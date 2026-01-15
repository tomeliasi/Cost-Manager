import React, { createContext, useEffect, useMemo, useState } from "react";
import { openCostsDB } from "../storage/idbRepo.js";
import { loadSettings } from "../storage/settings.js";
import { fetchRates } from "../storage/rates.js";

export const DbContext = createContext(null);
export const RatesContext = createContext(null);

const DB_NAME = "costsdb";
const DB_VERSION = 2;

export function AppProviders({ children }) {
  const [db, setDb] = useState(null);
  const [dbError, setDbError] = useState("");
  const [rates, setRates] = useState(null);
  const [ratesError, setRatesError] = useState("");
  const settings = useMemo(() => loadSettings(), []);

  useEffect(() => {
    let alive = true;

    openCostsDB(DB_NAME, DB_VERSION)
      .then((repo) => {
        if (alive) setDb(repo);
      })
      .catch((e) => {
        if (alive) setDbError(String(e?.message || e));
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setRatesError("");

    fetchRates(settings.ratesUrl)
      .then((r) => {
        if (alive) setRates(r);
      })
      .catch((e) => {
        if (alive) setRatesError(String(e?.message || e));
      });

    return () => {
      alive = false;
    };
  }, [settings.ratesUrl]);

  return (
    <DbContext.Provider value={{ db, dbError }}>
      <RatesContext.Provider value={{ rates, ratesError }}>
        {children}
      </RatesContext.Provider>
    </DbContext.Provider>
  );
}
