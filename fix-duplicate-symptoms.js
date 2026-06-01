const fs = require('fs');

const data = JSON.parse(fs.readFileSync('symptoms-mapping.json', 'utf8'));

console.log('🔍 Tìm và xóa triệu chứng trùng lặp\n');

// Find duplicates
const nameToIds = {};
data.symptoms.forEach(s => {
  if (!nameToIds[s.name]) nameToIds[s.name] = [];
  nameToIds[s.name].push(s.id);
});

const duplicates = Object.entries(nameToIds).filter(([name, ids]) => ids.length > 1);

console.log('Triệu chứng trùng lặp:');
duplicates.forEach(([name, ids]) => {
  console.log(`  ${name}: ${ids.join(', ')}`);
});

// Keep first ID, remove others
const idsToRemove = new Set();
const idMapping = {}; // old ID -> new ID

duplicates.forEach(([name, ids]) => {
  const keepId = ids[0];
  for (let i = 1; i < ids.length; i++) {
    idsToRemove.add(ids[i]);
    idMapping[ids[i]] = keepId;
  }
});

console.log('\nIDs sẽ xóa:', Array.from(idsToRemove).join(', '));
console.log('ID mapping:', idMapping);

// Remove duplicate symptoms
const uniqueSymptoms = data.symptoms.filter(s => !idsToRemove.has(s.id));

console.log(`\nĐã xóa ${data.symptoms.length - uniqueSymptoms.length} triệu chứng trùng`);
console.log(`Còn lại: ${uniqueSymptoms.length} triệu chứng`);

// Update mappings: replace old IDs with new IDs
data.mappings.forEach(mapping => {
  const updatedIds = mapping.symptomIds.map(id => idMapping[id] || id);
  // Remove duplicates in the array
  mapping.symptomIds = [...new Set(updatedIds)];
});

// Rebuild specialtyIds for each symptom
const symptomToSpecialties = {};
data.mappings.forEach(mapping => {
  mapping.symptomIds.forEach(symptomId => {
    if (!symptomToSpecialties[symptomId]) {
      symptomToSpecialties[symptomId] = [];
    }
    if (!symptomToSpecialties[symptomId].includes(mapping.specialtyId)) {
      symptomToSpecialties[symptomId].push(mapping.specialtyId);
    }
  });
});

// Update symptoms with correct specialtyIds
uniqueSymptoms.forEach(symptom => {
  symptom.specialtyIds = symptomToSpecialties[symptom.id] || [];
});

// Save
const updatedData = {
  symptoms: uniqueSymptoms,
  mappings: data.mappings
};

fs.writeFileSync('symptoms-mapping.json', JSON.stringify(updatedData, null, 2), 'utf8');

console.log('\n✅ Đã cập nhật symptoms-mapping.json');
console.log(`📊 Tổng triệu chứng: ${uniqueSymptoms.length}`);
console.log(`📊 Tổng chuyên khoa: ${data.mappings.length}`);

// Show specialty distribution
console.log('\n📊 Phân bố triệu chứng theo chuyên khoa:');
data.mappings.forEach(m => {
  console.log(`  ${m.specialtyName}: ${m.symptomIds.length} triệu chứng`);
});
