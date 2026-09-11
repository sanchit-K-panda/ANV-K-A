import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocUsers(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx"9" cy"8" r"3" />
      <path d"M3 20a6 6 0 0 1 12 0" />
      <path d"M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.5" />
    </SocIcon>
  );
}
