import React from "react";
import { X, Printer, CheckCircle, QrCode } from "lucide-react";
import { TextileAnalysis } from "../types";

interface QrLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: TextileAnalysis | null;
  itemCode: string;
}

export const QrLabelModal: React.FC<QrLabelModalProps> = ({ isOpen, onClose, analysis, itemCode }) => {
  if (!isOpen || !analysis) return null;

  const isLayak = analysis.keputusan === "LAYAK PAKAI";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Label Sortir Pakaian SISTA</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Card */}
        <div className="p-6 bg-slate-50 flex justify-center border-b border-slate-200">
          <div className="w-full bg-white text-slate-900 p-5 rounded-xl shadow-md border border-slate-300 font-sans print:shadow-none print:border-none">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
              <div>
                <h4 className="font-extrabold text-sm tracking-tight text-slate-900">
                  SISTA SORTIR &bull; PERJAL SOKOLA
                </h4>
                <p className="text-[10px] text-emerald-700 font-mono font-semibold">SISTEM PEMILAHAN CERDAS & LITERASI</p>
              </div>
              <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                {itemCode}
              </span>
            </div>

            {/* Decision Banner */}
            <div
              className={`p-2.5 rounded-lg text-center font-black text-sm uppercase mb-3 ${
                isLayak ? "bg-emerald-100 text-emerald-900 border-2 border-emerald-600" : "bg-amber-100 text-amber-900 border-2 border-amber-600"
              }`}
            >
              {analysis.keputusan === "LAYAK PAKAI" ? "LAYAK PAKAI (DONASI)" : "DAUR ULANG (INSULASI & ID CARD)"}
            </div>

            {/* Details Table */}
            <div className="text-xs space-y-1.5 border-b border-slate-200 pb-3 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Bahan:</span>
                <span className="font-bold text-slate-900">{analysis.bahan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Komposisi:</span>
                <span className="font-semibold text-slate-800">{analysis.komposisi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kondisi Fisik:</span>
                <span className="font-semibold text-slate-800">{analysis.kondisi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Warna / Berat:</span>
                <span className="font-medium text-slate-700">
                  {analysis.warnaDominan} (~{analysis.estimasiBeratGram}g)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tingkat Konfidensi:</span>
                <span className="font-mono font-bold text-emerald-700">{analysis.akurasi}</span>
              </div>
            </div>

            {/* Recommendation */}
            <div className="text-[11px] text-slate-600 bg-emerald-50/50 p-2 rounded border border-emerald-200 mb-3">
              <strong className="text-slate-800 block text-[10px] uppercase font-bold">Instruksi Alur & Hilirisasi:</strong>
              {analysis.rekomendasi}
            </div>

            {/* Barcode & Date */}
            <div className="flex items-center justify-between pt-1">
              <div className="font-mono text-[9px] text-slate-400">
                Tanggal: {new Date().toISOString().slice(0, 10)} &bull; Kota Serang
              </div>
              {/* Barcode representation */}
              <div className="flex items-center gap-[2px] h-6">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2].map((w, i) => (
                  <span
                    key={i}
                    className="bg-slate-900 h-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 transition cursor-pointer font-medium"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Cetak Label Tag
          </button>
        </div>
      </div>
    </div>
  );
};
