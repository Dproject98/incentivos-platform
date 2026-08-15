"use client"

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface DayData {
  date: string      // "YYYY-MM-DD"
  reservas: number
  confirmadas: number
  incentivos: number
}

interface AdminChartsProps {
  dailyData: DayData[]
}

const fmtDate = (d: string) => {
  try { return format(new Date(d), "d MMM", { locale: es }) } catch { return d }
}

export function AdminCharts({ dailyData }: AdminChartsProps) {
  return (
    <div className="space-y-4">
      {/* Reservas + incentivos */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.1em] font-mono mb-4"
          style={{ color: "oklch(0.62 0.01 250)" }}
        >
          Reservas e incentivos pagados — últimos 30 días
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2bd49a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2bd49a" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.20} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250)" />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fontSize: 10, fill: "oklch(0.62 0.01 250)" }}
              axisLine={false} tickLine={false}
              interval={Math.floor(dailyData.length / 7)}
            />
            <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: "oklch(0.62 0.01 250)" }} axisLine={false} tickLine={false} width={28} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "oklch(0.62 0.01 250)" }} axisLine={false} tickLine={false} width={40} tickFormatter={v => v + "€"} />
            <Tooltip
              contentStyle={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)", borderRadius: 10, color: "#ffffff", fontSize: 12 }}
              labelFormatter={(d) => fmtDate(String(d))}
              formatter={(val, name) => [
                name === "Incentivos €" ? Number(val).toFixed(2) + " €" : val,
                name,
              ]}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "oklch(0.62 0.01 250)" }} />
            <Area yAxisId="left"  type="monotone" dataKey="reservas"   name="Reservas"     stroke="#2bd49a" fill="url(#gradRes)" strokeWidth={2} dot={false} />
            <Area yAxisId="right" type="monotone" dataKey="incentivos" name="Incentivos €" stroke="#fbbf24" fill="url(#gradInc)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Confirmadas por día */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.1em] font-mono mb-4"
          style={{ color: "oklch(0.62 0.01 250)" }}
        >
          Reservas confirmadas por día
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dailyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fontSize: 10, fill: "oklch(0.62 0.01 250)" }}
              axisLine={false} tickLine={false}
              interval={Math.floor(dailyData.length / 7)}
            />
            <YAxis tick={{ fontSize: 10, fill: "oklch(0.62 0.01 250)" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip
              contentStyle={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)", borderRadius: 10, color: "#ffffff", fontSize: 12 }}
              labelFormatter={(d) => fmtDate(String(d))}
            />
            <Bar dataKey="confirmadas" name="Confirmadas" fill="#2bd49a" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
