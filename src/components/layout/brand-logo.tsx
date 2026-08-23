import Image from "next/image";

type Props = {
  /** Visual height in px; width follows the logo’s ~17:10 ratio. */
  height?: number;
  className?: string;
  priority?: boolean;
  /**
   * Drop the solid black plate so gold marks sit on the theme surface.
   * Uses mix-blend-mode: lighten (safe on dark Doctor Cuts backgrounds).
   * Ignored when `src` is already a transparent PNG.
   */
  blend?: boolean;
  /** Image path under /public. Default: classic JPG wordmark. */
  src?: string;
};

const ASPECT = 1024 / 598;

/** Gold wordmark (mustache + dr cuts). */
export function BrandLogo({
  height = 40,
  className = "",
  priority,
  blend = true,
  src = "/images/logo.jpg",
}: Props) {
  const width = Math.round(height * ASPECT);
  const transparent = src.endsWith(".png");
  return (
    <span
      className={`relative inline-block shrink-0 ${className}`.trim()}
      style={{ width, height }}
    >
      <Image
        src={src}
        alt="Doctor Cuts"
        fill
        sizes={`${width}px`}
        className={`object-contain object-center ${
          !transparent && blend ? "mix-blend-lighten" : ""
        }`.trim()}
        priority={priority}
      />
    </span>
  );
}
