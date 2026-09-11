import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocCheck(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx"12" cy"12" r"9" />
      <path d"m8 12 2.5 2.5L16 9" />
    </SocIcon>
  );
}
