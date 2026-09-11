'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocActivity(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </SocIcon>
  );
}

export default SocActivity;
