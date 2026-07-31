interface LogoIconProps {
  size?: number
  className?: string
}

/**
 * Nextill AI logo — layered pages icon with purple gradient.
 * Matches favicon.svg and og-image.svg branding.
 */
export function LogoIcon({ size = 32, className = "" }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6D5EF5" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
      <g
        transform="translate(6, 6)"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Back layer */}
        <path d="M10 2L2 6.5L10 11L18 6.5L10 2Z" opacity="0.5" />
        {/* Middle layer */}
        <path d="M2 13.5L10 18L18 13.5" opacity="0.75" />
        {/* Front layer */}
        <path d="M2 10L10 14.5L18 10" />
      </g>
    </svg>
  )
}
