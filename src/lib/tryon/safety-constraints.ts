/**
 * SAFETY & APPROPRIATENESS CONSTRAINTS
 * 
 * CRITICAL: Prevent inappropriate clothing removal or exposure
 */

import 'server-only'

export const SAFETY_CONSTRAINTS = `
═══════════════════════════════════════════════════════════════
🚨 SAFETY & APPROPRIATENESS (CRITICAL - HIGHEST PRIORITY)
═══════════════════════════════════════════════════════════════

⚠️  CRITICAL SAFETY RULE: DO NOT REMOVE CLOTHING BEYOND WHAT'S BEING REPLACED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLOTHING PRESERVATION RULES (MANDATORY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**RULE 1: LOWER BODY COVERAGE (ABSOLUTE)**

If Image 1 shows person wearing PANTS/TROUSERS/JEANS:
→ Output MUST show pants (same or similar style)
→ NEVER remove pants
→ NEVER make person barefoot if they had shoes
→ Preserve lower body modesty

If Image 1 shows person wearing SHOES/FOOTWEAR:
→ Output MUST show appropriate footwear
→ NEVER leave person barefoot unless they were barefoot in Image 1

**RULE 2: GARMENT SCOPE BOUNDARIES**

When replacing garment from Image 2:

If garment is UPPER BODY (shirt, t-shirt, kurta, top):
✓ Replace ONLY the upper body garment
✓ Keep pants from Image 1
✓ Keep shoes from Image 1
✗ DO NOT convert to full-length dress/outfit
✗ DO NOT remove lower body clothing

If garment is FULL OUTFIT (dress, gown, full kurta):
✓ May extend to appropriate length
✓ But person MUST still have appropriate footwear
✗ NEVER make barefoot unless Image 1 was barefoot

If garment is LOWER BODY (pants, skirt):
✓ Replace ONLY the lower body garment
✓ Keep upper body from Image 1
✓ Keep existing footwear

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAMPLE SCENARIOS (CORRECT vs WRONG):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**SCENARIO 1: Upper body garment replacement**

Input (Image 1):
- Person wearing: White t-shirt, blue jeans, sneakers

Garment (Image 2):
- Yellow dress (appears to be knee-length or longer)

✅ CORRECT Output:
- If dress is full-length: Person in yellow dress with appropriate footwear (sandals/shoes)
- If treating as top: Person with yellow top/kurta, SAME blue jeans, SAME sneakers

❌ WRONG Output (SAFETY VIOLATION):
- Person in yellow dress, BAREFOOT ← UNACCEPTABLE
- Person with removed pants ← INAPPROPRIATE
- Person with exposed lower body ← VIOLATION

**SCENARIO 2: Full outfit replacement**

Input (Image 1):
- Person wearing: Shirt, pants, shoes

Garment (Image 2):
- Long dress/gown

✅ CORRECT Output:
- Person in long dress WITH appropriate footwear (heels, sandals, or flats)

❌ WRONG Output (SAFETY VIOLATION):
- Person in dress, BAREFOOT ← UNACCEPTABLE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOOTWEAR RULES (MANDATORY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**DEFAULT: PERSON MUST HAVE FOOTWEAR**

Unless Image 1 shows person barefoot (beach, home setting, etc.):
→ Output MUST include appropriate footwear

Appropriate footwear choices:
- Casual outfit → Sneakers, casual shoes, sandals
- Formal outfit → Dress shoes, heels, formal sandals
- Traditional outfit → Ethnic footwear, sandals
- Dress/long outfit → Heels, sandals, flats

🚨 NEVER output barefoot unless:
1. Image 1 shows person barefoot, OR
2. Setting clearly indicates barefoot is appropriate (beach, yoga, home portrait)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODESTY & APPROPRIATENESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Maintain appropriate coverage:**
- Preserve lower body clothing from Image 1
- Do not expose skin that was covered in Image 1
- Maintain modesty standards

**If garment from Image 2 is revealing:**
- Still maintain base coverage from Image 1
- Do not remove undergarments, pants, or shoes
- Person should remain appropriately dressed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALIDATION CHECKLIST (BEFORE OUTPUT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ If Image 1 had pants → Output has pants or dress covering legs?
□ If Image 1 had shoes → Output has appropriate footwear?
□ Lower body coverage maintained?
□ No inappropriate exposure?
□ Person appropriately dressed for setting?

If ANY answer is NO → REGENERATE with proper clothing

═══════════════════════════════════════════════════════════════
CRITICAL FAILURES TO AVOID:
═══════════════════════════════════════════════════════════════

❌ NEVER: Remove pants when replacing upper body garment
❌ NEVER: Make person barefoot unless they were barefoot in input
❌ NEVER: Expose lower body inappropriately
❌ NEVER: Remove footwear without reason

These are SAFETY violations and absolutely forbidden.
`.trim()

export const GARMENT_SCOPE_DETECTION = `
═══════════════════════════════════════════════════════════════
GARMENT SCOPE DETECTION (PREVENT OVER-APPLICATION)
═══════════════════════════════════════════════════════════════

Before applying garment from Image 2, determine its SCOPE:

**UPPER BODY ONLY (shirt, t-shirt, blouse, short kurta, top):**
- Hemline ends at: Waist, hip, or upper thigh
- Does NOT cover knees
- Scope: Replace ONLY upper body
- Preserve: Pants, shoes from Image 1

**FULL OUTFIT (dress, long kurta, gown, jumpsuit):**
- Hemline reaches: Knee, mid-calf, or ankle
- Covers full body
- Scope: Can replace full outfit
- But MUST add: Appropriate footwear

**LOWER BODY ONLY (pants, skirt, shorts):**
- Only covers lower body
- Scope: Replace ONLY lower body
- Preserve: Upper body, shoes from Image 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECISION TREE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Analyze garment from Image 2
→ Where does hemline end?

Step 2: Determine scope
→ Above mid-thigh? = UPPER BODY ONLY
→ At/below knee? = FULL OUTFIT

Step 3: Apply replacement
→ UPPER BODY: Keep Image 1's pants + shoes
→ FULL OUTFIT: Add appropriate footwear

Step 4: Validate
→ Person appropriately dressed?
→ No inappropriate exposure?
→ Footwear present (unless original was barefoot)?

If validation fails → REJECT and regenerate
`.trim()
