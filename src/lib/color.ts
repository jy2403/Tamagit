export type Hsl = { h: number; s: number; l: number };

export function normalizeHex(input: string): string | null {
  let value = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    value = value
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  return `#${value.toUpperCase()}`;
}

export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const saturation = Math.max(0, Math.min(100, s)) / 100;
  const lightness = Math.max(0, Math.min(100, l)) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const section = hue / 60;
  const second = chroma * (1 - Math.abs((section % 2) - 1));
  const offset = lightness - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (section < 1) [red, green, blue] = [chroma, second, 0];
  else if (section < 2) [red, green, blue] = [second, chroma, 0];
  else if (section < 3) [red, green, blue] = [0, chroma, second];
  else if (section < 4) [red, green, blue] = [0, second, chroma];
  else if (section < 5) [red, green, blue] = [second, 0, chroma];
  else [red, green, blue] = [chroma, 0, second];

  const toHex = (channel: number) =>
    Math.round((channel + offset) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

export function relativeLuminance(hex: string | null | undefined): number {
  const normalized = normalizeHex(hex ?? '') ?? '#77BBA2';
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(normalized.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function readableStatColor(hex: string | null | undefined): string {
  const normalized = normalizeHex(hex ?? '') ?? '#77BBA2';
  if (relativeLuminance(normalized) <= 0.38) return normalized;

  const { h, s } = hexToHsl(normalized);
  if (s < 8) return '#673CC9';
  return hslToHex(h, Math.max(s, 45), 42);
}

export function hexToHsl(hex: string | null | undefined): Hsl {
  const normalized = normalizeHex(hex ?? '') ?? '#77BBA2';
  const red = parseInt(normalized.slice(1, 3), 16) / 255;
  const green = parseInt(normalized.slice(3, 5), 16) / 255;
  const blue = parseInt(normalized.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: Math.round(lightness * 100) };
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;
  if (max === red) hue = ((green - blue) / delta) % 6;
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;

  hue *= 60;
  if (hue < 0) hue += 360;

  return {
    h: Math.round(hue),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}
