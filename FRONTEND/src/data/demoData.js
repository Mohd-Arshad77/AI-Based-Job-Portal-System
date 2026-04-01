export const demoJobs = [
  {
    _id: "job-1",
    title: "Senior Product Designer",
    company: "Nebula Labs",
    location: "Remote",
    type: "Full-time",
    salary: "$120k - $145k",
    experienceRequired: "5+ years",
    matchScore: 96,
    isActive: true,
    isApproved: true,
    applicantsCount: 42,
    postedAt: "2026-03-20T09:00:00.000Z",
    description:
      "Lead end-to-end product design for AI-driven hiring experiences, collaborate with PMs and engineers, and shape a refined design system across candidate and recruiter journeys.",
    skillsRequired: ["Figma", "Design Systems", "UX Research", "Prototyping", "Product Strategy"]
  },
  {
    _id: "job-2",
    title: "Frontend Engineer",
    company: "Orbit People",
    location: "Bengaluru, India",
    type: "Hybrid",
    salary: "$90k - $118k",
    experienceRequired: "3+ years",
    matchScore: 92,
    isActive: true,
    isApproved: true,
    applicantsCount: 68,
    postedAt: "2026-03-22T11:30:00.000Z",
    description:
      "Build high-performance React experiences for job discovery, application workflows, and recruiter analytics with a strong eye for motion and interface polish.",
    skillsRequired: ["React", "Tailwind CSS", "TypeScript", "Vite", "REST APIs"]
  },
  {
    _id: "job-3",
    title: "Machine Learning Engineer",
    company: "Prism AI",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$135k - $170k",
    experienceRequired: "4+ years",
    matchScore: 88,
    isActive: true,
    isApproved: true,
    applicantsCount: 27,
    postedAt: "2026-03-18T16:45:00.000Z",
    description:
      "Develop ranking and recommendation models that match candidate profiles to roles using semantic retrieval, resume parsing, and feedback loops from recruiter actions.",
    skillsRequired: ["Python", "PyTorch", "MLOps", "NLP", "Ranking Systems"]
  },
  {
    _id: "job-4",
    title: "Growth Marketing Manager",
    company: "Helio Works",
    location: "London, UK",
    type: "Remote",
    salary: "$82k - $104k",
    experienceRequired: "4+ years",
    matchScore: 84,
    isActive: true,
    isApproved: false,
    applicantsCount: 19,
    postedAt: "2026-03-16T08:15:00.000Z",
    description:
      "Own demand generation campaigns, lifecycle journeys, and conversion experimentation for a rapidly growing AI hiring platform.",
    skillsRequired: ["Performance Marketing", "Lifecycle", "Analytics", "SEO", "Experimentation"]
  },
  {
    _id: "job-5",
    title: "Talent Operations Specialist",
    company: "Aster Careers",
    location: "New York, NY",
    type: "On-site",
    salary: "$68k - $82k",
    experienceRequired: "2+ years",
    matchScore: 79,
    isActive: false,
    isApproved: true,
    applicantsCount: 53,
    postedAt: "2026-03-10T10:00:00.000Z",
    description:
      "Coordinate candidate pipelines and improve recruiter workflows with automation and reporting.",
    skillsRequired: ["Recruiting Ops", "ATS", "Stakeholder Management", "Reporting"]
  },
  {
    _id: "job-6",
    title: "Data Analyst",
    company: "Northstar Cloud",
    location: "Remote",
    type: "Contract",
    salary: "$70k - $92k",
    experienceRequired: "2+ years",
    matchScore: 81,
    isActive: true,
    isApproved: true,
    applicantsCount: 31,
    postedAt: "2026-03-25T14:00:00.000Z",
    description:
      "Turn hiring funnel data into dashboards and actionable insight for recruiters, product teams, and leadership.",
    skillsRequired: ["SQL", "Power BI", "Python", "Experiment Analysis", "Data Storytelling"]
  }
];

export const featuredJobs = demoJobs.slice(0, 4);

export const dashboardStats = [
  { label: "Profile Strength", value: "91%", note: "Optimized for AI matching" },
  { label: "Suggested Roles", value: "28", note: "Fresh matches this week" },
  { label: "Application Rate", value: "12", note: "Tracked in one workspace" },
  { label: "Resume Score", value: "8.9/10", note: "Ready for premium roles" }
];

export const quickActions = [
  { title: "Upload Resume", description: "Refresh your AI profile with new skills and achievements.", href: "/resume-upload" },
  { title: "Browse Jobs", description: "Explore curated opportunities ranked by fit score.", href: "/jobs" },
  { title: "Track Applications", description: "Monitor application progress and recruiter updates.", href: "/applications" }
];

export const demoApplications = [
  {
    _id: "app-1",
    status: "Pending",
    appliedAt: "2026-03-27T10:30:00.000Z",
    job: demoJobs[0],
    user: { _id: "user-1", name: "Aarav Mehta", email: "aarav@demo.com" }
  },
  {
    _id: "app-2",
    status: "Shortlisted",
    appliedAt: "2026-03-21T08:20:00.000Z",
    job: demoJobs[1],
    user: { _id: "user-1", name: "Aarav Mehta", email: "aarav@demo.com" }
  },
  {
    _id: "app-3",
    status: "Hired",
    appliedAt: "2026-03-12T15:00:00.000Z",
    job: demoJobs[5],
    user: { _id: "user-1", name: "Aarav Mehta", email: "aarav@demo.com" }
  },
  {
    _id: "app-4",
    status: "Rejected",
    appliedAt: "2026-03-08T12:15:00.000Z",
    job: demoJobs[2],
    user: { _id: "user-2", name: "Maya Kapoor", email: "maya@demo.com" }
  }
];

export const parsedResumeDemo = {
  skills: ["React", "Tailwind CSS", "Design Systems", "Node.js", "Python", "Product Thinking"],
  projects: [
    "Built an AI resume analyzer with role-based dashboards and application tracking.",
    "Designed a recruiter workspace that improved shortlist visibility.",
    "Shipped a job search UI with responsive cards and status tracking."
  ],
  summary: "Senior frontend-focused candidate with strong UX sense and practical AI product experience."
};
