import React, { useContext, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import { DbContext } from '../state/AppProviders.jsx';

const CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];
const CATEGORIES = ['Food', 'Car', 'Education', 'Home', 'Health', 'Bills', 'Entertainment', 'Other'];

export default function AddCostDialog({ open, onClose }) {
  const { db } = useContext(DbContext);
  const [sum, setSum] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState({ type: 'info', text: 'Fill the fields and save.' });

  const canSave = useMemo(() => {
    const n = Number(sum);
    return db && Number.isFinite(n) && n > 0 && description.trim().length > 0;
  }, [db, sum, description]);

  function reset() {
    setSum('');
    setCurrency('USD');
    setCategory('Food');
    setDescription('');
    setMsg({ type: 'info', text: 'Fill the fields and save.' });
  }

  async function onSave() {
    try {
      const n = Number(sum);
      await db.addCost({ sum: n, currency, category, description: description.trim() });
      setMsg({ type: 'success', text: 'Cost item saved (date stored automatically).' });
      reset();
      onClose();
    } catch (e) {
      setMsg({ type: 'error', text: String(e?.message || e) });
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Cost</DialogTitle>
      <DialogContent dividers>
        <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Sum"
              value={sum}
              onChange={(e) => setSum(e.target.value)}
              fullWidth
              inputProps={{ inputMode: 'decimal' }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} select fullWidth>
              {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} select fullWidth>
              {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text">Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={!canSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
