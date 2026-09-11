'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocTarget(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.2" />
    </SocIcon>
  );
}

export default SocTarget;
