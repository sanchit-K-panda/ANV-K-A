'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocAccess(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
      <path d="m16 12 2 2 4-4" />
    </SocIcon>
  );
}

export default SocAccess;
