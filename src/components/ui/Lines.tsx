import type { ElementType } from "react";

interface LinesProps {
  as?: ElementType;
  text: string;
  className?: string;
}

/**
 * Heading whose words sit in masks so the motion layer can raise it line by line (data-lines).
 * React renders the word spans itself, so nothing mutates the DOM behind React's back.
 */
export function Lines({ as: Tag = "h2", text, className }: LinesProps) {
  const words = text.trim().split(/\s+/);
  return (
    <Tag className={className} data-lines aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="w"><span>{w}</span></span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
