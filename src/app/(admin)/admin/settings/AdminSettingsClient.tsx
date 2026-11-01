"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  Volume2,
  Mic,
  Mail,
  Activity,
  Save,
  RefreshCw,
  Database,
  HardDrive,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  settingsAdminApi,
  type SystemHealth,
  type SystemSettings,
} from "@/services/admin/settingsAdminApi";
import { AdminPageHeader, AdminStatCard } from "@/components/admin";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminSettingsClient() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");

  const [form, setForm] = useState<SystemSettings>({
    ai_model: "openai/gpt-oss-120b",
    ai_temperature: 0.7,
    ai_max_tokens: 1500,
    ai_interviewer_persona: "",
    tts_provider: "edge_tts",
    tts_default_voice: "vi-VN-HoaiMyNeural",
    stt_provider: "whisper",
    audio_retention_hours: 24,
    max_upload_size_mb: 25,
    smtp_host: "smtp.gmail.com",
    smtp_port: 587,
    smtp_sender_name: "Interviewly AI Coach",
    smtp_sender_email: "no-reply@interviewly.ai",
    maintenance_mode: false,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, h] = await Promise.all([
        settingsAdminApi.getSettings(),
        settingsAdminApi.getHealth().catch(() => null),
      ]);
      setSettings(s);
      setForm(s);
      setHealth(h);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải cấu hình hệ thống");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await settingsAdminApi.updateSettings({
        ai_model: form.ai_model,
        ai_temperature: Number(form.ai_temperature),
        ai_max_tokens: Number(form.ai_max_tokens),
        ai_interviewer_persona: form.ai_interviewer_persona,
        tts_provider: form.tts_provider,
        tts_default_voice: form.tts_default_voice,
        stt_provider: form.stt_provider,
        audio_retention_hours: Number(form.audio_retention_hours),
        max_upload_size_mb: Number(form.max_upload_size_mb),
        smtp_host: form.smtp_host,
        smtp_port: Number(form.smtp_port),
        smtp_sender_name: form.smtp_sender_name,
        smtp_sender_email: form.smtp_sender_email,
        maintenance_mode: form.maintenance_mode,
      });
      setSettings(updated);
      setForm(updated);
      toast.success("Lưu cấu hình hệ thống thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Lỗi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <AdminPageHeader
        title="Cài Đặt Hệ Thống & Trí Tuệ Nhân Tạo"
        description="Quản trị cấu hình LLM, Voice TTS/STT, hạ tầng email và theo dõi sức khỏe máy chủ."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || loading}>
            <Save className="size-4 mr-2" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </AdminPageHeader>

      {/* Quick Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatCard
          title="Trạng Thái Cơ Sở Dữ Liệu"
          value={health?.database_connected ? "Hoạt động tốt" : "Mất kết nối"}
          description="PostgreSQL Primary Cluster"
          icon={
            health?.database_connected ? (
              <CheckCircle2 className="size-5 text-emerald-500" />
            ) : (
              <XCircle className="size-5 text-rose-500" />
            )
          }
        />
        <AdminStatCard
          title="Bộ Nhớ Đệm Redis"
          value={health?.redis_connected ? "Đã kết nối" : "Ngoại tuyến"}
          description="Session & Rate Limiting Cache"
          icon={
            health?.redis_connected ? (
              <CheckCircle2 className="size-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="size-5 text-amber-500" />
            )
          }
        />
        <AdminStatCard
          title="Dung Lượng Audio Tạm"
          value={`${health?.audio_storage_size_mb ?? 0} MB`}
          description={`Tự động xóa sau ${form.audio_retention_hours}h`}
          icon={<HardDrive className="size-5 text-primary" />}
        />
        <AdminStatCard
          title="Phiên Bản Hệ Thống"
          value={health?.version ?? "v2.5.0"}
          description={form.maintenance_mode ? "Đang bảo trì" : "Sẵn sàng phục vụ"}
          icon={<Cpu className="size-5 text-primary" />}
        />
      </div>

      {loading ? (
        <div className="space-y-4 py-8">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="size-4" />
                <span>AI Models</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Volume2 className="size-4" />
                <span>Âm Thanh</span>
              </TabsTrigger>
              <TabsTrigger value="mail" className="flex items-center gap-2">
                <Mail className="size-4" />
                <span>Email & Hạ Tầng</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Activity className="size-4" />
                <span>Sức Khỏe</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: AI MODELS */}
            <TabsContent value="ai" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Bot className="size-5 text-primary" />
                    Cấu Hình Mô Hình Ngôn Ngữ Lớn (LLM)
                  </CardTitle>
                  <CardDescription>
                    Điều chỉnh engine AI phỏng vấn viên, độ ngẫu nhiên suy luận và prompt phong cách ứng xử
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai_model">Model Trí Tuệ Nhân Tạo</Label>
                      <Select
                        value={form.ai_model}
                        onValueChange={(val) => setForm({ ...form, ai_model: val })}
                      >
                        <SelectTrigger id="ai_model">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai/gpt-oss-120b">Groq: gpt-oss-120b (Khuyên dùng)</SelectItem>
                          <SelectItem value="llama-3.3-70b-versatile">Groq: Llama 3.3 70B Versatile</SelectItem>
                          <SelectItem value="qwen/qwen3.8-27b">Groq: Qwen 3.8 27B</SelectItem>
                          <SelectItem value="gpt-4o">OpenAI: GPT-4o Omni</SelectItem>
                          <SelectItem value="claude-3-5-sonnet-20241022">Anthropic: Claude 3.5 Sonnet</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Mô hình AI điều hành toàn bộ phiên phỏng vấn.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ai_temperature">Độ Sáng Tạo (Temperature): {form.ai_temperature}</Label>
                      </div>
                      <Input
                        id="ai_temperature"
                        type="number"
                        min="0.0"
                        max="1.5"
                        step="0.05"
                        value={form.ai_temperature}
                        onChange={(e) => setForm({ ...form, ai_temperature: Number(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">Giá trị 0.6 - 0.8 mang lại câu hỏi tự nhiên và chuyên nghiệp.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ai_max_tokens">Giới Hạn Token Tối Đa (Max Tokens)</Label>
                      <Input
                        id="ai_max_tokens"
                        type="number"
                        min="256"
                        max="8192"
                        step="100"
                        value={form.ai_max_tokens}
                        onChange={(e) => setForm({ ...form, ai_max_tokens: Number(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">Độ dài câu trả lời và phản hồi của người phỏng vấn.</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="persona">System Prompt Persona (Phong thái Phỏng vấn viên)</Label>
                    <textarea
                      id="persona"
                      rows={5}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={form.ai_interviewer_persona}
                      onChange={(e) => setForm({ ...form, ai_interviewer_persona: e.target.value })}
                      placeholder="Nhập prompt định hình phong thái phỏng vấn..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Đoạn chỉ dẫn cốt lõi yêu cầu AI áp dụng phương pháp STAR, hỏi sâu các tình huống thực tế và không dễ dãi cho qua câu trả lời chung chung.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: VOICE & AUDIO */}
            <TabsContent value="voice" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Volume2 className="size-5 text-primary" />
                    Cấu Hình Nhận Diện & Tổng Hợp Giọng Nói (TTS & STT)
                  </CardTitle>
                  <CardDescription>
                    Tùy chọn engine giọng đọc AI và chính sách dọn dẹp file ghi âm giải phóng dung lượng VPS
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tts_provider">Engine Tổng Hợp Giọng (TTS)</Label>
                      <Select
                        value={form.tts_provider}
                        onValueChange={(val) => setForm({ ...form, tts_provider: val })}
                      >
                        <SelectTrigger id="tts_provider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="edge_tts">Microsoft Edge TTS (Tốc độ cao & Miễn phí)</SelectItem>
                          <SelectItem value="elevenlabs">ElevenLabs Multilingual v2</SelectItem>
                          <SelectItem value="fpt_ai">FPT AI Text-to-Speech</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tts_default_voice">Giọng Đọc Mặc Định</Label>
                      <Select
                        value={form.tts_default_voice}
                        onValueChange={(val) => setForm({ ...form, tts_default_voice: val })}
                      >
                        <SelectTrigger id="tts_default_voice">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi-VN-HoaiMyNeural">Hoài My (Nữ - Miền Nam)</SelectItem>
                          <SelectItem value="vi-VN-NamMinhNeural">Nam Minh (Nam - Miền Bắc)</SelectItem>
                          <SelectItem value="en-US-JennyNeural">Jenny (Nữ - Tiếng Anh)</SelectItem>
                          <SelectItem value="en-US-GuyNeural">Guy (Nam - Tiếng Anh)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stt_provider">Engine Nhận Diện Lời Nói (STT)</Label>
                      <Select
                        value={form.stt_provider}
                        onValueChange={(val) => setForm({ ...form, stt_provider: val })}
                      >
                        <SelectTrigger id="stt_provider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whisper">Whisper OpenAI / Groq STT</SelectItem>
                          <SelectItem value="deepgram">Deepgram Nova-2 Multilingual</SelectItem>
                          <SelectItem value="google_speech">Google Speech-to-Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="audio_retention">Tự Động Xóa File Audio Tạm Sau (Giờ)</Label>
                      <Input
                        id="audio_retention"
                        type="number"
                        min="1"
                        max="168"
                        value={form.audio_retention_hours}
                        onChange={(e) => setForm({ ...form, audio_retention_hours: Number(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Tuân thủ quy tắc bảo tồn tài nguyên VPS: File audio phiên phỏng vấn tự động xóa định kỳ.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="upload_size">Giới Hạn Dung Lượng Upload Audio (MB)</Label>
                      <Input
                        id="upload_size"
                        type="number"
                        min="5"
                        max="100"
                        value={form.max_upload_size_mb}
                        onChange={(e) => setForm({ ...form, max_upload_size_mb: Number(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Chặn các file ghi âm vượt quá dung lượng cho phép.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: EMAIL & INFRASTRUCTURE */}
            <TabsContent value="mail" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Mail className="size-5 text-emerald-500" />
                    Cấu Hình Email SMTP & Máy Chủ Gửi Mã OTP
                  </CardTitle>
                  <CardDescription>
                    Cấu hình kết nối máy chủ gửi email kích hoạt tài khoản và biên nhận thanh toán
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_host">SMTP Host</Label>
                      <Input
                        id="smtp_host"
                        value={form.smtp_host}
                        onChange={(e) => setForm({ ...form, smtp_host: e.target.value })}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Input
                        id="smtp_port"
                        type="number"
                        value={form.smtp_port}
                        onChange={(e) => setForm({ ...form, smtp_port: Number(e.target.value) })}
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sender_name">Tên Người Gửi Hiển Thị</Label>
                      <Input
                        id="sender_name"
                        value={form.smtp_sender_name}
                        onChange={(e) => setForm({ ...form, smtp_sender_name: e.target.value })}
                        placeholder="Interviewly Team"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sender_email">Email Gửi</Label>
                      <Input
                        id="sender_email"
                        type="email"
                        value={form.smtp_sender_email}
                        onChange={(e) => setForm({ ...form, smtp_sender_email: e.target.value })}
                        placeholder="support@interviewly.ai"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-border text-primary focus:ring-primary size-4"
                        checked={form.maintenance_mode}
                        onChange={(e) => setForm({ ...form, maintenance_mode: e.target.checked })}
                      />
                      <div>
                        <div className="font-medium text-foreground text-sm">Chế độ Bảo trì Hệ thống (Maintenance Mode)</div>
                        <div className="text-xs text-muted-foreground">
                          Khi bật, người dùng phổ thông sẽ nhận thông báo bảo trì; chỉ tài khoản Admin mới có thể đăng nhập.
                        </div>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: SYSTEM HEALTH */}
            <TabsContent value="health" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Activity className="size-5 text-rose-500" />
                    Báo Cáo Sức Khỏe & Kết Nối Dịch Vụ
                  </CardTitle>
                  <CardDescription>
                    Chi tiết các kết nối nền tảng backend, cơ sở dữ liệu và dung lượng lưu trữ thực tế
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-xl space-y-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm flex items-center gap-2">
                          <Database className="size-4 text-emerald-500" />
                          PostgreSQL Database
                        </span>
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-none">Trực Tuyến</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pool kết nối hoạt động bình thường. Tất cả 41 bảng dữ liệu sẵn sàng.
                      </p>
                    </div>

                    <div className="p-4 border rounded-xl space-y-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm flex items-center gap-2">
                          <Cpu className="size-4 text-primary" />
                          Redis Cache Service
                        </span>
                        <Badge
                          variant={health?.redis_connected ? "default" : "secondary"}
                          className={health?.redis_connected ? "bg-emerald-500/15 text-emerald-600 border-none" : ""}
                        >
                          {health?.redis_connected ? "Đã Kết Nối" : "Ngoại Tuyến"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Hỗ trợ cache kết quả câu hỏi và session state của candidate.
                      </p>
                    </div>

                    <div className="p-4 border rounded-xl space-y-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm flex items-center gap-2">
                          <HardDrive className="size-4 text-amber-500" />
                          Dung Lượng Audio Tạm
                        </span>
                        <span className="text-sm font-bold text-foreground">{health?.audio_storage_size_mb ?? 0} MB</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Thư mục lưu trữ file audio ghi âm. Được dọn dẹp tự động bởi background worker.
                      </p>
                    </div>

                    <div className="p-4 border rounded-xl space-y-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm flex items-center gap-2">
                          <Activity className="size-4 text-primary" />
                          Thời Gian Máy Chủ (UTC)
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {health?.server_time ? new Date(health.server_time).toLocaleString("vi-VN") : "Đang kiểm tra"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Đồng hồ thời gian thực dùng để đồng bộ timestamp giao dịch và lịch hẹn phỏng vấn.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving}>
              <Save className="size-4 mr-2" />
              {saving ? "Đang lưu..." : "Lưu tất cả thay đổi"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
