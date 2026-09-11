'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocHelp(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.7 1.2-1.7 2.7M12 17h.01" />
    </SocIcon>
  );
}

export default SocHelp;
