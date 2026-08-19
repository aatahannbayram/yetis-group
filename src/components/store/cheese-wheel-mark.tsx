/**
 * Hand-drawn-style line mark: a wheel of cheese with a cut wedge set aside.
 * Decorative texture layered over hero photography — currentColor stroke,
 * caller controls color/opacity. Purely ornamental.
 */
export function CheeseWheelMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* wheel rind (double line, like a wrapped wheel) */}
      <circle cx="140" cy="140" r="100" />
      <circle cx="140" cy="140" r="88" opacity={0.55} />

      {/* wedge already cut from the wheel */}
      <line x1="140" y1="140" x2="236.6" y2="114.1" />
      <line x1="140" y1="140" x2="197.4" y2="221.9" />

      {/* texture holes, like an olgun kaşar */}
      <circle cx="108" cy="108" r="3.5" />
      <circle cx="132" cy="82" r="2.5" />
      <circle cx="86" cy="150" r="3" />
      <circle cx="115" cy="175" r="2" />

      {/* the cut wedge, set beside the wheel */}
      <g transform="translate(252 248) rotate(22)">
        <path d="M0,0 L-27.5,-47.6 A55,55 0 0 1 27.5,-47.6 Z" />
        <circle cx="-4" cy="-28" r="2.5" />
        <circle cx="10" cy="-16" r="2" />
      </g>
    </svg>
  );
}
