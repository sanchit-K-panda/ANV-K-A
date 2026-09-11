import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocSoar(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <rect x"3" y"4" width"7" height"7" rx"1" />
      <rect x"14" y"4" width"7" height"7" rx"1" />
      <rect x"8.5" y"13" width"7" height"7" rx"1" />
      <path d"M10 7h4M17.5 11v2M10 13v-2" />
    </SocIcon>
  );
}
