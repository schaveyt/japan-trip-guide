// src/components/HeroImage.jsx
// Full-bleed hero image with dark gradient overlay for text legibility.
// Used at the top of page views throughout the app.
//
// Props:
//   src      — Legacy: plain image URL. Renders plain <img> (backwards-compat).
//              Used when srcSet is not provided.
//   srcSet   — Modern: { webp: { '800': path, '1600': path },
//                        jpg: { '800': path, '1600': path } }
//              When provided, renders <picture> with WebP <source> + JPEG <img> fallback.
//              Use for hero images that need offline caching and bandwidth optimization.
//   alt      — descriptive alt text
//   children — content rendered over the gradient (eyebrow, title, subtitle)
//   className — optional additional classes on the outer container

export default function HeroImage({ src, srcSet, alt, children, className = "" }) {
  const renderImage = () => {
    if (srcSet) {
      // Modern path: <picture> with WebP source and JPEG fallback
      // fetchPriority="high" — hero is always the LCP element (above-fold, never lazy-load)
      // Per web.dev: "Never lazy-load your LCP image"
      return (
        <picture>
          <source
            type="image/webp"
            srcSet={`${srcSet.webp['800']} 800w, ${srcSet.webp['1600']} 1600w`}
            sizes="100vw"
          />
          <img
            src={srcSet.jpg['1600']}
            srcSet={`${srcSet.jpg['800']} 800w, ${srcSet.jpg['1600']} 1600w`}
            sizes="100vw"
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover object-center"
            fetchPriority="high"
          />
        </picture>
      )
    }
    // Legacy path: plain <img> — backwards-compat for src-only usage
    // Note: not fetchPriority="high" because legacy src may not be LCP-optimized
    return (
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="lazy"
      />
    )
  }

  return (
    <div
      className={`relative w-full overflow-hidden aspect-[4/3] md:aspect-[16/9] min-h-[50vh] md:min-h-[60vh] max-h-[70vh] ${className}`}
    >
      {renderImage()}
      {/* Dark gradient: rgba(0,0,0,0.2) at top → rgba(0,0,0,0.6) at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
      {/* Text overlay — text-white is explicit here; never rely on inheritance */}
      <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-12 text-white">
        {children}
      </div>
    </div>
  )
}
