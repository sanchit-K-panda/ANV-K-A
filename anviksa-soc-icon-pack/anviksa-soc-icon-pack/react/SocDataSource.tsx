import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocDataSource(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d"M4 6h16M4 12h16M4 18h16" />
      <circle cx"8" cy"6" r"2" />
      <circle cx"15" cy"12" r"2" />
      <circle cx"11" cy"18" r"2" />
    </SocIcon>
  );
}
