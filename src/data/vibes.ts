export const VIBES = [
  'Underground',
  'Nova Disco',
  'Dark Pop',
  'Lo-fi Beats',
  'House Music',
  'Trip-hop',
  'Neo Soul',
  'Heavy Metal',
]

export function pickVibe(): string {
  return VIBES[Math.floor(Math.random() * VIBES.length)]
}