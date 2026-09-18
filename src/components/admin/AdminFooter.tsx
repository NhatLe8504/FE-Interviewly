import React from "react";

export function AdminFooter() {
  return (
    <footer className="border-t py-3.5 px-4 md:px-6 lg:px-8 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto bg-card/40 backdrop-blur-xs">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-foreground">Hệ Thống Quản Trị Interviewly</span>
        <span>•</span>
        <span>Bảng điều khiển quản lý phiên bản v1.0.0</span>
      </div>
      <div>
        <span>Nền tảng luyện phỏng vấn AI © 2026</span>
      </div>
    </footer>
  );
}
