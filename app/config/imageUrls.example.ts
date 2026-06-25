// Example image URLs - Replace with actual URLs after uploading to Firebase Storage
// Run: node upload-images-to-firebase.js to generate actual URLs

export const imageUrls: { [key: string]: string } = {
  // Logo
  'logo.png': 'https://storage.googleapis.com/hearthcare-847b3.firebasestorage.app/images/logo.png',
  
  // Doctors
  'nguyenvanam.png': 'https://storage.googleapis.com/hearthcare-847b3.firebasestorage.app/images/nguyenvanam.png',
  'tranthilan.png': 'https://storage.googleapis.com/hearthcare-847b3.firebasestorage.app/images/tranthilan.png',
  'leminhtam.png': 'https://storage.googleapis.com/hearthcare-847b3.firebasestorage.app/images/leminhtam.png',
  'tranthimai.png': 'https://storage.googleapis.com/hearthcare-847b3.firebasestorage.app/images/tranthimai.png',
  
  // Specialties
  'tim-mach.png': 'https://storage.googleapis.com/hearthcare-847b3.firebasestorage.app/images/tim-mach.png',
  'nhi-khoa.png': 'https://storage.googleapis.com/hearthcare-847b3.firebasestorage.app/images/nhi-khoa.png',
  
  // Add more images here...
};

export function getImageUrl(imageName: string): string {
  return imageUrls[imageName] || imageUrls['logo.png'];
}
