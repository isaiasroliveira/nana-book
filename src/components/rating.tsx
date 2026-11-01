import { Star } from "lucide-react";

export function Rating({ value }: { value: number }) {
  return (
    <div className="stars" role="img" aria-label={`${value.toLocaleString("pt-BR")} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, value - index)) * 100;
        return (
          <span className="rating-star" key={index} aria-hidden="true">
            <Star />
            <Star style={{ fill: "currentColor", clipPath: `inset(0 ${100 - fill}% 0 0)` }} />
          </span>
        );
      })}
    </div>
  );
}
