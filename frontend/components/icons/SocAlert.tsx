'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocAlert(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M12 3a6 6 0 0 0-6 6v3.5L4 16h16l-2-3.5V9a6 6 0 0 0-6-6Z" />
      <path d="M9.5 19a2.7 2.7 0 0 0 5 0" />
      <path d="M12 6v3" />
      <path d="M12 12h.01" />
    </SocIcon>
  );
}

export default SocAlert;
