export interface TextileAnalysis {
  bahan: string;
  komposisi: string;
  kondisi: string;
  kondisiDetail: string;
  akurasi: string;
  keputusan: "LAYAK PAKAI" | "DAUR ULANG RESIN";
  alasanKeputusan: string;
  rekomendasi: string;
  warnaDominan: string;
  estimasiBeratGram: number;
  potensiProdukResin: string;
  // Estimasi Dampak Ekonomi & Sirkularitas (Opsional)
  dampakSosial?: {
    estimasiNilaiEkonomiRp: number;
    kategoriWirausaha: "Thrift Sosial Penyaluran" | "Kriya Komposit Resin Tekstil" | string;
    kontribusiLiterasi?: string;
    pemberdayaanKomunitas?: string;
    bukuDidanai?: number;
  };
  // Indikator Detail Pemeriksaan Fisik:
  statusSobek: {
    ada: boolean;
    deskripsi: string;
    tingkat: "Tidak Ada" | "Kecil/Jahitan Lepas" | "Sobek Parah/Lubang Fatal";
  };
  statusNoda: {
    ada: boolean;
    jenis: string;
    tingkat: "Bersih" | "Noda Ringan (Bisa Dicuci)" | "Noda Permanen (Oli/Karat/Jamur/Dekil)";
  };
  statusKerahKancing: {
    kondisiKerah: string;
    kondisiKancingResleting: string;
    jahitanKelim: string;
  };
  statusSeratKelayakan: {
    elastisitasIntegritas: string;
    aromaKelembaban: string;
    kegetasanLapisan: string;
  };
}

export interface SortRecord {
  id: string;
  waktu: string;
  bahan: string;
  komposisi?: string;
  kondisi: string;
  keputusan: "LAYAK PAKAI" | "DAUR ULANG RESIN" | string;
  catatan: string;
  akurasi?: string;
  fotoUrl?: string;
  nilaiEkonomiRp?: number;
  bukuDidanai?: number;
}

export interface AiEngineStatus {
  hasKey: boolean;
  model: string;
  mode: string;
}
