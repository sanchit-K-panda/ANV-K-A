'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocCode(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="m8 6-5 6 5 6M16 6l5 6-5 6M14 3l-4 18" />
    </SocIcon>
  );
}

export default SocCode;
