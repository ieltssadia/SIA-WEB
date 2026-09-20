/**
 * Central content source for the Sadia's IELTS website.
 * Facts sourced from sadiasielts.com and the client's Facebook page.
 */

export const site = {
  name: "Sadia's IELTS",
  tagline: "Unlock Your Future",
  subTagline: "Transform Your English Skills to Perfection",
  phone: "+880 1752-716238",
  phoneHref: "tel:+8801752716238",
  phone2: "+880 1746-466653",
  whatsapp: "https://wa.me/8801752716238?text=Assalamu%20Alaikum!%20I%20want%20to%20know%20about%20IELTS%20courses.",
  email: "support@sadiasielts.com",
  email2: "ieltsbysadianisha@gmail.com",
  address:
    "Syed Mujibur Rahman Market (2nd Floor), Chowmuhona, Sreemangal, Moulvibazar, Sylhet 3210",
  addressShort: "Sreemangal, Moulvibazar, Sylhet",
  facebook: "https://www.facebook.com/Sadiasielts",
  website: "https://sadiasielts.com",
};

/**
 * Public nav — coaching-brand top bar (Home / Courses / Cambridge / Free Tips).
 * Live classes are NOT public: they are an enrolled-student feature that lives
 * inside the portal ("My Portal" CTA), like every real coaching brand.
 */
export const navPrimary = [
  { label: "Home", href: "#/" },
  { label: "Courses", href: "#/courses" },
  { label: "Cambridge", href: "#/cambridge" },
  { label: "Free Tips", href: "#/tips" },
];

/** Secondary links grouped under the "More" dropdown in the desktop nav. */
export const navMore = [
  { label: "Team", href: "#/team", desc: "যাঁরা আপনাকে পড়াবেন" },
  { label: "About", href: "#/about", desc: "Sadia's story, mission & team" },
  { label: "Stories", href: "#/stories", desc: "Band 8+ success stories" },
  { label: "Shop", href: "#/shop", desc: "Books & mock test bundles" },
  { label: "Contact", href: "#/contact", desc: "Visit us or drop a message" },
];

/** Dismissible promo strip above the nav — honest, no exclamation-mark noise. */
export const promoBar = {
  message: "নতুন ব্যাচে ভর্তি চলছে — সেপ্টেম্বরের শেষ পর্যন্ত সব কোর্সে ৩৩% পর্যন্ত ছাড়",
  ctaLabel: "ভর্তি হোন",
  ctaHref: "#/checkout",
};

export const paymentMethods = ["bKash", "Nagad", "Rocket", "Bank Transfer", "Cash"];

/** 10MS-style popular searches shown in the header search dialog. */
export const popularSearches = [
  "Basic to IELTS",
  "Mock Test",
  "Speaking",
  "Crash Course",
  "Free Course",
  "Vocabulary",
];

/**
 * Demo certificates for the public "Verify Certificate" page (10MS pattern —
 * 10minuteschool.com/certificate). Real issued certificates live in the DB;
 * these seeds are inserted on first boot so the page is demonstrable.
 */
export const certificateSeeds = [
  {
    id: "SIE-CERT-2417",
    name: "Mithila Akter",
    course: "Basic to IELTS — In Batch",
    batch: "Batch 315",
    band: "8.0",
    issued: "30 May 2025",
  },
  {
    id: "SIE-CERT-2402",
    name: "Anika Tasnim",
    course: "Basic to IELTS — Private Batch",
    batch: "Batch 312",
    band: "7.5",
    issued: "30 May 2025",
  },
  {
    id: "SIE-CERT-2406",
    name: "Raihan Ahmed",
    course: "IELTS Crash Course",
    batch: "Batch 314-C",
    band: "7.5",
    issued: "06 Jun 2025",
  },
  {
    id: "SIE-CERT-2395",
    name: "Fariha Islam",
    course: "Basic to IELTS — In Batch",
    batch: "Batch 311",
    band: "7.0",
    issued: "30 May 2025",
  },
  {
    id: "SIE-CERT-2388",
    name: "Milon Mahmud",
    course: "Basic to IELTS — One to One",
    batch: "1-on-1",
    band: "6.0",
    issued: "30 May 2025",
  },
  {
    id: "SIE-CERT-2411",
    name: "Emran Ahmed",
    course: "IELTS Crash Course",
    batch: "Batch 313-C",
    band: "6.0",
    issued: "30 May 2025",
  },
];

export const stats = [
  { value: 9, suffix: "+", label: "বছরের শেখানোর অভিজ্ঞতা" },
  { value: 316, suffix: "+", label: "ব্যাচ সফলভাবে শেষ" },
  { value: 5000, suffix: "+", label: "শিক্ষার্থী পরীক্ষা দিয়েছে" },
  { value: 17, suffix: "", label: "কোর্স ও স্টাডি প্ল্যান" },
];

export type Course = {
  slug: string;
  title: string;
  titleBn: string;
  desc: string;
  lessons: number;
  duration: string;
  price: number | null; // null => call for price
  oldPrice?: number;
  tag: string;
  icon: string; // key used by the courses section
  features: string[];
  category: "complete" | "beginner" | "exam";
  rating: number;
  students: number;
  nextBatch: string;
  mode: string;
  syllabus: string[];
  /** One-line weekly schedule summary shown on the course page. */
  scheduleNote: string;
  /** 10MS batch urgency — seats remaining in the currently enrolling batch. */
  seatsLeft?: number;
  seatsTotal?: number;
  /** 10MS-style access duration, e.g. "3 মাস" / "আজীবন". */
  accessPeriod?: string;
};

export const courseCategories = [
  { value: "all", label: "All Courses" },
  { value: "complete", label: "Complete Preparation" },
  { value: "beginner", label: "For Beginners" },
  { value: "exam", label: "Exam Boosters" },
] as const;

export const courses: Course[] = [
  {
    slug: "basic-to-ielts-in-batch",
    title: "Basic to IELTS — In Batch",
    titleBn: "বেসিক টু আইইএলটিস — ইন ব্যাচ",
    desc: "আপনার IELTS প্রস্তুতির সেরা কোর্স! Basic English থেকে IELTS পর্যন্ত সম্পূর্ণ প্রস্তুতি — ব্যাচের সাথে শিখুন, একসাথে এগিয়ে যান।",
    lessons: 36,
    duration: "3 Months",
    price: 8000,
    oldPrice: 12000,
    tag: "Best Seller",
    icon: "users",
    features: [
      "36 Live Classes",
      "Weekly Mock Tests",
      "Free Study Materials",
      "Speaking Club Access",
    ],
    category: "complete",
    rating: 4.9,
    students: 2140,
    nextBatch: "Every Sunday",
    mode: "Online + Offline",
    scheduleNote: "Sat – Thu · 10:00 AM – 11:30 AM + Thursday Weekly Mock",
    seatsLeft: 5,
    seatsTotal: 30,
    accessPeriod: "3 মাস + পরীক্ষা পর্যন্ত রেকর্ডেড অ্যাক্সেস",
    syllabus: [
      "Foundation: Grammar & Vocabulary (4 weeks)",
      "Listening: Accents, note-taking & practice tests",
      "Reading: Skimming, scanning & all question types",
      "Writing: Task 1 graphs to Band 7+ essays",
      "Speaking: Daily clubs, interviews & fluency drills",
      "Final week: Full mock tests with band reports",
    ],
  },
  {
    slug: "basic-to-ielts-private-batch",
    title: "Basic to IELTS — Private Batch",
    titleBn: "বেসিক টু আইইএলটিস — প্রাইভেট ব্যাচ",
    desc: "ছোট গ্রুপে মনোযোগী শেখার সুযোগ। প্রতিটি শিক্ষার্থীর জন্য ব্যক্তিগত মনোযোগ ও নিয়মিত ফিডব্যাক নিশ্চিত করা হয়।",
    lessons: 36,
    duration: "3 Months",
    price: 12000,
    oldPrice: 16500,
    tag: "Small Group",
    icon: "grad",
    features: [
      "Small Batch (Max 10)",
      "Personal Attention",
      "Weekly Mock Tests",
      "Free Study Materials",
    ],
    category: "complete",
    rating: 4.9,
    students: 1120,
    nextBatch: "Every Sunday",
    mode: "Online + Offline",
    scheduleNote: "Sun & Tue · 5:00 PM – 6:30 PM + Thursday Weekly Mock",
    seatsLeft: 4,
    seatsTotal: 10,
    accessPeriod: "3 মাস + পরীক্ষা পর্যন্ত রেকর্ডেড অ্যাক্সেস",
    syllabus: [
      "Foundation: Grammar & Vocabulary (4 weeks)",
      "All 4 modules with individual feedback",
      "Weekly progress tracking & parent report",
      "Final week: Full mock tests with band reports",
    ],
  },
  {
    slug: "basic-to-ielts-one-to-one",
    title: "Basic to IELTS — One to One",
    titleBn: "বেসিক টু আইইএলটিস — ওয়ান টু ওয়ান",
    desc: "সম্পূর্ণ ব্যক্তিগত ক্লাস — আপনার সময় অনুযায়ী ক্লাস, আপনার দুর্বলতা অনুযায়ী কোর্স প্ল্যান। দ্রুততম ফলাফলের জন্য সেরা।",
    lessons: 36,
    duration: "Flexible",
    price: 16000,
    oldPrice: 19500,
    tag: "Personalized",
    icon: "target",
    features: [
      "Flexible Schedule",
      "Custom Study Plan",
      "Direct Mentor Access",
      "Unlimited Speaking Practice",
    ],
    category: "complete",
    rating: 5.0,
    students: 640,
    nextBatch: "Any day you start",
    mode: "Online + Offline",
    scheduleNote: "Flexible — class times are fixed with your mentor at admission",
    seatsLeft: 3,
    seatsTotal: 8,
    accessPeriod: "6 মাস অ্যাক্সেস",
    syllabus: [
      "Level assessment & custom study plan",
      "All 4 modules at your own pace",
      "Unlimited one-to-one speaking practice",
      "Direct WhatsApp access to your mentor",
    ],
  },
  {
    slug: "pre-ielts",
    title: "Basic IELTS / Pre-IELTS Course",
    titleBn: "বেসিক আইইএলটিস / প্রি-আইইএলটিস",
    desc: "IELTS প্রস্তুতির পারফেক্ট শুরু! English একদম শূন্য থেকে শুরু করার জন্য ডিজাইন করা ফাউন্ডেশন কোর্স।",
    lessons: 12,
    duration: "1 Month",
    price: 4000,
    oldPrice: 4500,
    tag: "Beginner Friendly",
    icon: "book",
    features: [
      "Grammar Foundation",
      "Vocabulary Building",
      "Basic Writing Skills",
      "Daily Practice Sheets",
    ],
    category: "beginner",
    rating: 4.8,
    students: 1280,
    nextBatch: "1st of every month",
    mode: "Online + Offline",
    scheduleNote: "Mon & Wed · 4:00 PM – 5:30 PM",
    seatsLeft: 15,
    seatsTotal: 35,
    accessPeriod: "1 মাস অ্যাক্সেস",
    syllabus: [
      "English grammar from absolute basics",
      "Everyday & academic vocabulary building",
      "Sentence structure & paragraph writing",
      "Intro to the IELTS exam format",
    ],
  },
  {
    slug: "ielts-crash-course",
    title: "IELTS Crash Course",
    titleBn: "আইইএলটিস ক্র্যাশ কোর্স",
    desc: "Exam near? Fast-track your preparation with proven strategies, shortcuts and intensive mock tests for all 4 modules.",
    lessons: 18,
    duration: "4 Weeks",
    price: null,
    tag: "Fast Track",
    icon: "zap",
    features: [
      "Exam Strategies & Tricks",
      "Intensive Mock Tests",
      "Time Management Skills",
      "Band Booster Sessions",
    ],
    category: "exam",
    rating: 4.9,
    students: 803,
    nextBatch: "Every Monday",
    mode: "Online + Offline",
    scheduleNote: "Mon & Wed · 6:00 PM – 7:30 PM + Thursday Mock Review",
    seatsLeft: 8,
    seatsTotal: 25,
    accessPeriod: "1 মাস অ্যাক্সেস",
    syllabus: [
      "Week 1: All 4 module strategies & shortcuts",
      "Week 2: Question-type tricks (Reading & Listening)",
      "Week 3: Essay templates & speaking fluency",
      "Week 4: 4 full mock tests with band reports",
    ],
  },
  {
    slug: "free-course",
    title: "Free IELTS Foundation",
    titleBn: "ফ্রি আইইএলটিস ফাউন্ডেশন কোর্স",
    desc: "Access premium online lessons for free! Create your free account now and immediately start your IELTS journey.",
    lessons: 10,
    duration: "Self-paced",
    price: 0,
    tag: "100% Free",
    icon: "gift",
    features: [
      "Free Video Lessons",
      "Practice Materials",
      "Weekly Tips & Tricks",
      "Community Support",
    ],
    category: "beginner",
    rating: 4.8,
    students: 3560,
    nextBatch: "Start instantly",
    mode: "Online",
    scheduleNote: "Self-paced — learn anytime + join the weekly free live classes",
    accessPeriod: "আজীবন অ্যাক্সেস",
    syllabus: [
      "10 premium video lessons",
      "Downloadable practice materials",
      "Weekly IELTS tips & tricks",
      "Facebook learners community access",
    ],
  },
];

/** 10MS-style free resources — free classes are a core part of the brand funnel. */
export const freeResources = [
  {
    icon: "video",
    title: "Free Video Lessons",
    desc: "IELTS মডিউল-ভিত্তিক ফ্রি ভিডিও ক্লাস — Facebook পেজে নিয়মিত আপলোড হয়। আজই দেখা শুরু করুন।",
    cta: "Watch on Facebook",
    href: site.facebook,
    external: true,
  },
  {
    icon: "clipboard",
    title: "Free Mock Test",
    desc: "ফুল-লেন্থ IELTS Mock Test ফ্রি! আপনার বর্তমান ব্যান্ড স্কোর জানতে ফ্রি অ্যাসেসমেন্টে রেজিস্টার করুন।",
    cta: "Book Free Mock Test",
    href: "#/contact",
    external: false,
  },
  {
    icon: "lightbulb",
    title: "Free Tips & Tricks",
    desc: "প্রতিটি প্রশ্ন টাইপের জন্য প্রমাণিত শর্টকাট — Reading, Listening, Writing ও Speaking টিপস পড়ুন।",
    cta: "Read the Tips",
    href: "#/tips",
    external: false,
  },
];

/* ------------------------------------------------------------------ */
/* Online Class Routine — 10MS-style weekly schedule                   */
/* ------------------------------------------------------------------ */

export const weekDays = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export type WeekDay = (typeof weekDays)[number];

export type RoutineClass = {
  day: WeekDay;
  start: string;
  end: string;
  courseSlug: string;
  /** Batch label, e.g. "Batch 317" or "All Students". */
  batch: string;
  topic: string;
  mode: "Online Live" | "Campus" | "Hybrid";
  type: "Regular Class" | "Speaking Club" | "Mock Test" | "Free Live Class" | "Feedback Session";
};

/**
 * The running weekly schedule (Asia/Dhaka time). Batch numbers continue from
 * the 316+ batches already completed.
 */
export const classRoutine: RoutineClass[] = [
  // Saturday
  {
    day: "Saturday",
    start: "10:00 AM",
    end: "11:30 AM",
    courseSlug: "basic-to-ielts-in-batch",
    batch: "Batch 317",
    topic: "Writing Task 1 — Graphs & Charts",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Saturday",
    start: "4:00 PM",
    end: "5:00 PM",
    courseSlug: "basic-to-ielts-in-batch",
    batch: "All Students",
    topic: "Free Speaking Club",
    mode: "Online Live",
    type: "Speaking Club",
  },
  // Sunday
  {
    day: "Sunday",
    start: "10:00 AM",
    end: "11:30 AM",
    courseSlug: "basic-to-ielts-in-batch",
    batch: "Batch 317",
    topic: "Listening — Accents & Note-taking",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Sunday",
    start: "5:00 PM",
    end: "6:30 PM",
    courseSlug: "basic-to-ielts-private-batch",
    batch: "Batch 319",
    topic: "Grammar Boost + Individual Feedback",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Sunday",
    start: "8:00 PM",
    end: "9:00 PM",
    courseSlug: "free-course",
    batch: "Everyone",
    topic: "Free Live Class — Reading Tricks",
    mode: "Online Live",
    type: "Free Live Class",
  },
  // Monday
  {
    day: "Monday",
    start: "10:00 AM",
    end: "11:30 AM",
    courseSlug: "basic-to-ielts-in-batch",
    batch: "Batch 317",
    topic: "Reading — Skimming & Scanning",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Monday",
    start: "4:00 PM",
    end: "5:30 PM",
    courseSlug: "pre-ielts",
    batch: "Batch 320",
    topic: "Basic Grammar — Tenses Made Easy",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Monday",
    start: "6:00 PM",
    end: "7:30 PM",
    courseSlug: "ielts-crash-course",
    batch: "Batch 318-C",
    topic: "Module Strategies & Shortcuts",
    mode: "Online Live",
    type: "Regular Class",
  },
  // Tuesday
  {
    day: "Tuesday",
    start: "10:00 AM",
    end: "11:30 AM",
    courseSlug: "basic-to-ielts-in-batch",
    batch: "Batch 317",
    topic: "Speaking — Cue Cards & Fluency",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Tuesday",
    start: "5:00 PM",
    end: "6:30 PM",
    courseSlug: "basic-to-ielts-private-batch",
    batch: "Batch 319",
    topic: "Writing Task 2 Workshop",
    mode: "Hybrid",
    type: "Regular Class",
  },
  // Wednesday
  {
    day: "Wednesday",
    start: "10:00 AM",
    end: "11:30 AM",
    courseSlug: "basic-to-ielts-in-batch",
    batch: "Batch 317",
    topic: "Writing Task 2 — Band 7+ Essays",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Wednesday",
    start: "4:00 PM",
    end: "5:30 PM",
    courseSlug: "pre-ielts",
    batch: "Batch 320",
    topic: "Vocabulary Builder",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Wednesday",
    start: "6:00 PM",
    end: "7:30 PM",
    courseSlug: "ielts-crash-course",
    batch: "Batch 318-C",
    topic: "Question-type Tricks — Reading & Listening",
    mode: "Online Live",
    type: "Regular Class",
  },
  {
    day: "Wednesday",
    start: "8:00 PM",
    end: "9:00 PM",
    courseSlug: "free-course",
    batch: "Everyone",
    topic: "Free Live Class — Essay Checking Live",
    mode: "Online Live",
    type: "Free Live Class",
  },
  // Thursday
  {
    day: "Thursday",
    start: "10:00 AM",
    end: "12:00 PM",
    courseSlug: "basic-to-ielts-in-batch",
    batch: "All Batches",
    topic: "Weekly Full Mock Test",
    mode: "Hybrid",
    type: "Mock Test",
  },
  {
    day: "Thursday",
    start: "4:00 PM",
    end: "5:30 PM",
    courseSlug: "ielts-crash-course",
    batch: "Batch 318-C",
    topic: "Mock Review & Band Report",
    mode: "Online Live",
    type: "Feedback Session",
  },
  // Friday — weekly off
];

export const routineNote = {
  title: "Routine পরিবর্তন হতে পারে",
  message:
    "Ramadan, সরকারি ছুটি বা বিশেষ অনুষ্ঠানের কারণে class time পরিবর্তন হলে আপনার WhatsApp গ্রুপে জানিয়ে দেওয়া হয়। Zoom/Facebook লিংক সবসময় গ্রুপে পাবেন।",
};

/** 10MS-style free live classes funnel — open to everyone, no enrollment needed. */
export const freeLiveClasses = [
  {
    title: "Free Live Class — IELTS Reading Tricks",
    when: "Every Sunday, 8:00 PM",
    platform: "Facebook Live",
    host: "Sadia Rahman",
    ctaLabel: "Watch on Facebook",
    href: site.facebook,
    external: true,
  },
  {
    title: "Free Live Class — Essay Checking Live",
    when: "Every Wednesday, 8:00 PM",
    platform: "Facebook Live",
    host: "Sadia Rahman",
    ctaLabel: "Watch on Facebook",
    href: site.facebook,
    external: true,
  },
  {
    title: "Free Full Mock Test + Band Assessment",
    when: "Every Thursday, 10:00 AM",
    platform: "Zoom — register first",
    host: "Sadia's IELTS Team",
    ctaLabel: "Register Free",
    href: "#/contact",
    external: false,
  },
];

/**
 * The people behind the results — team page (#/team), member profiles
 * (#/team/<slug>) and the moving team strip on the home page.
 * Portraits are studio-style placeholders; swap the files in /public/images/team
 * and update bios without touching layout.
 */
export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  /** One-liner shown on the moving card + profile header. */
  tagline: string;
  photo: string;
  /** Pastel chip classes for the specialty pills. */
  chip: string;
  /** 2–3 short paragraphs — the story, in a human voice. */
  bio: string[];
  specialties: string[];
  credentials: string[];
  stats: { value: string; label: string }[];
  quote: string;
};

export const teamMembers: TeamMember[] = [
  {
    slug: "sadia-rahman",
    name: "Sadia Rahman",
    role: "Founder & Lead IELTS Instructor",
    tagline: "Cambridge & IDP certified — ৯ বছরে ৩,০০০-র বেশি শিক্ষার্থীর নিজের হাতে প্রস্তুতি।",
    photo: "/images/instructor-sadia.png",
    chip: "bg-pastel-butter text-[#7a5a16]",
    bio: [
      "২০১৬ সালে Sreemangal-এর একটা ছোট রুম দিয়ে শুরু — তখন ছয়জন শিক্ষার্থী। আজ ৩১৬-র বেশি ব্যাচ শেষ হয়েছে, কিন্তু নিয়ম একটাই: প্রতিটি শিক্ষার্থীর mock test-এর খাতা নিজের হাতে দেখা, আর পরীক্ষার আগে শেষ কথাটা নিজে বলা।",
      "নিজের Band 8.5, Reading আর Listening-এ পুরো 9.0 — কিন্তু ক্লাসে এই কথা দ্বিতীয়বার আসে না। প্রথম দিন থেকে আসে একটাই প্রশ্ন: আপনার টার্গেট কত, আর কোথায় আটকে আছেন? সেই উত্তরটাই আপনার পুরো রুটিন সাজিয়ে দেয়।",
      "Sreemangal-এ থেকে বড় শহরে না গিয়েও শিক্ষার্থীরা প্রমাণ করেছে — সঠিক গাইডলাইন থাকলে Band 7+ শহর-মহল্লা দেখে না। এটাই Sadia's IELTS-এর ভিত।",
    ],
    specialties: ["Writing Task 2", "Mock Assessment", "Study Plan", "Speaking Feedback"],
    credentials: [
      "Cambridge & IDP Certified IELTS Trainer",
      "TKT & TTT Certified (University of Cambridge)",
      "Personal Band 8.5 — perfect 9.0 in Reading & Listening",
      "9+ years teaching, 316+ batches completed",
    ],
    stats: [
      { value: "9+", label: "Years teaching" },
      { value: "3,000+", label: "Students mentored" },
      { value: "8.5", label: "Personal band" },
    ],
    quote: "IELTS-এ লুকোচুরি চলে না — যে দুর্বলতা আপনি স্বীকার করবেন, সেটাই আমরা প্রথমে ঠিক করব।",
  },
  {
    slug: "farhana-yeasmin",
    name: "Farhana Yeasmin",
    role: "Speaking & Listening Coach",
    tagline: "পরীক্ষার হলে কাঁপা গলা, ক্লাসে হাসিমুখ — কথা বলার সাহসটা তৈরি করেন তিনিই।",
    photo: "/images/team/farhana.png",
    chip: "bg-pastel-green text-[#1f5c40]",
    bio: [
      "বেশিরভাগ শিক্ষার্থীর লেখা ভালো, কিন্তু মাইক্রোফোনের সামনে দাঁড়ালেই গলা চুপ — Farhana ম্যাম-এর ক্লাস ওই ভয়টাই ভাঙার জন্য। প্রথম সপ্তাহে ভুল নিয়ে লজ্জা নেই, এই নিয়ম প্রতিষ্ঠা করে তিনি ক্লাসের ভয়ঙ্কর-চেনা পরিবেশটা গুঁড়িয়ে দেন।",
      "প্রতি সপ্তাহে Speaking Club-এ এক-একটা real exam situation — cue card, follow-up, আর তাৎক্ষণিক feedback। কোন শব্দে আটকাচ্ছেন, কোথায় অযথা থেমে যাচ্ছেন — রেকর্ডিং শুনিয়ে ধরিয়ে দেন।",
      "Listening-এর band drop বেশিরভাগ সময় spelling আর concentration নয় — ভয়। প্রতিদিনের ২০ মিনিটের dictation drill-এ সেই ভয়টাই অভ্যাস হয়ে যায়।",
    ],
    specialties: ["Speaking Part 1–3", "Listening Strategy", "Pronunciation", "Weekly Speaking Club"],
    credentials: [
      "IELTS Band 8.0 (Speaking 8.5)",
      "MA in English Literature",
      "6+ years coaching Speaking & Listening",
    ],
    stats: [
      { value: "6+", label: "Years teaching" },
      { value: "1,200+", label: "Speaking sessions" },
      { value: "8.5", label: "Speaking band" },
    ],
    quote: "ভুল করা মানে অক্ষম না — মানে প্রস্তুতি এখনো চলছে। Speaking-এ সাহসই আসল স্কোর।",
  },
  {
    slug: "tanvir-ahmed",
    name: "Tanvir Ahmed",
    role: "Writing Coach & Feedback Lead",
    tagline: "Writing-এ ৫.৫ ঘুরে ৬.৫+ হওয়ার পেছনের কঠিন, পরিষ্কার feedback-এর মানুষ।",
    photo: "/images/team/tanvir.png",
    chip: "bg-pastel-sky text-[#2c4f8a]",
    bio: [
      "Writing-ই একমাত্র মডিউল যেখানে বাংলাদেশি শিক্ষার্থীদের band সবচেয়ে পিছিয়ে — আর এর একটাই কারণ: ভুল যেখানে, সেটা পরিষ্কার করে কেউ বলে না। Tanvir-এর কাজ ওই কথাটা বলা — প্রতিটি এসেতের পাশে ধরে ধরে।",
      "Task 2-এর structure, idea bank, আর সবচেয়ে জরুরি — কোন ভুল band কমায়, কোনটা কমায় না। শিক্ষার্থীর খাতায় তাঁর লাল কথাগুলো ক্লাসের সবচেয়ে দামি অংশ হিসেবেই পরিচিত।",
      "Weekly essay checking live-এ সাধারণ ভুলগুলো সবার সামনে ঠিক করেন — একজনের ভুল, পুরো ব্যাচের শিক্ষা।",
    ],
    specialties: ["Task 1 & 2 Structure", "Essay Feedback", "Idea Bank", "Vocabulary Building"],
    credentials: [
      "IELTS Band 8.0 (Writing 7.5)",
      "BA & MA in English, Shahjalal University",
      "5+ years, 4,000+ essays checked",
    ],
    stats: [
      { value: "5+", label: "Years teaching" },
      { value: "4,000+", label: "Essays checked" },
      { value: "80%", label: "Hit 6.5+ Writing" },
    ],
    quote: "আপনার এসের সমস্যা ইংরেজি না — চিন্তা সাজানো। ওটা ঠিক হলে Writing দাঁড়িয়ে যায় তিন মাসে।",
  },
  {
    slug: "nusrat-jahan",
    name: "Nusrat Jahan",
    role: "Reading Coach & Cambridge Coordinator",
    tagline: "Cambridge 5 থেকে 19 — পুরো সিরিজের প্রশ্ন-প্যাটার্ন তাঁর হাতের তালুতে।",
    photo: "/images/team/nusrat.png",
    chip: "bg-pastel-orange text-[#7a4c12]",
    bio: [
      "Reading-এ সময় ফুরিয়ে যায় কোথায়? Nusrat ম্যাম-এর ক্লাসে প্রথম দিনেই এই প্রশ্নের উত্তর হয়ে যায় — skimming, keyword trapping, আর true/false/not given-এর ফাঁদগুলো চেনা।",
      "সাইটের Cambridge Library-র পুরো টেস্ট সেট-আপ, লেভেল অনুযায়ী কে কোন বই দিয়ে প্র্যাকটিস করবে — এই পরিকল্পনাও তাঁর। প্রতিটি শিক্ষার্থীর প্রগ্রেস ট্র্যাক করে পরের টেস্ট ঠিক করে দেন।",
      "Reading band 5.5 থেকে 7+ যাওয়া শিক্ষার্থীদের একটাই কমন কথা — প্যাটার্ন চিনলে প্রশ্ন ভয় দেখায় না।",
    ],
    specialties: ["Reading Speed", "T/F/NG Strategy", "Cambridge Tests", "Vocabulary in Context"],
    credentials: [
      "IELTS Band 8.5 (Reading 9.0)",
      "BSc in English & Education",
      "4+ years, Cambridge series specialist",
    ],
    stats: [
      { value: "4+", label: "Years teaching" },
      { value: "9.0", label: "Reading band" },
      { value: "15", label: "Cambridge books mastered" },
    ],
    quote: "প্রশ্ন মিথ্যা বলে না — ফাঁদ দেখায় মাত্র। প্যাটার্ন চিনলে Reading-ই সবচেয়ে সহজ মডিউল।",
  },
  {
    slug: "mahmudul-hasan",
    name: "Mahmudul Hasan",
    role: "Admissions & Student Success",
    tagline: "ভর্তি থেকে ফলাফল — মাঝখানের প্রতিটি ঝামেলা যিনি নিজের কাঁধে নেন।",
    photo: "/images/team/mahmudul.png",
    chip: "bg-pastel-ruby text-[#7a2734]",
    bio: [
      "কোন কোর্সে ভর্তি হবেন, কোন ব্যাচের সময় আপনার রুটিনের সাথে মিলবে, ম্যাটেরিয়ালস কোরিয়ারে কোথায় — ক্লাসের বাইরের সব প্রশ্নের এক উত্তর: Mahmudul-কে ফোন দিন।",
      "পোর্টালে লগইন, মকের রেজাল্ট বোঝা, কোর্স শেষে সার্টিফিকেট — প্রযুক্তিগত আর প্রশাসনিক যেকোনো আটকে যাওয়া জায়গায় তিনিই প্রথম মানুষ।",
      "একবার ভর্তি হলে কোর্স শেষ হওয়ার আগ পর্যন্ত তিনি মাসে অন্তত একবার ফোনে নিশ্চিত হন — সব ঠিক চলছে তো?",
    ],
    specialties: ["Admission Guidance", "Batch Scheduling", "Student Support", "Certificate & Portal"],
    credentials: [
      "BBA, National University",
      "Trained in student counselling & support",
      "4+ years at Sadia's IELTS",
    ],
    stats: [
      { value: "4+", label: "Years with us" },
      { value: "5,000+", label: "Students assisted" },
      { value: "1-day", label: "Support response" },
    ],
    quote: "ভর্তির আগে যত প্রশ্নই করুন — ফোন নম্বরটা আপনার জন্যই খোলা। ভর্তির পরেও।",
  },
];

/** 10MS "choose your batch" board — next admission batches per course. */
export const upcomingBatches = [
  {
    courseSlug: "basic-to-ielts-in-batch",
    course: "Basic to IELTS — In Batch",
    batch: "Batch 318",
    starts: "Every Sunday",
    time: "10:00 AM – 11:30 AM",
    seats: "12 seats left",
    mode: "Online + Offline",
  },
  {
    courseSlug: "basic-to-ielts-private-batch",
    course: "Basic to IELTS — Private Batch",
    batch: "Batch 319",
    starts: "Every Sunday",
    time: "5:00 PM – 6:30 PM",
    seats: "4 seats left",
    mode: "Online + Offline",
  },
  {
    courseSlug: "ielts-crash-course",
    course: "IELTS Crash Course",
    batch: "Batch 320-C",
    starts: "Every Monday",
    time: "6:00 PM – 7:30 PM",
    seats: "8 seats left",
    mode: "Online",
  },
  {
    courseSlug: "pre-ielts",
    course: "Basic IELTS / Pre-IELTS",
    batch: "Batch 321",
    starts: "1st of every month",
    time: "4:00 PM – 5:30 PM",
    seats: "15 seats left",
    mode: "Online + Offline",
  },
];

/**
 * Student Portal — batch notices shown in the portal "Notices" section.
 * Latest first. (Static demo content — a production build would manage
 * these from an admin panel.)
 */
export const portalNotices = [
  {
    date: "10 Sep",
    tag: "Class Update",
    title: "Sunday 10 AM class shifted to 11:00 AM",
    body: "Batch 317-এর Sunday regular class আগামী সপ্তাহ থেকে সকাল ১১টায় হবে। Zoom লিংক WhatsApp গ্রুপে পাবেন।",
  },
  {
    date: "08 Sep",
    tag: "Mock Test",
    title: "Weekly full mock — Thursday, 10:00 AM",
    body: "প্রতি বৃহস্পতিবার ফুল-লেন্থ mock test (10 AM – 12 PM)। উপস্থিত থাকা আবশ্যক — band report ক্লাসেই আলোচনা করা হবে।",
  },
  {
    date: "05 Sep",
    tag: "Speaking Club",
    title: "Saturday Speaking Club — সব ব্যাচের জন্য খোলা",
    body: "প্রতি শনিবার বিকাল ৪টায় free speaking club-এ এখন সব ব্যাচের শিক্ষার্থী অংশ নিতে পারবে। Fluency বাড়াতে নিয়মিত জয়েন করুন।",
  },
  {
    date: "01 Sep",
    tag: "Notice",
    title: "Course materials আপডেট হয়েছে",
    body: "Writing Task 2 templates ও Speaking cue card bank-এর নতুন সংস্করণ My Course → Materials সেকশনে যোগ হয়েছে।",
  },
];

/** Student Portal — real downloadable resources (files live in /public/downloads/). */
export type PortalDownload = {
  id: string;
  title: string;
  desc: string;
  category: "writing" | "speaking" | "vocabulary" | "mock-tools";
  type: "PDF";
  size: string;
  href: string;
};

export const portalDownloads: PortalDownload[] = [
  {
    id: "task2-structures",
    title: "Writing Task 2 — Essay Structure Bank",
    desc: "চার ধরনের প্রশ্নের জন্য রেডি স্কেলিটন আর band 7+ সেন্টেন্স ফ্রেম।",
    category: "writing",
    type: "PDF",
    size: "10 KB",
    href: "/downloads/writing-task-2-structures.pdf",
  },
  {
    id: "task1-sentences",
    title: "Academic Task 1 — Sentence Bank",
    desc: "Introduction, overview আর trend-language — যেকোনো চার্টে মানিয়ে নেওয়ার মতো।",
    category: "writing",
    type: "PDF",
    size: "6 KB",
    href: "/downloads/academic-task-1-sentence-bank.pdf",
  },
  {
    id: "speaking-cue-cards",
    title: "Speaking Cue Card Bank — 24 Topics",
    desc: "প্রতিদিন একটা করে কার্ড প্র্যাকটিস করুন — ৬০ সেকেন্ডের প্ল্যানিং ফ্রেমসহ।",
    category: "speaking",
    type: "PDF",
    size: "7 KB",
    href: "/downloads/speaking-cue-card-bank.pdf",
  },
  {
    id: "band7-vocab",
    title: "Band 7+ Vocabulary & Collocations",
    desc: "টপিক-ভিত্তিক কোলোকেশন আর মডেল সেন্টেন্স — শব্দ নয়, চাঙ্ক শিখুন।",
    category: "vocabulary",
    type: "PDF",
    size: "7 KB",
    href: "/downloads/band-7-vocabulary-collocations.pdf",
  },
  {
    id: "answer-sheet",
    title: "Listening & Reading Answer Sheet",
    desc: "প্রিন্ট করে প্রতি mock-এ ব্যবহার করুন — অফিসিয়াল লেআউটে ৪০টা করে ঘর।",
    category: "mock-tools",
    type: "PDF",
    size: "6 KB",
    href: "/downloads/listening-reading-answer-sheet.pdf",
  },
  {
    id: "mock-day-checklist",
    title: "Mock Day Checklist & Timing Plan",
    desc: "টেস্টের আগের রাত থেকে শেষ চেকিং পর্যন্ত — band 8+ শিক্ষার্থীদের রুটিন।",
    category: "mock-tools",
    type: "PDF",
    size: "5 KB",
    href: "/downloads/mock-day-checklist.pdf",
  },
];

export const portalDownloadCategories = [
  { id: "all", label: "All" },
  { id: "writing", label: "Writing" },
  { id: "speaking", label: "Speaking" },
  { id: "vocabulary", label: "Vocabulary" },
  { id: "mock-tools", label: "Mock Tools" },
] as const;

export const skills = [
  {
    icon: "headphones",
    title: "Listening",
    bn: "উন্নত করুন: নিয়মিত অনুশীলন, ফোকাস, কৌশল, শব্দভাণ্ডার ও ধারাবাহিক প্রচেষ্টার মাধ্যমে সফলতা নিশ্চিত করুন।",
    en: "Train your ears with real accents, note-taking drills and focused practice tests.",
  },
  {
    icon: "book",
    title: "Reading",
    bn: "স্কিল বাড়ানোর সবচেয়ে ভালো উপায় হলো নিয়মিত অনুশীলন। প্রতিদিন IELTS Reading প্যাসেজ পড়ে প্রশ্নের উত্তর দেওয়ার চেষ্টা করো।",
    en: "Skimming, scanning and time-management techniques for every question type.",
  },
  {
    icon: "pen",
    title: "Writing",
    bn: "বিভিন্ন ধরনের sentence structure ব্যবহার করো। একই শব্দ বারবার না লিখে synonym ব্যবহার করো। বানান ও tense ঠিক রাখো।",
    en: "From Task 1 graphs to Band 7+ essays — structured feedback on every writing.",
  },
  {
    icon: "mic",
    title: "Speaking",
    bn: "প্র্যাকটিস, আত্মবিশ্বাস, সাবলীলতা ও নিয়মিত ফিডব্যাকের মাধ্যমে উন্নত করুন আপনার IELTS Speaking দক্ষতা।",
    en: "Daily speaking clubs, mock interviews and personalized fluency feedback.",
  },
];

export const whyUs = [
  {
    icon: "globe",
    title: "Global Higher Education",
    desc: "Get the band score that opens doors to universities in the UK, USA, Canada, Australia and beyond.",
  },
  {
    icon: "award",
    title: "Scholarship Opportunities",
    desc: "A higher IELTS score means bigger scholarships — we prepare you to win them.",
  },
  {
    icon: "briefcase",
    title: "Enhanced Career Prospects",
    desc: "IELTS certification boosts your CV and career both at home and abroad.",
  },
  {
    icon: "message",
    title: "Confidence in Communication",
    desc: "Beyond the exam — speak English with confidence in real life, interviews and workplace.",
  },
];

export const tips = [
  {
    icon: "lightbulb",
    category: "IELTS Reading",
    title: "List of Headings — Top 10 Short Tricks",
    excerpt:
      "প্রথমে সবগুলো Heading ভালোভাবে পড়ে নিন passage পড়ার আগেই — তাহলে বুঝবেন কোন ধরনের information খুঁজতে হবে।",
  },
  {
    icon: "target",
    category: "IELTS Reading",
    title: "MCQ — Top 10 Short Tricks",
    excerpt:
      "Question First, Passage Later! প্রথমে প্রশ্ন পড়ুন, তারপর passage-এ যান — অপ্রয়োজনীয় তথ্য এড়িয়ে সময় বাঁচান।",
  },
  {
    icon: "zap",
    category: "IELTS Reading",
    title: "Short Answer Questions — Top 10 Tricks",
    excerpt:
      "আগে সব প্রশ্ন পড়ুন, তারপর passage স্ক্যান করুন target-wise — সঠিক কীওয়ার্ড খুঁজে দ্রুত উত্তর লিখুন।",
  },
];

/**
 * Real success stories from sadiasielts.com result posts (May–June 2025).
 * Band scores are the published "IELTS Overall Band Score" values.
 */
export const stories = [
  {
    name: "Mithila Akter",
    band: "Band 8.0",
    score: 8.0,
    course: "Basic to IELTS — In Batch",
    date: "30 May 2025",
    quote:
      "আমার জীবনের সেরা সিদ্ধান্ত ছিল Sadia's IELTS-এ ভর্তি হওয়া। Your commitment and consistent effort have led to this amazing achievement — this is what my teacher told me, and it's true!",
  },
  {
    name: "Anika Tasnim",
    band: "Band 7.5",
    score: 7.5,
    course: "Basic to IELTS — Private Batch",
    date: "30 May 2025",
    quote:
      "Sadia apa's Reading short tricks saved me so much time in the exam. The personal feedback on every writing was priceless — Band 7.5 became possible.",
  },
  {
    name: "Raihan Ahmed (Emon)",
    band: "Band 7.5",
    score: 7.5,
    course: "IELTS Crash Course",
    date: "06 Jun 2025",
    quote:
      "The weekly mock tests and speaking club completely changed my confidence. I never imagined Band 7.5 on my first attempt!",
  },
  {
    name: "Fariha Islam",
    band: "Band 7.0",
    score: 7.0,
    course: "Basic to IELTS — In Batch",
    date: "30 May 2025",
    quote:
      "From basic grammar to Band 7 — the journey was structured step by step. ব্যাচের সবাই একসাথে এগিয়ে যাওয়ায় motivation কখনো কমেনি।",
  },
  {
    name: "Mahmuda Akter Eva",
    band: "Band 7.0",
    score: 7.0,
    course: "Basic to IELTS — In Batch",
    date: "06 Jun 2025",
    quote:
      "One-to-one feedback on my essays fixed mistakes I never knew I made. We are proud to be a part of your journey — and I am proud to be their student.",
  },
  {
    name: "Emran Ahmed",
    band: "Band 6.0",
    score: 6.0,
    course: "IELTS Crash Course",
    date: "30 May 2025",
    quote:
      "I had only one month before my exam. The crash course strategies and time-management tricks helped me hit my target on the first attempt.",
  },
  {
    name: "Milon Mahmud",
    band: "Band 6.0",
    score: 6.0,
    course: "Basic to IELTS — One to One",
    date: "30 May 2025",
    quote:
      "One-to-one classes fit perfectly around my job. Flexible timing and a mentor who truly cares about your result.",
  },
];

/* ------------------------------------------------------------------ */
/* Book Shop — IELTS study materials & guides (sadiasielts.com/shop)   */
/* ------------------------------------------------------------------ */

export const bookCategories = [
  { value: "all", label: "All Books" },
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "speaking", label: "Speaking" },
  { value: "listening", label: "Listening" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "mock", label: "Mock Tests" },
] as const;

export type Book = {
  slug: string;
  title: string;
  titleBn: string;
  author: string;
  desc: string;
  price: number;
  oldPrice?: number;
  category: (typeof bookCategories)[number]["value"];
  cover: string; // path under /public
  tag?: string;
  pages: number;
  highlights: string[];
};

export const books: Book[] = [
  {
    slug: "reading-short-tricks",
    title: "IELTS Reading — Top 10 Short Tricks",
    titleBn: "আইইএলটিস রিডিং — টপ ১০ শর্ট ট্রিকস",
    author: "Sadia Rahman",
    desc:
      "List of Headings, MCQ, Short Answer — প্রতিটি question type-এর জন্য প্রমাণিত shortcut ও time-management কৌশল, বাংলা ব্যাখ্যাসহ।",
    price: 450,
    oldPrice: 600,
    category: "reading",
    cover: "/images/books/reading-tricks.png",
    tag: "Bestseller",
    pages: 96,
    highlights: ["All 14 question types covered", "Bengali explanations", "60+ solved examples"],
  },
  {
    slug: "writing-task-2-handbook",
    title: "IELTS Writing Task 2 — Band 7+ Handbook",
    titleBn: "রাইটিং টাস্ক ২ — ব্যান্ড ৭+ হ্যান্ডবুক",
    author: "Sadia Rahman",
    desc:
      "Essay structure, idea generation থেকে Band 7+ linking words — ready-made templates ও 40+ checked model essays সহ।",
    price: 550,
    oldPrice: 700,
    category: "writing",
    cover: "/images/books/writing-handbook.png",
    tag: "Top Rated",
    pages: 120,
    highlights: ["25 essay templates", "40+ model answers", "Common mistake list"],
  },
  {
    slug: "speaking-cue-card-bank",
    title: "IELTS Speaking — Cue Card Bank & Fluency Guide",
    titleBn: "স্পিকিং — কিউ কার্ড ব্যাংক ও ফ্লুয়েন্সি গাইড",
    author: "Sadia Rahman",
    desc:
      "Latest cue card bank (Part 1–3), sample answers ও fluency drills — follow-up questions এর সহজ উত্তর কৌশলসহ।",
    price: 400,
    category: "speaking",
    cover: "/images/books/speaking-bank.png",
    pages: 88,
    highlights: ["150+ cue cards", "Part 1–3 samples", "Fluency drill plan"],
  },
  {
    slug: "vocabulary-builder",
    title: "IELTS Vocabulary Builder — 3000+ Academic Words",
    titleBn: "ভোকাবুলারি বিল্ডার — ৩০০০+ একাডেমিক শব্দ",
    author: "Sadia Rahman",
    desc:
      "Topic-wise academic word list, synonym banks ও collocations — Writing ও Speaking-এ band বাড়ানোর সবচেয়ে কার্যকর অস্ত্র।",
    price: 500,
    oldPrice: 650,
    category: "vocabulary",
    cover: "/images/books/vocabulary.png",
    pages: 140,
    highlights: ["3000+ words", "Topic-wise synonym bank", "Collocation lists"],
  },
  {
    slug: "listening-workbook",
    title: "IELTS Listening — Accent & Note-taking Workbook",
    titleBn: "লিসেনিং — অ্যাকসেন্ট ও নোট-টেকিং ওয়ার্কবুক",
    author: "Sadia Rahman",
    desc:
      "British/Australian accent training, spelling traps ও map-labelling practice — প্রতিটি section-এর জন্য step-by-step strategy।",
    price: 450,
    category: "listening",
    cover: "/images/books/listening.png",
    pages: 104,
    highlights: ["Accent training audio list", "Map & diagram practice", "Spelling trap guide"],
  },
  {
    slug: "grammar-foundation",
    title: "Basic Grammar Foundation — Pre-IELTS Starter",
    titleBn: "বেসিক গ্রামার ফাউন্ডেশন — প্রি-আইইএলটিস",
    author: "Sadia Rahman",
    desc:
      "একদম শূন্য থেকে English grammar — tense, sentence structure ও daily practice sheets, IELTS-এর আগে ভিত মজবুত করার জন্য।",
    price: 350,
    category: "vocabulary",
    cover: "/images/books/grammar.png",
    tag: "Beginner",
    pages: 76,
    highlights: ["Tense made easy", "Daily practice sheets", "Bengali instruction"],
  },
  {
    slug: "mock-test-pack",
    title: "IELTS Mock Test Pack — 10 Full Tests",
    titleBn: "মক টেস্ট প্যাক — ১০টি ফুল টেস্ট",
    author: "Sadia's IELTS Team",
    desc:
      "10 full-length mock tests with answer keys ও self-band-assessment guide — পরীক্ষার হলের অভ্যাস বাড়িতেই।",
    price: 600,
    oldPrice: 800,
    category: "mock",
    cover: "/images/books/mock-pack.png",
    tag: "Sale",
    pages: 180,
    highlights: ["10 full tests", "Answer keys + explanations", "Band assessment sheet"],
  },
  {
    slug: "complete-bundle",
    title: "Complete IELTS Bundle — All 5 Books + Mock Pack",
    titleBn: "কমপ্লিট আইইএলটিস বান্ডেল — সব বই একসাথে",
    author: "Sadia Rahman",
    desc:
      "Reading, Writing, Speaking, Listening, Vocabulary + Mock Pack — সম্পূর্ণ প্রস্তুতি এক প্যাকেজে। বান্ডেলে সবচেয়ে বেশি সাশ্রয়!",
    price: 2200,
    oldPrice: 3300,
    category: "mock",
    cover: "/images/books/bundle.png",
    tag: "Save ৳1,100",
    pages: 720,
    highlights: ["All 6 books together", "Free delivery in Sreemangal", "Best value pack"],
  },
];

export const faqs = [
  {
    q: "IELTS কী এবং কেন এটি গুরুত্বপূর্ণ?",
    a: "IELTS (International English Language Testing System) হলো বিশ্বের সবচেয়ে জনপ্রিয় English দক্ষতা পরীক্ষা। উচ্চ শিক্ষা, স্কলারশিপ, ইমিগ্রেশন এবং ক্যারিয়ারের জন্য এটি প্রয়োজন। ভালো IELTS স্কোর আপনার স্বপ্নের দেশে পৌঁছানোর দরজা খুলে দেয়।",
  },
  {
    q: "আমার English একদম basic — আমি কি ভর্তি হতে পারব?",
    a: "অবশ্যই! এজন্যই আমাদের 'Basic IELTS / Pre-IELTS' ও 'Basic to IELTS' কোর্স। ৯ বছরে হাজারো শিক্ষার্থী একদম শূন্য থেকে Band 7+ অর্জন করেছে। আপনার current level বুঝতে ফ্রি assessment-এ যোগ দিন।",
  },
  {
    q: "ক্লাসগুলো কি অনলাইনে নাকি অফলাইনে হয়?",
    a: "দুটোই! আমাদের ক্যাম্পাসে অফলাইন ব্যাচ চলে (Sreemangal, Chowmuhona), এবং সারাদেশ থেকে অনলাইনে ক্লাসে অংশ নেওয়া যায়। One-to-One কোর্সে আপনার সুবিধামতো সময় বেছে নিতে পারবেন।",
  },
  {
    q: "কোর্স ফি কত এবং কীভাবে পরিশোধ করব?",
    a: "In Batch ৳৮,০০০, Private Batch ৳১২,০০০, One-to-One ৳১৬,০০০ এবং Pre-IELTS ৳৪,০০০ (ভর্তি মূল্য)। bKash/Nagad/Bank Transfer-এ পরিশোধ করা যায়। বিস্তারিত জানতে কল করুন +880 1752-716238।",
  },
  {
    q: "Mock Test কি কোর্সের মধ্যে অন্তর্ভুক্ত?",
    a: "হ্যাঁ! প্রতিটি কোর্সে নিয়মিত ফুল-লেন্থ Mock Test, লিখিত feedback এবং band score report অন্তর্ভুক্ত। পরীক্ষার আগে আমরা guarantee multiple full mocks করিয়ে থাকি।",
  },
  {
    q: "ভর্তি হতে চাইলে কী করতে হবে?",
    a: "খুব সহজ! নিচের enrollment ফর্মটি পূরণ করুন অথবা সরাসরি কল করুন +880 1752-716238 নম্বরে। আমাদের টিম ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করবে এবং ব্যাচের সময়সূচি জানিয়ে দেবে।",
  },
];

export const enrollCourseOptions = [
  { value: "not-sure", label: "Not sure yet — need counseling" },
  ...courses.map((c) => ({ value: c.slug, label: c.title })),
];
