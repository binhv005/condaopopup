/** Numbered accordion built on <details>, first item open */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="acc">
      {items.map((it, i) => (
        <details key={i} open={i === 0}>
          <summary>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            <span>{it.q}</span>
            <span className="pm" aria-hidden="true"></span>
          </summary>
          <div className="ans"><p>{it.a}</p></div>
        </details>
      ))}
    </div>
  );
}
