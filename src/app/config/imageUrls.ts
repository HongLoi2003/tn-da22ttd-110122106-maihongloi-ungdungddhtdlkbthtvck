// Auto-generated image URLs from Firebase Storage
// Generated at: 2026-06-01T10:14:55.061Z

export const imageUrls: { [key: string]: string } = {};

export function getImageUrl(imageName: string): string {
  return imageUrls[imageName] || imageUrls['logo.png'];
}
