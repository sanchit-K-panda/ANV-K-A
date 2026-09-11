import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocKey(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx"8" cy"15" r"4" />
      <path d"m11 12 9-9M16 5l3 3M13 10l3 3" />
    </SocIcon>
  );
}
