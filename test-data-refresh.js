import fs from 'fs';
import path from 'path';

// This script tests the data refresh logic without starting the servers
console.log('🧪 Testing data refresh functionality...');

// Check if combined_truist_statements.csv exists
const csvFilePath = './public/combined_truist_statements.csv';
if (!fs.existsSync(csvFilePath)) {
  console.error(`⚠️ Warning: CSV file not found: ${csvFilePath}`);
  console.log('💡 The test cannot continue. Please make sure the CSV file exists in the public directory.');
  process.exit(1);
}

console.log('✅ CSV file found:', csvFilePath);

// Check if db.json exists and get its last modified time
const jsonFilePath = './db.json';
let dbJsonLastModified = null;
if (fs.existsSync(jsonFilePath)) {
  const stats = fs.statSync(jsonFilePath);
  dbJsonLastModified = stats.mtime;
  console.log('✅ db.json file found, last modified:', dbJsonLastModified);
} else {
  console.log('ℹ️ db.json file does not exist yet, it will be created during processing.');
}

// Import and run the data processing script
console.log('🔄 Running conversion script...');
import('./truist-to-json.js')
  .then(() => {
    console.log('✅ Data processing completed successfully!');
    
    // Check if db.json was modified
    if (fs.existsSync(jsonFilePath)) {
      const newStats = fs.statSync(jsonFilePath);
      if (!dbJsonLastModified || newStats.mtime > dbJsonLastModified) {
        console.log('✅ db.json was successfully updated!');
      } else {
        console.log('⚠️ db.json was not modified. This might indicate no new data was found or there was an issue.');
      }
      
      // Verify the content structure
      try {
        const dbContent = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        console.log('✅ db.json content verification:');
        console.log(`  - Cards: ${dbContent.cards ? dbContent.cards.length : 0}`);
        console.log(`  - Transactions: ${dbContent.transactions ? dbContent.transactions.length : 0}`);
        console.log(`  - Monthly spending data: ${Object.keys(dbContent.monthlySpending || {}).length} months`);
        console.log(`  - Balance history points: ${dbContent.balanceHistory ? dbContent.balanceHistory.length : 0}`);
      } catch (error) {
        console.error('❌ Error verifying db.json content:', error);
      }
    } else {
      console.error('❌ db.json was not created after processing!');
    }
  })
  .catch(error => {
    console.error('❌ Error during data processing:', error);
  }); 