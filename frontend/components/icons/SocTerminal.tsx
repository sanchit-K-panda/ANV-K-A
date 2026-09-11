'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocTerminal(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </SocIcon>
  );
}

export default SocTerminal;
