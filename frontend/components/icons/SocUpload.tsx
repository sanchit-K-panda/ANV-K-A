'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocUpload(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M12 15V3M7 8l5-5 5 5M4 21h16" />
    </SocIcon>
  );
}

export default SocUpload;
