import Image from "next/image";

type Props = {
  /** Visual height in px; width follows the logo’s ~17:10 ratio. */
  height?: number;
  className?: string;
  priority?: boolean;
};

const ASPECT = 1024 / 598;

/** Gold wordmark (mustache + dr cuts) from public/images/logo.jpg. */
export function BrandLogo({ height = 40, className = "", priority }: Props) {
  const width = Math.round(height * ASPECT);
  return (
    <span
      className={`relative inline-block shrink-0 ${className}`.trim()}
      style={{ width, height }}
    >
      <Image
        src="/images/logo.jpg"
        alt="Doctor Cuts"
        fill
        sizes={`${width}px`}
        className="object-contain object-left"
        priority={priority}
      />
    </span>
  );
}
