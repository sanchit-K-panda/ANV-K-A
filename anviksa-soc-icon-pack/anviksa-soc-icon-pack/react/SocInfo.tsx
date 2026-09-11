import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocInfo(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <circle cx"12" cy"12" r"9" />
      <path d"M12 10v6M12 7h.01" />
    </SocIcon>
  );
}
