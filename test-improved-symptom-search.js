const fs = require('fs');

// Read the updated symptoms data
const data = JSON.parse(fs.readFileSync('symptoms-mapping.json', 'utf8'));

console.log('🔍 Testing Improved Symptom Search with Keywords\n');
console.log('='.repeat(60));

// Test 1: Check data structure
console.log('\n📊 Test 1: Data Structure');
console.log(`Total symptoms: ${data.symptoms.length}`);
console.log(`Total specialties: ${data.mappings.length}`);

const sampleSymptom = data.symptoms[0];
console.log('\nSample symptom structure:');
console.log(JSON.stringify(sampleSymptom, null, 2));

// Test 2: Check keywords coverage
console.log('\n📊 Test 2: Keywords Coverage');
const symptomsWithKeywords = data.symptoms.filter(s => s.keywords && s.keywords.length > 0);
console.log(`Symptoms with keywords: ${symptomsWithKeywords.length}/${data.symptoms.length}`);

// Test 3: Check specialtyIds
console.log('\n📊 Test 3: SpecialtyIds Coverage');
const symptomsWithSpecialties = data.symptoms.filter(s => s.specialtyIds && s.specialtyIds.length > 0);
console.log(`Symptoms with specialtyIds: ${symptomsWithSpecialties.length}/${data.symptoms.length}`);

// Show symptoms with multiple specialties
const multiSpecialtySymptoms = data.symptoms.filter(s => s.specialtyIds && s.specialtyIds.length > 1);
console.log(`\nSymptoms belonging to multiple specialties: ${multiSpecialtySymptoms.length}`);
console.log('\nExamples:');
multiSpecialtySymptoms.slice(0, 5).forEach(s => {
  const specialtyNames = s.specialtyIds.map(id => {
    const mapping = data.mappings.find(m => m.specialtyId === id);
    return mapping ? mapping.specialtyName : `ID:${id}`;
  });
  console.log(`  - ${s.name}: ${specialtyNames.join(', ')}`);
});

// Test 4: Specialty distribution
console.log('\n📊 Test 4: Specialty Distribution');
data.mappings.forEach(mapping => {
  console.log(`  ${mapping.specialtyName}: ${mapping.symptomIds.length} symptoms`);
});

// Test 5: Sample keyword searches
console.log('\n📊 Test 5: Sample Keyword Searches');
const testSearches = [
  'dau dau',
  'ho khan',
  'sot cao',
  'dau bung',
  'ngua da'
];

testSearches.forEach(search => {
  const matches = data.symptoms.filter(s => {
    if (!s.keywords) return false;
    return s.keywords.some(k => k.includes(search) || search.includes(k));
  });
  console.log(`  "${search}" → ${matches.length} matches`);
  if (matches.length > 0) {
    console.log(`    → ${matches.map(m => m.name).join(', ')}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('✅ All tests completed!');
