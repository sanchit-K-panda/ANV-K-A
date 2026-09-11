import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocLogin(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d"M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
      <path d"m10 8-4 4 4 4M6 12h11" />
    </SocIcon>
  );
}
