/**
 * Tool rút gọn URL Unsplash
 * Chạy: node shorten-unsplash-url.js "URL_DÀI"
 */

// Lấy URL từ command line argument
const longUrl = process.argv[2];

if (!longUrl) {
  console.log('❌ Thiếu URL! Cách dùng:');
  console.log('   node shorten-unsplash-url.js "URL_CỦA_BẠN"');
  console.log('\nVí dụ:');
  console.log('   node shorten-unsplash-url.js "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZG9jdG9yJTIwdmlldG5hbXNlfGVufDB8fDB8fHww"');
  process.exit(1);
}

// Rút gọn URL
function shortenUnsplashUrl(url) {
  // Lấy phần base và photo ID
  const match = url.match(/https:\/\/images\.unsplash\.com\/(photo-[^?]+)/);
  
  if (!match) {
    return null;
  }
  
  const photoId = match[1];
  return `https://images.unsplash.com/${photoId}?w=400&q=80`;
}

const shortUrl = shortenUnsplashUrl(longUrl);

if (shortUrl) {
  console.log('\n✅ URL đã rút gọn:');
  console.log(shortUrl);
  console.log('\n📏 So sánh:');
  console.log(`   Dài:  ${longUrl.length} ký tự`);
  console.log(`   Ngắn: ${shortUrl.length} ký tự`);
  console.log(`   Tiết kiệm: ${longUrl.length - shortUrl.length} ký tự\n`);
} else {
  console.log('❌ URL không hợp lệ! Phải là URL từ Unsplash.');
}
