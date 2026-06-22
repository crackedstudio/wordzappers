export interface Palette {
  board: string;
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  ink2: string;
  ink3: string;
  line: string;
  tileface: string;
  tileedge: string;
  tileink: string;
  tilehi: string;
  slotbg: string;
  slotline: string;
  placed: string;
  slotfill: string;
  targetbg: string;
  targetink: string;
  targettile: string;
  chipbg: string;
  chipline: string;
  chipink: string;
  gbg: string;
  gline: string;
  gink: string;
  dot: string;
  shadow: string;
}

export function getPalette(dark: boolean): Palette {
  if (dark) {
    return {
      board: '#100e0c',
      bg: '#1b1714',
      surface: '#241f1b',
      surface2: '#2b251f',
      ink: '#f2ece0',
      ink2: '#8f8472',
      ink3: '#a89c88',
      line: '#342d26',
      tileface: '#3b322a',
      tileedge: '#211a14',
      tileink: '#f3e6cf',
      tilehi: 'rgba(255,255,255,.06)',
      slotbg: '#1f1a16',
      slotline: '#4a4036',
      placed: '#2a241e',
      slotfill: '#caa24f',
      targetbg: '#f2ece0',
      targetink: '#1b1714',
      targettile: '#d9cdb8',
      chipbg: '#3a2e1c',
      chipline: '#5e4a2a',
      chipink: '#f0b860',
      gbg: '#142c1f',
      gline: '#2f6b46',
      gink: '#5fdc97',
      dot: 'rgba(255,255,255,.035)',
      shadow: 'rgba(0,0,0,.5)',
    };
  }
  return {
    board: '#cfc7b5',
    bg: '#f4f0e8',
    surface: '#fffdf8',
    surface2: '#efe6d4',
    ink: '#1c1917',
    ink2: '#a59881',
    ink3: '#7a7060',
    line: '#e7ddc9',
    tileface: '#ece1cd',
    tileedge: '#cdbfa3',
    tileink: '#2a2017',
    tilehi: 'rgba(255,255,255,.6)',
    slotbg: '#eee5d3',
    slotline: '#c9bda3',
    placed: '#e3d8c2',
    slotfill: '#f6c46b',
    targetbg: '#1c1917',
    targetink: '#f4f0e8',
    targettile: '#2e2a26',
    chipbg: '#fbe3c0',
    chipline: '#e9c388',
    chipink: '#b45309',
    gbg: '#e9f9ef',
    gline: '#9be0b6',
    gink: '#0b7a3b',
    dot: 'rgba(0,0,0,.045)',
    shadow: 'rgba(28,25,23,.18)',
  };
}

export function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
