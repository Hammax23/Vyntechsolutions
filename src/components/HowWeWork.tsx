"use client";

const steps = [
  {
    number: 1,
    title: "Discovery & Planning",
    description:
      "We sit with you, learn the business, and write a clear plan: scope, timeline, and what success looks like.",
  },
  {
    number: 2,
    title: "Design & Prototyping",
    description:
      "You get clickable screens early so the flow feels right before we commit to build.",
  },
  {
    number: 3,
    title: "Development & Coding",
    description:
      "We build in React, Node.js, and Laravel. Clean code, mobile-ready, and ready to scale.",
  },
  {
    number: 4,
    title: "Testing & Quality Assurance",
    description:
      "We test on real devices and browsers, fix bugs, and only ship when it holds up.",
  },
  {
    number: 5,
    title: "Launch & Deployment",
    description:
      "We push live carefully so your site goes up without drama or long downtime.",
  },
  {
    number: 6,
    title: "Post-Launch Support & Maintenance",
    description:
      "We stay on after launch for updates, security, and the small fixes that keep things smooth.",
  },
];

const nodePositions = [
  { x: 640, y: 70 },
  { x: 910, y: 210 },
  { x: 640, y: 350 },
  { x: 360, y: 350 },
  { x: 90, y: 210 },
  { x: 360, y: 70 },
];

function StepCopy({
  title,
  description,
  align = "center",
}: {
  title: string;
  description: string;
  align?: "center" | "left" | "right";
}) {
  const alignClass =
    align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";
  return (
    <div className={alignClass}>
      <h3 className="text-[15px] xl:text-base font-bold text-[#0a0a0a] mb-2 leading-snug">
        {title}
      </h3>
      <p className="text-[12px] xl:text-[13px] text-[#555] leading-relaxed">{description}</p>
    </div>
  );
}

export default function HowWeWork() {
  return (
    <section className="w-full bg-white py-16 md:py-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10">
        <h2 className="text-center text-3xl sm:text-4xl md:text-[42px] font-bold tracking-tight text-[#0a0a0a] mb-10 md:mb-14">
          How We Work
        </h2>

        {/* Mobile */}
        <div className="lg:hidden space-y-6 max-w-xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-4">
              <div className="shrink-0 w-9 h-9 rounded-full bg-[#00C4CC] text-white text-sm font-bold flex items-center justify-center shadow-sm">
                {step.number}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#0a0a0a] mb-1.5">{step.title}</h3>
                <p className="text-[13px] text-[#555] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop diagram */}
        <div className="hidden lg:grid grid-cols-[240px_minmax(0,1fr)_240px] xl:grid-cols-[280px_minmax(0,1fr)_280px] gap-x-6 xl:gap-x-10 items-center">
          {/* Left column, step 5 */}
          <div className="pt-10">
            <StepCopy title={steps[4].title} description={steps[4].description} align="right" />
          </div>

          {/* Center: top texts + track + bottom texts */}
          <div className="flex flex-col items-stretch">
            <div className="grid grid-cols-2 gap-10 xl:gap-20 px-4 xl:px-8 mb-3">
              <StepCopy title={steps[5].title} description={steps[5].description} />
              <StepCopy title={steps[0].title} description={steps[0].description} />
            </div>

            <div className="relative w-full my-2">
              <svg viewBox="0 0 1000 420" className="w-full h-auto max-h-[340px] xl:max-h-none" fill="none" aria-hidden>
                <defs>
                  <linearGradient id="hwGradTR" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0d0d0d" />
                    <stop offset="100%" stopColor="#00C4CC" />
                  </linearGradient>
                  <linearGradient id="hwGradBR" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00C4CC" />
                    <stop offset="100%" stopColor="#0d0d0d" />
                  </linearGradient>
                  <linearGradient id="hwGradBL" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#0d0d0d" />
                    <stop offset="100%" stopColor="#00C4CC" />
                  </linearGradient>
                  <linearGradient id="hwGradTL" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00C4CC" />
                    <stop offset="100%" stopColor="#0d0d0d" />
                  </linearGradient>
                </defs>

                {/* Top straight 6→1 */}
                <path d="M 385 70 H 615" stroke="url(#hwGradTR)" strokeWidth="30" strokeLinecap="round" />
                {/* Top-right arc 1→2 */}
                <path
                  d="M 655 70 H 780 A 140 140 0 0 1 910 210"
                  stroke="url(#hwGradTR)"
                  strokeWidth="30"
                  strokeLinecap="round"
                />
                {/* Bottom-right arc 2→3 */}
                <path
                  d="M 910 210 A 140 140 0 0 1 780 350 H 655"
                  stroke="url(#hwGradBR)"
                  strokeWidth="30"
                  strokeLinecap="round"
                />
                {/* Bottom straight 3→4 */}
                <path d="M 615 350 H 385" stroke="url(#hwGradBR)" strokeWidth="30" strokeLinecap="round" />
                {/* Bottom-left arc 4→5 */}
                <path
                  d="M 345 350 H 220 A 140 140 0 0 1 90 210"
                  stroke="url(#hwGradBL)"
                  strokeWidth="30"
                  strokeLinecap="round"
                />
                {/* Top-left arc 5→6 */}
                <path
                  d="M 90 210 A 140 140 0 0 1 220 70 H 345"
                  stroke="url(#hwGradTL)"
                  strokeWidth="30"
                  strokeLinecap="round"
                />

                {nodePositions.map((pos, i) => (
                  <g key={i}>
                    <circle cx={pos.x} cy={pos.y} r="24" fill="#00C4CC" />
                    <text
                      x={pos.x}
                      y={pos.y + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="17"
                      fontWeight="700"
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {i + 1}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-10 xl:gap-20 px-4 xl:px-8 mt-3">
              <StepCopy title={steps[3].title} description={steps[3].description} />
              <StepCopy title={steps[2].title} description={steps[2].description} />
            </div>
          </div>

          {/* Right column, step 2 */}
          <div className="pt-10">
            <StepCopy title={steps[1].title} description={steps[1].description} align="left" />
          </div>
        </div>
      </div>
    </section>
  );
}
