import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocIntegration(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx"6" cy"12" r"3" />
      <circle cx"18" cy"6" r"3" />
      <circle cx"18" cy"18" r"3" />
      <path d"m8.5 10.5 7-3M8.5 13.5l7 3" />
    </SocIcon>
  );
}
