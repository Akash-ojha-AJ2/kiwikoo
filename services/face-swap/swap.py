"""
Face swap service using official InsightFace model logic with ONNX Runtime.

This keeps the deployment lightweight (no compiled insightface wheel required)
while using the same SCRFD detection decode flow and inswapper latent mapping
as the upstream project.
"""

import io
import os
import sys
import zipfile
import logging
import urllib.request
from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort

for extra_path in filter(None, [os.getenv("FACE_SWAP_VENDOR_PATH"), r"C:\tmp\onnxdeps"]):
    if os.path.isdir(extra_path) and extra_path not in sys.path:
        sys.path.insert(0, extra_path)

try:
    import onnx
    from onnx import numpy_helper
except Exception:  # pragma: no cover - optional local dependency
    onnx = None
    numpy_helper = None

logger = logging.getLogger("face-swap")

MODEL_DIR = Path(os.getenv("INSIGHTFACE_MODEL_DIR", os.path.expanduser("~/.insightface")))
BUFFALO_L_URL = "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip"

DET_MODEL = "det_10g.onnx"
REC_MODEL = "w600k_r50.onnx"
SWAP_MODEL = "inswapper_128.onnx"
IDENTITY_STRENGTH = float(os.getenv("FACE_SWAP_IDENTITY_STRENGTH", "0.65"))
MASK_STRENGTH = float(os.getenv("FACE_SWAP_MASK_STRENGTH", "0.55"))
SPOT_SUPPRESSION_STRENGTH = float(os.getenv("FACE_SWAP_SPOT_SUPPRESSION_STRENGTH", "0.9"))

ARCFACE_DST = np.array(
    [
        [38.2946, 51.6963],
        [73.5318, 51.5014],
        [56.0252, 71.7366],
        [41.5493, 92.3655],
        [70.7299, 92.2041],
    ],
    dtype=np.float32,
)


def _download_buffalo_l():
    buffalo_dir = MODEL_DIR / "models" / "buffalo_l"
    det_path = buffalo_dir / DET_MODEL
    rec_path = buffalo_dir / REC_MODEL
    if det_path.exists() and rec_path.exists():
        return

    logger.info("Downloading buffalo_l models...")
    buffalo_dir.mkdir(parents=True, exist_ok=True)
    resp = urllib.request.urlopen(BUFFALO_L_URL)
    with zipfile.ZipFile(io.BytesIO(resp.read())) as zf:
        for member in zf.namelist():
            fname = os.path.basename(member)
            if fname.endswith(".onnx"):
                with zf.open(member) as src, open(buffalo_dir / fname, "wb") as dst:
                    dst.write(src.read())
                logger.info("  Extracted %s", fname)
    logger.info("buffalo_l models ready")


def distance2bbox(points, distance, max_shape=None):
    x1 = points[:, 0] - distance[:, 0]
    y1 = points[:, 1] - distance[:, 1]
    x2 = points[:, 0] + distance[:, 2]
    y2 = points[:, 1] + distance[:, 3]
    if max_shape is not None:
        x1 = np.clip(x1, 0, max_shape[1])
        y1 = np.clip(y1, 0, max_shape[0])
        x2 = np.clip(x2, 0, max_shape[1])
        y2 = np.clip(y2, 0, max_shape[0])
    return np.stack([x1, y1, x2, y2], axis=-1)


def distance2kps(points, distance, max_shape=None):
    preds = []
    for i in range(0, distance.shape[1], 2):
        px = points[:, i % 2] + distance[:, i]
        py = points[:, i % 2 + 1] + distance[:, i + 1]
        if max_shape is not None:
            px = np.clip(px, 0, max_shape[1])
            py = np.clip(py, 0, max_shape[0])
        preds.append(px)
        preds.append(py)
    return np.stack(preds, axis=-1)


def norm_crop2(img: np.ndarray, landmark: np.ndarray, image_size: int):
    ratio = float(image_size) / 112.0 if image_size % 112 == 0 else float(image_size) / 128.0
    diff_x = 0.0 if image_size % 112 == 0 else 8.0 * ratio
    dst = ARCFACE_DST * ratio
    dst[:, 0] += diff_x
    M, _ = cv2.estimateAffinePartial2D(landmark.astype(np.float32), dst, method=cv2.LMEDS)
    if M is None:
        raise ValueError("Could not estimate face alignment transform")
    warped = cv2.warpAffine(img, M, (image_size, image_size), borderValue=0.0)
    return warped, M


def align_face(img: np.ndarray, kps: np.ndarray, image_size: int) -> np.ndarray:
    warped, _ = norm_crop2(img, kps[:5], image_size)
    return warped


def canonical_face_polygon(image_size: int) -> np.ndarray:
    """Inner-face-only polygon — excludes jaw, chin, hairline, and ears.
    Only covers forehead-to-nose-tip and cheek-to-cheek so the target's
    jawline, chin shape, and hair boundary are never overwritten."""
    size = float(image_size)
    return np.array(
        [
            [0.32 * size, 0.28 * size],
            [0.68 * size, 0.28 * size],
            [0.76 * size, 0.40 * size],
            [0.74 * size, 0.56 * size],
            [0.66 * size, 0.70 * size],
            [0.50 * size, 0.76 * size],
            [0.34 * size, 0.70 * size],
            [0.26 * size, 0.56 * size],
            [0.24 * size, 0.40 * size],
        ],
        dtype=np.int32,
    )


def build_soft_face_mask(image_size: int) -> np.ndarray:
    mask = np.zeros((image_size, image_size), dtype=np.uint8)
    polygon = canonical_face_polygon(image_size)
    cv2.fillConvexPoly(mask, polygon, 255)
    k = max(image_size // 16, 5)
    kernel = np.ones((k, k), np.uint8)
    mask = cv2.erode(mask, kernel, iterations=2)
    blur = max((image_size // 8) | 1, 15)
    mask = cv2.GaussianBlur(mask, (blur, blur), 0)
    return (mask.astype(np.float32) / 255.0) * MASK_STRENGTH


def smooth_swap_artifacts(img: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Remove high-frequency artifacts from 128px upscale (spots, noise)
    while preserving edges with bilateral filtering."""
    smoothed = cv2.bilateralFilter(img, d=9, sigmaColor=50, sigmaSpace=50)
    mask3 = mask[:, :, None]
    return (smoothed.astype(np.float32) * mask3 + img.astype(np.float32) * (1.0 - mask3)).astype(np.uint8)


def frequency_split_blend(
    swapped_face: np.ndarray,
    target_face: np.ndarray,
    mask: np.ndarray,
    low_freq_radius: int = 7,
) -> np.ndarray:
    """Keep high-frequency skin texture from the target (pores, smoothness)
    and take only the low-frequency identity structure (bone shape, eye shape,
    lip shape, nose bridge) from the swapped face.

    This prevents the 128px model from injecting synthetic spots/moles/artifacts
    because the skin texture layer always comes from the original target image."""
    ksize = low_freq_radius * 2 + 1

    swap_low = cv2.GaussianBlur(swapped_face.astype(np.float32), (ksize, ksize), 0)
    target_low = cv2.GaussianBlur(target_face.astype(np.float32), (ksize, ksize), 0)
    target_high = target_face.astype(np.float32) - target_low

    result = swap_low + target_high

    mask3 = mask[:, :, None]
    blended = result * mask3 + target_face.astype(np.float32) * (1.0 - mask3)
    return np.clip(blended, 0, 255).astype(np.uint8)


def suppress_dark_spot_artifacts(
    swapped_face: np.ndarray,
    target_face: np.ndarray,
    mask: np.ndarray,
) -> np.ndarray:
    """Remove tiny new dark blobs introduced by the 128px swap model.

    We only target *new* spot-like artifacts that appear in the swapped face but
    were not present in the original aligned target face. Small regions are
    blended back toward the original target skin so identity features remain.
    """
    gray_swapped = cv2.cvtColor(swapped_face, cv2.COLOR_BGR2GRAY)
    gray_target = cv2.cvtColor(target_face, cv2.COLOR_BGR2GRAY)

    kernel_size = max((min(swapped_face.shape[:2]) // 28) | 1, 3)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))

    swapped_blackhat = cv2.morphologyEx(gray_swapped, cv2.MORPH_BLACKHAT, kernel)
    target_blackhat = cv2.morphologyEx(gray_target, cv2.MORPH_BLACKHAT, kernel)

    new_dark_detail = swapped_blackhat.astype(np.int16) - target_blackhat.astype(np.int16)
    swapped_darker_than_target = gray_target.astype(np.int16) - gray_swapped.astype(np.int16)

    candidate = (
        (new_dark_detail > 7)
        & (swapped_darker_than_target > 5)
        & (mask > 0.18)
    ).astype(np.uint8)

    if not np.any(candidate):
        return swapped_face

    component_count, labels, stats, _ = cv2.connectedComponentsWithStats(candidate, connectivity=8)
    refined = np.zeros_like(candidate)
    max_area = max((swapped_face.shape[0] * swapped_face.shape[1]) // 160, 18)

    for component_idx in range(1, component_count):
        area = stats[component_idx, cv2.CC_STAT_AREA]
        if 2 <= area <= max_area:
            refined[labels == component_idx] = 255

    if not np.any(refined):
        return swapped_face

    cleanup_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    refined = cv2.dilate(refined, cleanup_kernel, iterations=1)
    refined = cv2.GaussianBlur(refined, (5, 5), 0)

    alpha = (refined.astype(np.float32) / 255.0 * SPOT_SUPPRESSION_STRENGTH)[:, :, None]
    cleaned = target_face.astype(np.float32) * alpha + swapped_face.astype(np.float32) * (1.0 - alpha)
    return np.clip(cleaned, 0, 255).astype(np.uint8)


def dark_spot_artifact_score(
    swapped_face: np.ndarray,
    target_face: np.ndarray,
    mask: np.ndarray,
) -> float:
    """Measure how many new tiny dark spot artifacts were introduced."""
    gray_swapped = cv2.cvtColor(swapped_face, cv2.COLOR_BGR2GRAY)
    gray_target = cv2.cvtColor(target_face, cv2.COLOR_BGR2GRAY)

    kernel_size = max((min(swapped_face.shape[:2]) // 28) | 1, 3)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))

    swapped_blackhat = cv2.morphologyEx(gray_swapped, cv2.MORPH_BLACKHAT, kernel)
    target_blackhat = cv2.morphologyEx(gray_target, cv2.MORPH_BLACKHAT, kernel)
    new_dark_detail = swapped_blackhat.astype(np.int16) - target_blackhat.astype(np.int16)
    swapped_darker_than_target = gray_target.astype(np.int16) - gray_swapped.astype(np.int16)

    candidate = (
        (new_dark_detail > 7)
        & (swapped_darker_than_target > 5)
        & (mask > 0.18)
    ).astype(np.uint8)

    if not np.any(candidate):
        return 0.0

    component_count, labels, stats, _ = cv2.connectedComponentsWithStats(candidate, connectivity=8)
    spot_pixels = 0
    max_area = max((swapped_face.shape[0] * swapped_face.shape[1]) // 160, 18)

    for component_idx in range(1, component_count):
        area = stats[component_idx, cv2.CC_STAT_AREA]
        if 2 <= area <= max_area:
            spot_pixels += int(area)

    skin_pixels = max(int(np.count_nonzero(mask > 0.18)), 1)
    return float(spot_pixels / skin_pixels)


def masked_lab_means(img: np.ndarray, mask: np.ndarray) -> np.ndarray:
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    weights = np.clip(mask.reshape(-1), 0.0, 1.0)
    pixels = lab.reshape(-1, 3)
    valid = weights > 0.05
    if not np.any(valid):
        return np.array([0.0, 0.0, 0.0], dtype=np.float32)
    weights = weights[valid][:, None]
    pixels = pixels[valid]
    return (pixels * weights).sum(axis=0) / np.maximum(weights.sum(), 1e-6)


def skin_tone_delta(source_img: np.ndarray, compare_img: np.ndarray, mask: np.ndarray) -> float:
    source_mean = masked_lab_means(source_img, mask)
    compare_mean = masked_lab_means(compare_img, mask)
    dl = (source_mean[0] - compare_mean[0]) * 0.25
    da = source_mean[1] - compare_mean[1]
    db = source_mean[2] - compare_mean[2]
    return float(np.sqrt(dl * dl + da * da + db * db))


def harmonize_face_lighting(fake_img: np.ndarray, target_img: np.ndarray, mask: np.ndarray) -> np.ndarray:
    fake_lab = cv2.cvtColor(fake_img, cv2.COLOR_BGR2LAB).astype(np.float32)
    target_lab = cv2.cvtColor(target_img, cv2.COLOR_BGR2LAB).astype(np.float32)
    fake_mean = masked_lab_means(fake_img, mask)
    target_mean = masked_lab_means(target_img, mask)

    result_lab = fake_lab.copy()
    mask3 = mask[:, :, None]

    # Match luminance strongly to the target scene while preserving most of the
    # swapped face chroma so skin tone does not drift into the target's tint.
    l_shift = (target_mean[0] - fake_mean[0]) * 0.85
    a_shift = (target_mean[1] - fake_mean[1]) * 0.12
    b_shift = (target_mean[2] - fake_mean[2]) * 0.12

    adjusted = fake_lab.copy()
    adjusted[:, :, 0] = np.clip(adjusted[:, :, 0] + l_shift, 0, 255)
    adjusted[:, :, 1] = np.clip(adjusted[:, :, 1] + a_shift, 0, 255)
    adjusted[:, :, 2] = np.clip(adjusted[:, :, 2] + b_shift, 0, 255)
    result_lab = adjusted * mask3 + fake_lab * (1.0 - mask3)

    return cv2.cvtColor(result_lab.astype(np.uint8), cv2.COLOR_LAB2BGR)


def nms(dets: np.ndarray, thresh: float):
    x1 = dets[:, 0]
    y1 = dets[:, 1]
    x2 = dets[:, 2]
    y2 = dets[:, 3]
    scores = dets[:, 4]

    areas = (x2 - x1 + 1) * (y2 - y1 + 1)
    order = scores.argsort()[::-1]
    keep = []

    while order.size > 0:
        i = order[0]
        keep.append(i)
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        w = np.maximum(0.0, xx2 - xx1 + 1)
        h = np.maximum(0.0, yy2 - yy1 + 1)
        inter = w * h
        ovr = inter / (areas[i] + areas[order[1:]] - inter)
        inds = np.where(ovr <= thresh)[0]
        order = order[inds + 1]

    return keep


class FaceDetector:
    """SCRFD detector using official InsightFace decode logic."""

    def __init__(self, model_path: str):
        self.session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        self.input_name = self.session.get_inputs()[0].name
        self.output_names = [o.name for o in self.session.get_outputs()]
        self.input_size = (640, 640)
        self.center_cache = {}
        self.det_thresh = 0.5
        self.nms_thresh = 0.4
        outputs = self.session.get_outputs()
        self.batched = len(outputs[0].shape) == 3
        self.use_kps = False
        self._num_anchors = 1
        if len(outputs) == 6:
            self.fmc = 3
            self._feat_stride_fpn = [8, 16, 32]
            self._num_anchors = 2
        elif len(outputs) == 9:
            self.fmc = 3
            self._feat_stride_fpn = [8, 16, 32]
            self._num_anchors = 2
            self.use_kps = True
        elif len(outputs) == 10:
            self.fmc = 5
            self._feat_stride_fpn = [8, 16, 32, 64, 128]
        elif len(outputs) == 15:
            self.fmc = 5
            self._feat_stride_fpn = [8, 16, 32, 64, 128]
            self.use_kps = True
        else:
            raise RuntimeError(f"Unsupported SCRFD output layout: {len(outputs)} outputs")

    def _forward(self, img: np.ndarray, threshold: float):
        scores_list = []
        bboxes_list = []
        kpss_list = []
        blob = cv2.dnn.blobFromImage(
            img,
            1.0 / 128.0,
            self.input_size,
            (127.5, 127.5, 127.5),
            swapRB=True,
        )
        net_outs = self.session.run(self.output_names, {self.input_name: blob})
        input_height = blob.shape[2]
        input_width = blob.shape[3]

        for idx, stride in enumerate(self._feat_stride_fpn):
            if self.batched:
                scores = net_outs[idx][0]
                bbox_preds = net_outs[idx + self.fmc][0] * stride
                kps_preds = net_outs[idx + self.fmc * 2][0] * stride if self.use_kps else None
            else:
                scores = net_outs[idx]
                bbox_preds = net_outs[idx + self.fmc] * stride
                kps_preds = net_outs[idx + self.fmc * 2] * stride if self.use_kps else None

            height = input_height // stride
            width = input_width // stride
            key = (height, width, stride)
            if key in self.center_cache:
                anchor_centers = self.center_cache[key]
            else:
                anchor_centers = np.stack(np.mgrid[:height, :width][::-1], axis=-1).astype(np.float32)
                anchor_centers = (anchor_centers * stride).reshape((-1, 2))
                if self._num_anchors > 1:
                    anchor_centers = np.stack([anchor_centers] * self._num_anchors, axis=1).reshape((-1, 2))
                if len(self.center_cache) < 100:
                    self.center_cache[key] = anchor_centers

            scores = scores.reshape(-1)
            bbox_preds = bbox_preds.reshape((-1, 4))
            pos_inds = np.where(scores >= threshold)[0]
            if pos_inds.size == 0:
                continue

            bboxes = distance2bbox(anchor_centers, bbox_preds)
            scores_list.append(scores[pos_inds][:, None])
            bboxes_list.append(bboxes[pos_inds])

            if self.use_kps and kps_preds is not None:
                kpss = distance2kps(anchor_centers, kps_preds.reshape((anchor_centers.shape[0], -1)))
                kpss = kpss.reshape((kpss.shape[0], -1, 2))
                kpss_list.append(kpss[pos_inds])

        return scores_list, bboxes_list, kpss_list

    def detect(self, img: np.ndarray, threshold: float = 0.5, max_num: int = 0):
        h, w = img.shape[:2]
        input_size = self.input_size
        im_ratio = float(h) / float(w)
        model_ratio = float(input_size[1]) / float(input_size[0])
        if im_ratio > model_ratio:
            new_height = input_size[1]
            new_width = int(new_height / im_ratio)
        else:
            new_width = input_size[0]
            new_height = int(new_width * im_ratio)
        det_scale = float(new_height) / float(h)
        resized_img = cv2.resize(img, (new_width, new_height))
        det_img = np.zeros((input_size[1], input_size[0], 3), dtype=np.uint8)
        det_img[:new_height, :new_width, :] = resized_img

        scores_list, bboxes_list, kpss_list = self._forward(det_img, threshold)
        if not scores_list or not bboxes_list:
            return []

        scores = np.vstack(scores_list)
        scores_ravel = scores.ravel()
        order = scores_ravel.argsort()[::-1]
        bboxes = np.vstack(bboxes_list) / det_scale
        pre_det = np.hstack((bboxes, scores)).astype(np.float32, copy=False)
        pre_det = pre_det[order, :]
        keep = nms(pre_det, self.nms_thresh)
        det = pre_det[keep, :]

        kpss = None
        if self.use_kps and kpss_list:
            kpss = np.vstack(kpss_list) / det_scale
            kpss = kpss[order, :, :]
            kpss = kpss[keep, :, :]

        if max_num > 0 and det.shape[0] > max_num:
            area = (det[:, 2] - det[:, 0]) * (det[:, 3] - det[:, 1])
            img_center = np.array([w // 2, h // 2], dtype=np.float32)
            centers = np.vstack(((det[:, 0] + det[:, 2]) / 2, (det[:, 1] + det[:, 3]) / 2)).T
            offset_dist_squared = np.sum(np.power(centers - img_center, 2.0), axis=1)
            values = area - offset_dist_squared * 2.0
            top_idx = np.argsort(values)[::-1][:max_num]
            det = det[top_idx, :]
            if kpss is not None:
                kpss = kpss[top_idx, :, :]

        faces = []
        for i in range(det.shape[0]):
            bbox = det[i, :4].astype(np.float32)
            score = float(det[i, 4])
            kps = kpss[i].astype(np.float32) if kpss is not None else None
            faces.append((bbox, kps, score))
        return faces


class FaceRecognizer:
    def __init__(self, model_path: str):
        self.session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        self.input_name = self.session.get_inputs()[0].name
        input_shape = self.session.get_inputs()[0].shape
        self.input_size = tuple(input_shape[2:4][::-1])

    def get_embedding(self, img: np.ndarray, kps: np.ndarray) -> np.ndarray:
        aligned, _ = norm_crop2(img, kps[:5], self.input_size[0])
        blob = cv2.dnn.blobFromImage(
            aligned,
            1.0 / 127.5,
            self.input_size,
            (127.5, 127.5, 127.5),
            swapRB=True,
        )
        embedding = self.session.run(None, {self.input_name: blob})[0].reshape(-1).astype(np.float32)
        norm = np.linalg.norm(embedding)
        return embedding / norm if norm > 0 else embedding


class FaceSwapperModel:
    def __init__(self, model_path: str):
        self.emap = None
        if onnx is not None and numpy_helper is not None:
            model = onnx.load(model_path)
            self.emap = numpy_helper.to_array(model.graph.initializer[-1]).astype(np.float32)
        else:
            logger.warning("onnx package unavailable; using direct ArcFace embedding without emap remap")
        self.session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        inputs = self.session.get_inputs()
        self.input_names = [inp.name for inp in inputs]
        self.output_names = [out.name for out in self.session.get_outputs()]
        self.input_size = tuple(inputs[0].shape[2:4][::-1])

    def swap(
        self,
        target_img: np.ndarray,
        target_kps: np.ndarray,
        source_embedding: np.ndarray,
        target_embedding: np.ndarray,
    ) -> np.ndarray:
        aligned, M = norm_crop2(target_img, target_kps[:5], self.input_size[0])
        blob = cv2.dnn.blobFromImage(aligned, 1.0 / 255.0, self.input_size, (0.0, 0.0, 0.0), swapRB=True)
        source_latent = source_embedding.reshape((1, -1)).astype(np.float32)
        target_latent = target_embedding.reshape((1, -1)).astype(np.float32)
        latent = source_latent * IDENTITY_STRENGTH + target_latent * (1.0 - IDENTITY_STRENGTH)
        if self.emap is not None:
            latent = np.dot(latent, self.emap)
        latent /= np.linalg.norm(latent)
        pred = self.session.run(self.output_names, {self.input_names[0]: blob, self.input_names[1]: latent})[0]
        img_fake = pred.transpose((0, 2, 3, 1))[0]
        bgr_fake = np.clip(255 * img_fake, 0, 255).astype(np.uint8)[:, :, ::-1]
        face_mask = build_soft_face_mask(self.input_size[0])
        cleaned_fake = smooth_swap_artifacts(bgr_fake, face_mask)
        freq_blended = frequency_split_blend(cleaned_fake, aligned, face_mask)
        de_spotted = suppress_dark_spot_artifacts(freq_blended, aligned, face_mask)
        harmonized = harmonize_face_lighting(de_spotted, aligned, face_mask)
        return self._paste_back(target_img, harmonized, M, face_mask)

    def _paste_back(
        self,
        target_img: np.ndarray,
        bgr_fake: np.ndarray,
        M: np.ndarray,
        face_mask: np.ndarray,
    ) -> np.ndarray:
        IM = cv2.invertAffineTransform(M)
        warped_fake = cv2.warpAffine(bgr_fake, IM, (target_img.shape[1], target_img.shape[0]), borderValue=0.0)
        warped_mask = cv2.warpAffine(face_mask, IM, (target_img.shape[1], target_img.shape[0]), borderValue=0.0)
        warped_mask = np.clip(warped_mask, 0.0, 1.0)

        mask_h_inds, mask_w_inds = np.where(warped_mask > 0.05)
        if mask_h_inds.size == 0 or mask_w_inds.size == 0:
            return target_img

        extra_blur = max(int(max(target_img.shape[:2]) / 80) | 1, 11)
        warped_mask = cv2.GaussianBlur(warped_mask, (extra_blur, extra_blur), 0)
        warped_mask = np.clip(warped_mask, 0.0, 1.0)

        alpha = warped_mask[:, :, None]
        merged = warped_fake.astype(np.float32) * alpha + target_img.astype(np.float32) * (1.0 - alpha)
        return np.clip(merged, 0, 255).astype(np.uint8)


class FaceSwapper:
    def __init__(self):
        _download_buffalo_l()
        buffalo_dir = MODEL_DIR / "models" / "buffalo_l"
        det_path = str(buffalo_dir / DET_MODEL)
        rec_path = str(buffalo_dir / REC_MODEL)
        swap_candidates = [
            MODEL_DIR / "models" / SWAP_MODEL,
            MODEL_DIR / SWAP_MODEL,
            Path(__file__).parent / "models" / SWAP_MODEL,
        ]
        swap_path = next((str(p) for p in swap_candidates if p.exists()), None)
        if not swap_path:
            raise FileNotFoundError(
                f"inswapper_128.onnx not found. Place it at {MODEL_DIR / 'models' / SWAP_MODEL}"
            )

        self.detector = FaceDetector(det_path)
        self.recognizer = FaceRecognizer(rec_path)
        self.swapper_model = FaceSwapperModel(swap_path)
        logger.info("FaceSwapper ready (official SCRFD + inswapper ONNX)")

    def swap(
        self,
        source_img: np.ndarray,
        target_img: np.ndarray,
        source_for_detection: np.ndarray | None = None,
        source_face_index: int = 0,
        target_face_index: int = 0,
    ) -> tuple[np.ndarray, dict]:
        detect_img = source_for_detection if source_for_detection is not None else source_img
        source_face_img = detect_img

        source_faces = self.detector.detect(detect_img, max_num=5)
        if not source_faces and source_for_detection is not None:
            source_faces = self.detector.detect(source_img, max_num=5)
            source_face_img = source_img
        if not source_faces:
            raise ValueError("No face detected in source image")

        target_faces = self.detector.detect(target_img, max_num=5)
        if not target_faces:
            raise ValueError("No face detected in generated image")

        si = min(source_face_index, len(source_faces) - 1)
        ti = min(target_face_index, len(target_faces) - 1)
        _, source_kps, _ = source_faces[si]
        _, target_kps, _ = target_faces[ti]
        if source_kps is None or target_kps is None or source_kps.shape[0] < 5 or target_kps.shape[0] < 5:
            raise ValueError("Could not detect sufficient facial landmarks")

        source_embedding = self.recognizer.get_embedding(source_face_img, source_kps)
        target_embedding_before = self.recognizer.get_embedding(target_img, target_kps)
        source_aligned = align_face(source_face_img, source_kps, self.swapper_model.input_size[0])
        target_before_aligned = align_face(target_img, target_kps, self.swapper_model.input_size[0])
        result = self.swapper_model.swap(
            target_img.copy(),
            target_kps,
            source_embedding,
            target_embedding_before,
        )

        result_faces = self.detector.detect(result, max_num=5)
        result_kps = target_kps
        if result_faces:
            ti2 = min(target_face_index, len(result_faces) - 1)
            _, detected_result_kps, _ = result_faces[ti2]
            if detected_result_kps is not None and detected_result_kps.shape[0] >= 5:
                result_kps = detected_result_kps

        target_embedding_after = self.recognizer.get_embedding(result, result_kps)
        result_aligned = align_face(result, result_kps, self.swapper_model.input_size[0])
        quality_mask = build_soft_face_mask(self.swapper_model.input_size[0])
        metrics = {
            "identity_similarity_before": self._cosine_similarity(source_embedding, target_embedding_before),
            "identity_similarity_after": self._cosine_similarity(source_embedding, target_embedding_after),
            "skin_tone_delta_before": skin_tone_delta(source_aligned, target_before_aligned, quality_mask),
            "skin_tone_delta_after": skin_tone_delta(source_aligned, result_aligned, quality_mask),
            "dark_spot_artifact_score_after": dark_spot_artifact_score(result_aligned, target_before_aligned, quality_mask),
        }
        return result, metrics

    @staticmethod
    def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
        a = a.reshape(-1).astype(np.float32)
        b = b.reshape(-1).astype(np.float32)
        denom = float(np.linalg.norm(a) * np.linalg.norm(b))
        if denom <= 1e-8:
            return 0.0
        return float(np.dot(a, b) / denom)
