const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Update these values with your CSV file path and output JSON file path
const csvFilePath = './your-financial-data.csv';
const jsonOutputPath = './db.json';

async function convertCsvToJson() {
  try {
    // Check if CSV file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`);
      console.log('Please place your CSV file in the project directory and update the file path in csv-to-json.js');
      return;
    }

    const fileStream = fs.createReadStream(csvFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    // Read the header line to get column names
    const headerLine = await new Promise(resolve => {
      rl.once('line', line => {
        resolve(line);
      });
    });

    const headers = headerLine.split(',').map(header => header.trim());
    
    // Create an array to hold all data rows
    const cards = [];
    let id = 1;

    // Process each line of the CSV
    for await (const line of rl) {
      const values = parseCSVLine(line);
      
      if (values.length !== headers.length) {
        console.warn(`Skipping line with incorrect number of values: ${line}`);
        continue;
      }

      // Create an object for this row
      const card = { id: id.toString() };
      
      // Map CSV columns to JSON properties
      headers.forEach((header, index) => {
        // Convert header names to camelCase if needed
        let propName = header.toLowerCase();
        
        // Handle common financial field mappings
        // Modify these mappings based on your CSV structure
        if (propName.includes('type')) propName = 'type';
        if (propName.includes('name') || propName.includes('holder')) propName = 'userName';
        if (propName.includes('number') || propName.includes('card number')) propName = 'password';
        if (propName.includes('expiry') || propName.includes('date') || 
            propName.includes('valid') || propName.includes('expires')) propName = 'validate';
        
        card[propName] = values[index];
      });

      // Convert date fields to ISO format if needed
      if (card.validate && !card.validate.includes('T')) {
        // Try to parse and convert date format
        try {
          const dateParts = card.validate.split(/[-/]/);
          if (dateParts.length >= 2) {
            // Assuming MM/YY or MM/YYYY format
            let month = parseInt(dateParts[0], 10);
            let year = parseInt(dateParts[1], 10);
            
            // Handle 2-digit years
            if (year < 100) year += 2000;
            
            const expiryDate = new Date(year, month - 1, 28); // Last day of month
            card.validate = expiryDate.toISOString();
          }
        } catch (e) {
          console.warn(`Could not parse date: ${card.validate}`);
        }
      }

      cards.push(card);
      id++;
    }

    // Read existing db.json if it exists
    let dbData = {};
    if (fs.existsSync(jsonOutputPath)) {
      try {
        const existingData = fs.readFileSync(jsonOutputPath, 'utf8');
        dbData = JSON.parse(existingData);
      } catch (err) {
        console.warn('Could not parse existing db.json, creating a new one');
      }
    }

    // Add the cards data
    dbData.cards = cards;

    // Write to db.json
    fs.writeFileSync(jsonOutputPath, JSON.stringify(dbData, null, 2));
    
    console.log(`Successfully converted CSV to JSON. Output saved to ${jsonOutputPath}`);
    console.log(`Found ${cards.length} records.`);
    
    // Quick preview of the first record
    if (cards.length > 0) {
      console.log('\nPreview of first record:');
      console.log(JSON.stringify(cards[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

// Helper function to handle CSV lines properly (accounts for quoted values with commas)
function parseCSVLine(line) {
  const values = [];
  let inQuote = false;
  let currentValue = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add the last value
  values.push(currentValue.trim());
  
  return values;
}

// Run the conversion
convertCsvToJson(); 