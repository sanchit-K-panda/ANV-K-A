import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocEdit(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d"m4 16-.8 4.8L8 20l11-11-4-4L4 16Z" />
      <path d"m13 6 4 4" />
    </SocIcon>
  );
}
