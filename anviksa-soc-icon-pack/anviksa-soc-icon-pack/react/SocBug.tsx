import * as React from "react";
import { SocIcon, SocIconProps } from "./SocIcon";

export function SocBug(props: SocIconProps) {
  return (
    <SocIcon {...props}>
      <path d"M9 7h6a3 3 0 0 1 3 3v5a6 6 0 0 1-12 0v-5a3 3 0 0 1 3-3Z" />
      <path d"M12 7V4M8 4v3M16 4v3M6 11H3M21 11h-3M6 15H3M21 15h-3" />
    </SocIcon>
  );
}
