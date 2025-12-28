"use client"
import { useState } from "react";

export default function Page() {
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear());
  return <>
    <a
      href="api/inventory/productsNonZeroCount"
    >
      Products with non zero-count (useful for correcting product counts) (.csv)
    </a>
    <br></br>
    <a
      href="api/inventory/productsGreaterThanZeroStock"
    >
      Products with greater than zero-count (useful for inventory report of products) (.csv)
    </a>
    <br></br>

    <a href={"api/inventory/saldoDeposits?year=" + financialYear}
    >
      Saldo deposits within selected year (.csv)
    </a>
    <input type="number" name="financial-year" value={financialYear} onChange={e => setFinancialYear(Number.parseInt(e.target.value))} min="2000" max="3000" />
    <br></br>

    <a href={"api/inventory/monthlyReport?year=" + financialYear}
    >
      Financial report for the year (.csv)
    </a>
    <input type="number" name="financial-year" value={financialYear} onChange={e => setFinancialYear(Number.parseInt(e.target.value))} min="2000" max="3000" />
    <br></br>
  </>
}
