const fs = require('fs')
const path = require('path')

const adStylesPath = path.join(__dirname, '..', 'src', 'lib', 'ads', 'ad-styles.ts')
const source = fs.readFileSync(adStylesPath, 'utf8')

const BLOCKED_PATTERNS = [
  { label: 'paparazzi', pattern: /\bpaparazzi\b/i },
  { label: 'street surveillance footage', pattern: /\bstreet surveillance footage\b/i },
  { label: 'surveillance', pattern: /\bsurveillance\b/i },
  { label: 'perfectly mirroring pose', pattern: /\bperfectly mirroring the real human'?s pose\b/i },
  { label: 'anatomically correct', pattern: /\banatomically correct\b/i },
  { label: 'throwing a powerful punch', pattern: /\bthrowing a powerful punch\b/i },
  { label: 'chopsticks aimed at face', pattern: /\bchopsticks aimed at face\b/i },
  { label: 'minecraft-style', pattern: /\bminecraft-style\b/i },
]

function extractPresetIdsFromList(src) {
  const idsBlockMatch = src.match(/export const AD_PRESET_IDS = \[([\s\S]*?)\] as const/)
  if (!idsBlockMatch) return []
  const idsBlock = idsBlockMatch[1]
  return Array.from(idsBlock.matchAll(/'([^']+)'/g)).map((m) => m[1])
}

function extractPresetsBlock(src) {
  const start = src.indexOf('export const AD_PRESETS: AdPreset[] = [')
  const end = src.indexOf('// Production guard: every AD_PRESET_IDS must have a matching preset')
  if (start === -1 || end === -1 || end <= start) return ''
  return src.slice(start, end)
}

function extractPresetObjectIds(block) {
  return Array.from(block.matchAll(/id:\s*'([^']+)'/g)).map((m) => m[1])
}

function validatePresetBlocks(block) {
  const issues = []
  const starts = Array.from(block.matchAll(/\{\s*\n\s*id:\s*'([^']+)'/g))

  for (let i = 0; i < starts.length; i += 1) {
    const id = starts[i][1]
    const from = starts[i].index
    const to = i + 1 < starts.length ? starts[i + 1].index : block.length
    const presetBlock = block.slice(from, to)

    const requiredFields = ['name:', 'description:', 'category:', 'platforms:', 'sceneGuide:', 'lightingGuide:', 'cameraGuide:', 'avoid:']
    for (const field of requiredFields) {
      if (!presetBlock.includes(field)) {
        issues.push(`- ${id} missing required field ${field.replace(':', '')}`)
      }
    }

    for (const blocked of BLOCKED_PATTERNS) {
      if (blocked.pattern.test(presetBlock)) {
        issues.push(`- ${id} contains blocked phrase: ${blocked.label}`)
      }
    }
  }

  return issues
}

function main() {
  const issues = []
  const listedIds = extractPresetIdsFromList(source)
  const presetsBlock = extractPresetsBlock(source)
  const objectIds = extractPresetObjectIds(presetsBlock)

  if (!listedIds.length) {
    issues.push('- Could not parse AD_PRESET_IDS list')
  }
  if (!presetsBlock) {
    issues.push('- Could not parse AD_PRESETS block')
  }

  const uniqueObjectIds = new Set(objectIds)
  if (uniqueObjectIds.size !== objectIds.length) {
    issues.push('- Duplicate preset IDs found in AD_PRESETS')
  }

  for (const id of listedIds) {
    if (!uniqueObjectIds.has(id)) {
      issues.push(`- Missing preset definition for ${id}`)
    }
  }

  for (const id of uniqueObjectIds) {
    if (!listedIds.includes(id)) {
      issues.push(`- Preset defined but not listed in AD_PRESET_IDS: ${id}`)
    }
  }

  issues.push(...validatePresetBlocks(presetsBlock))

  if (issues.length > 0) {
    console.error(`Preset safety check failed with ${issues.length} issue(s):`)
    for (const issue of issues) {
      console.error(issue)
    }
    process.exit(1)
  }

  console.log(`Preset safety check passed for ${objectIds.length} presets.`)
}

main()
