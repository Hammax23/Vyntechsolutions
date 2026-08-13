"use client";

const steps = [
  {
    number: "01",
    title: "Discover",
    description: "We map your goals, users, and constraints before a line of code is written — so the build starts from a shared brief.",
  },
  {
    number: "02",
    title: "Design",
    description: "Architecture, UX, and scope are locked together. Screens and systems are designed to scale, not just to look finished.",
  },
  {
    number: "03",
    title: "Build",
    description: "Two-week sprints, live demos, and a dedicated lead. You see working software early and steer it in real time.",
  },
  {
    number: "04",
    title: "Launch",
    description: "Test, ship, and stay on. We handle go-live, monitoring, and the first months of iteration after launch.",
  },
];

export default function HowWeWork() {
  return (
    <section className="w-full bg-[#F7F8FA] py-16 md:py-24">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-6">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#0055FF] mb-3">
            Process
          </p>
          <h2 className="text-[28px] sm:text-4xl font-semibold tracking-tight text-[#0f172a] mb-3">
            How we work
          </h2>
          <p className="text-slate-500 text-[15px] sm:text-base max-w-xl mx-auto leading-relaxed">
            A four-step engagement — from first call to production — with no black-box development.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(50%+28px)] right-[-12px] h-px bg-slate-200" />
              )}
              <p className="text-[13px] font-semibold tracking-[0.14em] text-[#0055FF] mb-3">
                {step.number}
              </p>
              <h3 className="text-lg font-semibold text-[#0f172a] mb-2">{step.title}</h3>
              <p className="text-[14px] sm:text-[15px] text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
