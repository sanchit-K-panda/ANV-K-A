import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocDatabase(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <ellipse cx"12" cy"5" rx"8" ry"3" />
      <path d"M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d"M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
    </SocIcon>
  );
}
