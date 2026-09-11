'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocPolicy(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M15 3v4h4M9 11h6M9 15h6M9 7h2" />
    </SocIcon>
  );
}

export default SocPolicy;
