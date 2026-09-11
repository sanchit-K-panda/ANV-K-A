import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocCloudAlert(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d"M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9Z" />
      <path d"M12 10v3M12 15.5h.01" />
    </SocIcon>
  );
}
