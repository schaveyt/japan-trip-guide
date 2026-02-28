// src/components/Layout.jsx
// Layout primitives for editorial reading experience.
//
// ReadingContainer: constrains content to 720px (45rem) reading width on desktop,
// full-width on mobile with horizontal padding.

export function ReadingContainer({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-[45rem] px-5 md:px-8 ${className}`}>
      {children}
    </div>
  )
}
