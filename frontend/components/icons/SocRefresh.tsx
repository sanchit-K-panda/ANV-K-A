'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocRefresh(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M20 11a8 8 0 0 0-14-5L4 8M4 5v3h3" />
      <path d="M4 13a8 8 0 0 0 14 5l2-2M20 19v-3h-3" />
    </SocIcon>
  );
}

export default SocRefresh;
