'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocPulse(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M3 12h4l2-6 3 12 2-8 2 4h5" />
    </SocIcon>
  );
}

export default SocPulse;
