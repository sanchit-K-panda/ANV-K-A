import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocPlus(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx"12" cy"12" r"9" />
      <path d"M12 8v8M8 12h8" />
    </SocIcon>
  );
}
