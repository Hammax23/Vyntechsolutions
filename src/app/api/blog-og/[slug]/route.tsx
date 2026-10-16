import { ImageResponse } from "next/og";
import { getCmsBlogPost } from "@/lib/cms/content";

export const runtime = "nodejs";
export const revalidate = 3600;

const SIZE = { width: 1200, height: 630 };

/** Branded 1200x630 share card, used when a post has no cover image. */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const post = await getCmsBlogPost(params.slug).catch(() => null);
  const title = (post?.title || "VynTech Solutions Blog").slice(0, 120);
  const category = post?.category || "Insights";
  const author = post?.author || "VynTech Solutions Team";
  const readTime = post?.readTime || "";
  const size = title.length > 80 ? 52 : title.length > 50 ? 62 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "white",
          background: "linear-gradient(135deg, #0f1020 0%, #1a1a2e 55%, #0b2a6b 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 520,
            height: 520,
            borderRadius: 520,
            background: "rgba(0,85,255,0.45)",
            filter: "blur(40px)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>vyntech</div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#00E1FF",
              border: "2px solid rgba(255,255,255,0.25)",
              borderRadius: 999,
              padding: "8px 24px",
            }}
          >
            {category}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 90, height: 8, borderRadius: 8, background: "linear-gradient(90deg,#0055FF,#00E1FF)", marginBottom: 32 }} />
          <div style={{ display: "flex", fontSize: size, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2 }}>{title}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
          <div style={{ display: "flex" }}>
            {author}
            {readTime ? `  •  ${readTime} read` : ""}
          </div>
          <div style={{ display: "flex", color: "#00E1FF" }}>vyntechsolutions.ca</div>
        </div>
      </div>
    ),
    { ...SIZE }
  );
}
