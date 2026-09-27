/**
 * Central content source for the Sadia's IELTS website.
 * Facts sourced from sadiasielts.com and the client's Facebook page.
 */

export const site = {
  name: "Sadia's IELTS",
  tagline: "Unlock Your Future With Sadia's IELTS Academy",
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
  message: "নতুন ব্যাচে ভর্তি চলছে, সেপ্টেম্বরের শেষ পর্যন্ত সব কোর্সে ৩৩% পর্যন্ত ছাড়",
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
    course: "Basic to IELTS (In Batch)",
    batch: "Batch 315",
    band: "8.0",
    issued: "30 May 2025",
  },
  {
    id: "SIE-CERT-2402",
    name: "Anika Tasnim",
    course: "Basic to IELTS (Private Batch)",
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
    course: "Basic to IELTS (In Batch)",
    batch: "Batch 311",
    band: "7.0",
    issued: "30 May 2025",
  },
  {
    id: "SIE-CERT-2388",
    name: "Milon Mahmud",
    course: "Basic to IELTS (One to One)",
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
  { value: "complete", label: "IELTS Preparation" },
  { value: "beginner", label: "Spoken & Kids English" },
  { value: "exam", label: "Crash & Fast Track" },
] as const;

export const courses: Course[] = [
  {
    slug: "basic-to-ielts",
    title: "Basic to IELTS",
    titleBn: "বেসিক টু আইইএলটিস",
    desc: "আপনার IELTS প্রস্তুতির সেরা ফ্ল্যাগশিপ কোর্স! একদম শূন্য থেকে শুরু করে IELTS-এর ৪টি মডিউলের সম্পূর্ণ প্রস্তুতি, রেগুলার লাইভ ক্লাস ও মক টেস্ট।",
    lessons: 36,
    duration: "3 Months",
    price: 15000,
    oldPrice: 18000,
    tag: "Flagship / Best Seller",
    icon: "grad",
    features: [
      "36 Live Masterclasses",
      "Weekly Full Mock Tests",
      "Free Hardcopy Study Books",
      "Speaking Club Access",
      "One-to-One Writing Feedback",
    ],
    category: "complete",
    rating: 4.9,
    students: 3240,
    nextBatch: "Every Sunday",
    mode: "Online + Offline",
    scheduleNote: "Sat-Thu · 10:00AM-11:30AM + Thursday Weekly Mock",
    seatsLeft: 6,
    seatsTotal: 30,
    accessPeriod: "৩ মাস + পরীক্ষা পর্যন্ত রেকর্ডেড ক্লাস অ্যাক্সেস",
    syllabus: [
      "Foundation: Advanced Grammar & Vocabulary (4 weeks)",
      "Listening: Accents, note-taking & practice tests",
      "Reading: Skimming, scanning & all question types",
      "Writing: Task 1 graphs to Band 7+ essays",
      "Speaking: Daily clubs, interviews & fluency drills",
      "Final week: Full mock tests with band reports",
    ],
  },
  {
    slug: "ielts-premium",
    title: "IELTS Premium",
    titleBn: "আইইএলটিস প্রিমিয়াম",
    desc: "যাঁদের বেসিক ভালো এবং দ্রুত সময়ের মধ্যে হাই ব্যান্ড স্কোর (Band 7.5 - 8.5) প্রয়োজন, তাঁদের জন্য বিশেষ প্রিমিয়াম কেয়ার ও পার্সোনাল মেন্টরিং ব্যাচ।",
    lessons: 30,
    duration: "2.5 Months",
    price: 12000,
    oldPrice: 15000,
    tag: "Target Band 7.5+",
    icon: "target",
    features: [
      "Small Premium Batch",
      "Direct Mentor Feedback on Essays",
      "IDP Standard Mock Test Grading",
      "Exclusive Band 8+ Vocabulary & Templates",
      "Speaking 1-on-1 Assessment",
    ],
    category: "complete",
    rating: 5.0,
    students: 1680,
    nextBatch: "Every Tuesday",
    mode: "Online + Offline",
    scheduleNote: "Sun & Tue · 7:00PM-8:30PM + Mock Review",
    seatsLeft: 4,
    seatsTotal: 12,
    accessPeriod: "২.৫ মাস + পরীক্ষা পর্যন্ত ফুল অ্যাক্সেস",
    syllabus: [
      "Advanced Reading Strategies for 35+ Correct Answers",
      "Listening Section 3 & 4 Complex Audio Mastering",
      "Band 8.0 Writing Structures & Templates",
      "Speaking Part 1, 2, 3 Idiomatic Expressions & Natural Delivery",
      "Weekly Intensive Mock Tests & Personalized Feedback",
    ],
  },
  {
    slug: "ielts-crash-course",
    title: "IELTS Crash Course",
    titleBn: "আইইএলটিস ক্র্যাশ কোর্স",
    desc: "পরীক্ষা সন্নিকটে? দ্রুত সময়ে ৪টি মডিউলের শর্টকাট ট্রিকস, স্ট্র্যাটেজি এবং ইনটেনসিভ মক টেস্ট দিয়ে সর্বোচ্চ প্রস্তুতি নিশ্চিত করুন।",
    lessons: 18,
    duration: "4 Weeks",
    price: 15000,
    oldPrice: 18000,
    tag: "Fast Track / Intensive",
    icon: "zap",
    features: [
      "Exam Strategies & Shortcuts",
      "Intensive Full Mock Tests",
      "Time Management Skills",
      "Band Booster Sessions",
      "High-Frequency Question Practice",
    ],
    category: "exam",
    rating: 4.9,
    students: 1150,
    nextBatch: "Every Monday",
    mode: "Online + Offline",
    scheduleNote: "Mon & Wed · 6:00PM-7:30PM + Thursday Mock Review",
    seatsLeft: 7,
    seatsTotal: 20,
    accessPeriod: "১ মাস ইনটেনসিভ অ্যাক্সেস",
    syllabus: [
      "Week 1: All 4 module strategies & shortcuts",
      "Week 2: Question-type tricks (Reading & Listening)",
      "Week 3: Essay templates & speaking fluency",
      "Week 4: 4 full mock tests with band reports",
    ],
  },
  {
    slug: "spoken-english-course",
    title: "Spoken English Course",
    titleBn: "স্পোকেন ইংলিশ কোর্স",
    desc: "সহজ ও সাবলীলভাবে ইংরেজিতে কথা বলার সম্পূর্ণ কোর্স। দৈনন্দিন কথোপকথন, প্রেজেন্টেশন, উচ্চারণ ও ফ্লুয়েন্সি ডেভেলপমেন্ট।",
    lessons: 24,
    duration: "2 Months",
    price: 5000,
    oldPrice: 7500,
    tag: "Fluency Booster",
    icon: "users",
    features: [
      "24 Live Interactive Classes",
      "Daily Speaking Partner Practice",
      "Pronunciation & Accent Training",
      "Presentation & Interview Skills",
      "Free Digital Study Sheets",
    ],
    category: "beginner",
    rating: 4.9,
    students: 2450,
    nextBatch: "Every Saturday",
    mode: "Online + Offline",
    scheduleNote: "Sat & Wed · 6:30PM-8:00PM",
    seatsLeft: 10,
    seatsTotal: 35,
    accessPeriod: "২ মাস + রেকর্ডেড ক্লাস অ্যাক্সেস",
    syllabus: [
      "Module 1: Daily Conversation & Fluency Building",
      "Module 2: Essential Grammar in Speaking & Pronunciation",
      "Module 3: Vocabulary for Workplace, Travel & Social Life",
      "Module 4: Public Speaking, Presentation & Extempore",
    ],
  },
  {
    slug: "kid-english-course",
    title: "Kid English Course",
    titleBn: "কিড ইংলিশ কোর্স",
    desc: "ছোটদের জন্য আনন্দময় পরিবেশে ইংরেজি শেখার বিশেষ কোর্স। Phonics, Storytelling, বেসিক স্পোকেন ও আত্মবিশ্বাস বৃদ্ধি।",
    lessons: 36,
    duration: "3 Months",
    price: 8000,
    oldPrice: 10000,
    tag: "Kids Special (Age 5-14)",
    icon: "book",
    features: [
      "Fun & Interactive Animated Classes",
      "Phonics, Reading & Storytelling",
      "Basic Vocabulary & Grammar for Kids",
      "Parent-Teacher Progress Updates",
      "Child-Friendly Learning Materials",
    ],
    category: "beginner",
    rating: 5.0,
    students: 980,
    nextBatch: "Every Friday & Saturday",
    mode: "Online + Offline",
    scheduleNote: "Fri & Sat · 10:00AM-11:30AM",
    seatsLeft: 8,
    seatsTotal: 25,
    accessPeriod: "৩ মাস ক্লাস + এক্টিভিটি শিটস",
    syllabus: [
      "Phonics & Correct English Pronunciation",
      "Picture Storytelling & Roleplay Games",
      "Basic Sentence Formation & Speaking",
      "Creative Writing & Kids Public Speaking",
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
    scheduleNote: "Self-paced: learn anytime + join the weekly free live classes",
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
    desc: "IELTS মডিউল-ভিত্তিক ফ্রি ভিডিও ক্লাস, Facebook পেজে নিয়মিত আপলোড হয়। আজই দেখা শুরু করুন।",
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
    desc: "প্রতিটি প্রশ্ন টাইপের জন্য প্রমাণিত শর্টকাট। Reading, Listening, Writing ও Speaking টিপস পড়ুন।",
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
    courseSlug: "basic-to-ielts",
    batch: "Batch 318",
    topic: "Writing Task 1: Graphs & Charts",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Saturday",
    start: "6:00 PM",
    end: "8:00 PM",
    courseSlug: "basic-to-ielts",
    batch: "All Batches & Students",
    topic: "Weekly Full Mock Test & Assessment",
    mode: "Online + Offline",
    type: "Mock Test",
  },
  // Sunday
  {
    day: "Sunday",
    start: "10:00 AM",
    end: "11:30 AM",
    courseSlug: "basic-to-ielts",
    batch: "Batch 318",
    topic: "Listening: Accents & Note-taking",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Sunday",
    start: "7:00 PM",
    end: "8:30 PM",
    courseSlug: "ielts-premium",
    batch: "Batch 319-VIP",
    topic: "Target Band 8.0 Strategies + Individual Feedback",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Sunday",
    start: "8:00 PM",
    end: "9:00 PM",
    courseSlug: "free-course",
    batch: "Everyone",
    topic: "Free Live Class: Reading Tricks",
    mode: "Online Live",
    type: "Free Live Class",
  },
  // Monday
  {
    day: "Monday",
    start: "10:00 AM",
    end: "11:30 AM",
    courseSlug: "basic-to-ielts",
    batch: "Batch 318",
    topic: "Reading: Skimming & Scanning",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Monday",
    start: "6:00 PM",
    end: "7:30 PM",
    courseSlug: "ielts-crash-course",
    batch: "Batch 320-C",
    topic: "Module Strategies & Fast-Track Shortcuts",
    mode: "Online Live",
    type: "Regular Class",
  },
  // Tuesday
  {
    day: "Tuesday",
    start: "10:00 AM",
    end: "11:30 AM",
    courseSlug: "basic-to-ielts",
    batch: "Batch 318",
    topic: "Speaking: Cue Cards & Fluency",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Tuesday",
    start: "7:00 PM",
    end: "8:30 PM",
    courseSlug: "ielts-premium",
    batch: "Batch 319-VIP",
    topic: "Writing Task 2 Band 8+ Workshop",
    mode: "Hybrid",
    type: "Regular Class",
  },
  // Wednesday
  {
    day: "Wednesday",
    start: "10:00 AM",
    end: "11:30 AM",
    courseSlug: "basic-to-ielts",
    batch: "Batch 318",
    topic: "Writing Task 2: Band 7+ Essays",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Wednesday",
    start: "6:00 PM",
    end: "7:30 PM",
    courseSlug: "ielts-crash-course",
    batch: "Batch 320-C",
    topic: "Question-type Tricks: Reading & Listening",
    mode: "Online Live",
    type: "Regular Class",
  },
  {
    day: "Wednesday",
    start: "6:30 PM",
    end: "8:00 PM",
    courseSlug: "spoken-english-course",
    batch: "Batch 321-SE",
    topic: "Fluency Drills & Workplace Vocabulary",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Wednesday",
    start: "8:00 PM",
    end: "9:00 PM",
    courseSlug: "free-course",
    batch: "Everyone",
    topic: "Free Live Class: Essay Checking Live",
    mode: "Online Live",
    type: "Free Live Class",
  },
  // Thursday
  {
    day: "Thursday",
    start: "10:00 AM",
    end: "11:30 AM",
    courseSlug: "basic-to-ielts",
    batch: "Batch 318",
    topic: "Module Review & Problem Solving Session",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Thursday",
    start: "4:00 PM",
    end: "5:30 PM",
    courseSlug: "ielts-crash-course",
    batch: "Batch 320-C",
    topic: "Mock Review & Band Report Analysis",
    mode: "Online Live",
    type: "Feedback Session",
  },
  // Friday
  {
    day: "Friday",
    start: "10:00 AM",
    end: "11:30 AM",
    courseSlug: "kid-english-course",
    batch: "Batch 322-Kids",
    topic: "Phonics, Storytelling & Fun Games",
    mode: "Hybrid",
    type: "Regular Class",
  },
  {
    day: "Friday",
    start: "10:00 PM",
    end: "11:30 PM",
    courseSlug: "free-course",
    batch: "All Students & Visitors",
    topic: "Online Free Live Masterclass with Sadia Ma'am",
    mode: "Online Live",
    type: "Free Live Class",
  },
];

export const routineNote = {
  title: "Routine পরিবর্তন হতে পারে",
  message:
    "সরকারি ছুটি বা বিশেষ অনুষ্ঠানের কারণে class time পরিবর্তন হলে আপনার WhatsApp গ্রুপে জানিয়ে দেওয়া হয়। Zoom/Facebook লিংক সবসময় গ্রুপে পাবেন।",
};

/** 10MS-style free live classes funnel — open to everyone, no enrollment needed. */
export const freeLiveClasses = [
  {
    title: "অনলাইন ফ্রি লাইভ ক্লাস: IELTS Masterclass & Live Q&A",
    when: "প্রতি শুক্রবার, রাত ১০:০০ টা",
    platform: "Facebook / Zoom Live",
    host: "Sadia Rahman (TKT Certified)",
    ctaLabel: "Watch on Facebook",
    href: site.facebook,
    external: true,
  },
  {
    title: "উইকলি ফুল মক টেস্ট ও ব্যান্ড অ্যাসেসমেন্ট",
    when: "প্রতি শনিবার, সন্ধ্যা ৬:০০ টা",
    platform: "Student Portal / Zoom",
    host: "Sadia's IELTS Academic Team",
    ctaLabel: "Join Mock Test",
    href: "#/portal",
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
    role: "Founder & CEO, TKT Certified IELTS Trainer",
    tagline: "Cambridge TKT certified, ৯ বছরে ৩,০০০-র বেশি শিক্ষার্থীর নিজের হাতে প্রস্তুতি ও ক্যারিয়ার মেন্টরিং।",
    photo: "/images/team/sadia-rahman.jpg",
    chip: "bg-pastel-butter text-[#7a5a16]",
    bio: [
      "২০১৬ সালে Sreemangal-এর একটা ছোট রুম দিয়ে শুরু, তখন ছয়জন শিক্ষার্থী। আজ ৩১৬-র বেশি ব্যাচ শেষ হয়েছে, কিন্তু নিয়ম একটাই: প্রতিটি শিক্ষার্থীর mock test-এর খাতা নিজের হাতে দেখা, আর পরীক্ষার আগে শেষ কথাটা নিজে বলা।",
      "Cambridge TKT সার্টিফাইড ইন্সট্রাক্টর হিসেবে ব্রিটিশ কাউন্সিল ও IDP স্ট্যান্ডার্ডে শিক্ষার্থীদের সর্বোচ্চ ব্যান্ড স্কোর অর্জনে নিবিড়ভাবে মেন্টরিং প্রদান করেন।",
      "Sreemangal-এ থেকে বড় শহরে না গিয়েও শিক্ষার্থীরা প্রমাণ করেছে, সঠিক গাইডলাইন থাকলে Band 7+ শহর-মহল্লা দেখে না। এটাই Sadia's IELTS-এর ভিত।",
    ],
    specialties: ["Writing Task 2", "Mock Assessment", "Study Plan", "Speaking Feedback"],
    credentials: [
      "Cambridge TKT Certified IELTS Trainer",
      "Founder & CEO, Sadia's IELTS",
      "Personal Band 8.5, perfect 9.0 in Reading & Listening",
      "9+ years teaching, 3,000+ students mentored",
    ],
    stats: [
      { value: "9+", label: "Years teaching" },
      { value: "3,000+", label: "Students mentored" },
      { value: "8.5", label: "Personal band" },
    ],
    quote: "IELTS-এ লুকোচুরি চলে না। যে দুর্বলতা আপনি স্বীকার করবেন, সেটাই আমরা প্রথমে ঠিক করব।",
  },
  {
    slug: "arpa-rani-paul",
    name: "Arpa Rani Paul",
    role: "Spoken English Instructor",
    tagline: "স্পোকেন ইংলিশের ভয় দূর করে ফ্লুয়েন্সি ও ন্যাচারাল স্পিকিং তৈরির দক্ষ প্রশিক্ষক।",
    photo: "/images/team/arpa-rani-paul.jpg",
    chip: "bg-pastel-green text-[#1f5c40]",
    bio: [
      "বেশিরভাগ শিক্ষার্থীর মনে জড়তা ও ভয় থাকে কথা বলার ক্ষেত্রে। Arpa ম্যামের স্পোকেন ক্লাসে বন্ধুত্বপূর্ণ পরিবেশে বাস্তব কথোপকথন ও নিয়মিত ড্রিলের মাধ্যমে জড়তা কেটে যায়।",
      "দৈনন্দিন জীবনের প্রয়োজনীয় ভোকাবুলারি, সঠিক উচ্চারণ এবং স্পিকিং পার্টনার প্র্যাকটিসের মাধ্যমে শিক্ষার্থীদের আত্মবিশ্বাস বাড়িয়ে তোলেন।",
    ],
    specialties: ["Spoken English", "Pronunciation", "Fluency Drills", "Interactive Sessions"],
    credentials: [
      "Spoken English Specialist",
      "BA & MA in English",
      "Experienced in Interactive Language Coaching",
    ],
    stats: [
      { value: "4+", label: "Years teaching" },
      { value: "1,500+", label: "Spoken sessions" },
      { value: "100%", label: "Confidence boost" },
    ],
    quote: "ইংরেজি বলা কঠিন কিছু নয়, সঠিক পরিবেশ ও নিয়মিত চর্চায় যেকোনো শিক্ষার্থী অনর্গল কথা বলতে পারে।",
  },
  {
    slug: "mahbub-masud",
    name: "Mahbub Masud",
    role: "Co-Instructor of IELTS",
    tagline: "IELTS স্ট্র্যাটেজি, রিডিং স্ক্যানিং ও লিসেনিং হ্যাকসে পারদর্শী নিবেদিতপ্রাণ মেন্টর।",
    photo: "/images/team/mahbub-masud.jpg",
    chip: "bg-pastel-sky text-[#2c4f8a]",
    bio: [
      "IELTS পরীক্ষার ৪টি মডিউলের খুঁটিনাটি ও ক্যামব্রিজ প্র্যাকটিস টেস্ট সলভিংয়ে শিক্ষার্থীদের হাতে-কলমে সমাধান দেন।",
      "বিশেষ করে রিডিং প্যাসেজের টাইম ম্যানেজমেন্ট এবং লিসেনিংয়ের জটিল অডিও সেকশনে শিক্ষার্থীদের শর্টকাট টেকনিক শিখিয়ে স্কোর বাড়াতে সহায়তা করেন।",
    ],
    specialties: ["IELTS Reading", "Listening Hacks", "Mock Evaluation", "Problem Solving"],
    credentials: [
      "Co-Instructor of IELTS",
      "IELTS Specialist Trainer",
      "Experienced in Cambridge Module Analysis",
    ],
    stats: [
      { value: "5+", label: "Years experience" },
      { value: "2,000+", label: "Hours taught" },
      { value: "8.0", label: "Module score" },
    ],
    quote: "নিয়মিত প্র্যাকটিস ও সঠিক কৌশল জানলে IELTS পরীক্ষায় কাঙ্ক্ষিত ব্যান্ড পাওয়া সম্ভব।",
  },
  {
    slug: "prohor-das",
    name: "Prohor Das",
    role: "Instructor of IELTS",
    tagline: "রাইটিং স্ট্রাকচার ও স্পিকিং পার্ট ১-৩ এর নিবিড় মূল্যায়ন এবং মক টেস্ট স্পেশালিস্ট।",
    photo: "/images/team/prohor-das.jpg",
    chip: "bg-pastel-orange text-[#7a4c12]",
    bio: [
      "শিক্ষার্থীদের রাইটিং টাস্ক ১ ও ২-এর ব্যাকরণগত নির্ভুলতা এবং আইডিয়া ডেভেলপমেন্টে নিয়মিত ফিডব্যাক প্রদান করেন।",
      "মক টেস্টে শিক্ষার্থীদের দুর্বলতা চিহ্নিত করে পরীক্ষার আগে ওয়ান-টু-ওয়ান গাইডলাইন দেন যাতে তারা পরীক্ষায় পূর্ণ আত্মবিশ্বাস নিয়ে বসতে পারে।",
    ],
    specialties: ["Writing Feedback", "Speaking Evaluation", "Mock Testing", "Grammar & Vocab"],
    credentials: [
      "Instructor of IELTS",
      "Specialist in Writing Assessment & Speaking Drills",
    ],
    stats: [
      { value: "4+", label: "Years teaching" },
      { value: "3,000+", label: "Essays evaluated" },
      { value: "8.0", label: "Band target hit" },
    ],
    quote: "ভুল শুধরে নেওয়াতেই দ্রুত উন্নতি সম্ভব। প্রতিটি মকে নতুন কিছু শেখাটাই সাফল্যের চাবিকাঠি।",
  },
  {
    slug: "hridoy-roy",
    name: "Hridoy Roy",
    role: "Operations Associate",
    tagline: "ব্যাচ ম্যানেজমেন্ট, পোর্টাল সাপোর্ট ও শিক্ষার্থীদের স্মুথ অ্যাকাডেমিক অপারেশনের দায়িত্বপ্রাপ্ত।",
    photo: "/images/team/hridoy-roy.jpg",
    chip: "bg-pastel-ruby text-[#7a2734]",
    bio: [
      "ক্লাসের শিডিউল, স্টুডেন্ট পোর্টাল সাপোর্ট, বই ও স্টাডি ম্যাটেরিয়ালস সময়মতো শিক্ষার্থীদের কাছে পৌঁছে দেওয়া নিশ্চিত করেন।",
      "শিক্ষার্থীদের যেকোনো টেকনিক্যাল বা অ্যাডমিশন সংক্রান্ত প্রয়োজনে সার্বক্ষণিক সহায়তা প্রদান করেন।",
    ],
    specialties: ["Academic Operations", "Student Support", "Portal Management", "Batch Coordination"],
    credentials: [
      "Operations Associate",
      "Specialist in Student Academic Coordination & Care",
    ],
    stats: [
      { value: "3+", label: "Years with us" },
      { value: "5,000+", label: "Students assisted" },
      { value: "24/7", label: "Support readiness" },
    ],
    quote: "শিক্ষার্থীদের ক্লাসের অভিজ্ঞতা ও পড়াশোনার পথকে সহজ ও নির্বিঘ্ন করাই আমাদের লক্ষ্য।",
  },
];

/** 10MS "choose your batch" board — next admission batches per course. */
export const upcomingBatches = [
  {
    courseSlug: "basic-to-ielts",
    course: "Basic to IELTS",
    batch: "Batch 318",
    starts: "Every Sunday",
    time: "10:00AM-11:30AM",
    seats: "12 seats left",
    mode: "Online + Offline",
  },
  {
    courseSlug: "ielts-premium",
    course: "IELTS Premium",
    batch: "Batch 319-VIP",
    starts: "Every Tuesday",
    time: "7:00PM-8:30PM",
    seats: "4 seats left",
    mode: "Online + Offline",
  },
  {
    courseSlug: "ielts-crash-course",
    course: "IELTS Crash Course",
    batch: "Batch 320-C",
    starts: "Every Monday",
    time: "6:00PM-7:30PM",
    seats: "8 seats left",
    mode: "Online + Offline",
  },
  {
    courseSlug: "spoken-english-course",
    course: "Spoken English Course",
    batch: "Batch 321-SE",
    starts: "Every Saturday",
    time: "6:30PM-8:00PM",
    seats: "10 seats left",
    mode: "Online + Offline",
  },
  {
    courseSlug: "kid-english-course",
    course: "Kid English Course",
    batch: "Batch 322-Kids",
    starts: "Every Friday",
    time: "10:00AM-11:30AM",
    seats: "8 seats left",
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
    title: "Weekly full mock: Thursday, 10:00 AM",
    body: "প্রতি বৃহস্পতিবার ফুল-লেন্থ mock test (10AM-12PM)। উপস্থিত থাকা আবশ্যক, band report ক্লাসেই আলোচনা করা হবে।",
  },
  {
    date: "05 Sep",
    tag: "Speaking Club",
    title: "Saturday Speaking Club, সব ব্যাচের জন্য খোলা",
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
    title: "Writing Task 2: Essay Structure Bank",
    desc: "চার ধরনের প্রশ্নের জন্য রেডি স্কেলিটন আর band 7+ সেন্টেন্স ফ্রেম।",
    category: "writing",
    type: "PDF",
    size: "10 KB",
    href: "/downloads/writing-task-2-structures.pdf",
  },
  {
    id: "task1-sentences",
    title: "Academic Task 1: Sentence Bank",
    desc: "Introduction, overview আর trend-language, যেকোনো চার্টে মানিয়ে নেওয়ার মতো।",
    category: "writing",
    type: "PDF",
    size: "6 KB",
    href: "/downloads/academic-task-1-sentence-bank.pdf",
  },
  {
    id: "speaking-cue-cards",
    title: "Speaking Cue Card Bank: 24 Topics",
    desc: "প্রতিদিন একটা করে কার্ড প্র্যাকটিস করুন, ৬০ সেকেন্ডের প্ল্যানিং ফ্রেমসহ।",
    category: "speaking",
    type: "PDF",
    size: "7 KB",
    href: "/downloads/speaking-cue-card-bank.pdf",
  },
  {
    id: "band7-vocab",
    title: "Band 7+ Vocabulary & Collocations",
    desc: "টপিক-ভিত্তিক কোলোকেশন আর মডেল সেন্টেন্স। শব্দ নয়, চাঙ্ক শিখুন।",
    category: "vocabulary",
    type: "PDF",
    size: "7 KB",
    href: "/downloads/band-7-vocabulary-collocations.pdf",
  },
  {
    id: "answer-sheet",
    title: "Listening & Reading Answer Sheet",
    desc: "প্রিন্ট করে প্রতি mock-এ ব্যবহার করুন, অফিসিয়াল লেআউটে ৪০টা করে ঘর।",
    category: "mock-tools",
    type: "PDF",
    size: "6 KB",
    href: "/downloads/listening-reading-answer-sheet.pdf",
  },
  {
    id: "mock-day-checklist",
    title: "Mock Day Checklist & Timing Plan",
    desc: "টেস্টের আগের রাত থেকে শেষ চেকিং পর্যন্ত, band 8+ শিক্ষার্থীদের রুটিন।",
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
    en: "From Task 1 graphs to Band 7+ essays, with structured feedback on every writing.",
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
    desc: "A higher IELTS score means bigger scholarships. We prepare you to win them.",
  },
  {
    icon: "briefcase",
    title: "Enhanced Career Prospects",
    desc: "IELTS certification boosts your CV and career both at home and abroad.",
  },
  {
    icon: "message",
    title: "Confidence in Communication",
    desc: "Beyond the exam, speak English with confidence in real life, interviews and workplace.",
  },
];

export const tips = [
  {
    icon: "lightbulb",
    category: "IELTS Reading",
    title: "List of Headings: Top 10 Short Tricks",
    excerpt:
      "প্রথমে সবগুলো Heading ভালোভাবে পড়ে নিন passage পড়ার আগেই, তাহলে বুঝবেন কোন ধরনের information খুঁজতে হবে।",
  },
  {
    icon: "target",
    category: "IELTS Reading",
    title: "MCQ: Top 10 Short Tricks",
    excerpt:
      "Question First, Passage Later! প্রথমে প্রশ্ন পড়ুন, তারপর passage-এ যান, অপ্রয়োজনীয় তথ্য এড়িয়ে সময় বাঁচান।",
  },
  {
    icon: "zap",
    category: "IELTS Reading",
    title: "Short Answer Questions: Top 10 Tricks",
    excerpt:
      "আগে সব প্রশ্ন পড়ুন, তারপর passage স্ক্যান করুন target-wise, সঠিক কীওয়ার্ড খুঁজে দ্রুত উত্তর লিখুন।",
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
    course: "Basic to IELTS (In Batch)",
    date: "30 May 2025",
    quote:
      "আমার জীবনের সেরা সিদ্ধান্ত ছিল Sadia's IELTS-এ ভর্তি হওয়া। Your commitment and consistent effort have led to this amazing achievement. This is what my teacher told me, and it's true!",
  },
  {
    name: "Anika Tasnim",
    band: "Band 7.5",
    score: 7.5,
    course: "Basic to IELTS (Private Batch)",
    date: "30 May 2025",
    quote:
      "Sadia apa's Reading short tricks saved me so much time in the exam. The personal feedback on every writing was priceless. Band 7.5 became possible.",
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
    course: "Basic to IELTS (In Batch)",
    date: "30 May 2025",
    quote:
      "From basic grammar to Band 7, the journey was structured step by step. ব্যাচের সবাই একসাথে এগিয়ে যাওয়ায় motivation কখনো কমেনি।",
  },
  {
    name: "Mahmuda Akter Eva",
    band: "Band 7.0",
    score: 7.0,
    course: "Basic to IELTS (In Batch)",
    date: "06 Jun 2025",
    quote:
      "One-to-one feedback on my essays fixed mistakes I never knew I made. We are proud to be a part of your journey, and I am proud to be their student.",
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
    course: "Basic to IELTS (One to One)",
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
    title: "IELTS Reading: Top 10 Short Tricks",
    titleBn: "আইইএলটিস রিডিং: টপ ১০ শর্ট ট্রিকস",
    author: "Sadia Rahman",
    desc:
      "List of Headings, MCQ, Short Answer সহ প্রতিটি question type-এর জন্য প্রমাণিত shortcut ও time-management কৌশল, বাংলা ব্যাখ্যাসহ।",
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
    title: "IELTS Writing Task 2: Band 7+ Handbook",
    titleBn: "রাইটিং টাস্ক ২: ব্যান্ড ৭+ হ্যান্ডবুক",
    author: "Sadia Rahman",
    desc:
      "Essay structure, idea generation থেকে Band 7+ linking words, ready-made templates ও 40+ checked model essays সহ।",
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
    title: "IELTS Speaking: Cue Card Bank & Fluency Guide",
    titleBn: "স্পিকিং: কিউ কার্ড ব্যাংক ও ফ্লুয়েন্সি গাইড",
    author: "Sadia Rahman",
    desc:
      "Latest cue card bank (Part 1-3), sample answers ও fluency drills, follow-up questions এর সহজ উত্তর কৌশলসহ।",
    price: 400,
    category: "speaking",
    cover: "/images/books/speaking-bank.png",
    pages: 88,
    highlights: ["150+ cue cards", "Part 1-3 samples", "Fluency drill plan"],
  },
  {
    slug: "vocabulary-builder",
    title: "IELTS Vocabulary Builder: 3000+ Academic Words",
    titleBn: "ভোকাবুলারি বিল্ডার: ৩০০০+ একাডেমিক শব্দ",
    author: "Sadia Rahman",
    desc:
      "Topic-wise academic word list, synonym banks ও collocations। Writing ও Speaking-এ band বাড়ানোর সবচেয়ে কার্যকর অস্ত্র।",
    price: 500,
    oldPrice: 650,
    category: "vocabulary",
    cover: "/images/books/vocabulary.png",
    pages: 140,
    highlights: ["3000+ words", "Topic-wise synonym bank", "Collocation lists"],
  },
  {
    slug: "listening-workbook",
    title: "IELTS Listening: Accent & Note-taking Workbook",
    titleBn: "লিসেনিং: অ্যাকসেন্ট ও নোট-টেকিং ওয়ার্কবুক",
    author: "Sadia Rahman",
    desc:
      "British/Australian accent training, spelling traps ও map-labelling practice। প্রতিটি section-এর জন্য step-by-step strategy।",
    price: 450,
    category: "listening",
    cover: "/images/books/listening.png",
    pages: 104,
    highlights: ["Accent training audio list", "Map & diagram practice", "Spelling trap guide"],
  },
  {
    slug: "grammar-foundation",
    title: "Basic Grammar Foundation: Pre-IELTS Starter",
    titleBn: "বেসিক গ্রামার ফাউন্ডেশন: প্রি-আইইএলটিস",
    author: "Sadia Rahman",
    desc:
      "একদম শূন্য থেকে English grammar, tense, sentence structure ও daily practice sheets, IELTS-এর আগে ভিত মজবুত করার জন্য।",
    price: 350,
    category: "vocabulary",
    cover: "/images/books/grammar.png",
    tag: "Beginner",
    pages: 76,
    highlights: ["Tense made easy", "Daily practice sheets", "Bengali instruction"],
  },
  {
    slug: "mock-test-pack",
    title: "IELTS Mock Test Pack: 10 Full Tests",
    titleBn: "মক টেস্ট প্যাক: ১০টি ফুল টেস্ট",
    author: "Sadia's IELTS Team",
    desc:
      "10 full-length mock tests with answer keys ও self-band-assessment guide, পরীক্ষার হলের অভ্যাস বাড়িতেই।",
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
    title: "Complete IELTS Bundle: All 5 Books + Mock Pack",
    titleBn: "কমপ্লিট আইইএলটিস বান্ডেল: সব বই একসাথে",
    author: "Sadia Rahman",
    desc:
      "Reading, Writing, Speaking, Listening, Vocabulary + Mock Pack, সম্পূর্ণ প্রস্তুতি এক প্যাকেজে। বান্ডেলে সবচেয়ে বেশি সাশ্রয়!",
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
    q: "আমার English একদম basic, আমি কি ভর্তি হতে পারব?",
    a: "অবশ্যই! এজন্যই আমাদের 'Spoken English Course' ও 'Basic to IELTS' কোর্স। ৯ বছরে হাজারো শিক্ষার্থী একদম শূন্য থেকে Band 7+ অর্জন করেছে। আপনার current level বুঝতে ফ্রি assessment-এ যোগ দিন।",
  },
  {
    q: "ক্লাসগুলো কি অনলাইনে নাকি অফলাইনে হয়?",
    a: "দুটোই! আমাদের ক্যাম্পাসে অফলাইন ব্যাচ চলে (Sreemangal, Chowmuhona), এবং সারাদেশ থেকে অনলাইনে ক্লাসে অংশ নেওয়া যায়। ওয়ান-টু-ওয়ান কেয়ারের সুবিধামতো সময় বেছে নিতে পারবেন।",
  },
  {
    q: "কোর্স ফি কত এবং কীভাবে পরিশোধ করব?",
    a: "আমাদের অফিশিয়াল কোর্স ফি: Spoken English ৫,০০০ টাকা, Kid English ৮,০০০ টাকা, IELTS Premium ১২,০০০ টাকা, Basic to IELTS ১৫,০০০ টাকা এবং IELTS Crash Course ১৫,০০০ টাকা। bKash/Nagad/Rocket/Bank Transfer-এ পরিশোধ করা যায়। বিস্তারিত জানতে কল করুন +880 1752-716238।",
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
  { value: "not-sure", label: "Not sure yet, need counseling" },
  ...courses.map((c) => ({ value: c.slug, label: c.title })),
];
