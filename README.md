# Cost Manager (Front-End) — React + MUI + IndexedDB

A distinct UI + code structure implementation that satisfies the course requirements:
- IndexedDB database (client-side)
- Promise-based idb wrapper (module version in React + vanilla version for submission)
- Add cost items (sum/currency/category/description) with automatic date (day added)
- Monthly report (month/year + target currency)
- Pie chart (month/year totals by category)
- Bar chart (12 months totals in selected year)
- Supported currencies: USD, ILS, GBP, EURO
- Exchange rates fetched from server using Fetch API
- Settings screen to override exchange rates URL
- Default rates URL works even if user does not configure settings

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Default exchange rates
`/public/rates.json` → available as `/rates.json` after deployment.
"# Cost-Manager" 
