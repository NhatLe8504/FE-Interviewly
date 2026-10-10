"use client";

import React, { useRef } from "react";
import { Plus, Camera, Trash2 } from "lucide-react";

interface CvAvatarProps {
  avatarUrl?: string;
  onChange: (url: string) => void;
  isEditable?: boolean;
  size?: number;
  className?: string;
}

const AVATAR_STORAGE_KEY = "interviewly_cv_avatar";

export const CvAvatar: React.FC<CvAvatarProps> = ({
  avatarUrl,
  onChange,
  isEditable = true,
  size = 84,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        // Lưu lại cho lần tạo CV lần tới
        try {
          localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
        } catch (err) {
          console.warn("Could not save avatar to localStorage:", err);
        }
        onChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    try {
      localStorage.removeItem(AVATAR_STORAGE_KEY);
    } catch (err) {
      // ignore
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Kích thước vòng tròn
  const styleObj: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
  };

  return (
    <div
      style={styleObj}
      className={`relative rounded-full shrink-0 group select-none ${className}`}
    >
      {/* ẨN KHI IN NẾU KHÔNG CÓ ẢNH */}
      {avatarUrl ? (
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-slate-200/80 shadow-sm">
          <img
            src={avatarUrl}
            alt="CV Avatar"
            className="w-full h-full object-cover rounded-full"
          />

          {/* OVERLAY SỬA ẢNH KHI HOVER (CHỈ HIỆN KHI EDIT VÀ KHÔNG IN) */}
          {isEditable && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/45 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer print:hidden"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-5 h-5 mb-0.5 text-white/90" />
              <span className="text-[9px] font-semibold tracking-tight text-white/90">
                Đổi ảnh
              </span>

              {/* Nút xóa ảnh nhỏ ở góc */}
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition"
                title="Xóa ảnh"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* VÒNG TRÒN DẤU + KHI CHƯA CÓ ẢNH */
        <div
          onClick={() => isEditable && fileInputRef.current?.click()}
          className={`w-full h-full rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all ${
            isEditable
              ? "border-amber-700/30 hover:border-amber-700/70 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer text-amber-900/70 hover:text-amber-900"
              : "border-slate-200 bg-slate-50 text-slate-400"
          } print:hidden`}
          title="Tải ảnh đại diện cho CV"
        >
          <Plus className="w-6 h-6 stroke-[2.2] mb-0.5 transition-transform group-hover:scale-110" />
          <span className="text-[10px] font-semibold tracking-tight">Ảnh</span>
        </div>
      )}

      {/* INPUT FILE ẨN */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
