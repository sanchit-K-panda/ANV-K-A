'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocAnalytics(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M4 19V9M10 19V5M16 19v-8M22 19H2" />
    </SocIcon>
  );
}

export default SocAnalytics;
