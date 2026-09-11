'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocLogs(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 7h8M8 11h8M8 15h5M8 18h3" />
    </SocIcon>
  );
}

export default SocLogs;
