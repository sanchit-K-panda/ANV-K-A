'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocWifi(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M3 9a14 14 0 0 1 18 0M6 13a9.5 9.5 0 0 1 12 0M9 17a5 5 0 0 1 6 0" />
      <circle cx="12" cy="20" r="1" />
    </SocIcon>
  );
}

export default SocWifi;
