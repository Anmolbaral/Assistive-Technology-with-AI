export type RoleKey = "teacher" | "at_specialist" | "coach";

export type RoleConfig = {
  label: string;
  banner: string;
  sampleQueries: string[];
  resources: { title: string; url: string }[];
  responseHints: string[]; // injected into system prompt
};

export const ROLES: Record<RoleKey, RoleConfig> = {
  teacher: {
    label: "Teacher",
    banner: "Welcome, Teachers! Get actionable, privacy-safe AT solutions — fast.",
    sampleQueries: [
      "What free text-to-speech tools work with Google Classroom?",
      "How do I support a third grader with dysgraphia in writing tasks?",
      "Simple classroom AT strategies for ADHD students in group activities."
    ],
    resources: [
      { title: "Free Assistive Tech Tools (Edutopia)", url: "https://www.edutopia.org/article/free-assistive-tech-tools-support-academic-success/" },
      { title: "Assistive Technology Resources (UMich)", url: "https://ssd.umich.edu/article/assistive-technology-resources" },
      { title: "SETT Quick-Start (Joy Zabala)", url: "https://www.joyzabala.com/links-resources" },
      { title: "SETT Framework (MN.gov)", url: "https://mn.gov/admin/at/learning/prek-12/sett-framework.jsp" },
      { title: "Central Rivers AEA Workshops", url: "https://www.centralriversaea.org/educators/professional-learning/" },
      { title: "Request AT Consult (Central Rivers AEA)", url: "https://www.centralriversaea.org/educators/special-education/assistive-technology/" }
    ],
    responseHints: [
      "Start with a direct, affirmative answer in 1–2 sentences.",
      "List at least 3 tools ranked low → high tech; prefer free/low-cost.",
      "Include a 'Try this now' quick step, then a 2-week review note.",
      "Remind: no PII; keep queries general."
    ]
  },
  at_specialist: {
    label: "AT Specialist",
    banner: "Welcome, AT Specialist! Dive deep into the evidence for every major AT tool.",
    sampleQueries: [
      "Show research comparing Proloquo2Go vs. Snap+Core for high school AAC use (2024–25).",
      "SETT analysis template for multi-disability support planning.",
      "Best practices for supporting device trials in rural schools."
    ],
    resources: [
      { title: "Frontiers in Education (peer-reviewed)", url: "https://www.frontiersin.org/journals/education" },
      { title: "ATIA (research & webinars)", url: "https://www.atia.org/" },
      { title: "Iowa AEA AT Overview", url: "https://iowaaea.org/community-partners/special-education-services/assistive-technology/" },
      { title: "SETT (Iowa-specific)", url: "https://sites.google.com/aea9.k12.ia.us/mbaeaatdept/sett-framework" },
      { title: "FERPA/COPPA quick refs", url: "https://educate.iowa.gov/pk-12/special-education/programs-services/assistive-technology" }
    ],
    responseHints: [
      "Cite specific sources and include brief notes on study design or evidence strength when available.",
      "Call out device/OS compatibility and licensing.",
      "Outline trial steps and data collection forms.",
      "Link to downloadable checklists or templates when present."
    ]
  },
  coach: {
    label: "Instructional/Technology Coach",
    banner: "Welcome, Coach! Build excitement and capacity for AT across your school.",
    sampleQueries: [
      "Give me a 30-minute PD agenda for introducing AT to K–6 teachers.",
      "Model script for coaching a teacher on speech-to-text tools.",
      "How do I address resistance to AT integration?"
    ],
    resources: [
      { title: "PD Templates (Edutopia)", url: "https://www.edutopia.org/article/training-instructional-coaches-technology-integration/" },
      { title: "Central Rivers AEA Professional Learning", url: "https://www.centralriversaea.org/educators/professional-learning/" }
    ],
    responseHints: [
      "Provide PD-ready outlines with time boxes and materials.",
      "Add role-play scenarios and success metrics.",
      "Suggest coach follow-ups and stakeholder communication tips."
    ]
  }
};
