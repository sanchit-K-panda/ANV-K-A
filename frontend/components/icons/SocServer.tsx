'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocServer(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <rect x="3" y="3" width="18" height="7" rx="2" />
      <rect x="3" y="14" width="18" height="7" rx="2" />
      <path d="M7 6h.01M7 17h.01M11 6h6M11 17h6" />
    </SocIcon>
  );
}

export default SocServer;
