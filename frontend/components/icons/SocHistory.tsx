'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocHistory(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5" />
      <path d="M4 4v4.5h4.5" />
      <path d="M12 7v5l3 2" />
    </SocIcon>
  );
}

export default SocHistory;
