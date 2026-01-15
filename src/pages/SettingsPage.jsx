import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { loadSettings, saveSettings } from "../storage/settings.js";
import { fetchRates } from "../storage/rates.js";

export default function SettingsPage() {
  const [ratesUrl, setRatesUrl] = useState("/rates.json");
  const [msg, setMsg] = useState({
    type: "info",
    text: "Default URL is /rates.json (works even if you do nothing).",
  });

  useEffect(() => {
    const s = loadSettings();
    setRatesUrl(s.ratesUrl);
  }, []);

  function onSave() {
    saveSettings({ ratesUrl: ratesUrl.trim() || "/rates.json" });
    setMsg({
      type: "success",
      text: "Saved. Refresh pages to refetch rates if needed.",
    });
  }

  async function onTest() {
    try {
      const r = await fetchRates(ratesUrl.trim() || "/rates.json");
      setMsg({
        type: "success",
        text: `OK. Loaded: USD=${r.USD}, ILS=${r.ILS}, GBP=${r.GBP}, EURO=${r.EURO}`,
      });
    } catch (e) {
      setMsg({ type: "error", text: `Failed: ${String(e?.message || e)}` });
    }
  }

  function onReset() {
    setRatesUrl("/rates.json");
    saveSettings({ ratesUrl: "/rates.json" });
    setMsg({ type: "info", text: "Reset to default." });
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Settings</Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Alert severity={msg.type}>{msg.text}</Alert>

          <TextField
            label="Exchange Rates URL"
            value={ratesUrl}
            onChange={(e) => setRatesUrl(e.target.value)}
            fullWidth
            helperText='Expected JSON: {"USD":1,"GBP":0.6,"EURO":0.7,"ILS":3.4}'
          />

          <Divider />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="contained" onClick={onSave}>
              Save
            </Button>
            <Button variant="outlined" onClick={onTest}>
              Test URL
            </Button>
            <Button variant="text" onClick={onReset}>
              Reset to default
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Requirement note: rates must be fetched from a server (Fetch API). A
            static JSON file deployed on the web is sufficient.
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}
