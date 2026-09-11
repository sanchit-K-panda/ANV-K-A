'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocPause(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <rect x="5" y="4" width="5" height="16" rx="1" />
      <rect x="14" y="4" width="5" height="16" rx="1" />
    </SocIcon>
  );
}

export default SocPause;
