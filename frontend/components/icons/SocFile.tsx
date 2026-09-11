'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocFile(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5M9 12h6M9 16h6" />
    </SocIcon>
  );
}

export default SocFile;
