'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocSearchUser(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx="10" cy="9" r="4" />
      <path d="M3 20a7 7 0 0 1 14 0M16 16l5 5" />
    </SocIcon>
  );
}

export default SocSearchUser;
