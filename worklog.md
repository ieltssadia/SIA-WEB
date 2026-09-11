# Worklog

---
Task ID: 1
Agent: Z.ai Code (main)
Task: Build a new website for Sadia's IELTS (sadiasielts.com), referencing 10minuteschool.com structure

Work Log:
- Researched client site sadiasielts.com via page_reader: extracted courses, pricing (৳), stats (9+ yrs, 316+ batches, 5,983 learners, 17 courses), contact info, blog tips, success story names
- Downloaded client logo (black + gold) → public/sadia-logo.png; confirmed brand identity
- 10minuteschool.com blocked by Cloudflare; used known edtech layout patterns instead
- Generated 3 AI images matching black/gold brand: hero student, instructor portrait (Sadia Rahman), classroom (public/images/)
- Updated prisma/schema.prisma: replaced User/Post demo models with Lead model (name, phone, email, course, message, status); ran db:push
- Redesigned globals.css: premium black & gold theme (#0a0a0c bg, #d4af37 gold primary), custom @utility classes (text-gold-gradient, bg-gold-gradient, bg-radial-glow) — note: Tailwind 4 requires @utility, not @layer utilities
- layout.tsx: Playfair Display (display serif) + Geist + Noto Sans Bengali fonts, SEO metadata for Sadia's IELTS
- Built components (src/components/site/): site-header (sticky, topbar, mobile Sheet), hero (animated, floating badges), stats-strip (count-up counters), courses-section (6 real courses, ৳ pricing, discounts, preselect-on-enroll), skills-section (4 modules, Bengali), why-us-section (classroom image + 4 benefits), tips-section (real blog tricks), stories-section (embla carousel, real student names), instructor-section (Sadia Rahman bio), faq-section (accordion, Bengali), enroll-section (lead form), site-footer (link columns, contact strip)
- Zustand store (enroll-store.ts) lets course cards pre-select the course in the enroll form
- API: POST /api/leads with zod validation, Prisma persistence
- Fixed issues during verification: missing Reveal import; Tailwind 4 @layer utilities → @utility syntax; Radix Sheet useId hydration mismatch → mount-gated Sheet via useSyncExternalStore; lint rule against sync setState in effect → rAF callback
- Verified with agent-browser: hero/courses/skills/why-us/tips/stories/faq/enroll/footer all render; FAQ accordion opens; carousel next works; course Enroll preselects form; form submission → 201 + lead persisted in DB (verified via Prisma query); invalid API input → 400 with field issues; mobile 390px layout + mobile menu work; footer sits flush at page bottom; zero console/server errors

Stage Summary:
- Complete single-page marketing site for Sadia's IELTS in brand black/gold, bilingual (English + Bengali)
- Real client data used throughout (courses, prices, stats, tips, testimonials, contacts)
- Working lead capture: form → POST /api/leads → SQLite (Lead table)
- All interactions browser-verified; lint clean; no hydration or runtime errors

---
Task ID: 2
Agent: Z.ai Code (main)
Task: Upgrade Sadia's IELTS site with 10minuteschool.com-style features (user emphasized 10MS as feature reference)

Work Log:
- 10minuteschool.com still Cloudflare-blocked (page_reader empty, agent-browser stuck on "Just a moment..."); used web_search instead — confirmed 10MS pillars: English Centre/IELTS focus, free classes content funnel, course categories, batch-based selling, payments (bKash/Nagad), 17M+ learners social proof
- site-data.ts: added WhatsApp link (wa.me), promoBar config, paymentMethods, courseCategories (all/complete/beginner/exam); extended Course type with category, rating, students, nextBatch, mode, syllabus[] — filled real-ish values for all 6 courses; added freeResources array (video lessons / free mock / tips)
- courses-section.tsx rebuilt: 10MS-style category filter tabs (gold pill active state), cards now show ★rating + "2.1k+ students" social proof, next-batch strip, mode; "View course details & syllabus" opens a Dialog (10MS course-page style): gradient header with badge, rating/enrolled/lessons/duration row, next batch + class mode fact cards, what-you-get, numbered course outline, price + Enroll/Call-to-Enroll CTA that preselects the course in the enroll form via Zustand
- New free-resources-section.tsx: 3 free-resource cards (Watch on Facebook → external, Book Free Mock Test → enroll form w/ free-course preselect, Read the Tips → #tips) + Bengali free-to-paid funnel strip with See All Courses / Ask on WhatsApp CTAs
- New floating-cta.tsx: WhatsApp (green) + Call Now (gold) floating pills, icon-only 48px circles on mobile / labeled pills on desktop, fades in after 480px scroll
- site-header.tsx: dismissible gold promo announcement bar (Bengali "নতুন ব্যাচে ভর্তি চলছে! up to 33% off") with Enroll CTA pill; promo bar + top contact strip both collapse (max-h transition) on scroll so sticky nav stays compact
- site-footer.tsx: "Easy Payment Via" strip with bKash/Nagad/Rocket/Bank Transfer/Cash badges; copyright row padded (sm:px-28 lg:px-36) so floating CTAs never overlap Privacy/Terms/Sitemap
- page.tsx: added FreeResourcesSection (after courses, 10MS free-content funnel position) + FloatingCta
- Fixed: Radix "Missing Description" dev warning via aria-describedby={undefined} on DialogContent; removed stray imports
- Browser verification: promo bar renders + dismisses; tabs filter correctly (Beginners→2 courses, Exam→1 course); dialog opens with syllabus, paid course Enroll preselects form ("Basic to IELTS — In Batch" confirmed in combobox), price-null course shows Call-to-Enroll; form submit → 201 + DB INSERT; floating CTAs appear on scroll; footer payment strip renders; mobile 390px: promo truncates+dismisses, tabs wrap, menu sheet works, payment badges stack, no overlap; zero console errors after fix; lint clean; final HTTP 200

Stage Summary:
- Site now mirrors 10MS feature set: promo bar, categorized course catalog with ratings/enrolled/next-batch, course detail modals, free resources funnel, floating WhatsApp/call CTA, payment trust strip
- All new interactions browser-verified on desktop + 390px mobile; lead flow re-verified end-to-end

---
Task ID: 3
Agent: Z.ai Code (main)
Task: Convert single-page site into multipage architecture (user request: "make it multipage")

Work Log:
- Constraint: sandbox preview only serves "/", so implemented hash-based multipage router (real path routes not servable here); pages behave like real routes — browser back/forward works, deep links load cold, links shareable
- New src/lib/router.ts: useHashRoute (useSyncExternalStore, hydration-safe: SSR "/", re-syncs post-mount), navigate(), routeSegments(); legacy "#section" anchors normalized to home + smooth-scroll
- New src/components/site/page-header.tsx: inner-page hero with breadcrumb (Home / Courses / title), eyebrow, serif title, gold glows
- site-router.tsx (client shell): route switch — "/" Home, "/courses", "/courses/[slug]", "/about", "/tips", "/stories", "/contact"; scroll restoration effect on rawHash (legacy anchors scrollIntoView with retry, page changes scroll to top instant); unknown course slug → friendly not-found page
- pages/: home-page (Hero, Stats, CoursesSection featured=3 + View All, FreeResources, Skills, Stories carousel, FAQ, new CTA banner), courses-page (PageHeader + full grid + tabs), course-detail-page (breadcrumb header, meta strip, About/What You Get/numbered Course Outline, instructor mini card, sticky price sidebar with facts + Enroll/WhatsApp CTAs + related courses), about-page (Instructor + WhyUs + Stats), tips-page, stories-page (grid of all stories + FB CTA banner), contact-page (PageHeader + EnrollSection)
- courses-section.tsx: removed Dialog; CourseCard links to "#/courses/[slug]" (title + details link); Enroll buttons → "#/contact" with setCourse preselect; added featured prop (home variant); exported courseIconMap
- Rewired all links: navLinks (Home/Courses/About/Free Tips/Stories/Contact), promoBar → #/contact, hero CTAs, free-resources CTAs + data hrefs, instructor/why-us section CTAs, footer columns (course links → detail pages, FAQs kept as legacy #faq anchor); header logo → #/
- site-header: active-route highlighting (aria-current="page", gold bg) via useHashRoute; Enroll buttons → #/contact
- Verification (agent-browser): home featured=3; /#/courses shows all 6 + For Beginners tab filters to 2; course card → detail page renders (breadcrumb, outline, sticky price card, related); detail Enroll link → #/contact preselects course; About/Tips/Stories/Contact pages all render; footer FAQs from Stories page → home + scrolled to FAQ (scrollY 4517); browser back/forward across hash routes works; cold deep-link load to #/about works; contact form submit → "Request received!" + POST 201; mobile 390px: menu lists pages, navigation works, cards stack; zero console errors; lint clean; final HTTP 200

Stage Summary:
- Site is now truly multipage: 7 routed pages + dynamic course detail pages, all under the sandbox-visible "/" via hash routing
- Upgrading to real App Router paths later = replace hash links with paths + move page components into app/ segments (components already page-shaped)

---
Task ID: 4
Agent: Z.ai Code (main)
Task: Add 10MS-style Online Class Routine feature (user: "make it like 10 ms online class routine etc etc")

Work Log:
- site-data.ts: added weekDays (Sat–Fri, Bangladesh week), RoutineClass type (day/start/end/courseSlug/batch/topic/mode/type), classRoutine array with 16 realistic weekly slots (Batch 317 In-Batch daily 10 AM hybrid, Private Batch 319 Sun/Tue 5 PM, Pre-IELTS 320 Mon/Wed 4 PM, Crash Course 318-C Mon/Wed 6 PM online, Thursday full mock + review, Saturday free speaking club, Sunday/Wednesday 8 PM free Facebook live classes, Friday off); added routineNote, freeLiveClasses (3 funnel sessions), upcomingBatches (Batch 318/319/320-C/321 with starts/time/seats-left/mode); added scheduleNote to Course type + all 6 courses; navLinks gained "Class Routine" (#/routine)
- New weekly-routine.tsx: hydration-safe useToday() via useSyncExternalStore (SSR ""); ModeBadge (Online Live=emerald, Campus=gold, Hybrid=neutral); WeeklyRoutine = 7 day pills with class counts + today dot, auto-selects visitor's current day, shadcn Table (Time/Batch/Course/Topic/Mode/Type), Friday renders "Weekly Off" empty state, free classes rows highlighted green; CourseRoutineTable = per-course rows sorted by weekday for course pages (returns null for flexible courses)
- New pages/routine-page.tsx: PageHeader, gold TodayBanner (today badge + long date + today's class cards + Friday off message + WhatsApp-group note), This Week's Schedule (WeeklyRoutine), mode legend strip, FreeLiveClasses (3 cards: schedule/platform/host/CTA — Facebook external + free mock register → #/contact), UpcomingBatchesBoard (10MS choose-your-batch table: course link, batch badge, starts, time, seats w/ amber <6 warning, gold Enroll button with Zustand setCourse preselect), routineNote info card, closing CTA
- New routine-banner.tsx (home): 2-col section — copy + bullets + View Full Routine / Join Free Live Class CTAs; right card shows "Today · {day}" with live-pulse indicator and today's classes (Friday off state), inserted between FreeResources and Skills on home
- course-detail-page.tsx: new "Weekly Class Routine" section after Course Outline — scheduleNote line + CourseRoutineTable + link to full routine
- site-router.tsx: added "#/routine" route; site-footer.tsx: Resources column now links "Class Routine" + "Free Live Classes" → #/routine
- Verification (agent-browser, desktop + 390px mobile): home banner shows "Today · Friday" off-state (sandbox date = Friday); #/routine renders header/today banner/legend/free-classes/batches/notice; 7 tabs with counts (Sat2 Sun3 Mon3 Tue2 Wed4 Thu2 Fri0); Fri auto-selected today; Sun table shows 3 rows w/ badges, free-class row highlighted; Mon tab switches; mobile table scrollable (scrollWidth 739 vs 356); mobile menu lists Class Routine; footer link navigates; batch Enroll → #/contact combobox preselected "Basic to IELTS — In Batch"; course page routine table (7 rows) + one-to-one flexible note w/o table; form submit → POST /api/leads 201 + Prisma INSERT; all 6 routes render; zero console errors on fresh load (stale Radix Dialog warning traced to old console buffer — no Dialog in codebase anymore); lint clean; HTTP 200
- Note: mobile Sheet stuck-open during testing was an artifact of switching viewport 390→1280 with menu open; Close button works normally

Stage Summary:
- Site now has a full 10MS-style Online Class Routine system: /routine page (today banner + interactive weekly table + free live classes + upcoming batches admission board), home routine banner, per-course weekly schedules, nav/footer wiring
- Batch numbers continue from the 316+ completed batches (317–321); all schedule data lives in site-data.ts for easy client updates

---
Task ID: 5
Agent: Z.ai Code (main)
Task: Make class routine private (enrolled-only) + build Student Portal (user: "routine is showed when someone enrolled not publicly and there should be portal for enrolled students")

Work Log:
- prisma/schema.prisma: added Student model (name, phone unique canonical 01XXXXXXXXX, courseSlug, batch, status default active); db:push OK; prisma/seed.ts (bun-run) upserts 5 demo students (01712000001 Anika/In Batch 317, 0002 Fariha/Private 319, 0003 Milon/One-to-One, 0004 Emran/Crash 318-C, 0005 Eva/Pre-IELTS 320)
- src/lib/phone.ts: canonicalPhone() normalizes +880/880/01/10-digit inputs
- POST /api/portal/login: zod-validates phone, canonicalizes, db.student.findUnique, 404 with bilingual "no active enrollment" message, 200 returns {name, phone, courseSlug, batch} (demo-grade phone-login auth; no OTP)
- src/lib/portal-store.ts: zustand + persist(localStorage "sadias-ielts-portal"), student + hasHydrated flag (onRehydrateStorage) so components gate rendering against SSR mismatch
- weekly-routine.tsx: exported RoutineTable + added isMine(row) prop — matching rows get gold left border + "My batch" chip (shared rows batch/Everyone count as mine)
- New pages/portal-page.tsx: LoginCard (benefits panel + phone form + inline error alert + 5 tap-to-fill demo chips + enroll CTA); Dashboard (greeting band with avatar initial/batch badge/logout, NextClassCard computing next upcoming class client-side from classRoutine with "Your schedule"/"Other batch" badge, PortalRoutine with My Classes|Full Routine toggle + day tabs showing filtered counts + RoutineTable isMine highlight + flexible-course empty states, sidebar: CourseCard w/ scheduleNote, SupportCard (WhatsApp group/call/Facebook/tips), FreeClassesCard); !hasHydrated renders skeleton; PortalPage = student ? Dashboard : login
- New locked-routine.tsx: LockedRoutineSection (routine page: real Saturday table blurred+aria-hidden under a lock overlay panel with Open Student Portal/Enroll CTAs + "free classes are public" note) and LockedRoutineCard (compact teaser for course pages/home)
- Gating: routine-page shows WelcomeStrip + TodayBanner + WeeklyRoutine + legend only when logged in, else LockedRoutineSection (FreeLiveClasses/UpcomingBatches/CTA stay public); routine-banner (home) shows today's classes when logged in else locked teaser card + Portal CTAs + updated copy bullet; course-detail CourseRoutineGate shows per-course table only when logged in else LockedRoutineCard (scheduleNote one-liner stays public)
- navLinks: added "Portal" (#/portal), renamed "Success Stories"→"Stories" for desktop nav width; footer Company column gained "Student Portal"; router gained portal branch
- Fixes during verification: (1) JSX parse error in course-detail (unclosed {" "}) — lint caught, server 500; (2) stale Prisma client in running dev server → db.student undefined 500 → restarted dev server; (3) stale Turbopack .next cache served old router (portal rendered RoutinePage) → rm -rf .next + restart; (4) ReferenceError classRoutine not imported in portal-page → crash on Dashboard render, caught via Next dev overlay shadowRoot, added import
- Verification (agent-browser, fresh session): API tests (valid/+880 format/unknown/invalid → 200/200/404/400); routine page logged out = locked w/ blurred preview, schedule hidden, free classes + batches still public; portal login page renders w/ demo chips; wrong number → bilingual inline error; login as Anika → dashboard (greeting, Batch 317, next class "Tomorrow" w/ Your schedule badge, My Classes counts Sat2 Sun2..., Sat rows w/ My batch chips incl shared Speaking Club, Full Routine toggle shows Batch 319 rows); login as Emran → crash course data + "Other batch" badge; login as Milon → flexible note + shared-only counts; logout → login page + storage cleared; persistence (reload keeps session); routine/home/course pages flip locked↔unlocked with session; mobile 390px portal layout OK; final fresh-session error count 0; lint clean; health 200

Stage Summary:
- Class routine is now members-only: public /routine shows a locked preview; full schedule, today banner and per-course topic tables render only for logged-in enrolled students
- Student Portal (#/portal): phone-based login against the Student table (SQLite), persisted session, dashboard with next-class card, My Classes/Full Routine weekly schedule, course info, support quick links and free-class reminders; logout + demo numbers seeded for testing
