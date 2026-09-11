'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocFolder(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H5a2 2 0 0 1-2-2V6Z" />
    </SocIcon>
  );
}

export default SocFolder;
