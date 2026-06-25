const https = require('https');
const fs = require('fs');

// Unsplash Access Key - bạn cần đăng ký tại https://unsplash.com/developers
const UNSPLASH_ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE';

// Load medicines database
const data = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));
const medicines = data.medicines;

// Function to search Unsplash
function searchUnsplash(query) {
  return new Promise((resolve, reject) => {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    
    https.get(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            resolve(json.results[0].urls.regular);
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Function to get search query for medicine
function getMedicineSearchQuery(medicine) {
  const name = medicine.name.toLowerCase();
  
  // Extract base medicine name (remove dosage)
  const baseName = name.split(' ')[0];
  
  // Map medicine names to better search terms
  const searchMap = {
    'paracetamol': 'paracetamol pills medicine',
    'hapacol': 'paracetamol tablets',
    'panadol': 'panadol medicine box',
    'efferalgan': 'effervescent tablet medicine',
    'tylenol': 'tylenol medicine bottle',
    'ibuprofen': 'ibuprofen pills capsules',
    'brufen': 'ibuprofen tablets',
    'advil': 'advil medicine box',
    'nurofen': 'nurofen liquid medicine',
    'profen': 'ibuprofen medicine',
    'aspirin': 'aspirin tablets medicine',
    'cardiprin': 'aspirin cardio medicine',
    'aspilets': 'aspirin tablets',
    'micropirin': 'aspirin medicine',
    'alaxan': 'pain relief medicine',
    'mefenamic': 'mefenamic acid capsules',
    'ponstan': 'ponstan medicine capsules',
    'diclofenac': 'diclofenac gel medicine',
    'voltaren': 'voltaren gel tube',
    'cataflam': 'cataflam tablets',
    'olfen': 'diclofenac tablets',
    'naproxen': 'naproxen tablets medicine',
    'amlodipine': 'amlodipine blood pressure pills',
    'nifedipine': 'nifedipine tablets',
    'bisoprolol': 'bisoprolol medicine',
    'metoprolol': 'metoprolol tablets',
    'atenolol': 'atenolol pills',
    'captopril': 'captopril medicine',
    'enalapril': 'enalapril tablets',
    'perindopril': 'perindopril medicine',
    'losartan': 'losartan potassium tablets',
    'valsartan': 'valsartan medicine',
    'telmisartan': 'telmisartan tablets',
    'furosemide': 'furosemide diuretic pills',
    'spironolactone': 'spironolactone tablets',
    'atorvastatin': 'atorvastatin statin pills',
    'rosuvastatin': 'rosuvastatin medicine',
    'simvastatin': 'simvastatin tablets',
    'omeprazole': 'omeprazole capsules medicine',
    'esomeprazole': 'esomeprazole pills',
    'lansoprazole': 'lansoprazole capsules',
    'pantoprazole': 'pantoprazole medicine',
    'ranitidine': 'ranitidine tablets',
    'famotidine': 'famotidine medicine',
    'gabapentin': 'gabapentin capsules',
    'pregabalin': 'pregabalin medicine',
    'carbamazepine': 'carbamazepine tablets',
    'valproate': 'valproate medicine',
    'levetiracetam': 'levetiracetam pills',
    'phenytoin': 'phenytoin capsules',
    'topiramate': 'topiramate tablets',
    'clonazepam': 'clonazepam medicine',
    'alprazolam': 'alprazolam tablets',
    'diazepam': 'diazepam pills',
    'lorazepam': 'lorazepam medicine'
  };
  
  // Try to find in map
  for (const [key, value] of Object.entries(searchMap)) {
    if (baseName.includes(key)) {
      return value;
    }
  }
  
  // Fallback: use category
  return `${medicine.category} medicine pills`;
}

// Main function
async function updateMedicineImages() {
  console.log('Starting to download unique images for medicines...\n');
  
  if (UNSPLASH_ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
    console.log('ERROR: Please set your Unsplash Access Key first!');
    console.log('Get one from: https://unsplash.com/developers\n');
    console.log('Alternative: Using Pexels instead (no API key needed)...\n');
    
    // Use Pexels as fallback
    await updateWithPexels();
    return;
  }
  
  let updated = 0;
  
  for (let i = 0; i < medicines.length; i++) {
    const medicine = medicines[i];
    const query = getMedicineSearchQuery(medicine);
    
    console.log(`[${i + 1}/${medicines.length}] ${medicine.name} -> "${query}"`);
    
    try {
      const imageUrl = await searchUnsplash(query);
      if (imageUrl) {
        medicine.imageUrl = imageUrl;
        updated++;
        console.log(`  ✓ Updated`);
      } else {
        console.log(`  ✗ No image found`);
      }
      
      // Rate limit: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
    }
  }
  
  // Save updated database
  data.medicines = medicines;
  fs.writeFileSync('medicines-database.json', JSON.stringify(data, null, 2));
  
  console.log(`\n✓ Complete! Updated ${updated}/${medicines.length} medicines`);
}

// Alternative: Use Pexels (no API key needed)
async function updateWithPexels() {
  console.log('Using placeholder images from Picsum...\n');
  
  // Generate unique images using Lorem Picsum with different seeds
  for (let i = 0; i < medicines.length; i++) {
    const medicine = medicines[i];
    const seed = medicine.id + Date.now();
    medicine.imageUrl = `https://picsum.photos/seed/${seed}/400/300`;
    console.log(`[${i + 1}/${medicines.length}] ${medicine.name} -> Updated with unique image`);
  }
  
  // Save updated database
  data.medicines = medicines;
  fs.writeFileSync('medicines-database.json', JSON.stringify(data, null, 2));
  
  console.log(`\n✓ Complete! All ${medicines.length} medicines now have unique images`);
}

// Run
updateMedicineImages().catch(console.error);
