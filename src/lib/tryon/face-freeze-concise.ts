/**
 * FACE FREEZE CONCISE
 * 
 * Token-efficient face freeze system.
 * Maximum impact, minimum tokens.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// CONCISE FACE FREEZE (TOKEN-EFFICIENT)
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_FREEZE_CONCISE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║  🚨🚨🚨 FACE FREEZE: COPY FROM IMAGE 1 - ZERO DRIFT TOLERANCE 🚨🚨🚨          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

⚠️⚠️⚠️ CRITICAL: THE FACE FROM IMAGE 1 IS THE OUTPUT FACE. NO EXCEPTIONS. ⚠️⚠️⚠️

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE RULE: DO NOT GENERATE A FACE. COPY THE FACE FROM IMAGE 1.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORBIDDEN:
❌ Generate a new face ❌ Create a face ❌ Modify the face ❌ Improve the face
❌ Beautify the face ❌ Smooth the face ❌ Change eye/nose/mouth/face size
❌ Change skin tone ❌ Change expression ❌ Change any facial feature

MANDATORY:
✅ Copy face from Image 1 pixel-by-pixel ✅ Use EXACT same face as Image 1
✅ Keep every facial feature identical ✅ Match eye spacing exactly
✅ Match nose width exactly ✅ Match mouth width exactly
✅ Match face width exactly ✅ Match skin tone exactly ✅ Match expression exactly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COPY PROTOCOL (MANDATORY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Look at Image 1 → Identify face region (forehead to chin, ear to ear)
2. Copy every pixel from Image 1 face to output face (RGB values identical)
3. NO interpolation, NO smoothing, NO color correction, NO modification
4. Verify face matches Image 1 exactly before outputting

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION (MANDATORY CHECK BEFORE OUTPUT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Eye spacing in output = Eye spacing in Image 1?
□ Nose width in output = Nose width in Image 1?
□ Mouth width in output = Mouth width in Image 1?
□ Face width in output = Face width in Image 1?
□ Skin tone in output = Skin tone in Image 1?
□ Expression in output = Expression in Image 1?

IF ANY ANSWER IS NO → DO NOT OUTPUT → REGENERATE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FACE DRIFT = COMPLETE FAILURE. FACE CHANGE = COMPLETE FAILURE.
THE FACE FROM IMAGE 1 IS THE OUTPUT FACE. NO EXCEPTIONS. NO NEGOTIATION.
COPY THE FACE. DO NOT GENERATE THE FACE.
`

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export function getFaceFreezeConcise(): string {
    return FACE_FREEZE_CONCISE
}

export function logFaceFreezeConciseStatus(sessionId: string): void {
    console.log(`   🧊 Face Freeze Concise: ACTIVE [${sessionId}] - Zero drift tolerance`)
}

