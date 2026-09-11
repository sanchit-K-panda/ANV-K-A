'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocUser(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </SocIcon>
  );
}

export default SocUser;
