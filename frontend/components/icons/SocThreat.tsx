'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocThreat(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="m12 2 8 4v6c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6l8-4Z" />
      <path d="m8 12 2.5 2.5L16 9" />
    </SocIcon>
  );
}

export default SocThreat;
