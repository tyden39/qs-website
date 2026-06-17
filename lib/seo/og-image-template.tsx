/**
 * Shared Satori-friendly JSX template for OG images.
 * Rendered by ImageResponse from next/og — no browser DOM available.
 */

export interface OgImageProps {
  title: string;
  subtitle?: string;
  tag?: string;
  /** Optional right-side label (e.g. date, category) */
  meta?: string;
}

/** Returns a plain JSX element compatible with Satori / ImageResponse (no Tailwind). */
export function OgImageTemplate({ title, subtitle, tag, meta }: OgImageProps) {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fafaf7",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, #e8e4dc 0, #e8e4dc 1px, transparent 1px, transparent 40px), " +
            "repeating-linear-gradient(90deg, #e8e4dc 0, #e8e4dc 1px, transparent 1px, transparent 40px)",
          opacity: 0.5,
        }}
      />

      {/* Gold accent top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #c9a35a 0%, #e8c878 50%, #c9a35a 100%)",
        }}
      />

      {/* Left gold border accent */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "60px",
          bottom: "40px",
          width: "3px",
          backgroundColor: "#c9a35a",
          opacity: 0.4,
        }}
      />

      {/* Content area */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px 60px 90px",
          height: "100%",
        }}
      >
        {/* Top: Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#8a6f35",
                fontWeight: 500,
              }}
            >
              QS TECHNOLOGY
            </div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#a8a499",
              }}
            >
              Made in Vietnam · CNC Controller
            </div>
          </div>
          {meta && (
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#a8a499",
              }}
            >
              {meta}
            </div>
          )}
        </div>

        {/* Middle: Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {tag && (
            <div
              style={{
                fontSize: "12px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#c9a35a",
                fontWeight: 600,
              }}
            >
              {`[ ${tag} ]`}
            </div>
          )}
          <div
            style={{
              fontSize: title.length > 60 ? "44px" : title.length > 40 ? "52px" : "62px",
              fontWeight: 700,
              color: "#1a1815",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: "20px",
                color: "#5a5650",
                lineHeight: 1.5,
                maxWidth: "780px",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom: Domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "2px",
              backgroundColor: "#c9a35a",
            }}
          />
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#8a8680",
            }}
          >
            qstech.vn
          </div>
        </div>
      </div>

      {/* Corner decoration */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "60px",
          width: "120px",
          height: "120px",
          border: "1px solid #e8e4dc",
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "52px",
          right: "72px",
          width: "96px",
          height: "96px",
          border: "1px dashed #c9a35a",
          opacity: 0.25,
        }}
      />
    </div>
  );
}
