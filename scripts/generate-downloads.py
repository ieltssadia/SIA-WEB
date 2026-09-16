#!/usr/bin/env python3
"""
Generate the real downloadable study-material PDFs served from
public/downloads/ in the Student Portal "Resources" section.

Brand: Sadia's IELTS (Gilded Court) — charcoal #171410, gold #d9b75c,
ivory #faf6ec, forest #225941. English-only content (ReportLab core fonts
cannot shape Bengali scripts).

Run: python3 scripts/generate-downloads.py
"""

import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# ── Brand tokens ──────────────────────────────────────────────────────────
CHARCOAL = colors.HexColor("#171410")
GOLD = colors.HexColor("#d9b75c")
GOLD_DARK = colors.HexColor("#b3944a")
IVORY = colors.HexColor("#faf6ec")
FOREST = colors.HexColor("#225941")
INK = colors.HexColor("#26221b")
MUTED = colors.HexColor("#6d6552")
LINE = colors.HexColor("#e2d9c2")

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm
AVAIL_W = PAGE_W - 2 * MARGIN

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "downloads")

# ── Styles ────────────────────────────────────────────────────────────────
S = {
    "kicker": ParagraphStyle(
        "kicker", fontName="Helvetica-Bold", fontSize=8.5, leading=12,
        textColor=GOLD_DARK, spaceAfter=2,
    ),
    "h1": ParagraphStyle(
        "h1", fontName="Helvetica-Bold", fontSize=21, leading=25,
        textColor=CHARCOAL, spaceAfter=3,
    ),
    "h1sub": ParagraphStyle(
        "h1sub", fontName="Helvetica", fontSize=10, leading=14,
        textColor=MUTED, spaceAfter=10,
    ),
    "h2": ParagraphStyle(
        "h2", fontName="Helvetica-Bold", fontSize=13.5, leading=17,
        textColor=CHARCOAL, spaceBefore=14, spaceAfter=5,
    ),
    "h3": ParagraphStyle(
        "h3", fontName="Helvetica-Bold", fontSize=10.5, leading=14,
        textColor=FOREST, spaceBefore=8, spaceAfter=3,
    ),
    "body": ParagraphStyle(
        "body", fontName="Helvetica", fontSize=9.5, leading=14.5,
        textColor=INK, spaceAfter=5,
    ),
    "li": ParagraphStyle(
        "li", fontName="Helvetica", fontSize=9.5, leading=14,
        textColor=INK, leftIndent=12, bulletIndent=2, spaceAfter=3,
    ),
    "tip": ParagraphStyle(
        "tip", fontName="Helvetica-Oblique", fontSize=9, leading=13.5,
        textColor=MUTED, spaceAfter=4,
    ),
    "cell": ParagraphStyle(
        "cell", fontName="Helvetica", fontSize=9, leading=12.5, textColor=INK,
    ),
    "cellb": ParagraphStyle(
        "cellb", fontName="Helvetica-Bold", fontSize=9, leading=12.5,
        textColor=CHARCOAL,
    ),
    "cellw": ParagraphStyle(
        "cellw", fontName="Helvetica-Bold", fontSize=9, leading=12.5,
        textColor=IVORY,
    ),
    "sheetnum": ParagraphStyle(
        "sheetnum", fontName="Helvetica-Bold", fontSize=9, leading=14,
        textColor=MUTED, alignment=TA_CENTER,
    ),
}


def bullet(text):
    return Paragraph(text, S["li"], bulletText="•")


def header_block(kicker, title, subtitle):
    """Branded charcoal header band with gold rule."""
    inner = [
        Paragraph(kicker.upper(), S["kicker"]),
        Paragraph(title, S["h1"]),
        Paragraph(subtitle, S["h1sub"]),
    ]
    t = Table([[inner]], colWidths=[AVAIL_W])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), CHARCOAL),
                ("LINEBELOW", (0, 0), (-1, -1), 2.2, GOLD),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ]
        )
    )
    return [t, Spacer(1, 12)]


def branded_table(headers, rows, widths):
    """Striped brand table with a charcoal header row. widths sum to AVAIL_W."""
    data = [[Paragraph(h, S["cellw"]) for h in headers]]
    for r in rows:
        data.append([c if isinstance(c, Paragraph) else Paragraph(str(c), S["cell"]) for c in r])
    t = Table(data, colWidths=widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), CHARCOAL),
        ("GRID", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            style.append(("BACKGROUND", (0, i), (-1, i), IVORY))
    t.setStyle(TableStyle(style))
    return t


def tip_box(text):
    t = Table([[Paragraph(text, S["tip"])]], colWidths=[AVAIL_W])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), IVORY),
                ("BOX", (0, 0), (-1, -1), 0.8, GOLD),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return t


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(MARGIN, 15 * mm, PAGE_W - MARGIN, 15 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(
        MARGIN, 10.5 * mm, "Sadia's IELTS  ·  Student Portal Resource  ·  sadiasielts.com"
    )
    canvas.drawRightString(PAGE_W - MARGIN, 10.5 * mm, f"Page {doc.page}")
    canvas.setFillColor(GOLD)
    canvas.rect(MARGIN, 15 * mm - 1.4, AVAIL_W * 0.18, 1.4, stroke=0, fill=1)
    canvas.restoreState()


def build(filename, title, subtitle, story, subject):
    path = os.path.join(OUT_DIR, filename)
    doc = BaseDocTemplate(
        path,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=22 * mm,
        title=title,
        author="Sadia's IELTS",
        subject=subject,
        creator="Sadia's IELTS Student Portal",
    )
    frame = Frame(MARGIN, 22 * mm, AVAIL_W, PAGE_H - MARGIN - 22 * mm, id="main")
    doc.addPageTemplates([PageTemplate(id="page", frames=[frame], onPage=footer)])
    doc.build(story)
    size_kb = os.path.getsize(path) / 1024
    print(f"  {filename}  ({size_kb:.0f} KB)")


# ══════════════════════════════════════════════════════════════════════════
# 1. Writing Task 2 — Essay Structure Bank
# ══════════════════════════════════════════════════════════════════════════
def pdf_task2():
    story = []
    story += header_block(
        "Writing · Band 7+",
        "IELTS Writing Task 2 — Essay Structure Bank",
        "Four ready-to-adapt essay skeletons with band 7+ sentence frames. "
        "Practise one structure per day and reuse the frames until they feel natural.",
    )

    story.append(Paragraph("How to use this bank", S["h2"]))
    story.append(
        Paragraph(
            "Do not memorise whole essays — examiners notice template paragraphs "
            "instantly and reward only language that fits the exact question. "
            "Instead, learn the skeleton of each essay type, then substitute the "
            "frame sentences with your own ideas. Every structure below follows the "
            "same 4-paragraph, 250-290 word plan: introduction, two body paragraphs, "
            "and a conclusion that answers the question directly.",
            S["body"],
        )
    )

    story.append(Paragraph("Structure 1 — Opinion Essay (agree / disagree)", S["h2"]))
    story.append(
        branded_table(
            ["Paragraph", "Job of the paragraph", "Sentence frames you can adapt"],
            [
                [
                    Paragraph("<b>Introduction</b>", S["cellb"]),
                    "Paraphrase the topic + clear position",
                    [
                        Paragraph("It is often argued that … I completely agree/disagree with this view because …", S["cell"]),
                        Paragraph("While some believe …, I am convinced that …", S["cell"]),
                    ],
                ],
                [
                    Paragraph("<b>Body 1</b>", S["cellb"]),
                    "Strongest reason + explanation + example",
                    [
                        Paragraph("The principal reason for my view is that … This is largely because …", S["cell"]),
                        Paragraph("For instance, research conducted in … shows that …", S["cell"]),
                    ],
                ],
                [
                    Paragraph("<b>Body 2</b>", S["cellb"]),
                    "Second reason, or a concession you defeat",
                    [
                        Paragraph("Admittedly, … However, this argument overlooks the fact that …", S["cell"]),
                        Paragraph("A further point worth noting is that …", S["cell"]),
                    ],
                ],
                [
                    Paragraph("<b>Conclusion</b>", S["cellb"]),
                    "Restate position — no new ideas",
                    [
                        Paragraph("In conclusion, although …, I firmly believe that …", S["cell"]),
                    ],
                ],
            ],
            [AVAIL_W * 0.16, AVAIL_W * 0.30, AVAIL_W * 0.54],
        )
    )

    story.append(Paragraph("Structure 2 — Discussion Essay (discuss both views)", S["h2"]))
    story.append(
        branded_table(
            ["Paragraph", "Job of the paragraph", "Sentence frames you can adapt"],
            [
                [
                    Paragraph("<b>Introduction</b>", S["cellb"]),
                    "Paraphrase + say both views will be examined + your lean",
                    [
                        Paragraph("Opinions differ about whether … This essay discusses both perspectives before arguing that …", S["cell"]),
                    ],
                ],
                [
                    Paragraph("<b>Body 1</b>", S["cellb"]),
                    "View A — strongest arguments, fair presentation",
                    [
                        Paragraph("Supporters of … point out that … They argue, quite reasonably, that …", S["cell"]),
                        Paragraph("A frequently cited benefit is that …", S["cell"]),
                    ],
                ],
                [
                    Paragraph("<b>Body 2</b>", S["cellb"]),
                    "View B — then signal why it is stronger",
                    [
                        Paragraph("On the other hand, critics contend that … What this view misses, however, is …", S["cell"]),
                    ],
                ],
                [
                    Paragraph("<b>Conclusion</b>", S["cellb"]),
                    "Weigh both, state your final position",
                    [
                        Paragraph("In my judgement, while … undoubtedly brings …, the advantages of … are more significant.", S["cell"]),
                    ],
                ],
            ],
            [AVAIL_W * 0.16, AVAIL_W * 0.30, AVAIL_W * 0.54],
        )
    )

    story.append(Paragraph("Structure 3 — Advantage / Disadvantage Essay", S["h2"]))
    story.append(bullet("<b>Introduction:</b> paraphrase the trend; state that it brings both benefits and drawbacks; hint which outweigh."))
    story.append(bullet("<b>Body 1 (advantages):</b> 'The most significant benefit of … is that …' → explain → 'A secondary advantage worth mentioning is …'."))
    story.append(bullet("<b>Body 2 (disadvantages):</b> 'Nevertheless, this development carries considerable risks, particularly …' → explain with a real-world case."))
    story.append(bullet("<b>Conclusion:</b> 'On balance, the benefits … outweigh the drawbacks, provided that …' — a conditional ending reads band 8."))
    story.append(Spacer(1, 2))

    story.append(Paragraph("Structure 4 — Problem / Solution Essay", S["h2"]))
    story.append(bullet("<b>Introduction:</b> paraphrase the problem statement; announce that causes and remedies will be discussed."))
    story.append(bullet("<b>Body 1 (problems/causes):</b> 'The root cause of this issue lies in …' + 'Compounding the problem, …'."))
    story.append(bullet("<b>Body 2 (solutions):</b> 'A practical first step would be to …' + 'This, however, requires … from both the government and individuals.'"))
    story.append(bullet("<b>Conclusion:</b> one sentence — 'Unless measures such as … are taken, the situation is likely to worsen.'"))

    story.append(Paragraph("Examiner's checklist — run before you submit", S["h2"]))
    story.append(
        branded_table(
            ["Check", "Band 7 requirement"],
            [
                ["Answer", "Every part of the question is addressed; position is clear from the introduction and never contradicted."],
                ["Ideas", "Each body paragraph develops ONE central idea — explanation + specific example, no idea-listing."],
                ["Cohesion", "Paragraphs open with a clear topic sentence; referencing (this, such, these) replaces repeated nouns."],
                ["Vocabulary", "Precise topic words and collocations; occasional idiomatic phrase; spelling error-free."],
                ["Grammar", "Mix of complex structures used naturally — conditionals, concessive clauses, relative clauses."],
                ["Word count", "250-290 words. Under 250 caps Task Achievement at Band 6; over 320 invites more errors."],
            ],
            [AVAIL_W * 0.18, AVAIL_W * 0.82],
        )
    )
    story.append(Spacer(1, 8))
    story.append(
        tip_box(
            "Self-marking habit: after every practice essay, underline your topic sentences, "
            "count words per paragraph (aim 60-80 each), and highlight every 'this/such' reference. "
            "If a paragraph has no example, it is not developed — rewrite it before checking vocabulary."
        )
    )
    build(
        "writing-task-2-structures.pdf",
        "IELTS Writing Task 2 — Essay Structure Bank",
        "Four essay skeletons + band 7+ sentence frames",
        story,
        "Writing Task 2 essay structures and sentence frames for band 7+",
    )


# ══════════════════════════════════════════════════════════════════════════
# 2. Academic Task 1 — Sentence Bank
# ══════════════════════════════════════════════════════════════════════════
def pdf_task1():
    story = []
    story += header_block(
        "Writing · Academic",
        "Academic Task 1 — Sentence Bank",
        "Introduction, overview and trend language you can adapt to any chart, "
        "table, map or process diagram.",
    )

    story.append(Paragraph("The 4-sentence introduction + overview", S["h2"]))
    story.append(bullet("<b>Paraphrase the rubric:</b> 'The provided line graph illustrates the proportion of … between 2000 and 2020.'"))
    story.append(bullet("<b>Group the data:</b> 'Overall, the data can be broadly categorised into three groups: …'"))
    story.append(bullet("<b>Main trend 1:</b> 'Overall, X experienced a dramatic rise, whereas Y declined steadily throughout the period.'"))
    story.append(bullet("<b>Main trend 2 / most striking feature:</b> 'It is also noticeable that … recorded the highest figure in every year shown.'"))
    story.append(
        Paragraph(
            "The overview carries enormous weight: without a clear 'Overall' statement, Task "
            "Achievement cannot exceed Band 6. Write it after the introduction, before any detail "
            "paragraph, and mention only the two or three biggest patterns — never individual numbers.",
            S["body"],
        )
    )

    story.append(Paragraph("Trend verbs — upgrade these", S["h2"]))
    story.append(
        branded_table(
            ["Weak (band 6)", "Band 7+ alternatives"],
            [
                ["went up", "climbed, surged, rocketed, soared, rose sharply / steadily / gradually"],
                ["went down", "fell, dropped, declined, plummeted, dipped, halved"],
                ["stayed same", "remained stable / constant, plateaued, levelled off at, held steady"],
                ["big change", "a dramatic / marked / substantial increase; a threefold rise"],
                ["small change", "a marginal / modest / slight fall; marginally below"],
            ],
            [AVAIL_W * 0.30, AVAIL_W * 0.70],
        )
    )

    story.append(Paragraph("Comparing & approximating", S["h2"]))
    story.append(bullet("'X stood at exactly 40%, almost double the figure for Y.'"))
    story.append(bullet("'By 2015, X had overtaken Y, reaching 60% compared with Y's 45%.'"))
    story.append(bullet("'The figure for X was roughly / approximately / just under three times that of Y.'"))
    story.append(bullet("'While X fluctuated between 20% and 30%, Y followed a consistently downward trajectory.'"))
    story.append(bullet("'X accounted for the largest share, at just over a third of the total.'"))

    story.append(Paragraph("Maps & process diagrams", S["h2"]))
    story.append(bullet("<b>Map change:</b> 'The playground was converted into a car park' / 'The village underwent significant redevelopment, most notably along the coastline.'"))
    story.append(bullet("<b>Map location:</b> 'situated to the north-west of', 'adjacent to', 'flanked by', 'relocated beside'."))
    story.append(bullet("<b>Process sequence:</b> 'Initially / Subsequently / At the following stage / Once this has been completed / Ultimately'."))
    story.append(bullet("<b>Process passive:</b> 'The beans are harvested, then roasted, before being ground and packaged.' — keep every step passive."))
    story.append(Spacer(1, 2))

    story.append(Paragraph("Numbers cheat-sheet", S["h2"]))
    story.append(
        branded_table(
            ["You see", "You write"],
            [
                ["25%", "a quarter of / exactly one in four"],
                ["~50%", "approximately half / just under a half"],
                ["75%", "roughly three-quarters"],
                ["3×", "three times as many / a threefold increase"],
                ["12% → 24%", "doubled, from 12% to 24%"],
                ["48% → 24%", "was halved / fell by half to 24%"],
                ["1,000 → 4,000", "quadrupled over the period shown"],
            ],
            [AVAIL_W * 0.34, AVAIL_W * 0.66],
        )
    )
    story.append(Spacer(1, 8))
    story.append(
        tip_box(
            "Timing drill: 20 minutes total — 3 to plan and find the overview, 14 to write, 3 to "
            "check verbs and prepositions. Never copy phrases from the question paper; paraphrase "
            "at least the verbs and nouns, or those words are subtracted from your word count."
        )
    )
    build(
        "academic-task-1-sentence-bank.pdf",
        "Academic Task 1 — Sentence Bank",
        "Introductions, overviews, trend and comparison language",
        story,
        "Academic Task 1 sentence frames and vocabulary",
    )


# ══════════════════════════════════════════════════════════════════════════
# 3. Speaking Part 2 — Cue Card Bank
# ══════════════════════════════════════════════════════════════════════════
def pdf_speaking():
    story = []
    story += header_block(
        "Speaking · Part 2",
        "Cue Card Bank — 24 Topics + Follow-ups",
        "Practise one card daily with a 1-minute plan and a 2-minute answer. "
        "Record yourself, then listen for filler words and broken tenses.",
    )

    story.append(Paragraph("The 60-second planning frame", S["h2"]))
    story.append(bullet("<b>0-20s:</b> choose the story and the three prompts — write one-word notes only."))
    story.append(bullet("<b>20-40s:</b> plan the PAST-PRESENT-FUTURE arc: how it began, what happened, what it means now."))
    story.append(bullet("<b>40-60s:</b> fix your opening sentence and one 'advanced' phrase you will definitely use."))
    story.append(
        Paragraph(
            "Speak the full two minutes. Examiners stop you at 2:00 — finishing early costs fluency "
            "marks. If you run out of ideas, describe the place, people, sounds, colours and your "
            "feelings in detail; sensory language is impossible to run out of.",
            S["body"],
        )
    )

    cue_cards = [
        ("Person", "Describe a person who has influenced you deeply.", "who they are · how you know them · what changed · why influential"),
        ("Person", "Describe an older person you admire.", "who · relationship · their qualities · what you learned"),
        ("Place", "Describe a quiet place you like to spend time in.", "where · how often · what you do there · why calming"),
        ("Place", "Describe a city you have visited and would return to.", "when · what you saw · what you did · why return"),
        ("Object", "Describe a useful object you own.", "what · when received · how used · why useful"),
        ("Object", "Describe a photograph you keep at home.", "what it shows · when taken · who took it · why kept"),
        ("Event", "Describe a celebration you enjoyed recently.", "occasion · where · who joined · what made it special"),
        ("Event", "Describe a time when you helped someone.", "whom · situation · what you did · the result"),
        ("Event", "Describe a mistake that taught you something.", "what went wrong · why · lesson learned · change since"),
        ("Media", "Describe a book that impressed you.", "title · genre · plot in two lines · lasting impression"),
        ("Media", "Describe a documentary or series worth watching.", "name · platform · content · recommendation reason"),
        ("Media", "Describe a song or piece of music you love.", "artist · when first heard · lyrics meaning · feeling"),
        ("Nature", "Describe your favourite season in Bangladesh.", "which · weather · activities · why favourite"),
        ("Nature", "Describe a river, tea garden or forest you have seen.", "where · when · scenery · your feelings"),
        ("Daily", "Describe a skill you learned outside school.", "what · how learned · difficulty · payoff"),
        ("Daily", "Describe a meal you cooked for your family.", "dishes · occasion · process · reaction"),
        ("Goals", "Describe a goal you want to achieve this year.", "goal · motivation · plan · obstacles"),
        ("Goals", "Describe a hobby you would like to start.", "hobby · why interested · first step · expectation"),
        ("Tech", "Describe an app or website you use daily.", "name · functions · frequency · what life was like before"),
        ("Tech", "Describe a piece of technology you bought recently.", "what · why bought · how used · satisfaction"),
        ("Money", "Describe a purchase you were happy with.", "item · cost · decision process · satisfaction"),
        ("Money", "Describe a time you saved for something special.", "target · duration · strategy · outcome"),
        ("People", "Describe a neighbour or classmate you get along with.", "who · how met · shared activities · why easy company"),
        ("People", "Describe a teacher who made learning enjoyable.", "who · subject · teaching style · your result"),
    ]

    story.append(Paragraph("24 cue cards by theme", S["h2"]))
    w = [AVAIL_W * 0.13, AVAIL_W * 0.42, AVAIL_W * 0.45]
    story.append(branded_table(["Theme", "Cue card", "Prompts to plan"], [[Paragraph(t, S["cellb"]), d, p] for t, d, p in cue_cards], w))

    story.append(Paragraph("Part 3 — extending your answers", S["h2"]))
    story.append(bullet("<b>Opinion + reason:</b> 'I'd argue that … primarily because …'"))
    story.append(bullet("<b>General + specific:</b> 'In most Bangladeshi families … , though in my own experience …'"))
    story.append(bullet("<b>Compare past/present:</b> 'Twenty years ago people used to …, whereas nowadays …'"))
    story.append(bullet("<b>Hypothetical:</b> 'If everyone had access to …, I imagine …'"))
    story.append(bullet("<b>Concede then counter:</b> 'Admittedly … , but on balance …'"))
    story.append(Spacer(1, 8))
    story.append(
        tip_box(
            "Fluency drill: answer the same card three times. Round 1 reads notes, round 2 hides "
            "them, round 3 adds one idiom and one complex sentence. Comparing the recordings shows "
            "exactly which words collapse under pressure — fix those first."
        )
    )
    build(
        "speaking-cue-card-bank.pdf",
        "Speaking Part 2 — Cue Card Bank",
        "24 themed cue cards with planning frames and Part 3 language",
        story,
        "Speaking Part 2 cue cards and follow-up language",
    )


# ══════════════════════════════════════════════════════════════════════════
# 4. Band 7+ Vocabulary & Collocations
# ══════════════════════════════════════════════════════════════════════════
def pdf_vocab():
    story = []
    story += header_block(
        "Vocabulary · Band 7+",
        "Band 7+ Vocabulary & Collocations",
        "Topic-wise collocations with ready-made sentences. Learn chunks, not "
        "single words — collocations are what separate Band 6 from Band 7.",
    )

    topics = [
        (
            "Education",
            [
                ("lifelong learning", "Lifelong learning is now essential, as skills become outdated within a decade."),
                ("tailored instruction", "Tailored instruction helps weaker students progress without holding back the class."),
                ("academic pressure", "Relentless academic pressure can harm teenagers' mental health."),
                ("rote memorisation", "Rote memorisation yields marks but rarely produces understanding."),
                ("extracurricular activities", "Extracurricular activities build teamwork and leadership alongside grades."),
            ],
        ),
        (
            "Environment",
            [
                ("carbon emissions", "Cutting carbon emissions demands coordinated international action."),
                ("renewable energy", "Investment in renewable energy creates jobs while reducing pollution."),
                ("irreversible damage", "Deforestation causes irreversible damage to biodiversity."),
                ("sustainable practices", "Factories are adopting sustainable practices to meet new regulations."),
                ("environmental degradation", "Environmental degradation hits poor communities hardest."),
            ],
        ),
        (
            "Technology",
            [
                ("rapid technological advances", "Rapid technological advances have reshaped how we work."),
                ("digital literacy", "Digital literacy is as fundamental as reading and writing."),
                ("face-to-face interaction", "Screens cannot fully replace face-to-face interaction."),
                ("data privacy concerns", "Data privacy concerns grow as apps collect more personal information."),
                ("automate routine tasks", "Machines now automate routine tasks, freeing people for creative work."),
            ],
        ),
        (
            "Health",
            [
                ("sedentary lifestyle", "A sedentary lifestyle contributes to obesity and heart disease."),
                ("balanced diet", "A balanced diet matters more than any supplement."),
                ("mental well-being", "Employers now recognise mental well-being as a productivity issue."),
                ("preventive healthcare", "Preventive healthcare saves far more than it costs."),
                ("public health campaign", "A well-designed public health campaign can change habits within months."),
            ],
        ),
        (
            "Work & Economy",
            [
                ("job security", "Automation threatens the job security of clerical workers."),
                ("work-life balance", "Remote work improved work-life balance for many employees."),
                ("competitive salary", "A competitive salary alone no longer retains young talent."),
                ("economic growth", "Economic growth means little unless ordinary households feel it."),
                ("career prospects", "Internships often open better career prospects than extra degrees."),
            ],
        ),
        (
            "Society & Cities",
            [
                ("urban sprawl", "Uncontrolled urban sprawl swallows farmland around every major city."),
                ("affordable housing", "The shortage of affordable housing pushes workers to the outskirts."),
                ("traffic congestion", "Traffic congestion costs Dhaka billions in lost productivity."),
                ("social cohesion", "Mixed neighbourhoods strengthen social cohesion."),
                ("an ageing population", "An ageing population will strain pension systems worldwide."),
            ],
        ),
    ]

    for topic, rows in topics:
        story.append(Paragraph(topic, S["h2"]))
        story.append(
            branded_table(
                ["Collocation", "Use it like this"],
                [[Paragraph(f"<b>{c}</b>", S["cell"]), ex] for c, ex in rows],
                [AVAIL_W * 0.34, AVAIL_W * 0.66],
            )
        )

    story.append(Paragraph("Adverb upgrades for Task 2", S["h2"]))
    story.append(bullet("very important → <b>pivotal, indispensable, paramount</b>"))
    story.append(bullet("very big → <b>substantial, considerable, profound</b>"))
    story.append(bullet("very bad → <b>detrimental, adverse, severe</b>"))
    story.append(bullet("very good → <b>beneficial, advantageous, invaluable</b>"))
    story.append(bullet("very fast → <b>unprecedented, exponential, meteoric</b> (for growth)"))
    story.append(Spacer(1, 8))
    story.append(
        tip_box(
            "Retention rule: a word is 'yours' only after you have used it in speaking AND writing. "
            "Pick five collocations from this sheet each day, force all five into today's practice "
            "essay, then recycle them in tomorrow's Speaking Club. Five a day for a month = 150 chunks."
        )
    )
    build(
        "band-7-vocabulary-collocations.pdf",
        "Band 7+ Vocabulary & Collocations",
        "Topic-wise collocations with model sentences",
        story,
        "Band 7+ topic vocabulary and collocations",
    )


# ══════════════════════════════════════════════════════════════════════════
# 5. Listening & Reading Answer Sheet
# ══════════════════════════════════════════════════════════════════════════
def pdf_answersheet():
    story = []
    story += header_block(
        "Mock Tools · Printable",
        "Listening & Reading Answer Sheet",
        "Print this sheet for every practice test. Numbers match the official "
        "Cambridge layout, so transferring answers becomes muscle memory.",
    )

    def num_rows(start, count, col_w):
        rows = []
        for i in range(0, count, 2):
            n1, n2 = start + i, start + i + 1
            rows.append(
                [
                    Paragraph(f"<b>{n1}</b>", S["cellb"]),
                    "",
                    Paragraph(f"<b>{n2}</b>", S["cellb"]) if n2 < start + count else "",
                    "" if n2 < start + count else None,
                ]
            )
        # strip None placeholders
        rows = [r[:3] if r[3] is None else r for r in rows]
        t = Table(
            [[Paragraph("<b>Q</b>", S["cellw"]), Paragraph("<b>Answer</b>", S["cellw"])] * 2]
            + rows,
            colWidths=[col_w * 0.12, col_w * 0.38, col_w * 0.12, col_w * 0.38],
        )
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), CHARCOAL),
                    ("GRID", (0, 0), (-1, -1), 0.6, LINE),
                    ("TOPPADDING", (0, 0), (-1, -1), 5.5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("ALIGN", (0, 0), (0, -1), "CENTER"),
                    ("ALIGN", (2, 0), (2, -1), "CENTER"),
                    ("BACKGROUND", (0, 1), (0, -1), IVORY),
                    ("BACKGROUND", (2, 1), (2, -1), IVORY),
                ]
            )
        )
        return t

    half = AVAIL_W * 0.5 - 6
    listening = num_rows(1, 40, half)
    reading = num_rows(1, 40, half)
    story.append(Paragraph("Section 1 — Listening (40 answers, 30 minutes + 10 to transfer)", S["h2"]))
    story.append(listening)
    story.append(Spacer(1, 14))
    story.append(Paragraph("Section 2 — Reading (40 answers, 60 minutes — NO transfer time)", S["h2"]))
    story.append(reading)

    story.append(Paragraph("Transfer rules that save marks", S["h2"]))
    story.append(bullet("Spelling must be correct — a right answer spelled wrong scores zero."))
    story.append(bullet("Capital or small letters both accepted, but pick one style and stay consistent."))
    story.append(bullet("For 'ONE WORD AND/OR A NUMBER', two words = wrong even if the meaning fits."))
    story.append(bullet("Never leave a blank — guess; there is no negative marking."))
    story.append(Spacer(1, 8))
    story.append(
        tip_box(
            "Self-marking grid: mark correct = 1, wrong = 0. Listening 39-40 ≈ Band 9, 37-38 ≈ 8.5, "
            "35-36 ≈ 8, 32-34 ≈ 7.5, 30-31 ≈ 7. Reading: 39-40 ≈ 9, 37-38 ≈ 8.5, 35-36 ≈ 8, 33-34 ≈ 7.5, "
            "30-32 ≈ 7. Log your raw score in the portal after every mock to track the trend."
        )
    )
    build(
        "listening-reading-answer-sheet.pdf",
        "Listening & Reading Answer Sheet",
        "Printable 40-question answer grid for practice tests",
        story,
        "Printable answer sheet for Listening and Reading practice",
    )


# ══════════════════════════════════════════════════════════════════════════
# 6. Mock Test Day Checklist
# ══════════════════════════════════════════════════════════════════════════
def pdf_checklist():
    story = []
    story += header_block(
        "Mock Tools · Strategy",
        "Mock Test Day Checklist & Timing Plan",
        "The exact routine our band 8+ students follow on test day — from "
        "wake-up to the final writing check.",
    )

    story.append(Paragraph("Night before", S["h2"]))
    story.append(bullet("Pack: passport/NID photocopy, two pens, pencils, eraser, water bottle, light snack."))
    story.append(bullet("Re-read your last mock's error log for 10 minutes — nothing new before test day."))
    story.append(bullet("Sleep by 11 PM; eight hours beats one more practice set, every time."))

    story.append(Paragraph("Test morning", S["h2"]))
    story.append(bullet("Reach the centre 45 minutes early; queues at Bangladesh centres are long."))
    story.append(bullet("Eat a protein-heavy breakfast — the listening test starts before your stomach speaks."))
    story.append(bullet("Phone + smartwatch go in the bag; keep only your ID in hand."))
    story.append(bullet("Toilet break BEFORE the listening starts — you cannot pause the recording."))

    story.append(Paragraph("Timing plan per paper", S["h2"]))
    story.append(
        branded_table(
            ["Paper", "Plan", "Execute", "Check"],
            [
                ["Listening", "Read questions in the 30s preview of each part", "Follow the audio, never freeze on one missed answer", "10-minute transfer — check spelling + plurals"],
                ["Reading", "3 min: skim passages + map question locations", "40 min: 18/20/22 min per passage, hard ones last", "3 min: fill blanks, re-check TF/NG wording"],
                ["Writing", "5 min: outline both tasks, pick the overview", "Task 1 by 20:00, Task 2 by 40:00 on the clock", "5 min: word counts, capital letters, verb tenses"],
            ],
            [AVAIL_W * 0.14, AVAIL_W * 0.30, AVAIL_W * 0.32, AVAIL_W * 0.24],
        )
    )

    story.append(Paragraph("During the listening — golden rules", S["h2"]))
    story.append(bullet("Missed an answer? Mark a dash and move on instantly — the next question matters more."))
    story.append(bullet("Answers above 20 in part 4 usually arrive after the speaker's signal words: 'however', 'in the end', 'what surprised us'."))
    story.append(bullet("Plurals matter: the audio says 'three tickets', write 'tickets', never 'ticket'."))

    story.append(Paragraph("Final 5 minutes of writing — check in this order", S["h2"]))
    story.append(
        branded_table(
            ["Order", "What to check", "Why"],
            [
                ["1", "Word counts (T1 ≥ 150, T2 ≥ 250)", "Under-count caps Task Achievement at Band 6"],
                ["2", "Every sentence has a verb + correct tense", "Run-ons and tense slips are the top band-killers"],
                ["3", "Introduction answers the actual question", "Off-topic intros collapse Task Response"],
                ["4", "Capital letters, commas, full stops", "Presentation errors read as carelessness"],
            ],
            [AVAIL_W * 0.10, AVAIL_W * 0.52, AVAIL_W * 0.38],
        )
    )
    story.append(Spacer(1, 8))
    story.append(
        tip_box(
            "After the mock: log your raw scores in the portal the same evening while memory is "
            "fresh. Note WHY each mark was lost — vocabulary, grammar, spelling, or timing. The "
            "pattern across three mocks tells you exactly what to study next."
        )
    )
    build(
        "mock-day-checklist.pdf",
        "Mock Test Day Checklist & Timing Plan",
        "Test-day routine, per-paper timing and checking order",
        story,
        "Mock test day checklist and timing strategy",
    )


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    print("Generating portal downloadables → public/downloads/")
    pdf_task2()
    pdf_task1()
    pdf_speaking()
    pdf_vocab()
    pdf_answersheet()
    pdf_checklist()
    print("Done.")


if __name__ == "__main__":
    main()
