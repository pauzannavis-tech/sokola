import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Leaf,
  BarChart3,
  Camera,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Copy,
  Printer,
  Search,
  Download,
  Check,
  FileCheck,
  Info,
  Tag,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Scissors,
  Droplets,
  Activity,
  AlertTriangle,
  ArrowRight,
  Database,
  BookOpen,
  Recycle,
  Heart,
  Mail,
  Send,
  Building,
  AtSign,
  MessageSquare,
  GraduationCap,
  MapPin,
  Sparkle,
  Users,
  CheckCheck,
  X
} from "lucide-react";

import { TextileAnalysis, SortRecord, AiEngineStatus } from "./types";
import { analyzeTextileImage, checkAiEngineStatus } from "./services/aiService";
import { fetchGoogleSheetsRecords, saveSortRecord } from "./services/sheetsService";
import { PresetSamples, PresetSample } from "./components/PresetSamples";
import { CameraModal } from "./components/CameraModal";
import { QrLabelModal } from "./components/QrLabelModal";
import { DashboardCharts } from "./components/DashboardCharts";

// Visual Assets
import heroGreenBannerImg from "./assets/images/hero_tekstil_hijau_1790214786562.jpg";
import labScanImg from "./assets/images/tekstil_lab_scan_1790214801502.jpg";
import textileWastePileImg from "./assets/images/limbah_tekstil_indonesia_1790187292821.jpg";
import textileRecyclingBalesImg from "./assets/images/bal_daur_ulang_indonesia_1790187306873.jpg";
import kriyaResinTekstilImg from "./assets/images/kriya_resin_tekstil_1791180211319.jpg";
import sokolaSerangLiterasiImg from "./assets/images/sokola_serang_literasi_1791304449027.jpg";
import literasiAnakSokolaImg from "./assets/images/anak_relawan_sokola_1791470947232.jpg";
import sokolaCraftBooksImg from "./assets/images/sokola_craft_books_1791304114495.jpg";

export default function App() {
  // Navigation: "about" (Halaman Utama) | "scanner" | "dashboard" | "gform"
  const [activeTab, setActiveTab] = useState<string>("about");

  // Contact Form State (Hubungi Kami -> perjalsokola@gmail.com)
  const [contactInstitusi, setContactInstitusi] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPesan, setContactPesan] = useState<string>("");
  const [isCopiedEmail, setIsCopiedEmail] = useState<boolean>(false);

  // AI Scanner State
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<TextileAnalysis | null>(null);
  const [engineSource, setEngineSource] = useState<string>("SISTA Vision AI");
  const [aiEngineStatus, setAiEngineStatus] = useState<AiEngineStatus>({
    hasKey: false,
    model: "gemini-3.8-flash",
    mode: "checking",
  });
  const [notesInput, setNotesInput] = useState<string>("");

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  // Records & Dashboard State
  const [records, setRecords] = useState<SortRecord[]>([]);
  const [isSheetsLive, setIsSheetsLive] = useState<boolean>(false);
  const [isLoadingSheets, setIsLoadingSheets] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterDecision, setFilterDecision] = useState<string>("ALL");

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Linked Form Fields
  const [formId, setFormId] = useState<string>("");
  const [formBahan, setFormBahan] = useState<string>("");
  const [formKomposisi, setFormKomposisi] = useState<string>("");
  const [formKondisi, setFormKondisi] = useState<string>("");
  const [formKeputusan, setFormKeputusan] = useState<string>("LAYAK PAKAI");
  const [formRuteProduk, setFormRuteProduk] = useState<string>("Thrift Sosial & Donasi");
  const [formNilaiSubsidi, setFormNilaiSubsidi] = useState<number>(45000);
  const [formCatatan, setFormCatatan] = useState<string>("");
  const [isDataLinked, setIsDataLinked] = useState<boolean>(false);

  // Custom Community Photo (supports uploading own photo or resetting to default)
  const [customCommunityPhoto, setCustomCommunityPhoto] = useState<string>(() => {
    try {
      return localStorage.getItem("perjal_custom_community_photo") || "";
    } catch {
      return "";
    }
  });

  const handleUploadCustomPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomCommunityPhoto(result);
        try {
          localStorage.setItem("perjal_custom_community_photo", result);
        } catch {
          // Ignore localStorage quote limits
        }
        showToast("Foto dokumentasi berhasil diganti!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetCustomPhoto = () => {
    setCustomCommunityPhoto("");
    try {
      localStorage.removeItem("perjal_custom_community_photo");
    } catch {
      // Ignore
    }
    showToast("Foto dikembalikan ke default.");
  };

  useEffect(() => {
    checkAiEngineStatus().then((status) => {
      setAiEngineStatus(status);
      if (status.hasKey) {
        setEngineSource("Gemini 3.8 Flash Vision AI");
      }
    });
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setIsLoadingSheets(true);
    const { records: loaded, isLive } = await fetchGoogleSheetsRecords();
    setRecords(loaded);
    setIsSheetsLive(isLive);
    setIsLoadingSheets(false);
  };

  // Contact Form Submission (Arahkan ke pesan Gmail: perjalsokola@gmail.com)
  const handleSendGmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInstitusi.trim()) {
      showToast("Mohon isi Nama Institusi / Perusahaan");
      return;
    }
    if (!contactEmail.trim()) {
      showToast("Mohon isi Email kontak Anda");
      return;
    }

    const recipient = "perjalsokola@gmail.com";
    const subject = `[Kolaborasi Literasi Perjal Sokola] - ${contactInstitusi.trim()}`;
    const emailBody = `Halo Tim Perjal Sokola,

Perkenalkan kami bermaksud menghubungi tim Perjal Sokola terkait program kemitraan / subsidi silang literasi:

• Nama Institusi / Perusahaan: ${contactInstitusi.trim()}
• Email Kontak: ${contactEmail.trim()}

Pesan / Keperluan Kemitraan:
${contactPesan.trim() || "Kami tertarik berkolaborasi dengan Perjal Sokola dalam program penyerapan limbah sandang dan penguatan literasi anak di Kota Serang."}

---
Dikirim melalui formulir kontak web PERJAL SOKOLA`;

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(emailBody);
    
    // Direct link to Gmail web compose
    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodedSubject}&body=${encodedBody}`;
    const mailtoUrl = `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`;

    try {
      window.open(gmailWebUrl, "_blank");
    } catch {
      window.location.href = mailtoUrl;
    }

    showToast("Membuka pesan Gmail ke perjalsokola@gmail.com...");
  };

  const handleCopyContactEmail = () => {
    navigator.clipboard.writeText("perjalsokola@gmail.com");
    setIsCopiedEmail(true);
    showToast("Email perjalsokola@gmail.com berhasil disalin!");
    setTimeout(() => setIsCopiedEmail(false), 2500);
  };

  const handleCopyContactDraft = () => {
    const textToCopy = `Penerima: perjalsokola@gmail.com
Subjek: [Kolaborasi Literasi Perjal Sokola] - ${contactInstitusi.trim() || "Nama Institusi"}
Institusi / Perusahaan: ${contactInstitusi.trim() || "-"}
Email: ${contactEmail.trim() || "-"}
Pesan: ${contactPesan.trim() || "Kami tertarik berkolaborasi dalam penguatan literasi anak di Kota Serang."}`;
    navigator.clipboard.writeText(textToCopy);
    showToast("Draf pesan kolaborasi berhasil disalin!");
  };

  // Image Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedSampleId(undefined);
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setCurrentImage(b64);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Select preset sample
  const handleSelectSample = async (sample: PresetSample) => {
    setSelectedSampleId(sample.id);
    setAnalysisResult(null);

    if (sample.dataUrl.startsWith("data:")) {
      setCurrentImage(sample.dataUrl);
    } else {
      try {
        const response = await fetch(sample.dataUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentImage(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.warn("Could not convert image path to base64, using direct url:", err);
        setCurrentImage(sample.dataUrl);
      }
    }
  };

  // Run AI Sort Processing
  const handleRunAiSort = async () => {
    if (!currentImage) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const resp = await analyzeTextileImage(currentImage, "image/jpeg", notesInput, selectedSampleId);
      if (resp.success && resp.data) {
        setAnalysisResult(resp.data);
        setEngineSource(resp.engine || "SISTA Vision AI");

        // Sync with linked form
        const genId = `SISTA-${Date.now().toString().slice(-4)}`;
        setFormId(genId);
        setFormBahan(resp.data.bahan);
        setFormKomposisi(resp.data.komposisi);
        setFormKondisi(resp.data.kondisi);
        setFormKeputusan(resp.data.keputusan);
        setFormRuteProduk(
          resp.data.keputusan === "LAYAK PAKAI"
            ? "Thrift Sosial & Donasi"
            : "Insulasi Serat Kain & Cetak ID Card"
        );
        setFormNilaiSubsidi(
          resp.data.dampakSosial?.estimasiNilaiEkonomiRp ||
            (resp.data.keputusan === "LAYAK PAKAI" ? 45000 : 35000)
        );
        setFormCatatan(`Hasil sortir AI: ${resp.data.alasanKeputusan}`);
        setIsDataLinked(true);

        showToast("Verifikasi citra tekstil selesai! Siap ditautkan ke formulir.");
      } else {
        showToast("Analisis AI gagal. Menggunakan data standar.");
      }
    } catch (err) {
      console.error("Sorting error:", err);
      showToast("Terjadi kendala jaringan saat memproses citra.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Navigate & Link to Form
  const handleLinkToForm = () => {
    if (!analysisResult) return;
    const genId = formId || `SISTA-${Date.now().toString().slice(-4)}`;
    setFormId(genId);
    setFormBahan(analysisResult.bahan);
    setFormKomposisi(analysisResult.komposisi);
    setFormKondisi(analysisResult.kondisi);
    setFormKeputusan(analysisResult.keputusan);
    setFormRuteProduk(
      analysisResult.keputusan === "LAYAK PAKAI"
        ? "Thrift Sosial & Donasi"
        : "Insulasi Serat Kain & Cetak ID Card"
    );
    setFormNilaiSubsidi(
      analysisResult.dampakSosial?.estimasiNilaiEkonomiRp ||
        (analysisResult.keputusan === "LAYAK PAKAI" ? 45000 : 35000)
    );
    setFormCatatan(`Hasil sortir SISTA AI: ${analysisResult.alasanKeputusan}`);
    setIsDataLinked(true);

    setActiveTab("gform");
    showToast("Hasil analisis berhasil dikaitkan ke Formulir Sortir!");
  };

  // Save to Dashboard
  const handleSaveToDashboard = () => {
    if (!analysisResult) return;

    const newRecord: SortRecord = {
      id: formId || `SISTA-${Date.now().toString().slice(-4)}`,
      waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }),
      bahan: analysisResult.bahan,
      komposisi: analysisResult.komposisi,
      kondisi: analysisResult.kondisi,
      keputusan: analysisResult.keputusan,
      catatan: analysisResult.alasanKeputusan,
      akurasi: analysisResult.akurasi,
      nilaiEkonomiRp: analysisResult.dampakSosial?.estimasiNilaiEkonomiRp || (analysisResult.keputusan === "LAYAK PAKAI" ? 45000 : 35000),
      bukuDidanai: analysisResult.dampakSosial?.bukuDidanai || (analysisResult.keputusan === "LAYAK PAKAI" ? 2 : 1),
    };

    saveSortRecord(newRecord);
    setRecords((prev) => [newRecord, ...prev]);
    showToast("Hasil sortir berhasil dicatat ke Pusat Data Tekstil!");
  };

  // Copy Summary
  const handleCopySummary = () => {
    if (!analysisResult) return;
    const text = `=== HASIL SORTIR SISTA AI ===
Sistem Verifikasi Citra SISTA AI
Jenis Bahan Tekstil: ${analysisResult.bahan} (${analysisResult.komposisi})
Kondisi Fisik: ${analysisResult.kondisi}
Deskripsi: ${analysisResult.kondisiDetail}
Tingkat Konfidensi AI: ${analysisResult.akurasi}
Keputusan Sortir: ${analysisResult.keputusan}
Alasan: ${analysisResult.alasanKeputusan}

[Indikator Fisik Pakaian Terperinci]
- Status Sobek & Bolong: ${analysisResult.statusSobek?.tingkat} - ${analysisResult.statusSobek?.deskripsi}
- Status Noda & Kebersihan: ${analysisResult.statusNoda?.tingkat} - ${analysisResult.statusNoda?.jenis}
- Kerah, Kancing & Keliman: Kerah: ${analysisResult.statusKerahKancing?.kondisiKerah}, Kancing: ${analysisResult.statusKerahKancing?.kondisiKancingResleting}, Kelim: ${analysisResult.statusKerahKancing?.jahitanKelim}
- Ketahanan Serat: ${analysisResult.statusSeratKelayakan?.elastisitasIntegritas}

Rekomendasi Alur Penanganan: ${analysisResult.rekomendasi}
Potensi Produk Daur Ulang: Insulasi Serat Kain & ID Card (${analysisResult.potensiProdukResin})
Dampak Literasi Serang: Rp ${(analysisResult.dampakSosial?.estimasiNilaiEkonomiRp || 45000).toLocaleString("id-ID")} (Mendanai ${analysisResult.dampakSosial?.bukuDidanai || 2} buku cerita anak Kota Serang)
============================================`;

    navigator.clipboard.writeText(text);
    showToast("Ringkasan hasil sortir disalin ke clipboard!");
  };

  // Submit Linked Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBahan.trim()) return;

    const manualRecord: SortRecord = {
      id: formId || `MANUAL-${Date.now().toString().slice(-4)}`,
      waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }),
      bahan: formBahan,
      komposisi: formKomposisi || "100% Terverifikasi",
      kondisi: formKondisi || "Terverifikasi Petugas Lapangan",
      keputusan: formKeputusan,
      catatan: `${formCatatan} [Rute: ${formRuteProduk}]`,
      akurasi: "100% (Verifikasi Terhubung)",
      nilaiEkonomiRp: formNilaiSubsidi || (formKeputusan === "LAYAK PAKAI" ? 45000 : 35000),
      bukuDidanai: formKeputusan === "LAYAK PAKAI" ? 2 : 1,
    };

    saveSortRecord(manualRecord);
    setRecords((prev) => [manualRecord, ...prev]);
    showToast("Data formulir berhasil dicatat ke Pusat Data Tekstil & Google Sheets!");
  };

  // Export CSV
  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = "ID,Waktu,Bahan Pakaian,Kondisi Fisik,Keputusan Sortir,Catatan,Akurasi,Nilai Subsidi (Rp),Buku Didanai\n";
    const rows = records
      .map(
        (r) =>
          `"${r.id}","${r.waktu}","${r.bahan}","${r.kondisi}","${r.keputusan}","${r.catatan}","${r.akurasi || "-"}","${r.nilaiEkonomiRp || 45000}","${r.bukuDidanai || 1}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sista-sortir-tekstil-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast("Data berhasil diunduh dalam format CSV!");
  };

  // Metrics
  const totalCount = records.length;
  const layakCount = records.filter((r) => String(r.keputusan).toUpperCase().includes("LAYAK")).length;
  const resinCount = totalCount - layakCount;
  const layakPercent = totalCount > 0 ? Math.round((layakCount / totalCount) * 100) : 100;
  const kgCarbonSaved = ((totalCount * 0.3) * 3.6).toFixed(1);
  const litersWaterSaved = Math.round(layakCount * 2700);

  // Filtered records for table
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.bahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.kondisi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.catatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterDecision === "ALL") return true;
    if (filterDecision === "LAYAK") return String(rec.keputusan).toUpperCase().includes("LAYAK");
    if (filterDecision === "RESIN") return String(rec.keputusan).toUpperCase().includes("RESIN");
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#064e3b] text-white border border-emerald-500/40 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header - Eco-Tech Clean Emerald Theme (Screenshot 1) */}
      <header className="sticky top-0 z-40 bg-[#064e3b] text-white shadow-lg px-4 sm:px-8 py-3.5 border-b border-emerald-950/80">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("scanner")}>
            <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-md shadow-emerald-500/30 shrink-0">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">SISTA</span>
                <span className="text-xl font-black tracking-tight text-[#34d399]">SORTIR</span>
                <span className="text-[10px] font-semibold text-emerald-100 bg-[#043e2e] px-2.5 py-0.5 rounded-full border border-emerald-700/60 hidden sm:inline-block">
                  Sistem Tekstil Berkelanjutan
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 font-medium hidden sm:block">
                Perjal Sokola • Pemilahan Sirkular Serat Tekstil, Insulasi & ID Card untuk Literasi Anak Serang
              </p>
            </div>
          </div>

          {/* Status Badge & CTA Button */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-[#043e2e] border border-emerald-700/70 px-3.5 py-1.5 rounded-full text-xs text-emerald-100 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
              <span>Sistem Pemindai: <strong className="text-white">Vision Multimodal Aktif</strong></span>
            </div>

            <button
              onClick={() => {
                setActiveTab("scanner");
                const el = document.getElementById("scanner-input");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/40 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mulai Pindai</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Left Sidebar & Right Content */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT SIDEBAR: MENU PEMILAHAN (Screenshot 1 & 2) */}
          {/* Pada versi ponsel berada di posisi bawah (order-last lg:order-first) */}
          {/* ========================================================= */}
          <aside className="order-last lg:order-first lg:col-span-3 space-y-3">
            <div className="hidden lg:block bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block">
                MENU PEMILAHAN
              </span>

              <nav className="space-y-1.5">
                <button
                  onClick={() => setActiveTab("about")}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                    activeTab === "about"
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <BookOpen className={`w-4 h-4 ${activeTab === "about" ? "text-emerald-600" : "text-slate-400"}`} />
                  <div className="flex flex-col text-left">
                    <span>Tentang Perjal Sokola</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Halaman Utama & Literasi</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("scanner")}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                    activeTab === "scanner"
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${activeTab === "scanner" ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>Pemindaian Pakaian</span>
                </button>

                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <BarChart3 className={`w-4 h-4 ${activeTab === "dashboard" ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>Pusat Data Tekstil</span>
                </button>

                <button
                  onClick={() => setActiveTab("gform")}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                    activeTab === "gform"
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <FileCheck className={`w-4 h-4 ${activeTab === "gform" ? "text-emerald-600" : "text-slate-400"}`} />
                  <div className="flex items-center justify-between flex-1">
                    <span>Formulir Sortir</span>
                    {isDataLinked && (
                      <span className="w-2 h-2 rounded-full bg-[#10b981]" title="Data Terhubung"></span>
                    )}
                  </div>
                </button>
              </nav>
            </div>

            {/* Sub-card in Sidebar: Subsidi Silang Literasi */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Literasi Anak Serang</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Laba bersih penjualan busana thrift & produk daur ulang (Insulasi serat kain & ID Card) dialokasikan untuk mensubsidi ruang baca anak Kota Serang.
              </p>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* RIGHT CONTENT AREA */}
          {/* ========================================================= */}
          <section className="order-first lg:order-last lg:col-span-9 space-y-6">
            {/* --------------------------------------------------------- */}
            {/* TAB 1: PEMINDAIAN PAKAIAN (Screenshot 1) */}
            {/* --------------------------------------------------------- */}
            {activeTab === "scanner" && (
              <div className="space-y-6">
                {/* Dark Emerald Big Banner (Screenshot 1) */}
                <div className="bg-[#064e3b] text-white p-6 sm:p-7 rounded-[26px] shadow-xl border border-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 bg-[#043e2e] px-3 py-1 rounded-full border border-emerald-700/60">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#34d399]" />
                      <span>Sistem Verifikasi Citra Tekstil Aktif & Sirkularitas Hijau</span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Pemindaian & Pemilahan Serat Tekstil
                      </h1>
                      <span className="text-xs font-semibold text-emerald-900 bg-[#34d399] px-2.5 py-0.5 rounded-full">
                        Multi-Faktor Fisik
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
                      Sistem memeriksa tekstil secara mendalam: deteksi jenis benang, keparahan sobek/lubang, noda minyak/oli/jamur, kondisi kerah/kancing/resleting, integritas serat, serta rute sortir (Donasi Layak Pakai vs Insulasi Serat Kain & ID Card).
                    </p>
                  </div>

                  {/* Right side: Mini Cards & Camera button */}
                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <div className="flex gap-2">
                      <div className="w-20 h-16 rounded-xl overflow-hidden relative border border-emerald-600/40 shadow-xs">
                        <img src={heroGreenBannerImg} alt="Serat Hijau" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-[9px] text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                          Serat Hijau
                        </span>
                      </div>
                      <div className="w-20 h-16 rounded-xl overflow-hidden relative border border-emerald-600/40 shadow-xs">
                        <img src={labScanImg} alt="Lab Optik AI" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-[9px] text-cyan-300 font-bold px-1.5 py-0.5 rounded">
                          Lab Optik AI
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsCameraOpen(true)}
                      className="px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Kamera</span>
                    </button>
                  </div>
                </div>

                {/* Preset Samples (Screenshot 1) */}
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs space-y-3">
                  <PresetSamples onSelectSample={handleSelectSample} selectedId={selectedSampleId} />
                </div>

                {/* Scanner Input & Result Card Grid */}
                <div id="scanner-input" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Input Dropzone */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                          Unggah Foto Pakaian
                        </h3>
                        {currentImage && (
                          <button
                            onClick={() => {
                              setCurrentImage(null);
                              setSelectedSampleId(undefined);
                              setAnalysisResult(null);
                            }}
                            className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                          >
                            Hapus Foto
                          </button>
                        )}
                      </div>

                      {/* Dropzone Container */}
                      <div className="relative">
                        {currentImage ? (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-[4/3] flex items-center justify-center">
                            <img
                              src={currentImage}
                              alt="Pratinjau Pakaian"
                              className="w-full h-full object-contain"
                            />

                            {/* Animated Scanline */}
                            {isAnalyzing && (
                              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#10b981] to-transparent shadow-[0_0_15px_#10b981] animate-scanline" />
                                <div className="absolute inset-0 bg-emerald-950/20 flex items-center justify-center">
                                  <div className="bg-white/95 px-4 py-2.5 rounded-xl border border-emerald-300 text-slate-900 text-xs font-mono flex items-center gap-2 shadow-xl">
                                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                                    <span className="font-semibold">Menganalisis Serat Tekstil SISTA AI...</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-700 flex items-center gap-1.5 font-medium shadow-xs">
                              <Tag className="w-3 h-3 text-emerald-600" />
                              <span>Foto Siap Dipindai</span>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="file-upload"
                            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 aspect-[4/3] group"
                          >
                            <input
                              id="file-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                              <UploadCloud className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-800">
                                Pilih atau seret foto pakaian ke sini
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Format JPG, PNG, WEBP (kamera ponsel / laptop)
                              </p>
                            </div>
                          </label>
                        )}
                      </div>

                      {/* Notes Input */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                          <span>Catatan Tambahan Petugas (Opsional):</span>
                        </label>
                        <input
                          type="text"
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          placeholder="Contoh: Donasi konveksi Serang, noda oli di bagian paha..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setIsCameraOpen(true)}
                          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-slate-600" />
                          <span>Kamera</span>
                        </button>

                        <button
                          onClick={handleRunAiSort}
                          disabled={!currentImage || isAnalyzing}
                          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                            currentImage && !isAnalyzing
                              ? "bg-[#10b981] hover:bg-[#059669] text-white cursor-pointer shadow-md shadow-emerald-500/25"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          }`}
                        >
                          {isAnalyzing ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Menganalisis Serat & Kondisi Fisik...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Jalankan Pemilahan Cerdas AI</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Full Detailed AI Analysis Result Card */}
                  <div className="lg:col-span-7">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
                      {/* Header Card */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 leading-tight">
                              Hasil Analisis Sortir AI
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Sistem Verifikasi Citra SISTA AI
                            </p>
                          </div>
                        </div>

                        {analysisResult ? (
                          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selesai
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            Menunggu Foto
                          </span>
                        )}
                      </div>

                      {/* Content Area */}
                      {analysisResult ? (
                        <div className="space-y-4 text-xs">
                          {/* 1. Jenis Bahan & Komposisi */}
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-slate-500 block text-[11px] font-medium">Jenis Bahan Tekstil:</span>
                              <span className="font-bold text-slate-900 text-sm sm:text-base">
                                {analysisResult.bahan}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono bg-white px-3 py-1.5 rounded-lg text-emerald-800 border border-emerald-200 font-bold shadow-xs">
                              {analysisResult.komposisi}
                            </span>
                          </div>

                          {/* 2. Kondisi Fisik */}
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-[11px] font-medium">Kondisi Fisik:</span>
                              <span className="font-mono text-[11px] font-bold text-emerald-700">
                                Akurasi AI: {analysisResult.akurasi}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">
                              {analysisResult.kondisi}
                            </h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {analysisResult.kondisiDetail}
                            </p>
                          </div>

                          {/* 3. Keputusan Sortir Banner */}
                          <div
                            className={`p-4 rounded-xl border-2 flex flex-col gap-1.5 shadow-xs ${
                              analysisResult.keputusan === "LAYAK PAKAI"
                                ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                                : "bg-amber-50/70 border-amber-300 text-amber-950"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Keputusan Sortir:
                              </span>
                              <span
                                className={`font-black text-xs px-3.5 py-1.5 rounded-lg uppercase tracking-wide shadow-xs ${
                                  analysisResult.keputusan === "LAYAK PAKAI"
                                    ? "bg-[#10b981] text-white"
                                    : "bg-amber-600 text-white"
                                }`}
                              >
                                {analysisResult.keputusan === "LAYAK PAKAI"
                                  ? "LAYAK PAKAI (DONASI)"
                                  : "DAUR ULANG (INSULASI / ID CARD)"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-700 mt-1 leading-relaxed font-medium">
                              {analysisResult.alasanKeputusan}
                            </p>
                          </div>

                          {/* 4. Indikator Fisik Pakaian Terperinci (Multi-Aspek) */}
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                                Indikator Fisik Pakaian Terperinci
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono font-semibold">Multi-Aspek</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                              {/* Status Sobek */}
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 font-medium">Status Sobek & Bolong:</span>
                                  <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${
                                    analysisResult.statusSobek?.ada ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                                  }`}>
                                    {analysisResult.statusSobek?.tingkat}
                                  </span>
                                </div>
                                <p className="text-slate-700 text-[10.5px] leading-snug">
                                  {analysisResult.statusSobek?.deskripsi}
                                </p>
                              </div>

                              {/* Status Noda */}
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 font-medium">Status Noda & Kebersihan:</span>
                                  <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${
                                    analysisResult.statusNoda?.ada ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                  }`}>
                                    {analysisResult.statusNoda?.tingkat}
                                  </span>
                                </div>
                                <p className="text-slate-700 text-[10.5px] leading-snug">
                                  {analysisResult.statusNoda?.jenis}
                                </p>
                              </div>

                              {/* Kerah, Kancing, Kelim */}
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                                <span className="text-slate-500 font-medium block">Kerah, Kancing & Keliman:</span>
                                <p className="text-slate-700 text-[10.5px] leading-tight">
                                  • Kerah: {analysisResult.statusKerahKancing?.kondisiKerah}
                                </p>
                                <p className="text-slate-700 text-[10.5px] leading-tight">
                                  • Kancing/Resleting: {analysisResult.statusKerahKancing?.kondisiKancingResleting}
                                </p>
                                <p className="text-slate-700 text-[10.5px] leading-tight">
                                  • Keliman: {analysisResult.statusKerahKancing?.jahitanKelim}
                                </p>
                              </div>

                              {/* Ketahanan Serat */}
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                                <span className="text-slate-500 font-medium block">Ketahanan Serat & Lapisan:</span>
                                <p className="text-slate-700 text-[10.5px] leading-tight">
                                  • Integritas: {analysisResult.statusSeratKelayakan?.elastisitasIntegritas}
                                </p>
                                <p className="text-slate-700 text-[10.5px] leading-tight">
                                  • Kegetasan/Aroma: {analysisResult.statusSeratKelayakan?.aromaKelembaban}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 5. Rekomendasi Alur & Potensi Daur Ulang (Insulasi & ID Card) */}
                          <div className="p-3.5 bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-xl border border-emerald-200 space-y-2">
                            <div>
                              <span className="text-slate-500 text-[11px] font-medium block">Rekomendasi Alur Penanganan:</span>
                              <p className="text-slate-800 text-[11px] font-semibold leading-relaxed">
                                {analysisResult.rekomendasi}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                                  <Recycle className="w-3.5 h-3.5 text-emerald-600" />
                                  Potensi Produk: Insulasi Serat Kain & ID Card
                                </span>
                                <p className="text-[10.5px] text-slate-600">
                                  {analysisResult.potensiProdukResin}
                                </p>
                              </div>
                              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-white px-2 py-1 rounded border border-emerald-200 shrink-0">
                                ~{analysisResult.estimasiBeratGram}g Serat
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16 text-slate-400 space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">Belum Ada Pakaian yang Dipindai</p>
                            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                              Klik salah satu foto sampel pakaian di atas atau unggah foto untuk melihat verifikasi multi-faktor SISTA AI.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons: Simpan ke Dasbor, Salin, Label Tag, dan KE FORM */}
                      {analysisResult && (
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                          <button
                            onClick={handleSaveToDashboard}
                            className="py-2.5 px-3.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Simpan ke Dasbor</span>
                          </button>

                          <button
                            onClick={handleCopySummary}
                            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Salin</span>
                          </button>

                          <button
                            onClick={() => setIsQrModalOpen(true)}
                            className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          >
                            <Printer className="w-4 h-4 text-emerald-600" />
                            <span>Label Tag</span>
                          </button>

                          {/* Tombol KE FORM (Kaitkan langsung ke Formulir Sortir) */}
                          <button
                            onClick={handleLinkToForm}
                            className="py-2.5 px-4 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md ml-auto"
                            title="Kaitkan hasil analisis langsung ke Formulir Sortir"
                          >
                            <span>Ke Form</span>
                            <ArrowRight className="w-4 h-4 text-[#34d399]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* TAB 2: PUSAT DATA TEKSTIL (Screenshot 2) */}
            {/* --------------------------------------------------------- */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Header Controls (Screenshot 2) */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Pusat Data & Statistik Sortir Tekstil
                      </h2>
                      <p className="text-xs text-slate-500">
                        Data riwayat pemilahan serat pakaian terintegrasi dengan Google Sheets & basis data lokal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadData}
                      disabled={isLoadingSheets}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition shadow-xs cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSheets ? "animate-spin text-blue-600" : ""}`} />
                      <span>Refresh</span>
                    </button>

                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh CSV</span>
                    </button>
                  </div>
                </div>

                {/* 5 KPI Stat Cards in a row (Screenshot 2) */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                  {/* Card 1: Total Pakaian */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      Total Pakaian Disortir
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                      {totalCount}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold pt-1">
                      <Database className="w-3 h-3" />
                      <span>Google Sheets Live</span>
                    </div>
                  </div>

                  {/* Card 2: Layak Pakai */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      Layak Pakai (Donasi)
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-blue-600">
                      {layakCount}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {layakPercent}% Distribusi Sosial
                    </p>
                  </div>

                  {/* Card 3: Daur Ulang Resin / Insulasi */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      Daur Ulang Resin
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-amber-500">
                      {resinCount}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {100 - layakPercent}% Olahan Komposit
                    </p>
                  </div>

                  {/* Card 4: Reduksi Emisi */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      Reduksi Emisi Karbon
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-blue-600">
                      {kgCarbonSaved} <span className="text-xs font-normal text-slate-400">kg</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Setara CO2e dicegah
                    </p>
                  </div>

                  {/* Card 5: Air Bersih */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1 col-span-2 md:col-span-1">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      Air Bersih Diselamatkan
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-blue-600">
                      {(litersWaterSaved / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">Liter</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Efisiensi siklus ulang
                    </p>
                  </div>
                </div>

                {/* Dashboard Charts: Distribusi Bahan & Proporsi Keputusan (Screenshot 2) */}
                <DashboardCharts records={records} />

                {/* Tabel Riwayat Sortir Tekstil */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-600" />
                        Tabel Riwayat Pemilahan Tekstil
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Menampilkan {filteredRecords.length} dari {records.length} item pakaian tersortir
                      </p>
                    </div>

                    {/* Filter and Search */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                        <button
                          onClick={() => setFilterDecision("ALL")}
                          className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                            filterDecision === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Semua
                        </button>
                        <button
                          onClick={() => setFilterDecision("LAYAK")}
                          className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                            filterDecision === "LAYAK" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Layak Pakai
                        </button>
                        <button
                          onClick={() => setFilterDecision("RESIN")}
                          className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                            filterDecision === "RESIN" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Daur Ulang
                        </button>
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Cari bahan, ID, catatan..."
                          className="bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white w-48 sm:w-56 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-3 font-bold">ID / Waktu</th>
                          <th className="p-3 font-bold">Bahan Pakaian</th>
                          <th className="p-3 font-bold">Kondisi Fisik</th>
                          <th className="p-3 font-bold">Keputusan Sortir</th>
                          <th className="p-3 font-bold">Nilai Subsidi</th>
                          <th className="p-3 font-bold">Buku Terbantu</th>
                          <th className="p-3 font-bold">Catatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredRecords.length > 0 ? (
                          filteredRecords.map((rec, idx) => {
                            const isLayak = String(rec.keputusan).toUpperCase().includes("LAYAK");
                            const uniqueKey = `${rec.id}-${rec.waktu || ""}-${idx}`;
                            return (
                              <tr key={uniqueKey} className="hover:bg-slate-50/80 transition">
                                <td className="p-3 font-mono text-[11px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900">{rec.id}</span>
                                    {rec.fotoUrl && (
                                      <a
                                        href={rec.fotoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-[10px] underline"
                                        title="Buka Foto Tekstil di Google Drive"
                                      >
                                        [Foto]
                                      </a>
                                    )}
                                  </div>
                                  <span className="text-slate-400 text-[10px] block">{rec.waktu}</span>
                                </td>
                                <td className="p-3 font-semibold text-slate-800">
                                  {rec.bahan}
                                  {rec.komposisi && (
                                    <span className="text-[10px] font-normal text-slate-500 block">
                                      {rec.komposisi}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-slate-700">{rec.kondisi}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                                      isLayak
                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                        : "bg-amber-50 text-amber-800 border border-amber-200"
                                    }`}
                                  >
                                    {rec.keputusan}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-[11px] text-slate-900 font-bold">
                                  Rp {(rec.nilaiEkonomiRp || (isLayak ? 45000 : 35000)).toLocaleString("id-ID")}
                                </td>
                                <td className="p-3 font-mono text-[11px] text-emerald-700 font-bold">
                                  +{rec.bukuDidanai || (isLayak ? 2 : 1)} Buku
                                </td>
                                <td className="p-3 text-slate-500 text-[11px] max-w-xs truncate">
                                  {rec.catatan}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-slate-400">
                              Tidak ada data yang cocok dengan pencarian.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* TAB 3: FORMULIR SORTIR (FORMULIR TERKAIT HASIL SCAN) */}
            {/* --------------------------------------------------------- */}
            {activeTab === "gform" && (
              <div className="space-y-6">
                <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-emerald-600" />
                        Formulir Sortir Lapangan & Verifikasi Terhubung
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Formulir digital petugas sortir untuk mencatat alokasi pakaian donasi, produk insulasi serat kain, dan ID Card.
                      </p>
                    </div>

                    <a
                      href="https://docs.google.com/forms/d/e/1FAIpQLSfiGu0lplA0J9IzriaJ4H6YTqO1UVXH1TvePeVfJ_4gmYQ6Nw/viewform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
                    >
                      <span>Buka Google Form</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Banner Data Terhubung dari Hasil Scan */}
                  {isDataLinked && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-900">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold block">✓ Data Terhubung dari Hasil Pemindaian SISTA AI:</span>
                          <span className="text-[11px] text-emerald-800">
                            ID: <strong>{formId}</strong> • Bahan: <strong>{formBahan}</strong> • Rute: <strong>{formRuteProduk}</strong>
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded border border-emerald-300 font-bold text-emerald-700">
                        Otomatis Terisi
                      </span>
                    </div>
                  )}

                  {/* Form Input Terstruktur */}
                  <form onSubmit={handleFormSubmit} className="space-y-4 max-w-3xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Kode Sortir */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">ID / Kode Sortir:</label>
                        <input
                          type="text"
                          value={formId}
                          onChange={(e) => setFormId(e.target.value)}
                          placeholder="Contoh: SISTA-005 atau BATCH-SRG"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                        />
                      </div>

                      {/* Bahan Pakaian */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Jenis Bahan Tekstil:</label>
                        <input
                          type="text"
                          value={formBahan}
                          onChange={(e) => setFormBahan(e.target.value)}
                          placeholder="Contoh: Denim Twill Katun, Kaos Combed 30s"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Komposisi Serat */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Komposisi Serat:</label>
                        <input
                          type="text"
                          value={formKomposisi}
                          onChange={(e) => setFormKomposisi(e.target.value)}
                          placeholder="Contoh: 98% Cotton Denim, 2% Elastane"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                        />
                      </div>

                      {/* Kondisi Fisik */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Kondisi Fisik Pakaian:</label>
                        <input
                          type="text"
                          value={formKondisi}
                          onChange={(e) => setFormKondisi(e.target.value)}
                          placeholder="Contoh: Sobek bolong lutut & kotor noda oli"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Keputusan Sortir */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Keputusan Sortir:</label>
                        <select
                          value={formKeputusan}
                          onChange={(e) => {
                            setFormKeputusan(e.target.value);
                            setFormRuteProduk(
                              e.target.value === "LAYAK PAKAI"
                                ? "Thrift Sosial & Donasi"
                                : "Insulasi Serat Kain & Cetak ID Card"
                            );
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                        >
                          <option value="LAYAK PAKAI">LAYAK PAKAI (Donasi / Bazar Sosial)</option>
                          <option value="DAUR ULANG RESIN">DAUR ULANG (Insulasi Serat Kain & ID Card)</option>
                        </select>
                      </div>

                      {/* Rute Produk Daur Ulang */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Alokasi Produk Hilirisasi:</label>
                        <select
                          value={formRuteProduk}
                          onChange={(e) => setFormRuteProduk(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                        >
                          <option value="Thrift Sosial & Donasi">Thrift Sosial & Donasi Pakaian Layak</option>
                          <option value="Insulasi Serat Kain & Cetak ID Card">Insulasi Serat Kain & Cetak ID Card Ramah Lingkungan</option>
                          <option value="Insulasi Serat Kain Saja">Insulasi Serat Kain (Peredam & Pelindung)</option>
                          <option value="ID Card & Merchandise Sirkular">Cetak ID Card & Souvenir Literasi</option>
                          <option value="Komposit Meja Baca Anak">Komposit Meja & Rak Baca Anak</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nilai Subsidi Rupiah */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Estimasi Nilai Subsidi (Rp):</label>
                        <input
                          type="number"
                          value={formNilaiSubsidi}
                          onChange={(e) => setFormNilaiSubsidi(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                        />
                      </div>

                      {/* Catatan Petugas */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Catatan Pemeriksaan Lapangan:</label>
                        <input
                          type="text"
                          value={formCatatan}
                          onChange={(e) => setFormCatatan(e.target.value)}
                          placeholder="Contoh: Cacah denim kotor untuk matrik ID Card & Insulasi"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simpan Data Verifikasi Lapangan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormId("");
                          setFormBahan("");
                          setFormKomposisi("");
                          setFormKondisi("");
                          setFormCatatan("");
                          setIsDataLinked(false);
                          showToast("Formulir telah di-reset.");
                        }}
                        className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Reset Form
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* TAB: TENTANG PERJAL SOKOLA (HALAMAN UTAMA & LITERASI)    */}
            {/* --------------------------------------------------------- */}
            {activeTab === "about" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* 1. HERO BANNER HALAMAN UTAMA */}
                <div className="bg-[#064e3b] text-white p-6 sm:p-8 rounded-[28px] shadow-xl border border-emerald-950 relative overflow-hidden space-y-5">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 bg-[#043e2e] px-3.5 py-1.5 rounded-full border border-emerald-700/70">
                    <BookOpen className="w-4 h-4 text-[#34d399]" />
                    <span>Halaman Utama • Gerakan Literasi Anak & Sirkularitas Sandang Kota Serang</span>
                  </div>

                  <div className="space-y-3 max-w-3xl">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                      PERJAL SOKOLA <span className="text-[#34d399]">(Sosial Kolaborasi)</span>
                    </h1>
                    <p className="text-base sm:text-lg font-bold text-emerald-100 leading-snug">
                      Kewirausahaan Sosial Berbasis Subsidi Silang Dari Limbah Tekstil Untuk Menguatkan Literasi Anak di Kota Serang
                    </p>
                    <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-normal">
                      Detak jantung utama Perjal Sokola bukanlah sekadar memilah sampah sandang, melainkan <strong>memulihkan budaya membaca anak-anak Kota Serang</strong>. Melalui teknologi cerdas SISTA AI, kami mengolah pakaian tak layak menjadi <strong>Insulasi serat kain</strong> dan <strong>ID Card ramah lingkungan</strong>, di mana seluruh laba bersihnya dialokasikan langsung untuk membeli buku cerita anak dan membiayai ruang baca mandiri di pelosok Serang.
                    </p>
                  </div>

                  {/* Quick Action Navigation CTAs */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveTab("scanner");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Uji Pindai Pakaian AI (SISTA)</span>
                    </button>

                    <button
                      onClick={() => {
                        const el = document.getElementById("hubungi-kami");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-4 py-2.5 bg-[#043e2e] hover:bg-[#065f46] text-emerald-100 border border-emerald-600/80 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-[#34d399]" />
                      <span>Hubungi Kami (Kemitraan)</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("dashboard");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-white/15 transition cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Pusat Data Tekstil</span>
                    </button>
                  </div>
                </div>

                {/* 2. DOKUMENTASI VISUAL GERAKAN LITERASI ANAK SERANG */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                  <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                    <div className="aspect-[16/10] sm:aspect-[16/9] w-full relative overflow-hidden bg-slate-100">
                      <img
                        src={sokolaSerangLiterasiImg}
                        alt="Anak-anak Kota Serang Membaca Bersama Perjal Sokola"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border border-emerald-700/60">
                        <MapPin className="w-3.5 h-3.5 text-[#34d399]" />
                        <span>Taman Bacaan Masyarakat • Kota Serang</span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 space-y-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        Menghadirkan Kembali Senyum dan Buku Cerita di Tangan Anak-Anak Serang
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Anak-anak di wilayah pinggiran Kota Serang menikmati bahan bacaan bergambar baru yang disubsidi dari penjualan produk olahan limbah sandang. Ruang baca outdoor dan dampingan relawan mengembalikan kegembiraan belajar membaca tanpa membebani orang tua.
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-5 flex flex-col gap-4">
                    {/* Secondary Visual: Relawan & Warga Komunitas Sokola */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 flex-1 flex flex-col justify-between">
                      <div className="aspect-[16/9] rounded-xl overflow-hidden relative bg-slate-100 group">
                        <img
                          src={customCommunityPhoto || literasiAnakSokolaImg}
                          alt="Dokumentasi Anak dan Relawan Perjal Sokola Kota Serang"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                          {customCommunityPhoto ? "Foto Dokumentasi Anda" : "Anak & Relawan Sokola"}
                        </div>

                        {/* Upload & Reset Buttons Overlay */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 hover:opacity-100 transition">
                          <label className="cursor-pointer bg-black/75 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 shadow-xs transition">
                            <Camera className="w-3 h-3 text-emerald-300" />
                            <span>Ganti Foto Sendiri</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadCustomPhoto}
                              className="hidden"
                            />
                          </label>

                          {customCommunityPhoto && (
                            <button
                              type="button"
                              onClick={handleResetCustomPhoto}
                              title="Kembalikan foto bawaan"
                              className="bg-black/75 hover:bg-rose-700 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-xs transition cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900">Kebersamaan Anak & Relawan Sokola</h4>
                          <label className="text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline flex items-center gap-0.5">
                            <UploadCloud className="w-3 h-3" />
                            <span>Upload foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadCustomPhoto}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Senyum anak-anak dampingan dan relawan muda Perjal Sokola di ruang terbuka Kota Serang, membangun masa depan literasi melalui gerakan ekonomi sandang sirkular.
                        </p>
                      </div>
                    </div>

                    {/* Kutipan Komitmen Literasi */}
                    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-200 p-4 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Komitmen Subsidi Silang
                      </span>
                      <blockquote className="text-xs font-semibold text-emerald-950 italic leading-snug">
                        “Dari tumpukan helai pakaian yang terbuang, kami mengalirkan ribuan halaman masa depan untuk anak-anak Kota Serang.”
                      </blockquote>
                      <span className="text-[10px] text-emerald-700 block font-mono">
                        — Tim Penggerak Perjal Sokola
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. METRIK & CAPAIAN DAMPAK LITERASI DI KOTA SERANG */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        Statistik & Target Dampak Literasi Anak di Kota Serang
                      </h3>
                      <p className="text-xs text-slate-500">
                        Dampak nyata yang dibiayai mandiri melalui konversi ekonomi pemilahan pakaian
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold self-start sm:self-auto">
                      Update 2026 • Mandiri
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Stat 1 */}
                    <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                        Krisis yang Dituntaskan
                      </span>
                      <h4 className="text-2xl sm:text-3xl font-black text-amber-900">34,62%</h4>
                      <p className="text-[11px] text-amber-700 leading-snug">
                        Tingkat Kegemaran Membaca Serang (peringkat terbawah Banten) yang dinaikkan.
                      </p>
                    </div>

                    {/* Stat 2 (Wilayah Sasaran) */}
                    <div className="bg-blue-50/80 border border-blue-200/80 p-4 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                        Wilayah Sasaran Serang
                      </span>
                      <h4 className="text-2xl sm:text-3xl font-black text-blue-900">1 Kec.</h4>
                      <p className="text-[11px] text-blue-700 leading-snug">
                        Fokus Utama: Kecamatan Cipocok Jaya, Kota Serang.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. EMPAT PILAR UTAMA PERJAL SOKOLA */}
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Fondasi Gerakan
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      Empat Pilar Utama Perjal Sokola
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rancangan sistematis kewirausahaan sosial yang menghubungkan pemulihan lingkungan dengan kemajuan pendidikan
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pilar 1: Krisis Literasi */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-base shadow-xs">
                          📚
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">1. Krisis Literasi Anak</h4>
                          <span className="text-[10px] font-mono text-amber-700 font-semibold">TGM Kota Serang: 34,62%</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tingkat kegemaran membaca di Kota Serang berada di angka terendah se-Provinsi Banten. Anak-anak di perkampungan minim akses terhadap bahan bacaan non-pelajaran yang menarik. Perjal Sokola hadir di akar rumput untuk menghidupkan kembali minat baca anak usia dini dan SD.
                      </p>
                    </div>

                    {/* Pilar 2: Busana Berkelanjutan */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-base shadow-xs">
                          ♻️
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">2. Busana Berkelanjutan</h4>
                          <span className="text-[10px] font-mono text-emerald-700 font-semibold">Insulasi Serat Kain & ID Card</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Mengatasi gunungan sampah sandang dengan pemilahan presisi. Pakaian layak masuk ke bazar sosial dan donasi, sementara pakaian sobek/rusak dilebur menjadi <strong>Insulasi serat kain</strong> (peredam & pelindung) serta dicetak menjadi <strong>ID Card</strong> ramah lingkungan bernilai ekonomis tinggi.
                      </p>
                    </div>

                    {/* Pilar 3: Subsidi Silang Sosial */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-base shadow-xs">
                          💡
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">3. Subsidi Silang Sosial</h4>
                          <span className="text-[10px] font-mono text-blue-700 font-semibold">Laba Bersih untuk Literasi</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Model kewirausahaan sosial di mana keuntungan penjualan pakaian thrift dan produk olahan (ID Card & Insulasi) digunakan sepenuhnya untuk membiayai pembelian buku baru, honor operasional relawan, dan perlengkapan ruang baca secara berkesinambungan tanpa ketergantungan donasi.
                      </p>
                    </div>

                    {/* Pilar 4: Dampak & SDGs */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-base shadow-xs">
                          🌍
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">4. Dampak Global & SDGs</h4>
                          <span className="text-[10px] font-mono text-purple-700 font-semibold">SDGs 4, 12, dan 8</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Mendukung Tujuan Pembangunan Berkelanjutan melalui pendidikan bermutu (SDGs 4), konsumsi dan produksi bertanggung jawab (SDGs 12), serta penciptaan lapangan kerja dan pertumbuhan ekonomi sirkular lokal bagi warga Kota Serang (SDGs 8).
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. CARA KERJA & ALUR SUBSIDI SILANG SIRKULAR */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-emerald-600" />
                    Alur Kerja: Dari Limbah Pakaian Menjadi Buku Anak Kota Serang
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-700">Tahap 01</span>
                      <h4 className="font-bold text-slate-900">Pemindaian & Klasifikasi AI</h4>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Pakaian dipindai lewat kamera ponsel. SISTA AI mendeteksi serat kain, noda, robekan, dan kelayakan secara otomatis.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-700">Tahap 02</span>
                      <h4 className="font-bold text-slate-900">Rute Sortir & Eksekusi</h4>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Baju layak disalurkan ke thrift sosial. Baju rusak dicacah jadi <strong>Insulasi serat kain</strong> & dicetak jadi <strong>ID Card</strong> ramah lingkungan.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-700">Tahap 03</span>
                      <h4 className="font-bold text-slate-900">Penjualan & Margin Dana</h4>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Produk ID Card dan insulasi dijual ke korporasi/komunitas. Seluruh laba bersih dipisahkan khusus untuk subsidi pendidikan.
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-800">Tahap 04</span>
                      <h4 className="font-bold text-emerald-950">Literasi Anak Serang</h4>
                      <p className="text-emerald-800 leading-relaxed text-[11px]">
                        Laba bersih dipakai membeli buku cerita bergambar baru, mendirikan ruang baca, dan mendampingi kelas baca anak tiap pekan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 6. SHOWCASE PRODUK DAUR ULANG DAN KRIYA LITERASI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden relative">
                      <img src={kriyaResinTekstilImg} alt="Produk Kriya & ID Card" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                        Produk: ID Card & Kriya
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">ID Card Ramah Lingkungan</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Limbah pakaian dicetak menjadi ID Card premium dan souvenir kantor untuk instansi serta komunitas di Banten.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden relative">
                      <img src={textileRecyclingBalesImg} alt="Bal Daur Ulang" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                        Bahan Baku: Insulasi Kain
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Insulasi Serat Kain Peredam</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Cacahan serat mikro pakaian rusak diolah menjadi insulasi peredam suara ruangan dan bantalan pelindung ramah lingkungan.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden relative">
                      <img src={sokolaCraftBooksImg} alt="Buku Cerita & Pojok Baca" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                        Hasil: Ruang Baca Anak
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Buku Cerita & Ruang Baca</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Keuntungan penjualan menjadi buku cerita baru dan sarana belajar yang hidup bagi anak-anak usia dini di Kota Serang.
                    </p>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 7. SECTION HUBUNGI KAMI (KEMITRAAN & PESAN GMAIL RESMI)   */}
                {/* ========================================================= */}
                <div id="hubungi-kami" className="bg-white border-2 border-emerald-500/80 rounded-[28px] p-6 sm:p-8 shadow-lg space-y-6 scroll-mt-20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kemitraan Sosial & Kolaborasi</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Hubungi Kami (Perjal Sokola)
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                        Tertarik menyalurkan limbah tekstil institusi Anda, memesan ID Card daur ulang, atau berkolaborasi mendirikan pojok baca anak di Kota Serang? Formulir ini akan langsung terhubung ke pesan <strong>Gmail: perjalsokola@gmail.com</strong>.
                      </p>
                    </div>

                    {/* Email badge with quick copy */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Email Resmi:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-800">
                          perjalsokola@gmail.com
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyContactEmail}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                          title="Salin Alamat Email"
                        >
                          {isCopiedEmail ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-3xl mx-auto">
                    {/* Contact Form */}
                    <div>
                      <form onSubmit={handleSendGmail} className="space-y-4">
                        {/* 1. Nama Institusi / Perusahaan * */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Nama Institusi / Perusahaan <strong className="text-rose-500">*</strong></span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">Wajib diisi</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={contactInstitusi}
                            onChange={(e) => setContactInstitusi(e.target.value)}
                            placeholder="Contoh: PT Industri Sandang Mandiri / Yayasan Literasi / Universitas..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                          />
                        </div>

                        {/* 2. Email * */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <AtSign className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Email Kontak <strong className="text-rose-500">*</strong></span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">Wajib diisi</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="Contoh: kemitraan@perusahaan.com / nama@email.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                          />
                        </div>

                        {/* 3. Pesan */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Pesan Kolaborasi / Kemitraan:</span>
                          </label>
                          <textarea
                            rows={4}
                            value={contactPesan}
                            onChange={(e) => setContactPesan(e.target.value)}
                            placeholder="Tuliskan kebutuhan kolaborasi Anda (contoh: Penyaluran 500kg limbah kain garmen, pemesanan 200 pcs ID Card ramah lingkungan untuk seminar, atau dukungan pengadaan buku cerita di Kecamatan Cipocok Jaya)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition resize-none leading-relaxed"
                          ></textarea>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <button
                            type="submit"
                            className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/25 transition cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                            <span>Kirim Pesan via Gmail (perjalsokola@gmail.com)</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCopyContactDraft}
                            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Draf Pesan</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modern Eco-Tech Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800">SISTA SORTIR &bull; Perjal Sokola</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Model: Gemini 3.8 Flash Vision</span>
            <span>&bull;</span>
            <span>Kota Serang, Banten</span>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar (Menu Pilihan Bawah Ponsel) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-around lg:hidden safe-area-bottom">
        <button
          onClick={() => {
            setActiveTab("about");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition cursor-pointer ${
            activeTab === "about"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === "about" ? "bg-emerald-100/80" : ""}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Utama</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("scanner");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition cursor-pointer ${
            activeTab === "scanner"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === "scanner" ? "bg-emerald-100/80" : ""}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Pindai</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("dashboard");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition cursor-pointer ${
            activeTab === "dashboard"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === "dashboard" ? "bg-emerald-100/80" : ""}`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Pusat Data</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("gform");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition relative cursor-pointer ${
            activeTab === "gform"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className={`p-1 rounded-lg relative ${activeTab === "gform" ? "bg-emerald-100/80" : ""}`}>
            <FileCheck className="w-5 h-5" />
            {isDataLinked && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#10b981] ring-1 ring-white"></span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Formulir</span>
        </button>
      </nav>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(b64) => {
          setSelectedSampleId(undefined);
          setCurrentImage(b64);
          setAnalysisResult(null);
        }}
      />

      {/* QR Label Print Modal */}
      <QrLabelModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        analysis={analysisResult}
        itemCode={formId || `SISTA-${Math.floor(1000 + Math.random() * 9000)}`}
      />
    </div>
  );
}
