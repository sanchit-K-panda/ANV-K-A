import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocHunting(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d"M4 12a8 8 0 1 0 2.3-5.7" />
      <path d"M4 4v4h4" />
      <circle cx"12" cy"12" r"2" />
      <path d"m13.5 13.5 4 4" />
    </SocIcon>
  );
}
