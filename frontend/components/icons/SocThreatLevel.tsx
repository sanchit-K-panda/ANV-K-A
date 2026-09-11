'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocThreatLevel(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M4 20V10M9 20V7M14 20V4M19 20V2" />
      <path d="M3 20h18" />
      <path d="m17 6 2-2 2 2" />
    </SocIcon>
  );
}

export default SocThreatLevel;
