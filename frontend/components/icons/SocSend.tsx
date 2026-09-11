'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocSend(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="m21 3-7 18-3-8-8-3 18-7Z" />
      <path d="M11 13 21 3" />
    </SocIcon>
  );
}

export default SocSend;
