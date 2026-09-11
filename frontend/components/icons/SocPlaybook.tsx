'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocPlaybook(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" />
      <path d="M8 20V7a3 3 0 0 1 3-3" />
      <path d="M11 9h5M11 13h5M11 17h3" />
    </SocIcon>
  );
}

export default SocPlaybook;
