"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Terminal,
  Play,
  Pause,
  Copy,
  Check,
  RotateCcw,
  Clock,
  ArrowDown,
  Trash2,
  Activity,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface ServerTerminalLogProps {
  lines: string[];
  isFetching?: boolean;
  onRefresh?: () => void;
  retentionMinutes?: number;
  uptimeSeconds?: number;
}

export function ServerTerminalLog({
  lines = [],
  isFetching = false,
  onRefresh,
  retentionMinutes = 10,
  uptimeSeconds = 0,
}: ServerTerminalLogProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [countdown, setCountdown] = useState(5);
  const [copied, setCopied] = useState(false);
  const [cleared, setCleared] = useState(false);

  const terminalBodyRef = useRef<HTMLDivElement>(null);

  // 5-second countdown timer
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (onRefresh) onRefresh();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onRefresh]);

  // Reset cleared state when new lines arrive
  useEffect(() => {
    if (lines.length > 0) {
      setCleared(false);
    }
  }, [lines.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && terminalBodyRef.current && !cleared) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [lines, autoScroll, cleared]);

  // Filter lines by level
  const displayedLines = React.useMemo(() => {
    if (cleared) return [];
    if (selectedLevel === "ALL") return lines;
    return lines.filter((line) => line.includes(`[${selectedLevel}`));
  }, [lines, selectedLevel, cleared]);

  const handleCopyLogs = () => {
    const text = displayedLines.join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`Đã sao chép ${displayedLines.length} dòng log terminal vào clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearTerminal = () => {
    setCleared(true);
    toast.info("Đã xóa màn hình console terminal.");
  };

  // Format uptime
  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h}h ${m}m ${s}s`;
  };

  // Syntax colorizer helper for terminal log line
  const colorizeLogLine = (line: string) => {
    // Regex matches: [timestamp] [LEVEL] METHOD /path -> STATUS (DURATIONms) from IP [user:ID]
    const match = line.match(/^(\[[^\]]+\])\s+\[([^\]]+)\]\s+([A-Z]+)\s+([^\s]+)\s+->\s+(\d+)\s+\(([^)]+)\)\s+from\s+([^\s]+)(.*)$/);

    if (!match) {
      // Fallback colorization for general messages
      if (line.includes("[ERROR]")) {
        return <span className="text-rose-400 font-semibold">{line}</span>;
      }
      if (line.includes("[WARN ]")) {
        return <span className="text-amber-300">{line}</span>;
      }
      return <span className="text-slate-300">{line}</span>;
    }

    const [, ts, lvl, method, path, status, dur, ip, extra] = match;
    const statusCode = parseInt(status, 10);

    const levelColor =
      lvl.trim() === "ERROR"
        ? "text-rose-400 font-bold bg-rose-950/40 px-1 rounded"
        : lvl.trim() === "WARN"
        ? "text-amber-400 font-bold bg-amber-950/40 px-1 rounded"
        : "text-emerald-400 font-bold bg-emerald-950/40 px-1 rounded";

    const methodColor =
      method === "GET"
        ? "text-sky-400 font-bold"
        : method === "POST"
        ? "text-emerald-400 font-bold"
        : method === "PUT"
        ? "text-amber-400 font-bold"
        : method === "DELETE"
        ? "text-rose-400 font-bold"
        : "text-purple-400 font-bold";

    const statusColor =
      statusCode >= 500
        ? "text-rose-400 font-black"
        : statusCode >= 400
        ? "text-amber-400 font-black"
        : "text-emerald-400 font-black";

    return (
      <span className="leading-relaxed">
        <span className="text-slate-500 mr-2 select-none">{ts}</span>
        <span className={`${levelColor} mr-2 select-none`}>[{lvl.trim()}]</span>
        <span className={`${methodColor} mr-2 inline-block w-14`}>{method}</span>
        <span className="text-slate-100 font-medium mr-2">{path}</span>
        <span className="text-slate-500 mr-1.5">-&gt;</span>
        <span className={`${statusColor} mr-2`}>{status}</span>
        <span className="text-purple-300 font-mono text-[11px] mr-2">({dur})</span>
        <span className="text-slate-400 text-[11px]">from {ip}</span>
        {extra && <span className="text-teal-300 text-[11px] ml-1.5">{extra}</span>}
      </span>
    );
  };

  return (
    <Card className="@container/card shadow-xs border bg-card overflow-hidden">
      {/* Header with Title & Terminal Toolbar */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b bg-muted/20">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Terminal className="size-4 text-emerald-500" />
              <span>Server Terminal Log (Real-time Console)</span>
            </CardTitle>

            {/* 5-second Live Polling Indicator */}
            <Badge
              variant="outline"
              className={`gap-1.5 font-mono text-xs font-semibold px-2 py-0.5 transition-colors ${
                isPaused
                  ? "border-slate-400 text-slate-500 bg-muted"
                  : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  isPaused ? "bg-slate-400" : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span>{isPaused ? "Đã tạm dừng" : `Live (${countdown}s)`}</span>
            </Badge>

            {/* Max 24h retention badge */}
            <Badge variant="secondary" className="font-mono text-[11px] gap-1 text-muted-foreground">
              <Clock className="size-3" />
              <span>Lưu tối đa {retentionMinutes} phút</span>
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Theo dõi dòng lệnh stdout và API requests tự động cập nhật mỗi 5 giây từ tiến trình backend
          </CardDescription>
        </div>

        {/* Action Controls */}
        <CardAction className="flex items-center gap-2 flex-wrap">
          {/* Level Filter */}
          <div className="w-[110px]">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả level</SelectItem>
                <SelectItem value="INFO">INFO</SelectItem>
                <SelectItem value="WARN">WARN</SelectItem>
                <SelectItem value="ERROR">ERROR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pause / Resume Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused((p) => !p)}
            className="h-8 text-xs gap-1.5"
            title={isPaused ? "Bật lại tự động cập nhật mỗi 5s" : "Tạm dừng cập nhật để đọc log"}
          >
            {isPaused ? (
              <>
                <Play className="size-3 text-emerald-500" />
                <span className="hidden sm:inline">Tiếp tục</span>
              </>
            ) : (
              <>
                <Pause className="size-3 text-amber-500" />
                <span className="hidden sm:inline">Tạm dừng</span>
              </>
            )}
          </Button>

          {/* Auto Scroll Toggle */}
          <Button
            variant={autoScroll ? "secondary" : "outline"}
            size="sm"
            onClick={() => setAutoScroll((a) => !a)}
            className="h-8 text-xs gap-1.5"
            title={autoScroll ? "Tắt tự động cuộn xuống dưới" : "Bật tự động cuộn xuống dưới"}
          >
            <ArrowDown className={`size-3 ${autoScroll ? "text-primary" : "text-muted-foreground"}`} />
            <span className="hidden md:inline">Cuộn tự động</span>
          </Button>

          {/* Copy Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLogs}
            disabled={displayedLines.length === 0}
            className="h-8 text-xs gap-1.5"
            title="Sao chép toàn bộ dòng log ra clipboard"
          >
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            <span className="hidden sm:inline">{copied ? "Đã chép" : "Copy"}</span>
          </Button>

          {/* Clear Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearTerminal}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            title="Xóa tạm thời màn hình console"
          >
            <Trash2 className="size-3" />
            <span className="hidden sm:inline">Xóa</span>
          </Button>
        </CardAction>
      </CardHeader>

      {/* Terminal Window Box */}
      <CardContent className="p-0 bg-slate-950 text-slate-100 font-mono text-xs select-text">
        {/* Linux / macOS Shell Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-red-500/80 inline-block" />
            <span className="size-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="size-3 rounded-full bg-green-500/80 inline-block" />
            <span className="ml-2 font-semibold text-slate-300">
              admin@interviewly-core:~$ journalctl -u uvicorn-api -f --since &quot;10 minutes ago&quot;
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            {uptimeSeconds > 0 && (
              <span>Uptime: <strong className="text-emerald-400">{formatUptime(uptimeSeconds)}</strong></span>
            )}
            <span className="text-slate-500">|</span>
            <span>Hiển thị: <strong className="text-slate-200">{displayedLines.length}</strong> dòng</span>
          </div>
        </div>

        {/* Terminal Lines Stream */}
        <div
          ref={terminalBodyRef}
          className="p-4 h-[280px] overflow-y-auto space-y-1 scroll-smooth font-mono text-[11.5px] leading-snug"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.15) transparent",
          }}
        >
          {displayedLines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
              <Terminal className="size-8 mb-2 opacity-40" />
              <p>Console trống hoặc chưa có sự kiện log nào phù hợp với bộ lọc.</p>
              {cleared && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCleared(false)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 mt-2"
                >
                  Khôi phục màn hình log
                </Button>
              )}
            </div>
          ) : (
            displayedLines.map((line, idx) => (
              <div key={idx} className="flex items-start hover:bg-slate-900/60 px-1 py-0.5 rounded transition-colors">
                <span className="text-slate-600 select-none mr-3 w-7 text-right text-[10px] shrink-0 pt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 break-all">
                  {colorizeLogLine(line)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}