import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  as?: ElementType;
  className?: string;
  id?: string;
  children: ReactNode;
}

/** Fades content up once it enters the viewport (CSS .reveal/.in); visible immediately without IntersectionObserver */
export function Reveal({ as: Tag = "div", className, id, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setShown(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setShown(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <Tag ref={ref} id={id} className={["reveal", shown && "in", className].filter(Boolean).join(" ")}>{children}</Tag>;
}
