'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocBell(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M5 16h14l-2-3V9a5 5 0 0 0-10 0v4l-2 3Z" />
      <path d="M9 19a3 3 0 0 0 6 0" />
    </SocIcon>
  );
}

export default SocBell;
