import React, { useMemo, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";

// Helpers
const formatINR = (n) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const pctChange = (curr, prev) => (prev === 0 ? 0 : ((curr - prev) / prev) * 100);
function KpiCard({ title, curr, prev, prefix = "", decimals = 2 }) {
  const change = pctChange(curr, prev);
  const isUp = change >= 0;
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 flex items-end gap-2">
        <div className="text-2xl font-semibold">
          {prefix ? prefix + curr.toLocaleString("en-IN", { maximumFractionDigits: decimals }) : curr.toLocaleString("en-IN", { maximumFractionDigits: decimals })}
        </div>
        <div className={`text-xs font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
          {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-500">Prev: {prefix ? prefix + prev.toLocaleString("en-IN", { maximumFractionDigits: decimals }) : prev.toLocaleString("en-IN", { maximumFractionDigits: decimals })}</div>
    </div>
  );
}
function SectionTitle({ children }) {
  return <h2 className="text-lg font-semibold tracking-tight">{children}</h2>;
}

// ---- Raw daily data parsed from the PDF ----
const daily = [
  { date: "01/09/2025", totalSpend: 24866.78, shopifyRevenue: 45500.91, roas: 1.83, meta: { spend: 19093.92, revenue: 38874.04, roas: 2.04, purchases: 39 }, google: { cost: 5772.86, convValue: 16580.13, roas: 3.62, conversions: 9 } },
  { date: "02/09/2025", totalSpend: 26914.37, shopifyRevenue: 49374.89, roas: 1.83, meta: { spend: 20377.96, revenue: 36466.86, roas: 1.79, purchases: 36 }, google: { cost: 6536.41, convValue: 17669.78, roas: 2.44, conversions: 14 } },
  { date: "03/09/2025", totalSpend: 24712.34, shopifyRevenue: 56352.62, roas: 2.28, meta: { spend: 18678.41, revenue: 44968.19, roas: 2.41, purchases: 47 }, google: { cost: 6033.93, convValue: 17773.23, roas: 2.21, conversions: 14 } },
  { date: "04/09/2025", totalSpend: 25587.03, shopifyRevenue: 58113.76, roas: 2.27, meta: { spend: 18040.03, revenue: 43150.46, roas: 2.39, purchases: 46 }, google: { cost: 7547.00, convValue: 21895.36, roas: 2.81, conversions: 15 } },
  { date: "05/09/2025", totalSpend: 23698.09, shopifyRevenue: 70936.85, roas: 2.99, meta: { spend: 19692.00, revenue: 52212.44, roas: 2.65, purchases: 54 }, google: { cost: 4006.09, convValue: 18603.41, roas: 2.74, conversions: 16 } },
  { date: "06/09/2025", totalSpend: 24265.40, shopifyRevenue: 56981.62, roas: 2.35, meta: { spend: 17554.51, revenue: 33781.00, roas: 1.92, purchases: 34 }, google: { cost: 6710.89, convValue: 21547.71, roas: 3.46, conversions: 15 } },
  { date: "07/09/2025", totalSpend: 27644.31, shopifyRevenue: 62755.61, roas: 2.27, meta: { spend: 21533.70, revenue: 58759.49, roas: 2.73, purchases: 64 }, google: { cost: 6110.61, convValue: 13143.50, roas: 2.04, conversions: 14 } },
  { date: "08/09/2025", totalSpend: 28469.20, shopifyRevenue: 53964.78, roas: 1.90, meta: { spend: 19822.30, revenue: 34252.40, roas: 1.73, purchases: 34 }, google: { cost: 8646.90, convValue: 17783.72, roas: 1.84, conversions: 14 } },
  { date: "09/09/2025", totalSpend: 27848.18, shopifyRevenue: 75152.58, roas: 2.70, meta: { spend: 19952.17, revenue: 49901.50, roas: 2.50, purchases: 56 }, google: { cost: 7896.01, convValue: 24664.56, roas: 2.63, conversions: 19 } },
  { date: "10/09/2025", totalSpend: 26481.59, shopifyRevenue: 56311.89, roas: 2.13, meta: { spend: 20369.32, revenue: 51637.80, roas: 2.54, purchases: 41 }, google: { cost: 6112.27, convValue: 5444.50, roas: 1.42, conversions: 7 } },
  { date: "11/09/2025", totalSpend: 24894.39, shopifyRevenue: 71585.92, roas: 2.88, meta: { spend: 20259.55, revenue: 54414.31, roas: 2.69, purchases: 46 }, google: { cost: 4634.84, convValue: 17310.10, roas: 3.23, conversions: 14 } },
  { date: "12/09/2025", totalSpend: 40887.08, shopifyRevenue: 113877.20, roas: 2.79, meta: { spend: 33685.81, revenue: 91962.96, roas: 2.73, purchases: 93 }, google: { cost: 7201.27, convValue: 31366.01, roas: 3.65, conversions: 24 } },
  { date: "13/09/2025", totalSpend: 24783.94, shopifyRevenue: 66414.94, roas: 2.68, meta: { spend: 19054.58, revenue: 48690.27, roas: 2.56, purchases: 50 }, google: { cost: 5729.36, convValue: 24358.94, roas: 3.82, conversions: 21 } },
  { date: "14/09/2025", totalSpend: 36737.80, shopifyRevenue: 86295.25, roas: 2.35, meta: { spend: 29902.41, revenue: 65984.88, roas: 2.21, purchases: 72 }, google: { cost: 6835.39, convValue: 16784.88, roas: 2.54, conversions: 12 } },
  { date: "15/09/2025", totalSpend: 34215.24, shopifyRevenue: 75762.25, roas: 2.21, meta: { spend: 27781.87, revenue: 62461.87, roas: 2.25, purchases: 59 }, google: { cost: 6433.37, convValue: 20104.63, roas: 2.51, conversions: 16 } },
  { date: "16/09/2025", totalSpend: 35440.92, shopifyRevenue: 73840.60, roas: 2.08, meta: { spend: 29833.06, revenue: 63436.29, roas: 2.13, purchases: 70 }, google: { cost: 5607.86, convValue: 13629.34, roas: 2.07, conversions: 14 } },
  { date: "17/09/2025", totalSpend: 30396.20, shopifyRevenue: 69430.43, roas: 2.28, meta: { spend: 23572.74, revenue: 62495.23, roas: 2.65, purchases: 62 }, google: { cost: 6823.46, convValue: 23302.06, roas: 3.22, conversions: 17 } },
  { date: "18/09/2025", totalSpend: 27236.44, shopifyRevenue: 71125.47, roas: 2.61, meta: { spend: 21074.18, revenue: 63252.60, roas: 3.00, purchases: 59 }, google: { cost: 6162.26, convValue: 19869.56, roas: 2.76, conversions: 15 } },
  { date: "19/09/2025", totalSpend: 30845.60, shopifyRevenue: 84225.54, roas: 2.73, meta: { spend: 23481.19, revenue: 54431.33, roas: 2.32, purchases: 56 }, google: { cost: 7364.41, convValue: 20866.34, roas: 3.28, conversions: 19 } },
  { date: "20/09/2025", totalSpend: 34402.62, shopifyRevenue: 109933.61, roas: 3.20, meta: { spend: 25479.36, revenue: 96244.83, roas: 3.78, purchases: 87 }, google: { cost: 8923.26, convValue: 32536.87, roas: 2.92, conversions: 20 } },
  { date: "21/09/2025", totalSpend: 42582.12, shopifyRevenue: 112016.26, roas: 2.63, meta: { spend: 34637.25, revenue: 80570.68, roas: 2.33, purchases: 76 }, google: { cost: 7944.87, convValue: 30839.27, roas: 2.50, conversions: 22 } },
  { date: "22/09/2025", totalSpend: 31491.32, shopifyRevenue: 71733.84, roas: 2.28, meta: { spend: 25904.35, revenue: 66633.82, roas: 2.57, purchases: 61 }, google: { cost: 5586.97, convValue: 11587.90, roas: 1.94, conversions: 10 } },
  { date: "23/09/2025", totalSpend: 31692.66, shopifyRevenue: 80364.89, roas: 2.54, meta: { spend: 25162.17, revenue: 68312.77, roas: 2.71, purchases: 59 }, google: { cost: 6530.49, convValue: 15922.31, roas: 1.90, conversions: 13 } },
  { date: "24/09/2025", totalSpend: 30572.28, shopifyRevenue: 67892.09, roas: 2.22, meta: { spend: 25023.10, revenue: 52547.80, roas: 2.10, purchases: 51 }, google: { cost: 5549.18, convValue: 18924.44, roas: 2.92, conversions: 18 } },
];

// Overall period KPIs
const periodKPIs = {
  overall: { spend: 716665.91, revenue: 1739943.8, roas: 2.43, orders: 1671, cac: 428.88, prev: { spend: 589513.76, revenue: 1533573.19, roas: 2.60, orders: 1495, cac: 394.32 } },
  meta: { spend: 156699.97, revenue: 472508.54, roas: 3.02, orders: 372, cac: 421.24, prev: { spend: 135882.03, revenue: 391546.70, roas: 2.88, orders: 329.91, cac: 411.88 } },
  google: { spend: 559965.94, revenue: 1375443.82, roas: 2.46, orders: 1352, cac: 414.18, prev: { spend: 453631.73, revenue: 1247171.37, roas: 2.75, orders: 1220, cac: 371.83 } },
};

export default function Dashboard() {
  const [view, setView] = useState("overall"); // overall | meta | google
  const kpis = useMemo(() => periodKPIs[view], [view]);
  const trend = useMemo(() => {
    return daily.map((d) => ({
      date: d.date.slice(0, 5), // DD/MM
      TotalSpend: d.totalSpend,
      TotalRevenue: d.shopifyRevenue,
      TotalROAS: d.roas,
      MetaSpend: d.meta.spend,
      MetaRevenue: d.meta.revenue,
      MetaROAS: d.meta.roas,
      GoogleSpend: d.google.cost,
      GoogleRevenue: d.google.convValue,
      GoogleROAS: d.google.roas,
    }));
  }, []);
  const sums = useMemo(() => {
    const acc = daily.reduce(
      (a, d) => {
        a.total.spend += d.totalSpend; a.total.rev += d.shopifyRevenue;
        a.meta.spend += d.meta.spend; a.meta.rev += d.meta.revenue;
        a.google.spend += d.google.cost; a.google.rev += d.google.convValue;
        return a;
      },
      { total: { spend: 0, rev: 0 }, meta: { spend: 0, rev: 0 }, google: { spend: 0, rev: 0 } }
    );
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Performance Dashboard</h1>
            <p className="text-xs text-gray-500">From PDF: Sept 1–24, 2025 • Currency: INR</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView("overall")} className={`rounded-full px-3 py-1 text-sm ${view === "overall" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>Overall</button>
            <button onClick={() => setView("meta")} className={`rounded-full px-3 py-1 text-sm ${view === "meta" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>Meta</button>
            <button onClick={() => setView("google")} className={`rounded-full px-3 py-1 text-sm ${view === "google" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>Google</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard title="Ad Spend" curr={kpis.spend} prev={kpis.prev.spend} prefix="₹" />
          <KpiCard title="Revenue" curr={kpis.revenue} prev={kpis.prev.revenue} prefix="₹" />
          <KpiCard title="ROAS" curr={kpis.roas} prev={kpis.prev.roas} />
          <KpiCard title="Orders" curr={kpis.orders} prev={kpis.prev.orders} decimals={0} />
          <KpiCard title="CAC" curr={kpis.cac} prev={kpis.prev.cac} prefix="₹" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <SectionTitle>MTD Summary (1–24 Sep)</SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-gray-500">Total Spend</div>
                <div className="text-lg font-semibold">{formatINR(sums.total.spend)}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-gray-500">Total Revenue</div>
                <div className="text-lg font-semibold">{formatINR(sums.total.rev)}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-gray-500">Meta Spend / Rev</div>
                <div className="text-lg font-semibold">{formatINR(sums.meta.spend)} / {formatINR(sums.meta.rev)}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-gray-500">Google Spend / Rev</div>
                <div className="text-lg font-semibold">{formatINR(sums.google.spend)} / {formatINR(sums.google.rev)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <SectionTitle>Spend Trend</SectionTitle>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v, n) => (n.includes("ROAS") ? v : formatINR(v))} />
                  <Legend verticalAlign="top" height={24} />
                  <Line type="monotone" dataKey="TotalSpend" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="MetaSpend" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="GoogleSpend" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <SectionTitle>Revenue Trend</SectionTitle>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => formatINR(v)} />
                  <Legend verticalAlign="top" height={24} />
                  <Area type="monotone" dataKey="TotalRevenue" strokeWidth={2} fillOpacity={0.25} />
                  <Area type="monotone" dataKey="MetaRevenue" strokeWidth={2} fillOpacity={0.25} />
                  <Area type="monotone" dataKey="GoogleRevenue" strokeWidth={2} fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <SectionTitle>ROAS by Day</SectionTitle>
          <div className="mt-2 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="TotalROAS" />
                <Bar dataKey="MetaROAS" />
                <Bar dataKey="GoogleROAS" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <SectionTitle>Daily Breakdown</SectionTitle>
          <div className="mt-3 overflow-auto">
            <table className="w-full min-w-[960px] table-fixed text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2">Date</th>
                  <th className="p-2">Total Spend</th>
                  <th className="p-2">Revenue</th>
                  <th className="p-2">ROAS</th>
                  <th className="p-2">Meta Spend</th>
                  <th className="p-2">Meta Rev</th>
                  <th className="p-2">Meta ROAS</th>
                  <th className="p-2">Google Spend</th>
                  <th className="p-2">Google Rev</th>
                  <th className="p-2">Google ROAS</th>
                </tr>
              </thead>
              <tbody>
                {daily.map((d) => (
                  <tr key={d.date} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{d.date}</td>
                    <td className="p-2">{formatINR(d.totalSpend)}</td>
                    <td className="p-2">{formatINR(d.shopifyRevenue)}</td>
                    <td className="p-2">{d.roas.toFixed(2)}</td>
                    <td className="p-2">{formatINR(d.meta.spend)}</td>
                    <td className="p-2">{formatINR(d.meta.revenue)}</td>
                    <td className="p-2">{d.meta.roas.toFixed(2)}</td>
                    <td className="p-2">{formatINR(d.google.cost)}</td>
                    <td className="p-2">{formatINR(d.google.convValue)}</td>
                    <td className="p-2">{d.google.roas.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm text-xs text-gray-500">
          Source: Uploaded PDF (fields: Total Ad Spend, Shopify Revenue, ROAS, and channel splits for Meta & Google). Figures shown for 1–24 Sep 2025.
        </div>
      </main>
    </div>
  );
}
