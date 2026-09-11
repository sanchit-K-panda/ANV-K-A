import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocNetwork(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx"12" cy"5" r"2.5" />
      <circle cx"5" cy"18" r"2.5" />
      <circle cx"19" cy"18" r"2.5" />
      <path d"m10.2 7-3.4 8.7M13.8 7l3.4 8.7M7.5 18h9" />
    </SocIcon>
  );
}
