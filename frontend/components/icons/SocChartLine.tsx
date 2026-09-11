'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocChartLine(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M3 17 8 11l4 3 7-8" />
      <path d="M16 6h3v3" />
    </SocIcon>
  );
}

export default SocChartLine;
