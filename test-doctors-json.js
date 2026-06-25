// Test script to verify doctors.json is loaded correctly
const doctorsData = require('./doctors.json');

console.log('📊 Total doctors:', doctorsData.length);
console.log('\n💰 Prices from JSON:');
doctorsData.forEach((doc, index) => {
  console.log(`${index + 1}. ${doc.ten}: ${doc.gia_kham}đ`);
});

console.log('\n✅ All prices:');
console.log(doctorsData.map(d => d.gia_kham));
