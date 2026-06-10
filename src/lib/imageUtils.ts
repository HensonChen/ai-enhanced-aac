export function isModelReadableImage(value?: string) {
  return !!value && (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:image/"));
}

export function isPlaceholderImageUrl(value?: string) {
  return !!value && value.startsWith("[");
}

export function isEmojiImageUrl(value?: string, source?: string) {
  if (!value) return false;
  if (source === "emoji") return true;
  if (value.startsWith("http") || value.startsWith("data:") || value.startsWith("/") || value.startsWith("[")) {
    return false;
  }
  return true;
}

export function isUsableImageUrl(value?: string, source?: string) {
  if (!value || isPlaceholderImageUrl(value) || isEmojiImageUrl(value, source)) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/") ||
    value.startsWith("/")
  );
}
