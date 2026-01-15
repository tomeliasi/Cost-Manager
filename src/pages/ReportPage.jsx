import React, { useContext, useEffect, useMemo, useState } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { DbContext, RatesContext } from "../state/AppProviders.jsx";
import { convert } from "../storage/rates.js";

const CURRENCIES = ["USD", "ILS", "GBP", "EURO"];

function initMonthYear() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function ReportPage() {
  const { db, dbError } = useContext(DbContext);
  const { rates, ratesError } = useContext(RatesContext);
  const initial = useMemo(() => initMonthYear(), []);

  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [currency, setCurrency] = useState("USD");
  const [report, setReport] = useState(null);
  const [msg, setMsg] = useState({
    type: "info",
    text: "Select month/year/currency.",
  });

  useEffect(() => {
    if (!db) return;

    let alive = true;
    db.getReport(Number(year), Number(month), currency, rates, convert)
      .then((r) => {
        if (!alive) return;
        setReport(r);
        setMsg({
          type: "success",
          text: `Report ready for ${r.year}-${String(r.month).padStart(
            2,
            "0"
          )}.`,
        });
      })
      .catch(
        (e) => alive && setMsg({ type: "error", text: String(e?.message || e) })
      );

    return () => {
      alive = false;
    };
  }, [db, year, month, currency, rates]);

  const rows = useMemo(() => {
    if (!report || !rates) return [];
    return report.costs.map((c) => ({
      ...c,
      converted: convert(c.sum, c.currency, currency, rates),
    }));
  }, [report, rates, currency]);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Monthly Report</Typography>

      {dbError && <Alert severity="error">{dbError}</Alert>}
      {ratesError && <Alert severity="warning">{ratesError}</Alert>}
      <Alert severity={msg.type}>{msg.text}</Alert>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Month"
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              fullWidth
              inputProps={{ min: 1, max: 12 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              select
              fullWidth
            >
              {CURRENCIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">
          Total: {Number(report?.total?.total || 0).toFixed(2)} {currency}
        </Typography>

        <TableContainer sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Original</TableCell>
                <TableCell align="right">In {currency}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{r.Date?.day ?? ""}</TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell align="right">
                    {Number(r.sum).toFixed(2)} {r.currency}
                  </TableCell>
                  <TableCell align="right">
                    {Number(r.converted).toFixed(2)} {currency}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: "text.secondary" }}>
                    No costs found for this month.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
