import { cn } from "@/lib/utils";

interface MaterialIconProps {
  name: string;
  className?: string;
  size?: number;
  fill?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
}

export function MaterialIcon({ name, className, size = 24, fill = false, weight = 400 }: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined select-none align-middle", className)}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
