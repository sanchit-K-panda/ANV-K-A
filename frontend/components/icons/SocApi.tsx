'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocApi(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M7 5 3 9l4 4M17 5l4 4-4 4M14 3l-4 18" />
    </SocIcon>
  );
}

export default SocApi;
