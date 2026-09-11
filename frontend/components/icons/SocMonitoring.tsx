'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocMonitoring(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="m6 13 3-3 3 2 5-5" />
    </SocIcon>
  );
}

export default SocMonitoring;
