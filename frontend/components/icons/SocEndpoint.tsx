'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocEndpoint(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <circle cx="7" cy="8" r="1" />
      <path d="M10 8h7M10 12h5" />
    </SocIcon>
  );
}

export default SocEndpoint;
