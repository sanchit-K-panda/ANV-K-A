'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocSettings(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </SocIcon>
  );
}

export default SocSettings;
