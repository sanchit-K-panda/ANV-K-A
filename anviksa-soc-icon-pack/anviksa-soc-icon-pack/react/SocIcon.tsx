import * as React from "react";

export interface SocIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function SocIcon({
  size = 24,
  children,
  className = "",
  ...props
}: SocIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}
