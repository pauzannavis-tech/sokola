import React, { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X, Check, AlertCircle, Upload, Image, HelpCircle } from "lucide-react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = async (mode: "environment" | "user") => {
    setErrorMsg(null);
    setIsPermissionDenied(false);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg("Perangkat atau browser ini tidak mendukung akses kamera langsung.");
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("First camera attempt failed:", err?.name, err?.message);
      
      const isDenied =
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError" ||
        err?.message?.toLowerCase().includes("permission denied") ||
        err?.message?.toLowerCase().includes("not allowed");

      if (isDenied) {
        setIsPermissionDenied(true);
        setErrorMsg("Izin akses kamera ditolak oleh browser atau sistem. Anda dapat memberikan izin di ikon gembok/setelan browser, atau langsung gunakan tombol 'Pilih Foto dari Galeri / Kamera HP' di bawah.");
        return;
      }

      // Try fallback without facingMode constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr: any) {
        console.error("Camera access fallback error:", fallbackErr);
        const isFallbackDenied =
          fallbackErr?.name === "NotAllowedError" ||
          fallbackErr?.name === "PermissionDeniedError" ||
          fallbackErr?.message?.toLowerCase().includes("permission denied") ||
          fallbackErr?.message?.toLowerCase().includes("not allowed");

        if (isFallbackDenied) {
          setIsPermissionDenied(true);
          setErrorMsg("Izin akses kamera ditolak. Berikan izin di browser atau gunakan fitur unggah foto langsung dari galeri.");
        } else {
          setErrorMsg("Kamera tidak dapat diaktifkan atau sedang digunakan oleh aplikasi lain. Silakan unggah foto pakaian secara manual.");
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (!stream && !errorMsg) {
      startCamera(facingMode);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  // Alternative fallback: Direct file / camera picker via input
  const handleFileAlternative = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCapturedImage(result);
          setErrorMsg(null);
          setIsPermissionDenied(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-blue-100 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Ambil Foto Pakaian</h3>
              <p className="text-[11px] text-slate-500">Pindai pakaian secara langsung untuk analisis SISTA AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="p-6 text-center text-slate-300 space-y-4 max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {isPermissionDenied ? "Izin Kamera Belum Diberikan" : "Kamera Tidak Tersedia"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {errorMsg}
                </p>
              </div>

              {/* Action Buttons in Error State */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pilih Foto dari Galeri / Kamera HP</span>
                </button>

                <button
                  onClick={() => startCamera(facingMode)}
                  className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Coba Izin Lagi</span>
                </button>
              </div>

              <div className="text-[10.5px] text-slate-400 pt-1 flex items-center justify-center gap-1">
                <HelpCircle className="w-3 h-3 text-slate-400" />
                <span>Tips: Klik ikon gembok pada URL browser untuk mengaktifkan izin kamera.</span>
              </div>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Foto Diambil" className="w-full h-full object-contain bg-slate-900" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Overlay Guide Box for Garment Alignment */}
              <div className="absolute inset-8 border-2 border-emerald-400/70 rounded-xl pointer-events-none border-dashed flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] text-emerald-200 font-mono uppercase bg-slate-950/80 px-2 py-0.5 rounded self-start border border-emerald-500/40">
                  Bidik Seluruh Pakaian
                </div>
                <div className="text-[10px] text-emerald-200 font-mono text-center bg-slate-950/80 py-0.5 rounded border border-emerald-500/40">
                  Pastikan serat tekstil, robekan, & noda terlihat jelas
                </div>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
          {/* Hidden File Input as fallback */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileAlternative}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <RefreshCw className="w-4 h-4" /> Ulangi Foto
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition"
              >
                <Check className="w-4 h-4" /> Gunakan Foto Ini
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFacingMode}
                  className="py-2 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  title="Ganti Kamera Depan/Belakang"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-600" /> Balik
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  title="Unggah Foto dari Galeri"
                >
                  <Image className="w-4 h-4 text-emerald-600" /> Galeri
                </button>
              </div>

              {!errorMsg && (
                <button
                  onClick={handleCapture}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer transition"
                >
                  <Camera className="w-4 h-4" /> Potret
                </button>
              )}

              <button
                onClick={onClose}
                className="py-2 px-3 text-slate-500 hover:text-slate-800 text-xs cursor-pointer font-medium"
              >
                Tutup
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
