'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocReport(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 17v-4M12 17V9M16 17v-7" />
    </SocIcon>
  );
}

export default SocReport;
