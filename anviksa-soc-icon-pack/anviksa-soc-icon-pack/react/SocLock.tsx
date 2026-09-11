import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocLock(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <rect x"4" y"10" width"16" height"11" rx"2" />
      <path d"M7 10V7a5 5 0 0 1 10 0v3" />
      <circle cx"12" cy"15.5" r"1.2" />
    </SocIcon>
  );
}
