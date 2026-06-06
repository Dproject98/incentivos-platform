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
        style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.1em] font-mono mb-4"
          style={{ color: "#88B5A2" }}
        >
          Reservas e incentivos pagados — últimos 30 días
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#1F6B4D" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1F6B4D" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#D88B2E" stopOpacity={0.20} />
                <stop offset="95%" stopColor="#D88B2E" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,31,26,0.05)" />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fontSize: 10, fill: "#88B5A2" }}
              axisLine={false} tickLine={false}
              interval={Math.floor(dailyData.length / 7)}
            />
            <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: "#88B5A2" }} axisLine={false} tickLine={false} width={28} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#88B5A2" }} axisLine={false} tickLine={false} width={40} tickFormatter={v => v + "€"} />
            <Tooltip
              contentStyle={{ background: "#0F1F1A", border: "none", borderRadius: 10, color: "#F2EBDC", fontSize: 12 }}
              labelFormatter={(d) => fmtDate(String(d))}
              formatter={(val, name) => [
                name === "Incentivos €" ? Number(val).toFixed(2) + " €" : val,
                name,
              ]}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#88B5A2" }} />
            <Area yAxisId="left"  type="monotone" dataKey="reservas"   name="Reservas"     stroke="#1F6B4D" fill="url(#gradRes)" strokeWidth={2} dot={false} />
            <Area yAxisId="right" type="monotone" dataKey="incentivos" name="Incentivos €" stroke="#D88B2E" fill="url(#gradInc)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Confirmadas por día */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.1em] font-mono mb-4"
          style={{ color: "#88B5A2" }}
        >
          Reservas confirmadas por día
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dailyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,31,26,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fontSize: 10, fill: "#88B5A2" }}
              axisLine={false} tickLine={false}
              interval={Math.floor(dailyData.length / 7)}
            />
            <YAxis tick={{ fontSize: 10, fill: "#88B5A2" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip
              contentStyle={{ background: "#0F1F1A", border: "none", borderRadius: 10, color: "#F2EBDC", fontSize: 12 }}
              labelFormatter={(d) => fmtDate(String(d))}
            />
            <Bar dataKey="confirmadas" name="Confirmadas" fill="#1F6B4D" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
