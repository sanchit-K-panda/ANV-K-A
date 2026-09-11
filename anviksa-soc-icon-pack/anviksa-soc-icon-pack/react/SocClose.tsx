import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocClose(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx"12" cy"12" r"9" />
      <path d"m9 9 6 6M15 9l-6 6" />
    </SocIcon>
  );
}
