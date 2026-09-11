'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocTeam(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M2.5 20a5.5 5.5 0 0 1 11 0M10.5 20a5.5 5.5 0 0 1 11 0" />
    </SocIcon>
  );
}

export default SocTeam;
