/**
 * Per-phase subject hints + note chips for Project Manager → Client Updates.
 */

export type ClientUpdatePhaseTemplate = {
  subjectHint: string;
  noteChips: string[];
};

export const CLIENT_UPDATE_TEMPLATES_BY_PHASE: Record<string, ClientUpdatePhaseTemplate> = {
  discovery: {
    subjectHint: "Discovery update — next steps",
    noteChips: [
      "Kickoff complete; aligning on goals and timeline.",
      "Gathering requirements and preparing the proposal.",
      "Happy to jump on a quick call if you have questions.",
    ],
  },
  requirements: {
    subjectHint: "Requirements update — scope & sign-off",
    noteChips: [
      "Scope document is ready for your review.",
      "Please confirm requirements so we can move to design.",
      "Advance payment milestone is next once scope is signed.",
    ],
  },
  design: {
    subjectHint: "Design update — review requested",
    noteChips: [
      "Wireframes / UI drafts are ready for feedback.",
      "Please share design notes by end of week if possible.",
      "Once approved, we move into development.",
    ],
  },
  development: {
    subjectHint: "Development update — sprint progress",
    noteChips: [
      "Latest sprint demo is ready to walk through.",
      "Incorporating your last round of feedback now.",
      "On track for the next milestone delivery.",
    ],
  },
  testing: {
    subjectHint: "Testing / UAT update",
    noteChips: [
      "UAT build is ready — please test the checklist items.",
      "Bug fixes from your feedback are in progress.",
      "Sign-off on UAT unlocks deployment.",
    ],
  },
  deployment: {
    subjectHint: "Deployment update",
    noteChips: [
      "Preparing production deploy and go-live checklist.",
      "DNS / hosting steps may need a short window from your side.",
      "We'll confirm once live and monitored.",
    ],
  },
  support: {
    subjectHint: "Support & handover update",
    noteChips: [
      "Post-launch support window is active.",
      "Training / handover materials are available.",
      "Send any issues to this thread and we'll prioritize.",
    ],
  },
  seo: {
    subjectHint: "SEO update",
    noteChips: [
      "Technical SEO and content tasks are underway.",
      "Ranking / indexing progress will be shared in the next report.",
      "Let us know if priority keywords have changed.",
    ],
  },
  digital_marketing: {
    subjectHint: "Digital marketing update",
    noteChips: [
      "Campaign setup / creatives are in progress.",
      "We'll share performance notes after the first data window.",
      "Reply with any promo dates we should align to.",
    ],
  },
  completed: {
    subjectHint: "Project complete — thank you",
    noteChips: [
      "All delivery phases are complete — thank you for the partnership.",
      "Ongoing support or new scope can start anytime.",
    ],
  },
  on_hold: {
    subjectHint: "Project on hold — status note",
    noteChips: [
      "Work is paused as discussed; we'll resume when you confirm.",
      "No further billing milestones will advance while on hold.",
    ],
  },
};

export function getClientUpdateTemplate(phase: string): ClientUpdatePhaseTemplate {
  return (
    CLIENT_UPDATE_TEMPLATES_BY_PHASE[phase] || {
      subjectHint: "Project status update",
      noteChips: [
        "Sharing a quick progress update on your project.",
        "Reply if you'd like a call to walk through details.",
      ],
    }
  );
}
