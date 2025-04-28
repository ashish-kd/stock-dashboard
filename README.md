# Stock Dashboard

A responsive React + TypeScript web app that fetches and displays intraday stock data from Alpha Vantage, with utility-first Tailwind CSS styling.

## Features

- **Symbol Search**: Lookup and add stocks using Alpha Vantage’s `SYMBOL_SEARCH` API.
- **Multi-Stock Table**: View a table of symbols, latest close price, and change %.
- **Sortable Columns**: Click on the Price header to toggle ascending/descending sort.
- **Loading & Error States**: Per-symbol spinner while fetching and inline error messages.
- **Interactive Charts**: Click on any stock row to toggle its intraday price chart (Chart.js).
- **Responsive Design**: Mobile-first layout built with Tailwind CSS (v4.1).
- **Deploy Anywhere**: Ready for GitHub Pages, Vercel, or Netlify.

---

## Prerequisites

- **Node.js** (v16+) and **npm**
- Free **Alpha Vantage API Key** (sign up at https://www.alphavantage.co)

---

## Getting Started

1. **Clone this repo**:
   ```bash
   git clone https://github.com/yourusername/stock-dashboard.git
   cd stock-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Tailwind CSS CLI**:
   - Create `src/input.css`:
     ```css
     @import "tailwindcss/base";
     @import "tailwindcss/components";
     @import "tailwindcss/utilities";
     ```
   - Add these npm scripts to your `package.json`:
     ```jsonc
     "scripts": {
       "build:css": "npx tailwindcss -i ./src/input.css -o ./src/output.css --watch",
       "start": "npm-run-all --parallel build:css react-scripts start",
       "build": "npm run build:css && react-scripts build"
     }
     ```

4. **Add environment variable**:
   - Create a file `.env` in the project root:
     ```bash
     REACT_APP_ALPHA_API_KEY=YOUR_ALPHA_VANTAGE_KEY
     ```

5. **Import compiled CSS**:
   In `src/index.tsx`, add:
   ```ts
   import './output.css';
   ```

---

## Running Locally

Start the dev server (with live Tailwind builds):

```bash
npm start
```

Open http://localhost:3000 in your browser.

---

## Build & Deployment

- **Production build**:
  ```bash
  npm run build
  ```

- **GitHub Pages**:
  1. Push the `build/` folder to `gh-pages` branch, or configure GitHub Pages source to the `build` directory.

- **Vercel / Netlify**:
  1. Connect your GitHub repo.
  2. Set **Build Command** to `npm run build` and **Publish Directory** to `build`.

---

## Usage

1. **Search** for a company by typing 2+ characters in the search box.
2. **Select** a suggested symbol to add it to the table and fetch data.
3. **Sort** by clicking the **Price** header.
4. **Click** any table row to toggle its intraday price chart below.

---

## Project Structure

```
├── public/
│   └── index.html
├── src/
│   ├── input.css       # Tailwind CLI entry
│   ├── output.css      # Generated Tailwind styles
│   ├── index.tsx       # Root import + ReactDOM
│   └── App.tsx         # Main dashboard component
├── .env                # API key
├── package.json        # Scripts & dependencies
└── README.md           # This file
```

---
