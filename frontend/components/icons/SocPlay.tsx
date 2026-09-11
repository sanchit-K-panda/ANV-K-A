'use client';

import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocPlay(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d="m8 5 11 7-11 7V5Z" />
    </SocIcon>
  );
}

export default SocPlay;
