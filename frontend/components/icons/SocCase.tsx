'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocCase(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M3 7h7l2 2h9v10a2 2 0 0 1-2 2H3V7Z" />
      <path d="M3 7V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v2" />
    </SocIcon>
  );
}

export default SocCase;
