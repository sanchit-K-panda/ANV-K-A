'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocTrash(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
    </SocIcon>
  );
}

export default SocTrash;
