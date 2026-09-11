'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocFilter(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" />
    </SocIcon>
  );
}

export default SocFilter;
