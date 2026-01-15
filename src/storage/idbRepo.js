let _db = null;

function reqToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("IndexedDB request failed"));
  });
}

function openDb(name, version) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create store if missing; otherwise ensure indexes exist.
      let store;
      if (!db.objectStoreNames.contains("costs")) {
        store = db.createObjectStore("costs", {
          keyPath: "id",
          autoIncrement: true,
        });
      } else {
        store = event.target.transaction.objectStore("costs");
      }

      if (!store.indexNames.contains("idx_year_month")) {
        store.createIndex("idx_year_month", ["date.year", "date.month"], {
          unique: false,
        });
      }
      if (!store.indexNames.contains("idx_year")) {
        store.createIndex("idx_year", "date.year", { unique: false });
      }
      if (!store.indexNames.contains("idx_category")) {
        store.createIndex("idx_category", "category", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () =>
      reject(req.error || new Error("Failed to open IndexedDB"));
  });
}

function today() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

function getStore(mode) {
  if (!_db) throw new Error("DB not opened");
  const tx = _db.transaction("costs", mode);
  return { store: tx.objectStore("costs"), tx };
}

function validateCost(cost) {
  if (
    typeof cost?.sum !== "number" ||
    !Number.isFinite(cost.sum) ||
    cost.sum <= 0
  ) {
    throw new Error("sum must be a positive number");
  }
  if (typeof cost?.currency !== "string" || !cost.currency) {
    throw new Error("currency is required");
  }
  if (typeof cost?.category !== "string" || !cost.category) {
    throw new Error("category is required");
  }
  if (typeof cost?.description !== "string" || !cost.description) {
    throw new Error("description is required");
  }
}

async function addCost(cost) {
  validateCost(cost);
  const d = today();
  const item = {
    sum: cost.sum,
    currency: cost.currency,
    category: cost.category,
    description: cost.description,
    date: d,
    timestamp: Date.now(),
  };

  const { store } = getStore("readwrite");
  const id = await reqToPromise(store.add(item));
  return { ...item, id };
}

async function costsByMonth(year, month) {
  const { store } = getStore("readonly");
  const idx = store.index("idx_year_month");
  return reqToPromise(idx.getAll(IDBKeyRange.only([year, month])));
}

async function costsByYear(year) {
  const { store } = getStore("readonly");
  const idx = store.index("idx_year");
  return reqToPromise(idx.getAll(IDBKeyRange.only(year)));
}

function sumConverted(costs, currency, rates, convertFn) {
  let total = 0;
  costs.forEach((c) => {
    total += convertFn(c.sum, c.currency, currency, rates);
  });
  return total;
}

export async function openCostsDB(databaseName, databaseVersion) {
  _db = await openDb(databaseName, databaseVersion);

  return {
    addCost,

    /**
     * getReport(year, month, currency)
     * We allow extra args (rates, convertFn) for app usage.
     */
    async getReport(year, month, currency, rates, convertFn) {
      const list = await costsByMonth(year, month);
      const costs = Array.isArray(list) ? list : [];
      const total =
        rates && convertFn
          ? sumConverted(costs, currency, rates, convertFn)
          : 0;

      return {
        year,
        month,
        costs: costs.map((c) => ({
          sum: c.sum,
          currency: c.currency,
          category: c.category,
          description: c.description,
          Date: { day: c.date?.day ?? null },
        })),
        total: { currency, total },
      };
    },

    async getCategoryTotals(year, month, currency, rates, convertFn) {
      const list = await costsByMonth(year, month);
      const costs = Array.isArray(list) ? list : [];
      const map = new Map();
      costs.forEach((c) => {
        const v =
          rates && convertFn
            ? convertFn(c.sum, c.currency, currency, rates)
            : c.sum;
        map.set(c.category, (map.get(c.category) || 0) + v);
      });
      return Array.from(map.entries()).map(([category, total]) => ({
        category,
        total,
        currency,
      }));
    },

    async getMonthlyTotals(year, currency, rates, convertFn) {
      const list = await costsByYear(year);
      const costs = Array.isArray(list) ? list : [];
      const totals = Array.from({ length: 12 }, () => 0);

      costs.forEach((c) => {
        const m = (c.date?.month ?? 1) - 1;
        if (m < 0 || m > 11) return;
        const v =
          rates && convertFn
            ? convertFn(c.sum, c.currency, currency, rates)
            : c.sum;
        totals[m] += v;
      });

      return totals.map((total, i) => ({ month: i + 1, total, currency }));
    },
  };
}
