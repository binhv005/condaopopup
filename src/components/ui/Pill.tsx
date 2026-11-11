import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "./Icons";

type Variant = "dark" | "brand" | "light" | "ghost" | "outline";

interface PillProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  small?: boolean;
  /** Icon inside the round badge; defaults to the up-right arrow */
  icon?: ReactNode;
}

/** Pill link with a round arrow badge that turns on hover */
export function Pill({ variant = "dark", small, icon, className, children, ...rest }: PillProps) {
  const cls = ["pill", variant !== "dark" && "pill-" + variant, small && "pill-sm", className].filter(Boolean).join(" ");
  return (
    <a className={cls} {...rest}>
      <span>{children}</span>
      <i>{icon ?? <ArrowUpRight />}</i>
    </a>
  );
}

/** External link attributes */
export const external = { target: "_blank", rel: "noopener" } as const;
