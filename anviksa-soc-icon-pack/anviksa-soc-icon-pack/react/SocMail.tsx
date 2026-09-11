import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocMail(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <rect x"3" y"5" width"18" height"14" rx"2" />
      <path d"m3 7 9 6 9-6" />
    </SocIcon>
  );
}
