import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocClock(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx"12" cy"12" r"9" />
      <path d"M12 7v5l3 2" />
    </SocIcon>
  );
}
