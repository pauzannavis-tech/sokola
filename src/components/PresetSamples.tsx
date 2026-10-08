import React from "react";

// Real photographic inspection sample images
import imgKaosCombed from "../assets/images/sample_kaos_combed_1790187737382.jpg";
import imgCelanaJeans from "../assets/images/sample_celana_jeans_1790187751480.jpg";
import imgJaketParasut from "../assets/images/sample_jaket_parasut_getas_1790187686409.jpg";
import imgKemejaFlanel from "../assets/images/sample_kemeja_flanel_1790187767916.jpg";
import imgJeansSobekOli from "../assets/images/sample_jeans_sobek_oli_1790187720405.jpg";
import imgBajuSobekKotor from "../assets/images/sample_baju_sobek_kotor_1790187704048.jpg";

export interface PresetSample {
  id: string;
  name: string;
  category: string;
  description: string;
  dataUrl: string;
  expectedResult: "LAYAK PAKAI" | "DAUR ULANG RESIN";
}

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: "sample-cotton",
    name: "Kaos Katun Combed",
    category: "Kaos Katun Utuh",
    description: "Baju kaos katun combed putih mulus, serat rajut utuh rapat tanpa lubang dan jahitan rapi.",
    dataUrl: imgKaosCombed,
    expectedResult: "LAYAK PAKAI",
  },
  {
    id: "sample-denim",
    name: "Celana Denim Jeans",
    category: "Denim Twill Utuh",
    description: "Celana jeans biru indigo, anyaman twill tebal miring, jahitan keling tembaga kokoh tanpa sobek.",
    dataUrl: imgCelanaJeans,
    expectedResult: "LAYAK PAKAI",
  },
  {
    id: "sample-jacket",
    name: "Jaket Parasut Getas",
    category: "Poliester Parasut",
    description: "Jaket parasut windbreaker dengan lapisan coating dalam getas/pecah dan noda minyak membandel.",
    dataUrl: imgJaketParasut,
    expectedResult: "DAUR ULANG RESIN",
  },
  {
    id: "sample-flannel",
    name: "Kemeja Flanel Hangat",
    category: "Flanel Tartan Wol",
    description: "Kemeja flanel motif kotak tartan bersih, serat berbulu lembut hangat, kancing lengkap.",
    dataUrl: imgKemejaFlanel,
    expectedResult: "LAYAK PAKAI",
  },
  {
    id: "sample-torn-jeans",
    name: "Celana Jeans Sobek & Oli",
    category: "Celana Rusak Fatal",
    description: "Celana jeans bolong besar di lutut hingga serat putih terurai lepas dan noda oli mesin hitam.",
    dataUrl: imgJeansSobekOli,
    expectedResult: "DAUR ULANG RESIN",
  },
  {
    id: "sample-torn",
    name: "Baju Sobek Parah & Kotor",
    category: "Baju Rusak & Jamur",
    description: "Kaos sobek berlubang fatal >12cm di bagian badan, serat rapuh berbulu, bercak jamur & noda dekil.",
    dataUrl: imgBajuSobekKotor,
    expectedResult: "DAUR ULANG RESIN",
  },
];

interface PresetSamplesProps {
  onSelectSample: (sample: PresetSample) => void;
  selectedId?: string;
}

export const PresetSamples: React.FC<PresetSamplesProps> = ({ onSelectSample, selectedId }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>Foto Sampel Pakaian Siap Sortir (Termasuk Sobek & Kotor):</span>
        </label>
        <span className="text-[11px] text-emerald-700 font-medium">Klik foto untuk uji sortir instan</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {PRESET_SAMPLES.map((sample) => {
          const isSelected = selectedId === sample.id;
          const isLayak = sample.expectedResult === "LAYAK PAKAI";

          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between group relative overflow-hidden cursor-pointer ${
                isSelected
                  ? "bg-emerald-50 border-emerald-600 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/40"
                  : "bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300 shadow-xs"
              }`}
            >
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-2 bg-slate-100 flex items-center justify-center border border-slate-200 relative">
                <img
                  src={sample.dataUrl}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className={`absolute top-1.5 right-1.5 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase shadow-xs ${
                    isLayak
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {isLayak ? "Layak" : "Resin"}
                </span>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                  {sample.name}
                </p>
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 truncate max-w-[85px]">{sample.category}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
