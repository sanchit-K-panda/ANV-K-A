import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocPin(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d"M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx"12" cy"10" r"2.5" />
    </SocIcon>
  );
}
