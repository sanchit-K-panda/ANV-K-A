'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocLink(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" />
    </SocIcon>
  );
}

export default SocLink;
