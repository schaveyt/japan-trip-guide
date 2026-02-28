// src/components/HeroImage.jsx
// Full-bleed hero image with dark gradient overlay for text legibility.
// Used at the top of page views throughout the app.
//
// Props:
//   src      — Unsplash image URL (include ?w=1600&q=80&auto=format&fit=crop)
//   alt      — descriptive alt text
//   children — content rendered over the gradient (eyebrow, title, subtitle)
//   className — optional additional classes on the outer container

export default function HeroImage({ src, alt, children, className = "" }) {
  return (
    <div
      className={`relative w-full overflow-hidden aspect-[4/3] md:aspect-[16/9] min-h-[50vh] md:min-h-[60vh] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="lazy"
      />
      {/* Dark gradient: rgba(0,0,0,0.2) at top → rgba(0,0,0,0.6) at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
      {/* Text overlay — text-white is explicit here; never rely on inheritance */}
      <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-12 text-white">
        {children}
      </div>
    </div>
  )
}
