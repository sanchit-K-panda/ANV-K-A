import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocVirus(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx"12" cy"12" r"6" />
      <path d"M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" />
    </SocIcon>
  );
}
