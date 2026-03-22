import { Children, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type InfiniteSliderProps = {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  durationSeconds?: number;
  gap?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
};

export default function InfiniteSlider({
  children,
  className,
  itemClassName,
  durationSeconds = 36,
  gap = "1rem",
  reverse = false,
  pauseOnHover = true,
}: InfiniteSliderProps) {
  const items = Children.toArray(children);
  const sliderStyle = {
    "--infinite-slider-duration": `${durationSeconds}s`,
    "--infinite-slider-gap": gap,
  } as CSSProperties;

  return (
    <div
      className={cn(
        "infinite-slider-shell overflow-hidden",
        pauseOnHover && "infinite-slider-shell--pausable",
        className
      )}
    >
      <div
        className={cn(
          "infinite-slider-track flex w-max min-w-full items-center gap-[var(--infinite-slider-gap)] will-change-transform",
          reverse && "infinite-slider-track--reverse"
        )}
        style={sliderStyle}
      >
        {[0, 1].map((copyIndex) => (
          <div
            key={copyIndex}
            aria-hidden={copyIndex === 1}
            className="flex shrink-0 items-center gap-[var(--infinite-slider-gap)]"
          >
            {items.map((child, childIndex) => (
              <div key={`${copyIndex}-${childIndex}`} className={itemClassName}>
                {child}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
