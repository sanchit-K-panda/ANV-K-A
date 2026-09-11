'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocLogout(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
      <path d="m14 8 4 4-4 4M18 12H8" />
    </SocIcon>
  );
}

export default SocLogout;
