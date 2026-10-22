import React, { useMemo } from 'react';

const QR_SIZE = 29;
const FINDER = 7;
const LOGO_SPAN = 9;

const createSeededRandom = (seed: string) => {
  let state = Array.from(seed).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
};

const isInFinderZone = (row: number, col: number) => {
  const zone = FINDER + 1;
  return (
    (row < zone && col < zone) ||
    (row < zone && col >= QR_SIZE - zone) ||
    (row >= QR_SIZE - zone && col < zone)
  );
};

const isInLogoZone = (row: number, col: number) => {
  const start = Math.floor((QR_SIZE - LOGO_SPAN) / 2);
  return row >= start && row < start + LOGO_SPAN && col >= start && col < start + LOGO_SPAN;
};

/** 演示用二维码点阵：仅按邀请链接生成稳定图案，不可被真实扫码识别 */
export const buildQrMatrix = (value: string) => {
  const random = createSeededRandom(value);
  const matrix: boolean[][] = [];
  for (let row = 0; row < QR_SIZE; row += 1) {
    const line: boolean[] = [];
    for (let col = 0; col < QR_SIZE; col += 1) {
      line.push(!isInFinderZone(row, col) && !isInLogoZone(row, col) && random() > 0.52);
    }
    matrix.push(line);
  }
  return matrix;
};

const FINDER_ORIGINS: Array<[number, number]> = [
  [0, 0],
  [0, QR_SIZE - FINDER],
  [QR_SIZE - FINDER, 0]
];

export const InviteQrCode: React.FC<{ value: string; size?: number; logoText?: string }> = ({
  value,
  size = 200,
  logoText = '点点速豹'
}) => {
  const matrix = useMemo(() => buildQrMatrix(value), [value]);
  const logoStart = Math.floor((QR_SIZE - LOGO_SPAN) / 2);
  return (
    <svg viewBox={`-1 -1 ${QR_SIZE + 2} ${QR_SIZE + 2}`} width={size} height={size} className="block">
      <rect x={-1} y={-1} width={QR_SIZE + 2} height={QR_SIZE + 2} fill="#fff" />
      {matrix.map((line, row) =>
        line.map((filled, col) =>
          filled ? <rect key={`${row}-${col}`} x={col + 0.08} y={row + 0.08} width={0.84} height={0.84} rx={0.18} fill="#0f172a" /> : null
        )
      )}
      {FINDER_ORIGINS.map(([row, col]) => (
        <g key={`${row}-${col}`}>
          <rect x={col} y={row} width={7} height={7} rx={1.2} fill="#0f172a" />
          <rect x={col + 1} y={row + 1} width={5} height={5} rx={0.8} fill="#fff" />
          <rect x={col + 2} y={row + 2} width={3} height={3} rx={0.6} fill="#1E5ABB" />
        </g>
      ))}
      <rect x={logoStart + 0.5} y={logoStart + 0.5} width={LOGO_SPAN - 1} height={LOGO_SPAN - 1} rx={1.6} fill="#fff" stroke="#dbe4f3" strokeWidth={0.15} />
      <rect x={logoStart + 2.5} y={logoStart + 1.4} width={4} height={4} rx={1} fill="#1E5ABB" />
      <text x={logoStart + 4.5} y={logoStart + 4.25} textAnchor="middle" fontSize={2.6} fontWeight={700} fill="#fff">
        速
      </text>
      <text x={logoStart + 4.5} y={logoStart + 7.4} textAnchor="middle" fontSize={1.5} fontWeight={700} fill="#1E5ABB">
        {logoText}
      </text>
    </svg>
  );
};

interface QrCardImageOptions {
  value: string;
  title: string;
  subtitle: string;
  lines: string[];
  fileName: string;
}

export const downloadQrCardImage = ({ value, title, subtitle, lines, fileName }: QrCardImageOptions) => {
  const width = 600;
  const height = 780;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#F4F8FE';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(32, 32, width - 64, height - 64, 24);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 30px "Microsoft YaHei", sans-serif';
  ctx.fillText(title, width / 2, 104);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px "Microsoft YaHei", sans-serif';
  ctx.fillText(subtitle, width / 2, 140);

  const qrPixels = 360;
  const cell = qrPixels / (QR_SIZE + 2);
  const originX = (width - qrPixels) / 2;
  const originY = 170;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(originX, originY, qrPixels, qrPixels);
  const matrix = buildQrMatrix(value);
  ctx.fillStyle = '#0f172a';
  matrix.forEach((line, row) =>
    line.forEach((filled, col) => {
      if (filled) ctx.fillRect(originX + (col + 1) * cell, originY + (row + 1) * cell, cell * 0.9, cell * 0.9);
    })
  );
  FINDER_ORIGINS.forEach(([row, col]) => {
    const x = originX + (col + 1) * cell;
    const y = originY + (row + 1) * cell;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, cell * 7, cell * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + cell, y + cell, cell * 5, cell * 5);
    ctx.fillStyle = '#1E5ABB';
    ctx.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3);
  });
  const logoStart = Math.floor((QR_SIZE - LOGO_SPAN) / 2);
  const logoX = originX + (logoStart + 1.5) * cell;
  const logoY = originY + (logoStart + 1.5) * cell;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(logoX, logoY, cell * (LOGO_SPAN - 1), cell * (LOGO_SPAN - 1));
  ctx.fillStyle = '#1E5ABB';
  ctx.font = `bold ${Math.round(cell * 2.4)}px "Microsoft YaHei", sans-serif`;
  ctx.fillText('点点速豹', width / 2, logoY + cell * 4.8);

  ctx.fillStyle = '#475569';
  ctx.font = '20px "Microsoft YaHei", sans-serif';
  lines.forEach((text, index) => ctx.fillText(text, width / 2, 590 + index * 36));

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = fileName;
  link.click();
};
