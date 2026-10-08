"use client";

import Image from "next/image";
import { useState } from "react";
import { getCompanyImageUrl } from "@/lib/company-images";
import type { JobCompany } from "@/types/job";
import styles from "./jobs.module.css";

export function CompanyLogo({ company, size = 44 }: { company?: JobCompany | null; size?: number }) {
  const source = company?.branding_reuse_allowed ? getCompanyImageUrl(company.company_logo_url) : null;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const companyName = company?.company_name || "";

  return (
    <span className={styles.companyLogo} style={{ width: size, height: size }} aria-hidden="true">
      {source && failedSource !== source ? (
        <Image
          src={source}
          alt=""
          width={size}
          height={size}
          sizes={size + "px"}
          className={styles.companyLogoImage}
          onError={() => setFailedSource(source)}
        />
      ) : (
        <span className={styles.companyInitial}>{companyName.charAt(0).toUpperCase() || "—"}</span>
      )}
    </span>
  );
}
