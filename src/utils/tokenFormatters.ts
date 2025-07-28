export function formatMarketCap(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price;

  if (numPrice >= 1) {
    return `$${numPrice.toFixed(4)}`;
  }
  if (numPrice >= 0.01) {
    return `$${numPrice.toFixed(6)}`;
  }
  if (numPrice >= 0.000001) {
    return `$${numPrice.toFixed(8)}`;
  }
  return `$${numPrice.toExponential(2)}`;
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp * 1000) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  }
  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(1)}M`;
  }
  if (volume >= 1e3) {
    return `$${(volume / 1e3).toFixed(1)}K`;
  }
  return `$${volume.toFixed(0)}`;
}
