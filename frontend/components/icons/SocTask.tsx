'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocTask(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 12h8M8 17h5" />
      <path d="m5.5 7 .8.8L7.8 6" />
    </SocIcon>
  );
}

export default SocTask;
