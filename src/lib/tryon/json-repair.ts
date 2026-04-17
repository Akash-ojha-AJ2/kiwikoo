/**
 * Robust JSON extraction and repair for LLM responses.
 *
 * LLMs frequently return malformed JSON: unterminated strings,
 * trailing commas, markdown fences, control characters, etc.
 * This module handles all of those without external dependencies.
 */

/**
 * Extract and parse the first JSON object from an LLM response string.
 * Applies progressive repair strategies before giving up.
 */
export function extractJson<T = Record<string, unknown>>(raw: string): T {
  if (!raw || !raw.trim()) {
    throw new Error('Empty response — no JSON to extract')
  }

  // Strip markdown code fences
  let cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  // Try direct parse first (fastest path)
  try {
    return JSON.parse(cleaned)
  } catch { /* continue to repair */ }

  // Extract the outermost { ... } block
  const start = cleaned.indexOf('{')
  if (start === -1) {
    throw new Error('No JSON object found in response')
  }

  let depth = 0
  let inString = false
  let escape = false
  let end = -1

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i]

    if (escape) {
      escape = false
      continue
    }

    if (ch === '\\' && inString) {
      escape = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }

  // If braces aren't balanced, close them
  let jsonStr: string
  if (end === -1) {
    jsonStr = cleaned.substring(start)
    // Close open strings and braces
    jsonStr = closeOpenJson(jsonStr, depth)
  } else {
    jsonStr = cleaned.substring(start, end + 1)
  }

  // Try parsing the extracted block
  try {
    return JSON.parse(jsonStr)
  } catch { /* continue to repair */ }

  // Apply progressive repairs
  const repaired = repairJson(jsonStr)
  try {
    return JSON.parse(repaired)
  } catch (finalErr) {
    throw new Error(
      `JSON repair failed: ${finalErr instanceof Error ? finalErr.message : String(finalErr)}`
    )
  }
}

/**
 * Apply common repairs to malformed JSON strings.
 */
function repairJson(json: string): string {
  let s = json

  // Remove control characters (except \n \r \t which are valid in strings)
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')

  // Fix unterminated strings: find strings that don't close before a newline
  s = fixUnterminatedStrings(s)

  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([\]}])/g, '$1')

  // Fix single-quoted strings → double-quoted
  s = s.replace(/'/g, '"')

  // Fix missing commas between key-value pairs:  "key": "value" "nextKey"
  s = s.replace(/"(\s+)"/g, '","')

  // Fix unquoted keys: { key: "value" } → { "key": "value" }
  s = s.replace(/{\s*(\w+)\s*:/g, '{ "$1":')
  s = s.replace(/,\s*(\w+)\s*:/g, ', "$1":')

  return s
}

/**
 * Close JSON that was truncated mid-string or mid-object.
 */
function closeOpenJson(json: string, openBraces: number): string {
  let s = json

  // If we're inside an unterminated string, close it
  let inStr = false
  let esc = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (esc) { esc = false; continue }
    if (ch === '\\' && inStr) { esc = true; continue }
    if (ch === '"') inStr = !inStr
  }

  if (inStr) {
    s += '"'
  }

  // Remove any trailing comma
  s = s.replace(/,\s*$/, '')

  // Close open braces
  const remainingBraces = Math.max(0, openBraces)
  for (let i = 0; i < remainingBraces; i++) {
    s += '}'
  }

  return s
}

/**
 * Fix strings that span multiple lines (LLM sometimes breaks strings across lines).
 */
function fixUnterminatedStrings(json: string): string {
  const lines = json.split('\n')
  const fixed: string[] = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Count unescaped quotes in this line
    let quoteCount = 0
    let esc = false
    for (const ch of line) {
      if (esc) { esc = false; continue }
      if (ch === '\\') { esc = true; continue }
      if (ch === '"') quoteCount++
    }

    // Odd number of quotes means an unterminated string
    if (quoteCount % 2 !== 0) {
      // If next line exists and starts with what looks like a continuation
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim()
        // If next line looks like a new key-value pair, close the string
        if (nextLine.match(/^"?\w+"?\s*:/) || nextLine.startsWith('}') || nextLine.startsWith(']')) {
          line += '"'
        } else {
          // Merge with next line (string spans lines)
          lines[i + 1] = line + ' ' + lines[i + 1]
          continue
        }
      } else {
        // Last line with unterminated string
        line += '"'
      }
    }

    fixed.push(line)
  }

  return fixed.join('\n')
}
