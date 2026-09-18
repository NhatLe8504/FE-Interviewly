"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  Check,
  FileCode,
  ArrowRight,
  Shield,
  Clock,
  Globe,
  Terminal,
  Database,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import type { AuditLogItem } from "./types";

interface AuditLogDetailDialogProps {
  log: AuditLogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailDialog({
  log,
  open,
  onOpenChange,
}: AuditLogDetailDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    toast.success("Đã sao chép toàn bộ thông tin bản ghi log dạng JSON!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine action badge styling
  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-[11px]">CREATE</Badge>;
      case "UPDATE":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-mono text-[11px]">UPDATE</Badge>;
      case "DELETE":
        return <Badge variant="destructive" className="font-mono text-[11px]">DELETE</Badge>;
      case "STATUS_CHANGE":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-mono text-[11px]">STATUS_CHANGE</Badge>;
      case "ROLE_ASSIGN":
        return <Badge className="bg-purple-500 hover:bg-purple-600 text-white font-mono text-[11px]">ROLE_ASSIGN</Badge>;
      case "LOGIN":
      case "LOGOUT":
      case "PASSWORD_CHANGE":
        return <Badge variant="outline" className="border-purple-400 text-purple-600 dark:text-purple-300 font-mono text-[11px]">{action}</Badge>;
      case "CONFIG_CHANGE":
        return <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white font-mono text-[11px]">CONFIG</Badge>;
      case "SYNC":
        return <Badge className="bg-teal-500 hover:bg-teal-600 text-white font-mono text-[11px]">SYNC</Badge>;
      default:
        return <Badge variant="secondary" className="font-mono text-[11px]">{action}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 gap-1 text-xs">
            <CheckCircle2 className="size-3" /> Thành công
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 gap-1 text-xs">
            <AlertTriangle className="size-3" /> Cảnh báo
          </Badge>
        );
      case "failure":
        return (
          <Badge variant="outline" className="border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10 gap-1 text-xs">
            <XCircle className="size-3" /> Thất bại
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 gap-1 text-xs">
            <Info className="size-3" /> Thông tin
          </Badge>
        );
    }
  };

  // Extract all keys between old_value and new_value
  const allKeys = Array.from(
    new Set([
      ...Object.keys(log.old_value || {}),
      ...Object.keys(log.new_value || {}),
    ])
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                #AUD-{log.audit_id}
              </Badge>
              {getActionBadge(log.action)}
              {getStatusBadge(log.status)}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {new Date(log.created_at).toLocaleString("vi-VN")}
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground mt-2 leading-snug">
            {log.summary}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Bản ghi vết thay đổi trên bảng <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground font-semibold">{log.table_name}</code> (Khóa bản ghi ID: <code className="font-mono font-bold text-primary">{String(log.record_id ?? "N/A")}</code>)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-2">
          <TabsList className="grid grid-cols-3 w-full h-9">
            <TabsTrigger value="overview" className="text-xs">
              <Activity className="size-3.5 mr-1.5" />
              Tổng quan sự kiện
            </TabsTrigger>
            <TabsTrigger value="diff" className="text-xs">
              <Layers className="size-3.5 mr-1.5" />
              Biến động (Diff)
            </TabsTrigger>
            <TabsTrigger value="raw" className="text-xs">
              <FileCode className="size-3.5 mr-1.5" />
              JSON đầy đủ
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-4 pt-3 text-xs">
            {/* Actor Card */}
            <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Người thực hiện (Actor)
                </span>
                <Badge variant="secondary" className="capitalize text-[11px]">
                  {log.actor_role}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="size-10 border">
                  <AvatarFallback className="font-bold text-sm bg-primary/10 text-primary">
                    {log.actor_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-foreground">{log.actor_name}</p>
                  <p className="text-muted-foreground font-mono">{log.actor_email}</p>
                  {log.user_id && (
                    <p className="text-[11px] text-muted-foreground">ID người dùng: #{log.user_id}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Network & Device Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Globe className="size-3.5 text-blue-500" />
                  <span className="font-medium text-[11px]">Địa chỉ IP</span>
                </div>
                <p className="font-mono font-bold text-sm text-foreground">{log.ip_address}</p>
              </div>

              <div className="rounded-lg border p-3 bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Terminal className="size-3.5 text-amber-500" />
                  <span className="font-medium text-[11px]">Mức độ nghiêm trọng</span>
                </div>
                <Badge
                  variant="outline"
                  className={`capitalize text-xs font-semibold ${
                    log.severity === "critical"
                      ? "border-red-500 text-red-600 bg-red-500/10"
                      : log.severity === "high"
                      ? "border-amber-500 text-amber-600 bg-amber-500/10"
                      : "border-slate-300 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {log.severity}
                </Badge>
              </div>
            </div>

            <div className="rounded-lg border p-3 bg-card space-y-1">
              <span className="font-medium text-[11px] text-muted-foreground">Trình duyệt / Thiết bị (User Agent)</span>
              <p className="font-mono text-xs text-foreground break-all">{log.user_agent}</p>
            </div>

            {/* Target Resource */}
            <div className="rounded-lg border p-3 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[11px] text-muted-foreground">Bảng dữ liệu &amp; Mã đối tượng</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {log.table_name}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Mã định danh bản ghi (Record ID):</span>
                <span className="font-mono font-bold text-foreground">#{String(log.record_id ?? "N/A")}</span>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: DIFF VIEW */}
          <TabsContent value="diff" className="pt-3">
            {allKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                Không có dữ liệu thay đổi chi tiết được ghi nhận cho sự kiện này.
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <div className="grid grid-cols-12 bg-muted/60 p-2.5 font-bold text-xs border-b">
                  <div className="col-span-4">Trường dữ liệu</div>
                  <div className="col-span-4">Giá trị cũ (Before)</div>
                  <div className="col-span-4">Giá trị mới (After)</div>
                </div>

                <div className="divide-y max-h-[320px] overflow-y-auto">
                  {allKeys.map((key) => {
                    const oldVal = log.old_value ? (log.old_value as any)[key] : undefined;
                    const newVal = log.new_value ? (log.new_value as any)[key] : undefined;
                    const isDifferent = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                    const formatVal = (v: any) => {
                      if (v === undefined) return <span className="text-muted-foreground italic font-mono text-[11px]">null</span>;
                      if (typeof v === "object" && v !== null) return JSON.stringify(v);
                      return String(v);
                    };

                    return (
                      <div
                        key={key}
                        className={`grid grid-cols-12 p-2.5 text-xs font-mono items-center gap-2 ${
                          isDifferent ? "bg-amber-500/5 dark:bg-amber-500/10" : ""
                        }`}
                      >
                        <div className="col-span-4 font-bold text-foreground truncate" title={key}>
                          {key}
                        </div>
                        <div className="col-span-4 text-rose-600 dark:text-rose-400 break-all text-[11px]">
                          {formatVal(oldVal)}
                        </div>
                        <div className="col-span-4 text-emerald-600 dark:text-emerald-400 font-semibold break-all text-[11px]">
                          {formatVal(newVal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: RAW JSON */}
          <TabsContent value="raw" className="pt-3">
            <div className="relative">
              <pre className="p-3.5 rounded-lg bg-slate-950 text-slate-50 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[340px]">
                {JSON.stringify(log, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 sm:justify-between items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJson}
            className="text-xs gap-1.5"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Đã chép" : "Sao chép JSON"}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}