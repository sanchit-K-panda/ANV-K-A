'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocCertificate(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M5 3h14v12H5z" />
      <path d="m9 15-1 6 4-2 4 2-1-6" />
      <path d="M8 7h8M8 11h5" />
    </SocIcon>
  );
}

export default SocCertificate;
