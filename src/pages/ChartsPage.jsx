import React, { useContext, useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { DbContext, RatesContext } from '../state/AppProviders.jsx';
import { convert } from '../storage/rates.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

function initMonthYear() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/**
 * Charts (required):
 * - Pie chart by category for selected month/year.
 * - Bar chart for totals across 12 months in selected year.
 * Currency selection for both.
 */
export default function ChartsPage() {
  const { db, dbError } = useContext(DbContext);
  const { rates, ratesError } = useContext(RatesContext);
  const initial = useMemo(() => initMonthYear(), []);

  const [tab, setTab] = useState(0);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [yearForBar, setYearForBar] = useState(initial.year);
  const [currency, setCurrency] = useState('USD');
  const [msg, setMsg] = useState({ type: 'info', text: 'Choose inputs and view charts.' });

  const [pieData, setPieData] = useState({ labels: [], values: [] });
  const [barData, setBarData] = useState({ labels: [], values: [] });

  useEffect(() => {
    if (!db || !rates) return;

    let alive = true;
    Promise.all([
      db.getCategoryTotals(Number(year), Number(month), currency, rates, convert),
      db.getMonthlyTotals(Number(yearForBar), currency, rates, convert),
    ])
      .then(([cats, months]) => {
        if (!alive) return;
        setPieData({
          labels: cats.map((x) => x.category),
          values: cats.map((x) => Number(x.total || 0)),
        });
        setBarData({
          labels: months.map((x) => String(x.month)),
          values: months.map((x) => Number(x.total || 0)),
        });
        setMsg({ type: 'success', text: 'Charts updated.' });
      })
      .catch((e) => alive && setMsg({ type: 'error', text: String(e?.message || e) }));

    return () => { alive = false; };
  }, [db, rates, year, month, yearForBar, currency]);

  const pie = useMemo(() => ({
    labels: pieData.labels,
    datasets: [{ label: `By category (${currency})`, data: pieData.values }],
  }), [pieData, currency]);

  const bar = useMemo(() => ({
    labels: barData.labels,
    datasets: [{ label: `By month (${currency})`, data: barData.values }],
  }), [barData, currency]);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Charts</Typography>

      {dbError && <Alert severity="error">{dbError}</Alert>}
      {ratesError && <Alert severity="warning">{ratesError}</Alert>}
      <Alert severity={msg.type}>{msg.text}</Alert>

      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Pie (Categories)" />
          <Tab label="Bar (12 Months)" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} select fullWidth>
              {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Grid>

          {tab === 0 ? (
            <>
              <Grid item xs={12} md={3}>
                <TextField label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Month" type="number" value={month} onChange={(e) => setMonth(e.target.value)} fullWidth inputProps={{ min: 1, max: 12 }} />
              </Grid>
            </>
          ) : (
            <Grid item xs={12} md={3}>
              <TextField label="Year" type="number" value={yearForBar} onChange={(e) => setYearForBar(e.target.value)} fullWidth />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {tab === 0 ? (
          pieData.labels.length === 0 ? (
            <Typography color="text.secondary">No data for selected month.</Typography>
          ) : (
            <Pie data={pie} />
          )
        ) : (
          <Bar
            data={bar}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Total costs per month' },
              },
            }}
          />
        )}
      </Paper>
    </Stack>
  );
}
