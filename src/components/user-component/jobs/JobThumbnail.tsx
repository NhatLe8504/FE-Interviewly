"use client";

import React, { useState } from "react";
import { JobItem } from "@/types/job";
import { Code2, Cpu, Globe, Layers, Server, Smartphone, Terminal, Sparkles } from "lucide-react";

interface JobThumbnailProps {
  job: JobItem;
  aspectRatio?: "video" | "wide";
  className?: string;
}

interface TechMeta {
  label: string;
  imageUrl: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

function getTechMeta(job: JobItem): TechMeta {
  const text = `${job.title} ${job.skills_required?.join(" ") || ""} ${job.technologies?.join(" ") || ""}`.toLowerCase();

  if (text.includes("java") || text.includes("spring")) {
    return {
      label: "JAVA / SPRING",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=700&q=80",
      icon: Code2,
      gradient: "from-amber-900/70 via-orange-950/60 to-stone-900/80",
    };
  }
  if (text.includes("react") || text.includes("next.js") || text.includes("frontend") || text.includes("vue") || text.includes("angular")) {
    return {
      label: "FRONTEND / REACT",
      imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=700&q=80",
      icon: Layers,
      gradient: "from-sky-950/70 via-indigo-950/60 to-slate-900/80",
    };
  }
  if (text.includes("golang") || text.includes("go ") || text.includes("grpc")) {
    return {
      label: "GOLANG / CLOUD",
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=80",
      icon: Server,
      gradient: "from-cyan-950/70 via-blue-950/60 to-slate-900/80",
    };
  }
  if (text.includes("python") || text.includes("ai") || text.includes("machine learning") || text.includes("nlp") || text.includes("data")) {
    return {
      label: "AI / PYTHON",
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=700&q=80",
      icon: Cpu,
      gradient: "from-violet-950/70 via-purple-950/60 to-slate-900/80",
    };
  }
  if (text.includes("devops") || text.includes("kubernetes") || text.includes("docker") || text.includes("aws") || text.includes("cloud")) {
    return {
      label: "DEVOPS / CLOUD",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=700&q=80",
      icon: Globe,
      gradient: "from-blue-950/70 via-slate-950/60 to-neutral-900/80",
    };
  }
  if (text.includes("node") || text.includes("fullstack") || text.includes("typescript") || text.includes("javascript")) {
    return {
      label: "FULLSTACK / NODE",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=700&q=80",
      icon: Terminal,
      gradient: "from-emerald-950/70 via-teal-950/60 to-slate-900/80",
    };
  }
  if (text.includes("mobile") || text.includes("flutter") || text.includes("react native") || text.includes("ios") || text.includes("android")) {
    return {
      label: "MOBILE DEV",
      imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=700&q=80",
      icon: Smartphone,
      gradient: "from-rose-950/70 via-pink-950/60 to-stone-900/80",
    };
  }

  return {
    label: "ENGINEERING",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80",
    icon: Sparkles,
    gradient: "from-amber-950/70 via-stone-950/60 to-stone-900/80",
  };
}

export function JobThumbnail({ job, aspectRatio = "video", className = "" }: JobThumbnailProps) {
  const meta = getTechMeta(job);
  const [imgError, setImgError] = useState(false);
  const src = !imgError ? (job.thumbnail_url || meta.imageUrl) : meta.imageUrl;
  const Icon = meta.icon;
  const companyInitial = job.company?.company_name?.charAt(0).toUpperCase() || "T";

  const aspectClass = aspectRatio === "wide" ? "h-48 sm:h-56" : "h-44 sm:h-48";

  return (
    <div className={`relative w-full ${aspectClass} overflow-hidden rounded-t-xl bg-stone-900 ${className}`}>
      {/* Background Image */}
      <img
        src={src}
        alt={job.title}
        onError={() => setImgError(true)}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        loading="lazy"
      />

      {/* Gradient Scrim Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${meta.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75" />

      {/* Top Bar Badges */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-bold text-white tracking-wide shadow-sm">
          <Icon className="w-3 h-3 text-amber-300" />
          <span>{meta.label}</span>
        </div>

        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-stone-200 uppercase tracking-wider">
          {job.workplace_type}
        </div>
      </div>

      {/* Bottom Floating Company Pill & Source */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/95 backdrop-blur-md border border-white text-stone-800 font-extrabold text-xs flex items-center justify-center shadow-md">
            {companyInitial}
          </div>
          <span className="text-xs font-semibold text-white drop-shadow-md truncate max-w-[140px] sm:max-w-[180px]">
            {job.company?.company_name || "Nhà tuyển dụng"}
          </span>
        </div>

        {job.via_source && (
          <span className="text-[10px] font-medium text-amber-200/95 px-2 py-0.5 rounded bg-black/40 backdrop-blur-md border border-amber-300/20">
            {job.via_source}
          </span>
        )}
      </div>
    </div>
  );
}
