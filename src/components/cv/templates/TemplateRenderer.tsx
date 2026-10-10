"use client";

import React from "react";
import { CvDocument } from "@/types/cv";
import { ModernTechTemplate, TemplateProps } from "./ModernTechTemplate";
import { MinimalistAtsTemplate } from "./MinimalistAtsTemplate";
import { ExecutiveLeaderTemplate } from "./ExecutiveLeaderTemplate";
import { CreativeProductTemplate } from "./CreativeProductTemplate";
import { CompactSwissTemplate } from "./CompactSwissTemplate";

export const TemplateRenderer: React.FC<TemplateProps> = (props) => {
  const templateId = props.cv.template_id;

  switch (templateId) {
    case "minimalist_ats":
      return <MinimalistAtsTemplate {...props} />;
    case "executive_leader":
      return <ExecutiveLeaderTemplate {...props} />;
    case "creative_product":
      return <CreativeProductTemplate {...props} />;
    case "compact_swiss":
      return <CompactSwissTemplate {...props} />;
    case "modern_tech":
    default:
      return <ModernTechTemplate {...props} />;
  }
};
