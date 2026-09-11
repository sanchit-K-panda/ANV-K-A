import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocSearch(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx"10.5" cy"10.5" r"6.5" />
      <path d"m16 16 5 5" />
    </SocIcon>
  );
}
