'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocMessage(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M4 5h16v11H9l-5 4V5Z" />
      <path d="M8 9h.01M12 9h.01M16 9h.01" />
    </SocIcon>
  );
}

export default SocMessage;
