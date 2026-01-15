# Cost Manager — Front-End

Cost Manager is a front-end expense management application developed to meet academic course requirements, with a focus on clean architecture, client-side data handling, and data visualization.

## Overview
The application allows users to add and manage personal expenses, store data locally in the browser, and view monthly and yearly reports grouped by categories and currencies.

## Key Features
- Client-side data persistence using **IndexedDB**
- Promise-based IndexedDB wrapper (idb)
- Add expense items with amount, currency, category, description, and automatic date
- Monthly expense reports by month and year
- Currency conversion between USD, ILS, GBP, and EUR
- Data visualization:
  - Pie chart showing monthly totals by category
  - Bar chart showing yearly totals across 12 months
- Exchange rates fetched from an external source using the Fetch API
- Settings screen for overriding the exchange rates source
- Default exchange rates available without user configuration

## Technologies
- React
- Material UI (MUI)
- IndexedDB
- Fetch API
- Chart-based data visualization

This project is fully client-side and does not include a backend. It demonstrates local data storage, asynchronous APIs, and visual representation of financial data.
