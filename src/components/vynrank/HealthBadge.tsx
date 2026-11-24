import { healthColors, type HealthTone } from "@/lib/vynrank/theme";

export default function HealthBadge({ health }: { health: string }) {
  const tone = (["healthy", "attention", "at_risk"].includes(health)
    ? health
    : "healthy") as HealthTone;
  const c = healthColors(tone);
  return (
    <span
      className="vynrank-badge"
      style={{ background: c.bg, color: c.fg }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.fg,
        }}
      />
      {c.label}
    </span>
  );
}
