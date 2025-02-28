import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Set paths for input and output
const csvFilePath = './public/combined_truist_statements.csv';
const jsonOutputPath = './db.json';

async function convertTruistCsvToJson() {
  try {
    // Check if CSV file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`);
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
    
    // Create arrays to hold different types of data
    const transactions = [];
    const cards = [];
    let id = 1;
    let transactionId = 1;

    // Track distinct merchants for categorization
    const merchants = new Set();
    const categories = {
      // Food & Dining
      'RESTAURANT': 'Dining',
      'GEPPETTOS': 'Dining',
      'ROUND TABLE': 'Dining',
      'EMPANADA': 'Dining',
      'CHARLIMIKE': 'Dining',
      'LOBSTER': 'Dining',
      'PIZZE': 'Dining',
      'TST*': 'Dining',
      'DIPPIN': 'Dining',
      'MCDONALD': 'Dining',
      'WHATABURGER': 'Dining',
      'CHICK-FIL-A': 'Dining',
      'TORCHYS': 'Dining',
      'JIMMY JOHNS': 'Dining',
      'PANERA': 'Dining',
      'CHIPOTLE': 'Dining',
      'HOPDODDY': 'Dining',
      'COCO CREPES': 'Dining',
      'TACO': 'Dining',
      'WENDYS': 'Dining',
      'PAPAS': 'Dining',
      'BURGER': 'Dining',
      'PIZZA': 'Dining',
      'SHAKE SHACK': 'Dining',
      'SALTGRASS': 'Dining',
      'SANDWICH': 'Dining',
      'FUZZIWIGS': 'Dining',
      'BONEFISH': 'Dining',
      'SUSHI': 'Dining',
      'PANDA EXPRESS': 'Dining',
      'WENDY': 'Dining',
      'SHAKE SHACK': 'Dining',
      'VILLAGE PIZZE': 'Dining',
      'FLOWER & CREAM': 'Dining', 
      'ENO AT THE DEL': 'Dining',
      'BOARDWALK': 'Dining',
      'MEALEO': 'Dining',
      'GRUB': 'Dining',
      'JERSEY MIKE': 'Dining',
      'STARBUCKS': 'Coffee',
      'BONEY': 'Grocery',
      'SPROUTS': 'Grocery',
      'H-E-B': 'Grocery',
      'KROGER': 'Grocery',
      'TARGET': 'Shopping',
      'WHOLE FOODS': 'Grocery',
      'TRADER': 'Grocery',
      'INSTACART': 'Grocery',
      'UBER EATS': 'Food Delivery',
      'GRUBHUB': 'Food Delivery',
      'DOORDASH': 'Food Delivery',
      
      // Transportation
      'UBER TRIP': 'Transportation',
      'UBER *TRIP': 'Transportation',
      'LYFT': 'Transportation',
      'RIDE': 'Transportation',
      'PARKING': 'Transportation',
      'CITYSDPKG': 'Transportation',
      'LAZ PARKING': 'Transportation',
      'HOU PARKING': 'Transportation',
      'COASTER': 'Transportation',
      'AIRPORT': 'Transportation',
      'TAXI': 'Transportation',
      'TRANSIT': 'Transportation',
      
      // Fuel
      'CHEVRON': 'Fuel',
      'SHELL': 'Fuel',
      'EXXON': 'Fuel',
      'FUEL MAXX': 'Fuel',
      'CIRCLE K': 'Fuel',
      'VALERO': 'Fuel',
      'PHILLIPS': 'Fuel',
      '76 GAS': 'Fuel',
      'TEXACO': 'Fuel',
      
      // Finance
      'COINBASE': 'Cryptocurrency',
      'ATM': 'Cash Withdrawal',
      'WITHDRAWAL': 'Cash Withdrawal',
      'ISPA/PIMDS': 'ATM Fee',
      'DEPOSIT': 'Income',
      'CREDIT': 'Income',
      'FEE': 'Bank Fee',
      'TRANSFER': 'Transfer',
      'ZELLE': 'Transfer',
      'VENMO': 'Transfer',
      'PAYPAL': 'Transfer',
      'ACH': 'Bill Payment',
      
      // Utilities & Bills
      'CPENERGY': 'Utility',
      'ENTEX': 'Utility',
      'STREAM ENERGY': 'Utility',
      'CENTERPOINT': 'Utility',
      'ELECTRIC': 'Utility',
      'WATER': 'Utility',
      'BILL ': 'Bill Payment',
      'PAYMENT': 'Bill Payment',
      'PHONE': 'Phone',
      'INTERNET': 'Internet',
      'RENT': 'Housing',
      'MORTGAGE': 'Housing',
      'BELLAIRE U': 'Utility',
      'CITY OF': 'Utility',
      
      // Shopping
      'AMAZON': 'Shopping',
      'WAL-MART': 'Shopping',
      'WALMART': 'Shopping',
      'TARGET': 'Shopping',
      'BEST BUY': 'Shopping',
      'JCPENNEY': 'Shopping',
      'COSTCO': 'Shopping',
      'WALGREENS': 'Pharmacy',
      'CVS': 'Pharmacy',
      'GRAINGER': 'Business Supplies',
      'OFFICE': 'Business Supplies',
      'STAPLES': 'Business Supplies',
      
      // Subscriptions & Digital Services
      'NETFLIX': 'Subscription',
      'SPOTIFY': 'Subscription',
      'APPLE.COM': 'Subscription',
      'GITHUB': 'Subscription',
      'ADOBE': 'Subscription',
      'ZOOM': 'Subscription',
      'DROPBOX': 'Subscription',
      'RING': 'Subscription',
      'DISNEY': 'Subscription',
      'HBO': 'Subscription',
      'PRIME': 'Subscription',
      'HULU': 'Subscription',
      
      // Entertainment
      'BELMONT PARK': 'Entertainment',
      'SKATING': 'Entertainment',
      'MOVIES': 'Entertainment',
      'THEATER': 'Entertainment',
      'CINEMA': 'Entertainment',
      'CONCERT': 'Entertainment',
      'TICKET': 'Entertainment',
      'HOUSTON BALLET': 'Entertainment',
      'GOLF': 'Entertainment',
      'WORKSHOP': 'Entertainment',
      'FITNESS': 'Health & Fitness',
      'GYM': 'Health & Fitness',
      'WESTSIDE TENNIS': 'Health & Fitness',
      
      // Services
      'UPWORK': 'Professional Services',
      'INSURANCE': 'Insurance',
      'NATL GEN INS': 'Insurance',
      'ACI*GM': 'Auto Finance',
      'MISTER CAR WASH': 'Auto Care',
      'TEAMVIEWER': 'Software',
      'LISLE VIOLIN': 'Music',
      'BOOST MOBILE': 'Phone',
      'ATT': 'Phone',
      '4TE*DYNAMARK': 'Home Security',
      'SERVICE': 'Services',
      'CANTEEN': 'Vending',
      'NAYAX': 'Vending',
      'CSC SERVICEWORK': 'Laundry',
      
      // Travel
      'HOTEL': 'Travel',
      'AIRBNB': 'Travel',
      'AIRLINE': 'Travel',
      'FLIGHT': 'Travel',
      'SWA': 'Travel',
      'DELTA': 'Travel',
      'UNITED': 'Travel',
      'SOUTHWEST': 'Travel',
      'AMERICAN AIRLINES': 'Travel',
      'CORONADO': 'Travel',
      'MIAMI': 'Travel',
      'HUDSON': 'Travel',
      
      // Retail
      'SIGNATURE SHOP': 'Retail',
      'LIQUOR': 'Alcohol',
      'CENTRAL LIQUOR': 'Alcohol',
      'PARTY CITY': 'Retail',
      'SMART STOP': 'Convenience Store',
      'V STAR': 'Convenience Store',
      
      // Health
      'MEDICAL': 'Healthcare',
      'DOCTOR': 'Healthcare',
      'PHARMACY': 'Healthcare',
      'DENTAL': 'Healthcare',
      'HOSPITAL': 'Healthcare',
      'CLINIC': 'Healthcare',
      
      // Technology
      'APPLE': 'Technology',
      'MICROSOFT': 'Technology',
      'GOOGLE': 'Technology',
      'TECH': 'Technology',
      'WIFI': 'Technology'
    };

    // Default card information since we don't have actual card data in the statements
    cards.push({
      id: "1",
      type: "Debit",
      userName: "Your Name",
      password: "1238 XXXX XXXX XXXX", // Based on card number fragments in the data
      validate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString()
    });

    // Function to determine category based on description
    function determineCategory(description, type, amount) {
      // Default category based on transaction type if description is not informative
      let defaultCategory = 'Miscellaneous';
      
      if (type === 'Credit' && amount > 0) {
        defaultCategory = 'Income';
      } else if (type === 'Debit' && amount < 0) {
        defaultCategory = 'Bill Payment';
      } else if (type === 'Fee') {
        defaultCategory = 'Bank Fee';
      } else if (type === 'ATM') {
        defaultCategory = 'Cash Withdrawal';
      } else if (type === 'POS' && amount < 0) {
        defaultCategory = 'Shopping';
      }
      
      // Check description against category keywords
      const upperDesc = description.toUpperCase();
      for (const [keyword, category] of Object.entries(categories)) {
        if (upperDesc.includes(keyword.toUpperCase())) {
          return category;
        }
      }
      
      // If no match found, use the default category based on transaction type
      return defaultCategory;
    }

    // Process each line of the CSV
    for await (const line of rl) {
      const values = parseCSVLine(line);
      
      if (values.length !== headers.length) {
        console.warn(`Skipping line with incorrect number of values: ${line}`);
        continue;
      }

      // Create a transaction object
      const transaction = { id: transactionId.toString() };
      
      // Variables to store transaction info for later category determination
      let transType = '';
      let description = '';
      let transAmount = 0;
      
      // Map CSV columns to transaction properties
      headers.forEach((header, index) => {
        const value = values[index];
        
        switch(header) {
          case 'Posted Date':
            transaction.postedDate = value;
            // Create a standardized date format
            const dateParts = value.split('/');
            const month = parseInt(dateParts[0], 10);
            const day = parseInt(dateParts[1], 10);
            const year = parseInt(dateParts[2], 10);
            
            // No longer validate the date - include all transactions regardless of date
            transaction.date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            break;
          case 'Transaction Date':
            transaction.transactionDate = value;
            break;
          case 'Transaction Type':
            transaction.type = value;
            transType = value;
            break;
          case 'Description':
            transaction.description = value;
            description = value;
            // Extract merchant name for categorization
            const words = value.split(' ');
            if (words.length > 0) {
              const possibleMerchant = words[0].replace('*', '').trim();
              if (possibleMerchant.length > 2) {
                merchants.add(possibleMerchant);
              }
            }
            break;
          case 'Amount':
            // Remove $ and convert to number
            let amount = value.replace('$', '').replace(',', '');
            // Handle parentheses notation for negative numbers
            if (amount.startsWith('(') && amount.endsWith(')')) {
              amount = '-' + amount.slice(1, -1);
            }
            transaction.amount = parseFloat(amount);
            transAmount = parseFloat(amount);
            transaction.isDebit = transaction.amount < 0;
            break;
        }
      });

      // Add computed fields
      transaction.category = determineCategory(description, transType, transAmount);
      transaction.cardId = "1"; // Link to the default card

      transactions.push(transaction);
      transactionId++;
    }

    // Calculate monthly spending by category
    const monthlySpending = {};
    transactions.forEach(t => {
      if (t.date) {
        const yearMonth = t.date.substring(0, 7); // Get YYYY-MM
        if (!monthlySpending[yearMonth]) {
          monthlySpending[yearMonth] = {};
        }
        
        const category = t.category;
        if (!monthlySpending[yearMonth][category]) {
          monthlySpending[yearMonth][category] = 0;
        }
        
        // Only add negative amounts (spending)
        if (t.amount < 0) {
          monthlySpending[yearMonth][category] += Math.abs(t.amount);
        }
      }
    });

    // Calculate total balance over time (for the chart)
    let balance = 0;
    const balanceHistory = [];
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    sortedTransactions.forEach(t => {
      balance += t.amount;
      balanceHistory.push({
        date: t.date,
        balance: balance.toFixed(2)
      });
    });

    // Create recent activity summary
    const recentActivity = sortedTransactions.slice(-20).reverse();
    
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

    // Add our data to the JSON
    dbData.cards = cards;
    dbData.transactions = transactions;
    dbData.monthlySpending = monthlySpending;
    dbData.balanceHistory = balanceHistory;
    dbData.recentActivity = recentActivity;

    // Analyze categorization results
    const categoryStats = {};
    const uncategorizedTransactions = [];
    
    transactions.forEach(t => {
      if (!categoryStats[t.category]) {
        categoryStats[t.category] = { count: 0, total: 0 };
      }
      categoryStats[t.category].count += 1;
      categoryStats[t.category].total += Math.abs(t.amount);
      
      if (t.category === 'Uncategorized') {
        uncategorizedTransactions.push(t);
      }
    });

    // Write to db.json
    fs.writeFileSync(jsonOutputPath, JSON.stringify(dbData, null, 2));
    
    console.log(`Successfully converted Truist statements to JSON.`);
    console.log(`Output saved to ${jsonOutputPath}`);
    console.log(`Found ${transactions.length} transactions.`);
    
    console.log('\nCreated the following data:');
    console.log(`- ${cards.length} cards`);
    console.log(`- ${transactions.length} transactions`);
    console.log(`- ${Object.keys(monthlySpending).length} months of spending data`);
    console.log(`- ${balanceHistory.length} balance history points`);
    
    console.log('\nCategory statistics:');
    Object.entries(categoryStats)
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([category, stats]) => {
        console.log(`- ${category}: ${stats.count} transactions, $${stats.total.toFixed(2)}`);
      });
    
    console.log(`\nUncategorized transactions: ${uncategorizedTransactions.length}`);
    if (uncategorizedTransactions.length > 0) {
      console.log('Sample of uncategorized transactions:');
      uncategorizedTransactions.slice(0, 5).forEach(t => {
        console.log(`- ${t.description}: $${Math.abs(t.amount).toFixed(2)}`);
      });
    }
    
    // Preview one transaction
    if (transactions.length > 0) {
      console.log('\nPreview of first transaction:');
      console.log(JSON.stringify(transactions[0], null, 2));
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
convertTruistCsvToJson(); 