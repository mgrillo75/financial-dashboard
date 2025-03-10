# Guide to Importing CSV Financial Data

This guide will help you import your CSV financial data into the Financial Dashboard application.

## Current Data Structure

The Financial Dashboard is currently expecting data in the following JSON format:

```json
{
  "cards": [
    {
      "id": "1",
      "type": "Credit",
      "userName": "User Name",
      "password": "1234 5678 9012 3456",
      "validate": "2024-05-30T23:47:55.991Z"
    }
  ]
}
```

## Steps to Import Your CSV Data

### 1. Prepare Your CSV File

Your CSV file should have headers in the first row. The script will try to match your CSV headers to the expected JSON structure.

Ideal CSV format should have columns for:
- Card type (credit/debit)
- Card holder name
- Card number
- Expiry date

Example:
```
Card Type,Holder Name,Card Number,Expiry Date
Credit,John Doe,1234 5678 9012 3456,05/2024
Debit,Jane Smith,9876 5432 1098 7654,12/2025
```

### 2. Place Your CSV File in the Public Directory

Copy your CSV file to the `public` directory of the project. The application is configured to look for a file named `combined_truist_statements.csv` in this location.

If you're using a different filename, you'll need to update the `csvFilePath` variable in `truist-to-json.js`.

### 3. Use Automatic Data Processing (Recommended)

The application now supports automatic data processing on startup. You can use either the JavaScript or Python launcher:

#### Python Launcher (Recommended)
```bash
# Start with Python launcher (recommended)
npm run start:py
# or
yarn start:py
```

#### JavaScript Launcher (Alternative)
```bash
# Start with JavaScript launcher
npm run start
# or
yarn start
```

Both options will:
1. Check for the `combined_truist_statements.csv` file in the `public` directory
2. Process the CSV file and update the `db.json` database
3. Start both the backend and frontend servers

### 4. Manually Run the Conversion Script (Alternative)

If you prefer to run the conversion process manually:

```bash
node truist-to-json.js
```

This will:
1. Read your CSV file
2. Convert it to the JSON format expected by the application
3. Save it to `db.json`
4. Show a preview of the first converted record

### 5. Verify Your Data

After the automatic or manual conversion, visit `http://localhost:4000/cards` or `http://localhost:4000/transactions` in your browser to make sure your data is available via the API.

## Updating Your Data

When you receive new transactions:

1. Append the new transactions to your `public/combined_truist_statements.csv` file
2. Restart the application using `npm run start` or `yarn start`
3. The dashboard will automatically incorporate the new data

## Troubleshooting

If your CSV data structure doesn't match the expected format:

1. Edit the `csv-to-json.js` file
2. Modify the field mappings in the script (look for the "Handle common financial field mappings" section)
3. Run the script again

## Adding Other Types of Financial Data

If you have other types of financial data beyond cards (like transactions, investments, etc.):

1. Create a new conversion script based on `csv-to-json.js`
2. Modify it to create a new array for your data type
3. Add the new data to the `dbData` object (e.g., `dbData.transactions = transactions;`)
4. Update the application code to fetch and display this new data type

## Notes on Data Privacy

The card information is being stored in the `password` field. For a production application, you should:

1. Never store actual card numbers in plain text
2. Use proper encryption for sensitive data
3. Consider masking card numbers (e.g., only showing last 4 digits)

This implementation is for development purposes only. 