/**
 * FACE COORDINATES DETECTOR
 *
 * Detects face bounding box coordinates in an image using Gemini Flash.
 * Returns normalised 0-1000 coordinates for the eye compositor to align
 * original eye pixels onto the generated image.
 */

import 'server-only'
import sharp from 'sharp'
import { geminiGenerateContent } from '@/lib/gemini/executor'

export interface FaceCoordinates {
  ymin: number
  xmin: number
  ymax: number
  xmax: number
  confidence: number
}

interface DetectFaceOptions {
  allowHeuristicFallback?: boolean
}

function isImplausibleFaceBox(ymin: number, xmin: number, ymax: number, xmax: number): boolean {
  const w = xmax - xmin
  const h = ymax - ymin
  const areaRatio = (w * h) / 1_000_000

  if (areaRatio > 0.82) return true
  if (w > 900 || h > 900) return true
  if (xmin <= 10 && ymin <= 10 && (xmax >= 820 || ymax >= 820)) return true
  if (w < 35 || h < 35) return true

  return false
}

const DETECT_PROMPT = `Detect the single most prominent human face in this image.
Output ONLY a raw JSON object — no explanation, no markdown, no preamble, no trailing text.
The JSON must be the very first character of your response.
Format: {"ymin": <0-1000>, "xmin": <0-1000>, "ymax": <0-1000>, "xmax": <0-1000>, "confidence": <0-1>}
Coordinates are normalised to 0..1000 (top-left origin).
If no face is found, output: {"ymin": 0, "xmin": 0, "ymax": 0, "xmax": 0, "confidence": 0}`

async function getImageDimensions(base64: string): Promise<{ width: number; height: number } | null> {
  try {
    const metadata = await sharp(Buffer.from(base64, 'base64')).metadata()
    if (!metadata.width || !metadata.height) return null
    return { width: metadata.width, height: metadata.height }
  } catch {
    return null
  }
}

function parseBox2D(raw: any): { top: number; left: number; bottom: number; right: number } | null {
  if (!raw || !Array.isArray(raw.box_2d) || raw.box_2d.length < 2) return null
  const nums = raw.box_2d.slice(0, 4).map((v: unknown) => Number(v))
  if (nums.some((v: number) => !Number.isFinite(v))) return null

  const [a, b, c, d] = nums
  if (nums.length >= 4 && c > a && d > b) return { top: a, left: b, bottom: c, right: d }
  if (nums.length >= 4 && d > b && c > a) return { top: b, left: a, bottom: d, right: c }

  // Partial truncated output like {"box_2d":[185,38
  if (nums.length === 2) {
    const top = a
    const left = b
    return { top, left, bottom: top + 260, right: left + 220 }
  }

  if (nums.length === 3) {
    const top = a
    const left = b
    const bottom = c > top ? c : top + 260
    return { top, left, bottom, right: left + 220 }
  }
  return null
}

function parseBbox(raw: any): { top: number; left: number; bottom: number; right: number } | null {
  if (!raw || !Array.isArray(raw.bbox) || raw.bbox.length < 2) return null
  const nums = raw.bbox.slice(0, 4).map((v: unknown) => Number(v))
  if (nums.some((v: number) => !Number.isFinite(v))) return null

  const [a, b, c, d] = nums
  // Common format: [xmin, ymin, xmax, ymax]
  if (nums.length >= 4 && c > a && d > b) return { top: b, left: a, bottom: d, right: c }
  // Alternate: [ymin, xmin, ymax, xmax]
  if (nums.length >= 4 && d > b && c > a) return { top: a, left: b, bottom: c, right: d }
  if (nums.length === 2) return { top: b, left: a, bottom: b + 260, right: a + 220 }
  if (nums.length === 3) return { top: b, left: a, bottom: b + 260, right: c > a ? c : a + 220 }
  return null
}

function normalizeDirectBoxValue(value: number): number {
  if (!Number.isFinite(value)) return 0
  if (value >= 0 && value <= 1.2) return Math.round(value * 1000)
  return Math.round(value)
}

export async function detectFaceCoordinates(
  imageBase64: string,
  options?: DetectFaceOptions
): Promise<FaceCoordinates | null> {
  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
    if (!cleanBase64 || cleanBase64.length < 100) {
      console.warn('?? Face detect: invalid image data')
      return null
    }

    const heuristicFallback = async (): Promise<FaceCoordinates | null> => {
      if (!options?.allowHeuristicFallback) return null
      const dims = await getImageDimensions(cleanBase64)
      if (!dims?.width || !dims?.height) return null
      console.warn('?? Face detect: using heuristic source-face fallback box')
      return { ymin: 70, xmin: 260, ymax: 520, xmax: 740, confidence: 0.25 }
    }

    const response = await geminiGenerateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: DETECT_PROMPT },
          ],
        },
      ],
      config: {
        temperature: 0.0,
        maxOutputTokens: 512,
        responseMimeType: 'application/json',
      },
    })

    let text = ''
    if (response.candidates?.length) {
      for (const part of response.candidates[0].content?.parts || []) {
        if (part.text) text += part.text
      }
    }
    if (!text) {
      console.warn('?? Face detect: empty response from Gemini')
      return null
    }

    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    const firstBrace = cleanedText.indexOf('{')
    const lastBrace = cleanedText.lastIndexOf('}')

    let raw: any = null
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        raw = JSON.parse(cleanedText.slice(firstBrace, lastBrace + 1))
      } catch {
        raw = null
      }
    }

    const pick = (key: string): number | null => {
      const m = cleanedText.match(new RegExp(`"${key}"\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)`, 'i'))
      return m ? Number(m[1]) : null
    }

    if (!raw) {
      const yminN = pick('ymin')
      const xminN = pick('xmin')
      const ymaxN = pick('ymax')
      const xmaxN = pick('xmax')
      const confidence = pick('confidence')

      if (yminN !== null && xminN !== null && ymaxN !== null && xmaxN !== null) {
        raw = { ymin: yminN, xmin: xminN, ymax: ymaxN, xmax: xmaxN, confidence: confidence ?? 1 }
      } else {
        const box2dLooseMatch = cleanedText.match(/"box_2d"\s*:\s*\[\s*([^\]}]*)/i)
        if (box2dLooseMatch?.[1]) {
          const nums = (box2dLooseMatch[1].match(/-?\d+(?:\.\d+)?/g) || [])
            .map((s) => Number(s))
            .filter((n) => Number.isFinite(n))
          if (nums.length >= 2) raw = { box_2d: nums.slice(0, 4) }
        }
        if (!raw) {
          const bboxLooseMatch = cleanedText.match(/"bbox"\s*:\s*\[\s*([^\]}]*)/i)
          if (bboxLooseMatch?.[1]) {
            const nums = (bboxLooseMatch[1].match(/-?\d+(?:\.\d+)?/g) || [])
              .map((s) => Number(s))
              .filter((n) => Number.isFinite(n))
            if (nums.length >= 2) raw = { bbox: nums.slice(0, 4) }
          }
        }
      }
    }

    if (!raw) {
      console.warn('?? Face detect: no recoverable JSON in response:', cleanedText.substring(0, 120))
      return await heuristicFallback()
    }

    console.log('   Raw face detect JSON:', JSON.stringify(raw))

    let ymin: number
    let xmin: number
    let ymax: number
    let xmax: number

    if (raw.ymin !== undefined && raw.xmin !== undefined && raw.ymax !== undefined && raw.xmax !== undefined) {
      ymin = normalizeDirectBoxValue(Number(raw.ymin))
      xmin = normalizeDirectBoxValue(Number(raw.xmin))
      ymax = normalizeDirectBoxValue(Number(raw.ymax))
      xmax = normalizeDirectBoxValue(Number(raw.xmax))
    } else {
      const parsedBox2D = parseBox2D(raw)
      const parsedBbox = parseBbox(raw)
      const parsedAny = parsedBox2D ?? parsedBbox
      const top = Number(parsedAny?.top ?? raw.top ?? raw.ymin ?? raw.y ?? 0)
      const left = Number(parsedAny?.left ?? raw.left ?? raw.xmin ?? raw.x ?? 0)
      const bottom = Number(parsedAny?.bottom ?? raw.bottom ?? raw.ymax ?? 0)
      const right = Number(parsedAny?.right ?? raw.right ?? raw.xmax ?? 0)
      const maxCoord = Math.max(top, left, bottom, right)

      if (parsedAny && maxCoord <= 1000) {
        ymin = normalizeDirectBoxValue(top)
        xmin = normalizeDirectBoxValue(left)
        ymax = normalizeDirectBoxValue(bottom)
        xmax = normalizeDirectBoxValue(right)
      } else {
        let imgW = Number(raw.img_width || raw.imgWidth || raw.width || 0)
        let imgH = Number(raw.img_height || raw.imgHeight || raw.height || 0)
        if (!(imgW > 0 && imgH > 0)) {
          const dims = await getImageDimensions(cleanBase64)
          imgW = dims?.width ?? 0
          imgH = dims?.height ?? 0
        }
        if (!(imgW > 0 && imgH > 0)) {
          console.warn('?? Face detect: unrecognised coordinate format')
          return await heuristicFallback()
        }

        ymin = Math.round((top / imgH) * 1000)
        xmin = Math.round((left / imgW) * 1000)
        ymax = Math.round((bottom / imgH) * 1000)
        xmax = Math.round((right / imgW) * 1000)
      }
    }

    if ([ymin, xmin, ymax, xmax].some((v) => Number.isNaN(v))) {
      console.warn('?? Face detect: NaN in coordinates after parsing')
      return await heuristicFallback()
    }

    ymin = Math.max(0, Math.min(1000, ymin))
    xmin = Math.max(0, Math.min(1000, xmin))
    ymax = Math.max(0, Math.min(1000, ymax))
    xmax = Math.max(0, Math.min(1000, xmax))

    if (ymax <= ymin || xmax <= xmin) {
      console.warn('?? Face detect: invalid box (zero or negative area)')
      return await heuristicFallback()
    }

    if (isImplausibleFaceBox(ymin, xmin, ymax, xmax)) {
      console.warn(`?? Face detect: implausible face box rejected [${ymin},${xmin}]-[${ymax},${xmax}]`)
      return await heuristicFallback()
    }

    const parsedConfidence = Number(raw?.confidence)
    const result: FaceCoordinates = {
      ymin,
      xmin,
      ymax,
      xmax,
      confidence: Number.isFinite(parsedConfidence)
        ? Math.max(0, Math.min(1, parsedConfidence))
        : 1.0,
    }

    console.log(
      `?? Face detected: [${result.ymin},${result.xmin}]-[${result.ymax},${result.xmax}] conf=${result.confidence.toFixed(2)}`
    )

    return result
  } catch (error) {
    console.error('?? Face coordinate detection failed:', error)
    if (options?.allowHeuristicFallback) {
      try {
        const fallbackDims = await getImageDimensions(
          imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
        )
        if (fallbackDims?.width && fallbackDims?.height) {
          console.warn('?? Face detect: exception fallback to heuristic source-face box')
          return { ymin: 70, xmin: 260, ymax: 520, xmax: 740, confidence: 0.2 }
        }
      } catch {
        // ignore
      }
    }
    return null
  }
}
