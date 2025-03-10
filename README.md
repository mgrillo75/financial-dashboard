<h1 align="center">
    <img src="https://ik.imagekit.io/dzojbyqyz/cover.png?updatedAt=1713803120525">
   
</h1>

# Financial Dashboard

A modern financial dashboard application built with React, TypeScript, and styled-components.

## 🔗 Live Demo

[Financial Dashboard](https://financial-dashboard-pi-seven.vercel.app/)

## 📖 About

This project is a financial dashboard that helps users manage their financial information, including credit and debit cards. It provides a clean interface for viewing and organizing financial data.

## 🚀 Technology Stack

- [React](https://reactjs.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Styled Components](https://styled-components.com/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Recharts](https://recharts.org/) - For data visualization
- [React Hook Form](https://react-hook-form.com/) - For form handling
- [Zod](https://zod.dev/) - For form validation
- [JSON Server](https://github.com/typicode/json-server) - For mock API

## 🛠️ Setup and Installation

### Prerequisites

- Node.js (v16 or higher)
- Yarn or npm

### Installation Steps

1. Clone the repository
```bash
git clone https://github.com/renanvilelati/financial-dashboard
cd financial-dashboard
```

2. Install dependencies
```bash
yarn
# or using npm
npm install
```

3. Start the mock backend server
```bash
yarn dev:back
# or using npm
npm run dev:back
```

4. In a new terminal, start the frontend development server
```bash
yarn dev
# or using npm
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal)

## 📋 Available Scripts

- `yarn dev` - Starts the frontend development server
- `yarn dev:back` - Starts the JSON server for mock API (runs on port 4000)
- `yarn dev:refresh` - Processes CSV data and starts both servers (JavaScript version)
- `yarn start` - Same as dev:refresh, ideal for regular use with JavaScript
- `yarn start:py` - **Processes CSV data and starts both servers using Python** (recommended)
- `yarn build` - Creates a production build
- `yarn lint` - Runs the linter
- `yarn preview` - Previews the production build locally
- `yarn test:refresh` - Tests the data processing without starting servers

## 🔄 CSV Data Processing

The application now supports automatic data processing on startup. When you run `yarn start`, `yarn dev:refresh`, or `yarn start:py` the application will:

1. Check for the `combined_truist_statements.csv` file in the `public` directory
2. Process the CSV file and update the `db.json` database
3. Start both the backend and frontend servers

This ensures any new data in your CSV file is automatically incorporated into the dashboard every time you start the application.

### Using the Python Launcher (Recommended)

For those who prefer a more robust launcher with better process management:

```bash
yarn start:py
# or
npm run start:py
```

The Python launcher provides:
- Automatic CSV data processing
- Cleaner console output with color coding
- Better process management
- Automatic browser opening

### Adding New Transactions

To add new transactions:

1. Update your `public/combined_truist_statements.csv` file with new transaction data
2. Run `yarn start` to process the new data and launch the application
3. The dashboard will now display the updated information

## 🔍 Project Structure

- `/src` - Source code
  - `/assets` - Static assets
  - `/components` - Reusable UI components
  - `/contexts` - React contexts
  - `/hooks` - Custom React hooks
  - `/mock` - Mock data
  - `/pages` - Page components
  - `/services` - API services
  - `/styles` - Global styles
  - `/types` - TypeScript type definitions
  - `/utils` - Utility functions

## 📋 Planned Updates

- [ ] Add mobile menu support
- [ ] Create horizontal scroll for card section

## 🧑‍💻 Author

Developed by Renan Vilela
