function channels(color: string): number[] {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    return full.match(/.{2}/g)!.map((value) => parseInt(value, 16) / 255);
  }
  const values = color.match(/[\d.]+/g)!.map(Number);
  return color.startsWith("color(srgb") ? values : values.map((v) => v / 255);
}

function luminance(color: string): number {
  const rgb = channels(color).map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

export function contrast(first: string, second: string): number {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
