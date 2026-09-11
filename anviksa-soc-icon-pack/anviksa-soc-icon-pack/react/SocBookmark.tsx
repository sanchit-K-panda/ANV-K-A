import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocBookmark(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d"M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z" />
    </SocIcon>
  );
}
