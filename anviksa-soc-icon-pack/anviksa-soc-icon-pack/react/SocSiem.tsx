import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocSiem(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <rect x"3" y"4" width"18" height"16" rx"2" />
      <path d"M7 9h.01M10 9h.01M13 9h.01M7 14l3 3 5-5" />
    </SocIcon>
  );
}
