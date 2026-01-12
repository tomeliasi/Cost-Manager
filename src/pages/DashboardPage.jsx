import React, { useContext, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import AddCostDialog from '../ui/AddCostDialog.jsx';
import { DbContext, RatesContext } from '../state/AppProviders.jsx';

/**
 * Dashboard: quick status + quick add.
 * Requirement: Add cost item with sum/currency/category/description (date saved automatically).
 */
export default function DashboardPage() {
  const { db, dbError } = useContext(DbContext);
  const { rates, ratesError } = useContext(RatesContext);
  const [open, setOpen] = useState(false);

  const badges = useMemo(() => {
    const list = [];
    if (db) list.push({ label: 'IndexedDB connected', color: 'success' });
    if (dbError) list.push({ label: 'DB error', color: 'error' });
    if (rates) list.push({ label: 'Rates loaded', color: 'success' });
    if (ratesError) list.push({ label: 'Rates fetch failed', color: 'warning' });
    return list;
  }, [db, dbError, rates, ratesError]);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Dashboard</Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap">
        {badges.map((b, i) => (
          <Chip key={i} label={b.label} color={b.color} variant="outlined" />
        ))}
      </Stack>

      {dbError && <Alert severity="error">{dbError}</Alert>}
      {ratesError && <Alert severity="warning">{ratesError}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Typography variant="h5">Quick Add</Typography>
              <Typography color="text.secondary">
                Add a new cost item. The date is set automatically to the day you add it.
              </Typography>
              <Button
                onClick={() => setOpen(true)}
                variant="contained"
                startIcon={<AddIcon />}
                disabled={!db}
                sx={{ width: 'fit-content', mt: 1 }}
              >
                Add Cost
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Typography variant="h5">What you can do</Typography>
              <Typography color="text.secondary">• Monthly report (month/year + currency)</Typography>
              <Typography color="text.secondary">• Pie chart by category</Typography>
              <Typography color="text.secondary">• Bar chart (12 months) by year</Typography>
              <Typography color="text.secondary">• Settings: exchange rates URL</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <AddCostDialog open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
}
