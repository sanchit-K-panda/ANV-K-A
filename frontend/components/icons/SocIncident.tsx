'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocIncident(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M12 3 3.5 7.5v5.7c0 4 3.1 6.6 8.5 7.8 5.4-1.2 8.5-3.8 8.5-7.8V7.5L12 3Z" />
      <path d="M12 8v4" />
      <path d="M12 15h.01" />
    </SocIcon>
  );
}

export default SocIncident;
