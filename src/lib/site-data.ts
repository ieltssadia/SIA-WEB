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
  email: "support@sadiasielts.com",
  email2: "ieltsbysadianisha@gmail.com",
  address:
    "Syed Mujibur Rahman Market (2nd Floor), Chowmuhona, Sreemangal, Moulvibazar, Sylhet 3210",
  addressShort: "Sreemangal, Moulvibazar, Sylhet",
  facebook: "https://www.facebook.com/Sadiasielts",
  website: "https://sadiasielts.com",
};

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Courses", href: "#courses" },
  { label: "Why Us", href: "#why-us" },
  { label: "Free Tips", href: "#tips" },
  { label: "Success Stories", href: "#stories" },
  { label: "FAQ", href: "#faq" },
];

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
};

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
  },
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
