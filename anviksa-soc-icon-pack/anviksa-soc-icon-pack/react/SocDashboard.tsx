import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocDashboard(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d"M3 3h8v8H3z" />
      <path d"M13 3h8v5h-8z" />
      <path d"M13 10h8v11h-8z" />
      <path d"M3 13h8v8H3z" />
    </SocIcon>
  );
}
