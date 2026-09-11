'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocWorkflow(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="5" cy="19" r="2" />
      <path d="M7 5h5a5 5 0 0 1 5 5v0M7 19h5a5 5 0 0 0 5-5v0" />
    </SocIcon>
  );
}

export default SocWorkflow;
