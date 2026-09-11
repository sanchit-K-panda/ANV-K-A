'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocSort(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M7 4v16M4 7l3-3 3 3M17 20V4M14 17l3 3 3-3" />
    </SocIcon>
  );
}

export default SocSort;
