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

export const navLinks = [
  { label: "Home", href: "#/" },
  { label: "Courses", href: "#/courses" },
  { label: "Class Routine", href: "#/routine" },
  { label: "About", href: "#/about" },
  { label: "Free Tips", href: "#/tips" },
  { label: "Stories", href: "#/stories" },
  { label: "Contact", href: "#/contact" },
];

/** Dismissible promo strip above the nav — 10MS-style announcement bar. */
export const promoBar = {
  message: "🎉 নতুন ব্যাচে ভর্তি চলছে! Admission offer — up to 33% off on all courses",
  ctaLabel: "Enroll Now",
  ctaHref: "#/checkout",
};

export const paymentMethods = ["bKash", "Nagad", "Rocket", "Bank Transfer", "Cash"];

export const stats = [
  { value: 9, suffix: "+", label: "Years of Experience" },
  { value: 316, suffix: "+", label: "Batches Completed" },
  { value: 5983, suffix: "+", label: "Successful Learners" },
  { value: 17, suffix: "", label: "Courses Published" },
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

/** Student Portal — downloadable class materials (demo library). */
export const portalMaterials = [
  { icon: "file-text", label: "Class Notes & Slide Deck", meta: "PDF · 4.2 MB" },
  { icon: "headphones", label: "Listening Practice Pack 1–5", meta: "Audio · ZIP" },
  { icon: "book-open", label: "Reading Passage Collection", meta: "PDF · 6.8 MB" },
  { icon: "pen", label: "Writing Task 1 & 2 Templates", meta: "PDF · 1.1 MB" },
  { icon: "mic", label: "Speaking Cue Card Bank", meta: "PDF · 2.3 MB" },
  { icon: "clipboard-check", label: "Mock Test Question Bank", meta: "PDF · 3.0 MB" },
];

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

export const stories = [
  {
    name: "Anika Tasnim",
    band: "Band 8.0",
    course: "Basic to IELTS — In Batch",
    quote:
      "The regular mock tests and speaking practice completely changed my confidence. I never imagined scoring Band 8!",
  },
  {
    name: "Fariha Islam",
    band: "Band 7.5",
    course: "Basic to IELTS — Private Batch",
    quote:
      "Sadia apa's tricks for Reading saved me so much time in the exam. The personal feedback on writing was priceless.",
  },
  {
    name: "Milon Mahmud",
    band: "Band 7.5",
    course: "Basic to IELTS — One to One",
    quote:
      "One-to-one classes fit perfectly around my job. Flexible timing and a mentor who truly cares about your result.",
  },
  {
    name: "Mahmuda Akter Eva",
    band: "Band 7.0",
    course: "Basic to IELTS — In Batch",
    quote:
      "From basic grammar to Band 7 — the journey was structured step by step. Best decision of my life!",
  },
  {
    name: "Emran Ahmed",
    band: "Band 7.0",
    course: "IELTS Crash Course",
    quote:
      "I had only one month before my exam. The crash course strategies helped me hit my target score on the first attempt.",
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
