/** Small drawings. Ori is an orchid. Look marks use a magnifying glass, never an eye icon. */

export function oriSvg() {
  return `<svg class="ori" viewBox="0 0 80 96" aria-hidden="true">
    <path d="M40 94 C42 78 36 70 40 58" fill="none" stroke="#2F8A4E" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="26" cy="74" rx="12" ry="6" fill="#7DCA6E" transform="rotate(-28 26 74)"/>
    <ellipse cx="56" cy="70" rx="11" ry="5.5" fill="#5EAF62" transform="rotate(24 56 70)"/>
    <g class="petals">
      <ellipse cx="40" cy="34" rx="11" ry="18" fill="#F6E9FA"/>
      <ellipse cx="40" cy="34" rx="11" ry="18" fill="#E7C6F2" transform="rotate(72 40 34)"/>
      <ellipse cx="40" cy="34" rx="11" ry="18" fill="#F8F1FC" transform="rotate(144 40 34)"/>
      <ellipse cx="40" cy="34" rx="11" ry="18" fill="#E7C6F2" transform="rotate(216 40 34)"/>
      <ellipse cx="40" cy="34" rx="11" ry="18" fill="#F6E9FA" transform="rotate(288 40 34)"/>
    </g>
    <circle cx="40" cy="36" r="11" fill="#FFF8F0"/>
    <circle cx="36" cy="35" r="1.5" fill="#2A2724"/>
    <circle cx="44" cy="35" r="1.5" fill="#2A2724"/>
    <path d="M36 40.5 Q40 44 44 40.5" fill="none" stroke="#D36B86" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="33.5" cy="38" r="1.6" fill="#F6C3CC"/>
    <circle cx="46.5" cy="38" r="1.6" fill="#F6C3CC"/>
  </svg>`;
}

export function hiveSvg() {
  return `<svg class="hive" viewBox="0 0 64 72" aria-hidden="true">
    <path d="M32 10 C46 10 52 18 52 24 C52 28 12 28 12 24 C12 18 18 10 32 10Z" fill="#F6C453" stroke="#5C3B16" stroke-width="2"/>
    <path d="M8 32 H56 C56 40 48 44 32 44 C16 44 8 40 8 32Z" fill="#F0B429" stroke="#5C3B16" stroke-width="2"/>
    <path d="M14 46 H50 C50 58 44 66 32 66 C20 66 14 58 14 46Z" fill="#E39B16" stroke="#5C3B16" stroke-width="2"/>
    <ellipse cx="32" cy="54" rx="5" ry="6" fill="#5C3B16"/>
  </svg>`;
}

export function glassSvg() {
  return `<svg class="glass" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="10" cy="10" r="6.2" fill="none" stroke="currentColor" stroke-width="2.4"/>
    <path d="M14.6 14.6 L20 20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`;
}
