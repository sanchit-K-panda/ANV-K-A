'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocStar(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </SocIcon>
  );
}

export default SocStar;
