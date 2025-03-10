import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔄 Starting data refresh process...');

// Check if combined_truist_statements.csv exists
const csvFilePath = './public/combined_truist_statements.csv';
if (!fs.existsSync(csvFilePath)) {
  console.error(`⚠️ Warning: CSV file not found: ${csvFilePath}`);
  console.log('💡 The application will still start, but no data will be processed.');
} else {
  console.log('✅ CSV file found, processing data...');
}

// Import and run the data processing script
console.log('🔄 Converting CSV data to JSON...');
try {
  // We'll dynamically import and run the conversion script
  import('./truist-to-json.js')
    .then(() => {
      console.log('✅ Data processing completed successfully!');
      startServers();
    })
    .catch(error => {
      console.error('❌ Error during data processing:', error);
      console.log('💡 The application will still start with existing data.');
      startServers();
    });
} catch (error) {
  console.error('❌ Error importing processing script:', error);
  console.log('💡 The application will still start with existing data.');
  startServers();
}

function startServers() {
  console.log('🚀 Starting servers...');

  // Start the JSON server (backend)
  const jsonServer = exec('npx json-server db.json -p 4000');
  jsonServer.stdout.on('data', (data) => {
    console.log(`Backend: ${data.trim()}`);
  });
  jsonServer.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data.trim()}`);
  });

  // Give the backend a moment to start up
  setTimeout(() => {
    // Start the frontend development server
    const frontendServer = exec('npx vite');
    frontendServer.stdout.on('data', (data) => {
      console.log(`Frontend: ${data.trim()}`);
    });
    frontendServer.stderr.on('data', (data) => {
      console.error(`Frontend Error: ${data.trim()}`);
    });
  }, 1000);

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    process.exit();
  });
} 