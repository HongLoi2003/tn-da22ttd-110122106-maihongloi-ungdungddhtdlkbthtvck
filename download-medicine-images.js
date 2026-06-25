const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Read medicines database
const medicinesData = JSON.parse(fs.readFileSync('medicines-database.json', 'utf-8'));

// Unsplash Access Key (you need to add this to .env.local)
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'YOUR_UNSPLASH_ACCESS_KEY';

async function downloadMedicineImages() {
  console.log('🔄 Starting to download medicine images...\n');
  
  const medicines = medicinesData.medicines;
  const updatedMedicines = [];
  
  // Create images directory if it doesn't exist
  const imagesDir = path.join(__dirname, 'assets', 'medicine-images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  for (let i = 0; i < medicines.length; i++) {
    const medicine = medicines[i];
    const medicineId = medicine.id;
    
    try {
      // Search queries based on medicine category
      let searchQuery = '';
      if (medicine.category.includes('Giảm đau')) {
        searchQuery = 'medicine pills painkiller tablet';
      } else if (medicine.category.includes('Kháng sinh')) {
        searchQuery = 'antibiotic capsule medicine';
      } else if (medicine.category.includes('Vitamin')) {
        searchQuery = 'vitamin supplement pills bottle';
      } else if (medicine.category.includes('Tiêu hóa')) {
        searchQuery = 'digestive medicine tablet';
      } else if (medicine.category.includes('Hô hấp')) {
        searchQuery = 'cough medicine syrup pills';
      } else if (medicine.category.includes('Tim mạch')) {
        searchQuery = 'heart medicine cardiovascular pills';
      } else if (medicine.category.includes('Da liễu')) {
        searchQuery = 'skin cream ointment tube';
      } else {
        searchQuery = 'medicine pills pharmaceutical';
      }

      // Use Unsplash API
      const response = await axios.get(`https://api.unsplash.com/photos/random`, {
        params: {
          query: searchQuery,
          orientation: 'squarish',
          client_id: UNSPLASH_ACCESS_KEY
        }
      });

      const imageUrl = response.data.urls.regular;
      const imageSmallUrl = response.data.urls.small;
      
      // Add image URL to medicine data
      updatedMedicines.push({
        ...medicine,
        imageUrl: imageSmallUrl,
        imageUrlLarge: imageUrl,
        imageCredit: {
          photographer: response.data.user.name,
          photographerUrl: response.data.user.links.html,
          source: 'Unsplash'
        }
      });

      console.log(`✅ [${i + 1}/${medicines.length}] ${medicine.name} - Image added`);
      
      // Rate limiting - Unsplash allows 50 requests per hour for free tier
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      
    } catch (error) {
      console.error(`❌ [${i + 1}/${medicines.length}] ${medicine.name} - Error: ${error.message}`);
      
      // Keep original data without image
      updatedMedicines.push({
        ...medicine,
        imageUrl: null,
        imageUrlLarge: null
      });
    }
  }

  // Save updated database
  const output = {
    medicines: updatedMedicines,
    lastUpdated: new Date().toISOString(),
    totalCount: updatedMedicines.length
  };

  fs.writeFileSync('medicines-database-with-images.json', JSON.stringify(output, null, 2), 'utf-8');
  
  console.log('\n✅ Process completed!');
  console.log(`📄 File saved: medicines-database-with-images.json`);
  console.log(`🖼️  Total images: ${updatedMedicines.filter(m => m.imageUrl).length}/${updatedMedicines.length}`);
}

// Alternative: Use Pexels API (Free, more generous rate limits)
async function downloadMedicineImagesFromPexels() {
  console.log('🔄 Starting to download medicine images from Pexels...\n');
  
  const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY';
  const medicines = medicinesData.medicines;
  const updatedMedicines = [];

  for (let i = 0; i < medicines.length; i++) {
    const medicine = medicines[i];
    
    try {
      let searchQuery = '';
      if (medicine.category.includes('Giảm đau')) {
        searchQuery = 'medicine pills painkiller';
      } else if (medicine.category.includes('Kháng sinh')) {
        searchQuery = 'antibiotic capsule';
      } else if (medicine.category.includes('Vitamin')) {
        searchQuery = 'vitamin supplement';
      } else if (medicine.category.includes('Tiêu hóa')) {
        searchQuery = 'digestive medicine';
      } else if (medicine.category.includes('Hô hấp')) {
        searchQuery = 'cough medicine';
      } else if (medicine.category.includes('Tim mạch')) {
        searchQuery = 'heart medicine';
      } else if (medicine.category.includes('Da liễu')) {
        searchQuery = 'skin cream tube';
      } else {
        searchQuery = 'pharmaceutical medicine';
      }

      const response = await axios.get(`https://api.pexels.com/v1/search`, {
        params: {
          query: searchQuery,
          per_page: 1,
          page: Math.floor(Math.random() * 10) + 1 // Random page for variety
        },
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      });

      if (response.data.photos && response.data.photos.length > 0) {
        const photo = response.data.photos[0];
        
        updatedMedicines.push({
          ...medicine,
          imageUrl: photo.src.medium,
          imageUrlLarge: photo.src.large,
          imageCredit: {
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            source: 'Pexels'
          }
        });

        console.log(`✅ [${i + 1}/${medicines.length}] ${medicine.name} - Image added`);
      } else {
        updatedMedicines.push({
          ...medicine,
          imageUrl: null,
          imageUrlLarge: null
        });
        console.log(`⚠️  [${i + 1}/${medicines.length}] ${medicine.name} - No image found`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay
      
    } catch (error) {
      console.error(`❌ [${i + 1}/${medicines.length}] ${medicine.name} - Error: ${error.message}`);
      updatedMedicines.push({
        ...medicine,
        imageUrl: null,
        imageUrlLarge: null
      });
    }
  }

  const output = {
    medicines: updatedMedicines,
    lastUpdated: new Date().toISOString(),
    totalCount: updatedMedicines.length
  };

  fs.writeFileSync('medicines-database-with-images.json', JSON.stringify(output, null, 2), 'utf-8');
  
  console.log('\n✅ Process completed!');
  console.log(`📄 File saved: medicines-database-with-images.json`);
  console.log(`🖼️  Total images: ${updatedMedicines.filter(m => m.imageUrl).length}/${updatedMedicines.length}`);
}

// Run the function
const useSource = process.argv[2] || 'pexels'; // default to pexels

if (useSource === 'unsplash') {
  downloadMedicineImages();
} else {
  downloadMedicineImagesFromPexels();
}
