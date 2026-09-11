import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocFirewall(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d"M4 4h16v16H4z" />
      <path d"M4 9h16M4 15h16M9 4v5M15 4v5M9 15v5M15 15v5" />
    </SocIcon>
  );
}
