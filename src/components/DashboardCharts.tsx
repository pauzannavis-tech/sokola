import React, { useState } from "react";
import { SortRecord } from "../types";

interface DashboardChartsProps {
  records: SortRecord[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ records }) => {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Group materials
  const materialCounts: Record<string, number> = {};
  let layakCount = 0;
  let resinCount = 0;

  records.forEach((rec) => {
    const rawBahan = rec.bahan || "Lainnya";
    // Normalize category
    let key = "Lainnya";
    if (rawBahan.toLowerCase().includes("katun")) key = "Katun";
    else if (rawBahan.toLowerCase().includes("denim")) key = "Denim / Jeans";
    else if (rawBahan.toLowerCase().includes("poliester")) key = "Poliester";
    else if (rawBahan.toLowerCase().includes("tc") || rawBahan.toLowerCase().includes("campuran")) key = "Campuran TC";
    else if (rawBahan.toLowerCase().includes("flanel") || rawBahan.toLowerCase().includes("wol")) key = "Flanel / Wol";
    else if (rawBahan.toLowerCase().includes("rayon")) key = "Rayon Viscose";
    else key = rawBahan.slice(0, 15);

    materialCounts[key] = (materialCounts[key] || 0) + 1;

    if (String(rec.keputusan).toUpperCase().includes("LAYAK")) {
      layakCount++;
    } else {
      resinCount++;
    }
  });

  const total = records.length || 1;
  const layakPercent = Math.round((layakCount / total) * 100);
  const resinPercent = 100 - layakPercent;

  const materialEntries = Object.entries(materialCounts).sort((a, b) => b[1] - a[1]);
  const maxMaterialCount = Math.max(...materialEntries.map((e) => e[1]), 1);

  // Doughnut chart calculation
  const radius = 65;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;
  const layakStrokeDashoffset = circumference - (layakPercent / 100) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Bar Chart: Distribusi Bahan Tekstil */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Distribusi Jenis Bahan Pakaian
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Klasifikasi serat tekstil terdata dari {records.length} item pakaian
              </p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
              {materialEntries.length} Kategori
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {materialEntries.map(([name, count]) => {
              const pct = Math.round((count / total) * 100);
              const barWidth = Math.max(12, (count / maxMaterialCount) * 100);
              const isHovered = hoveredBar === name;

              return (
                <div
                  key={name}
                  onMouseEnter={() => setHoveredBar(name)}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">
                      {name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 group-hover:text-emerald-800 font-medium">
                      {count} item ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-[2px] border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHovered
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50"
                          : "bg-emerald-600"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Target Daur Ulang: Katun murni & Sintetis dipisah teratur</span>
          <span className="text-emerald-700 font-semibold">Efisiensi Sortir 94.2%</span>
        </div>
      </div>

      {/* Doughnut Chart: Proporsi Keputusan Sortir */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Proporsi Keputusan Sortir
            </h3>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
              Total {records.length} Item
            </span>
          </div>

          {/* SVG Doughnut */}
          <div className="relative flex items-center justify-center py-4">
            <svg width="180" height="180" className="transform -rotate-90">
              {/* Background Ring (Resin) */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="#f59e0b"
                strokeWidth={strokeWidth}
                fill="transparent"
                opacity="0.9"
              />
              {/* Layak Pakai Arc (Green) */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="#059669"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={layakStrokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{layakPercent}%</span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                LAYAK PAKAI
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-600"></span>
              <span className="text-slate-800 font-semibold">Layak Pakai (Donasi / Re-use)</span>
            </div>
            <span className="font-bold text-emerald-800">
              {layakCount} item ({layakPercent}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-amber-500"></span>
              <span className="text-slate-800 font-semibold">Daur Ulang (Insulasi & ID Card)</span>
            </div>
            <span className="font-bold text-amber-700">
              {resinCount} item ({resinPercent}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
