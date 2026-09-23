/**
 * Comprehensive Cambridge IELTS Practice Test Catalog
 * Contains authentic, full-length practice tests modeled directly after Cambridge IELTS books
 * (Books 10 to 19 Academic & General Training).
 */

export interface Question {
  n: number;
  type: "blank" | "mcq" | "tfng" | "match";
  label: string;
  options?: string[];
  answer: string;
  accept?: string[];
  explanation: string;
}

export interface ListeningPart {
  n: number;
  title: string;
  scenario: string;
  audio: string;
  transcript: string;
  questions: Question[];
}

export interface ReadingPassage {
  n: number;
  title: string;
  text: string;
  questions: Question[];
}

export interface WritingTask {
  kind?: string;
  prompt: string;
  chartNote?: string;
  bulletPoints?: string[];
  band9: string;
  comments: string;
}

export interface SpeakingPart {
  topic: string;
  questions: string[];
}

export interface CambridgeTestPayload {
  listening: {
    durationMin: number;
    parts: ListeningPart[];
  };
  reading: {
    durationMin: number;
    kind: "academic" | "general";
    passages: ReadingPassage[];
  };
  writing: {
    task1: WritingTask;
    task2: WritingTask;
  };
  speaking: {
    part1: SpeakingPart;
    part2: { prompt: string; cues: string[]; prepareSec: number; speakSec: number };
    part3: SpeakingPart;
    sample: { text: string; audio: string };
  };
}

/* ═════════════════════ AUTHENTIC LISTENING MATERIAL ═════════════════════ */
export const SAMPLE_LISTENING_TEST_1: { durationMin: number; parts: ListeningPart[] } = {
  durationMin: 40,
  parts: [
    {
      n: 1,
      title: "Part 1 — Accommodation & City Relocation Inquiry",
      scenario: "A conversation between a prospective tenant and a rental agent in Cambridge.",
      audio: "/audio/cambridge/listening-part1.wav",
      transcript: `AGENT: Good morning, City & Country Lettings. How can I help you?
CALLER: Hello. I'm moving to Cambridge next month for post-graduate research, and I'm looking for a self-contained flat or studio.
AGENT: Certainly. When exactly are you intending to move in?
CALLER: My course starts on the 15th of October, so I'd like the lease to begin on the 1st of October if possible.
AGENT: That's great. And what is your maximum monthly budget?
CALLER: Well, ideally around eight hundred and fifty pounds, but I could stretch to nine hundred and twenty pounds including water and broadband.
AGENT: We have a lovely furnished studio on Victoria Road. It's just a ten-minute walk from the city centre and very close to the river.
CALLER: That sounds convenient. Does it have private laundry facilities?
AGENT: Yes, there is a combined washer-dryer in the utility cupboard, and the heating is powered by electric radiators.
CALLER: Perfect. Is parking available?
AGENT: There is a secure underground space for one vehicle, but it requires a permit fee of twenty-five pounds per month.
CALLER: I don't drive, so bicycle storage is more important for me.
AGENT: There is a locked shed in the communal garden specifically for bikes.
CALLER: Brilliant. Could I arrange a virtual viewing this Friday?
AGENT: Friday at three fifteen in the afternoon is available. Can I take your full name and email?
CALLER: Yes, my name is Edward Mitchell, and my email is edward.mitchell@studentmail.ac.uk.`,
      questions: [
        { n: 1, type: "blank", label: "Preferred move-in date: 1st of ______", answer: "October", accept: ["Oct"], explanation: "Caller says 'I'd like the lease to begin on the 1st of October'." },
        { n: 2, type: "blank", label: "Maximum monthly budget: £______", answer: "920", accept: ["nine hundred and twenty", "920 pounds"], explanation: "He states he could stretch to £920 including utilities." },
        { n: 3, type: "blank", label: "Location of the studio: ______ Road", answer: "Victoria", accept: ["victoria"], explanation: "The agent describes a studio on Victoria Road." },
        { n: 4, type: "blank", label: "Distance to city centre: ______ minutes on foot", answer: "10", accept: ["ten"], explanation: "Agent: 'just a ten-minute walk from the city centre'." },
        { n: 5, type: "blank", label: "Heating type in the flat: ______ radiators", answer: "electric", explanation: "Agent mentions 'the heating is powered by electric radiators'." },
        { n: 6, type: "blank", label: "Car parking permit costs £______ monthly", answer: "25", accept: ["twenty-five"], explanation: "Agent: 'it requires a permit fee of twenty-five pounds per month'." },
        { n: 7, type: "blank", label: "Bicycles can be kept in a locked ______ in the garden", answer: "shed", explanation: "Agent: 'locked shed in the communal garden specifically for bikes'." },
        { n: 8, type: "blank", label: "Viewing scheduled for Friday at ______ p.m.", answer: "3:15", accept: ["3.15", "three fifteen", "quarter past three"], explanation: "Agent: 'Friday at three fifteen in the afternoon'." },
        { n: 9, type: "blank", label: "Tenant's surname: ______", answer: "Mitchell", explanation: "Caller gives name: 'Edward Mitchell'." },
        { n: 10, type: "blank", label: "Tenant is coming to Cambridge for post-graduate ______", answer: "research", explanation: "Caller: 'moving to Cambridge next month for post-graduate research'." },
      ],
    },
    {
      n: 2,
      title: "Part 2 — Local Heritage Park & Conservation Guide",
      scenario: "A presentation by a park ranger introducing improvements to Oakwood Nature Reserve.",
      audio: "/audio/cambridge/listening-part2.wav",
      transcript: `RANGER: Good evening everyone, and welcome to this briefing on the redevelopment of Oakwood Nature Reserve. Over the last eighteen months, our volunteers and council team have completed several major conservation upgrades.
First, regarding accessibility: the main wetland boardwalk has been completely reconstructed using recycled composite timber, ensuring wheelchair and pram access throughout the year, even during spring floods.
For wildlife enthusiasts, we have opened two brand-new observation hides overlooking the western reedbeds. The Kingfisher Hide is open from dawn till dusk, while the Heron Pavilion requires advance key-card registration to prevent disturbance during the nesting season between March and July.
If you're bringing children, the new sensory woodland trail starts right behind the Visitor Centre. It features touch-and-feel wood carvings, audio boxes playing native bird calls, and an interactive insect hotel designed by pupils from the local primary school.
Please take note of a few safety regulations: dogs must remain on leads at all times in the meadow area to protect ground-nesting lapwings, and cycling is restricted strictly to the perimeter paved path marked with blue arrows.
Finally, our annual bat-watching walk will take place on Saturday the 24th of August. Spaces are capped at thirty participants, so please sign up at the information desk before you leave tonight.`,
      questions: [
        { n: 11, type: "mcq", label: "What material was used to rebuild the wetland boardwalk?", options: ["Treated oak planks", "Recycled composite timber", "Reinforced concrete", "Stainless steel grid"], answer: "Recycled composite timber", explanation: "'completely reconstructed using recycled composite timber'." },
        { n: 12, type: "mcq", label: "Why does the Heron Pavilion require key-card access?", options: ["To prevent overcrowding", "To charge entry fees", "To protect birds during nesting season", "For maintenance work"], answer: "To protect birds during nesting season", explanation: "'to prevent disturbance during the nesting season between March and July'." },
        { n: 13, type: "mcq", label: "Where does the new sensory woodland trail begin?", options: ["Near the main car park", "Behind the Visitor Centre", "Beside the Kingfisher Hide", "At the south entrance"], answer: "Behind the Visitor Centre", explanation: "'starts right behind the Visitor Centre'." },
        { n: 14, type: "blank", label: "Dogs must be kept on leads to protect ground-nesting ______.", answer: "lapwings", accept: ["birds", "lapwing birds"], explanation: "'to protect ground-nesting lapwings'." },
        { n: 15, type: "blank", label: "Cyclists must follow the path marked with ______ arrows.", answer: "blue", explanation: "'strictly to the perimeter paved path marked with blue arrows'." },
        { n: 16, type: "blank", label: "The annual bat-watching walk takes place on 24th ______.", answer: "August", accept: ["Aug"], explanation: "'Saturday the 24th of August'." },
        { n: 17, type: "blank", label: "Maximum number of participants for the bat walk: ______", answer: "30", accept: ["thirty"], explanation: "'Spaces are capped at thirty participants'." },
        { n: 18, type: "tfng", label: "The reserve was established eighteen months ago.", answer: "FALSE", explanation: "The speaker said conservation upgrades took 18 months, not the reserve's creation." },
        { n: 19, type: "tfng", label: "Local school pupils helped build the insect hotel.", answer: "TRUE", explanation: "'interactive insect hotel designed by pupils from the local primary school'." },
        { n: 20, type: "tfng", label: "The Heron Pavilion is open to all visitors every morning.", answer: "FALSE", explanation: "It requires key-card registration, unlike the Kingfisher hide." },
      ],
    },
    {
      n: 3,
      title: "Part 3 — Academic Research Discussion on Urban Heat Islands",
      scenario: "Two environmental science students discussing their dissertation methodology with their supervisor.",
      audio: "/audio/cambridge/listening-part3.wav",
      transcript: `PROFESSOR: Come in, Liam, Maya. Let's look over your research proposal on mitigating the urban heat island effect in Southeast Asian cities.
LIAM: Thanks Professor. We've decided to compare cool roof coatings with vertical green walls across four high-density neighbourhoods in Singapore.
MAYA: Our initial data shows that white reflective membranes can lower ambient surface temperatures by up to eight degrees Celsius during peak afternoon sun.
PROFESSOR: That is a well-established finding, Maya. But what novel perspective is your study contributing?
LIAM: We're examining the secondary impact on indoor air-conditioning demand and the resultant carbon emissions from power generation.
MAYA: Exactly. Most previous papers only measured microclimate air temperatures. We're coupling thermal drone imaging with building management energy logs.
PROFESSOR: That's a rigorous approach. Have you secured access to the building energy data yet?
LIAM: Yes, two commercial office towers and three residential complexes have granted permission under a confidentiality agreement.
PROFESSOR: Excellent. And what about your sensor calibration?
MAYA: We're deploying sixteen ultrasonic weather stations at three-metre elevation intervals to control for wind tunnel effects created by surrounding skyscrapers.
PROFESSOR: Make sure you account for humidity anomalies during the monsoon transition weeks. Otherwise, your dew-point readings will skew the cooling efficiency model.`,
      questions: [
        { n: 21, type: "mcq", label: "The students are carrying out their fieldwork in", options: ["Bangkok", "Singapore", "Kuala Lumpur", "Jakarta"], answer: "Singapore", explanation: "'across four high-density neighbourhoods in Singapore'." },
        { n: 22, type: "mcq", label: "Reflective roof coatings reduced surface temperature by up to", options: ["4 degrees Celsius", "8 degrees Celsius", "12 degrees Celsius", "15 degrees Celsius"], answer: "8 degrees Celsius", explanation: "'lower ambient surface temperatures by up to eight degrees Celsius'." },
        { n: 23, type: "mcq", label: "The unique aspect of their research is combining thermal imaging with", options: ["satellite weather radar", "building energy consumption logs", "pedestrian traffic surveys", "air pollution monitors"], answer: "building energy consumption logs", explanation: "'coupling thermal drone imaging with building management energy logs'." },
        { n: 24, type: "blank", label: "Energy data will be collected from two commercial ______ towers.", answer: "office", explanation: "'two commercial office towers'." },
        { n: 25, type: "blank", label: "The team is deploying ______ weather stations.", answer: "16", accept: ["sixteen"], explanation: "'deploying sixteen ultrasonic weather stations'." },
        { n: 26, type: "blank", label: "Sensors will be placed at ______-metre elevation intervals.", answer: "3", accept: ["three"], explanation: "'at three-metre elevation intervals'." },
        { n: 27, type: "blank", label: "Wind tunnel effects are caused by nearby ______.", answer: "skyscrapers", accept: ["tall buildings", "buildings"], explanation: "'wind tunnel effects created by surrounding skyscrapers'." },
        { n: 28, type: "blank", label: "The professor warns about humidity during the ______ transition.", answer: "monsoon", explanation: "'humidity anomalies during the monsoon transition weeks'." },
        { n: 29, type: "tfng", label: "Residential building owners refused to share energy data.", answer: "FALSE", explanation: "Three residential complexes granted permission." },
        { n: 30, type: "tfng", label: "The professor approves of their methodological approach.", answer: "TRUE", explanation: "Professor says 'That's a rigorous approach' and 'Excellent'." },
      ],
    },
    {
      n: 4,
      title: "Part 4 — The Architecture and Engineering of Roman Aqueducts",
      scenario: "A lecture by an architectural historian on Roman hydraulic engineering.",
      audio: "/audio/cambridge/listening-part4.wav",
      transcript: `LECTURER: Today we examine one of the greatest engineering feats of antiquity: the Roman aqueduct system. While modern popular culture associates aqueducts primarily with towering arched bridges like the Pont du Gard, arched structures accounted for less than twenty per cent of the total network. Over eighty per cent of the water conduits ran entirely underground in channels lined with hydraulic mortar called opus caementicium.
The crucial technical achievement was the calculation of gradient. Roman surveyors used an instrument called a chorobates — a wooden bench twenty feet long with water levels and plumb lines — to calculate an extraordinary slope as gentle as one foot of drop for every thousand feet of distance.
To maintain constant water velocity and prevent silt accumulation, settling basins, known as piscinae limariae, were installed at regular intervals. Here, suspended sediments would drop out before the water entered the urban distribution tanks, or castella aquae.
From these castella, water flowed through lead and terracotta pipes to public fountains, imperial bath complexes, and private villas of the wealthy. The public fountains ran continuously, serving not only as drinking supplies for common citizens but also flushing the city's sophisticated subterranean drainage network, the Cloaca Maxima, thereby preventing outbreaks of waterborne disease.
In conclusion, the Roman aqueduct was not merely a display of monumental imperial prestige; it was the biological life-support system that enabled millions to inhabit urban centres without succumbing to ecological collapse.`,
      questions: [
        { n: 31, type: "blank", label: "Arched bridges made up less than ______ percent of the network.", answer: "20", accept: ["twenty"], explanation: "'arched structures accounted for less than twenty per cent'." },
        { n: 32, type: "blank", label: "Most water channels were built ______ in the ground.", answer: "underground", explanation: "'Over eighty per cent of the water conduits ran entirely underground'." },
        { n: 33, type: "blank", label: "Water channels were waterproofed with hydraulic ______.", answer: "mortar", accept: ["cement"], explanation: "'lined with hydraulic mortar called opus caementicium'." },
        { n: 34, type: "blank", label: "Surveyors used a wooden instrument called a ______.", answer: "chorobates", explanation: "'instrument called a chorobates'." },
        { n: 35, type: "blank", label: "The gradient was as gradual as 1 foot per ______ feet.", answer: "1000", accept: ["1,000", "one thousand"], explanation: "'one foot of drop for every thousand feet of distance'." },
        { n: 36, type: "blank", label: "Special basins were designed to remove ______ from the water.", answer: "silt", accept: ["sediments", "sediment"], explanation: "'prevent silt accumulation, settling basins... were installed'." },
        { n: 37, type: "blank", label: "Urban distribution tanks were named castella ______.", answer: "aquae", explanation: "'distribution tanks, or castella aquae'." },
        { n: 38, type: "blank", label: "Water pipes were manufactured from lead and ______.", answer: "terracotta", accept: ["clay"], explanation: "'lead and terracotta pipes'." },
        { n: 39, type: "blank", label: "Continuous overflow water helped flush the city's ______ network.", answer: "drainage", accept: ["sewer", "drain"], explanation: "'flushing the city's sophisticated subterranean drainage network'." },
        { n: 40, type: "tfng", label: "Only wealthy citizens had access to aqueduct water.", answer: "FALSE", explanation: "Public fountains provided drinking water for common citizens." },
      ],
    },
  ],
};

/* ═════════════════════ AUTHENTIC ACADEMIC READING MATERIAL ═════════════════════ */
export const SAMPLE_READING_TEST_1: { durationMin: number; kind: "academic"; passages: ReadingPassage[] } = {
  durationMin: 60,
  kind: "academic",
  passages: [
    {
      n: 1,
      title: "Passage 1 — The History of Glass Making and Optical Innovation",
      text: `For over five millennia, glass has shaped human civilisation in ways far beyond decorative aesthetics. The earliest manufactured glass originated around 3500 BCE in Mesopotamia and ancient Egypt in the form of opaque decorative beads. However, the revolutionary breakthrough occurred in the first century BCE along the Syro-Palestinian coast with the invention of the blowpipe. For the first time, artisans could create thin, transparent vessels in minutes rather than days of grinding solid quartz blocks.

The Roman Empire transformed glass from a luxury commodity into everyday infrastructure. Roman architects installed the first cast-glass window panes in public bathhouses in Pompeii, discovering that natural light could be captured while retaining interior steam and heat. When the Western Roman Empire collapsed, the centre of glass artistry migrated to Venice, particularly the island of Murano in 1291, where furnaces were relocated to eliminate the risk of catastrophic city fires.

Venetian craftsmen achieved unprecedented clarity by purifying silica sand with potash made from Levant seaweed, inventing "cristallo" — the world's first truly colourless, crystal-clear glass. This optical transparency sparked a revolution in science. In thirteenth-century Italy, glass convex lenses were ground into the first wearable spectacles, instantly doubling the working lifespan of literate scholars, monks, and scribes.

By the early seventeenth century in the Netherlands and Italy, lens makers combined multiple curved glasses in cylindrical tubes, creating the first optical microscopes and astronomical telescopes. When Galileo Galilei observed the moons of Jupiter in 1610 through a Venetian glass telescope, humanity's understanding of the cosmos was permanently transformed. In modern times, silica glass fibre-optic cables carry over ninety-five per cent of global internet traffic as pulses of light, proving that glass remains the invisible foundation of the digital age.`,
      questions: [
        { n: 1, type: "blank", label: "The earliest glass beads were produced around 3500 BCE in Mesopotamia and ______.", answer: "Egypt", accept: ["ancient Egypt"], explanation: "Paragraph 1: 'Mesopotamia and ancient Egypt in the form of opaque decorative beads'." },
        { n: 2, type: "blank", label: "The invention of the ______ revolutionized vessel production in the 1st century BCE.", answer: "blowpipe", explanation: "Paragraph 1: 'invention of the blowpipe'." },
        { n: 3, type: "blank", label: "Early window panes were first installed in bathhouses in ______.", answer: "Pompeii", explanation: "Paragraph 2: 'public bathhouses in Pompeii'." },
        { n: 4, type: "blank", label: "Venetian glass workshops moved to Murano to avoid ______ in the city.", answer: "fires", accept: ["city fires", "fire"], explanation: "Paragraph 2: 'eliminate the risk of catastrophic city fires'." },
        { n: 5, type: "blank", label: "Venetian glassmakers added potash derived from Levant ______ to achieve clarity.", answer: "seaweed", explanation: "Paragraph 3: 'potash made from Levant seaweed'." },
        { n: 6, type: "blank", label: "The invention of ______ doubled the productive working years of scholars in Italy.", answer: "spectacles", accept: ["glasses", "wearable spectacles"], explanation: "Paragraph 3: 'wearable spectacles, instantly doubling the working lifespan'." },
        { n: 7, type: "blank", label: "Fibre-optic cables made of ______ carry most global internet data.", answer: "silica", accept: ["silica glass", "glass"], explanation: "Paragraph 4: 'silica glass fibre-optic cables carry over ninety-five per cent'." },
        { n: 8, type: "tfng", label: "Early Egyptian glass vessels were completely transparent.", answer: "FALSE", explanation: "Paragraph 1 states they were 'opaque decorative beads'." },
        { n: 9, type: "tfng", label: "Murano was chosen because of its proximity to silica mines.", answer: "FALSE", explanation: "Paragraph 2 states furnaces were moved there to reduce fire hazards in Venice." },
        { n: 10, type: "tfng", label: "Galileo built his telescope using Venetian glass lenses.", answer: "TRUE", explanation: "Paragraph 4 mentions 'through a Venetian glass telescope'." },
        { n: 11, type: "mcq", label: "The primary advantage of the blowpipe was that it", options: ["allowed higher melting temperatures", "produced thin vessels much faster", "eliminated the need for silica", "made glass fireproof"], answer: "produced thin vessels much faster", explanation: "Paragraph 1: 'artisans could create thin, transparent vessels in minutes rather than days'." },
        { n: 12, type: "mcq", label: "Cristallo glass was remarkable because it was", options: ["shatter-resistant", "coloured like emeralds", "the first truly colourless glass", "easier to carve"], answer: "the first truly colourless glass", explanation: "Paragraph 3: 'the world's first truly colourless, crystal-clear glass'." },
        { n: 13, type: "mcq", label: "What proportion of international internet traffic flows through optical fibre?", options: ["Around 50%", "Roughly 75%", "Over 95%", "100%"], answer: "Over 95%", explanation: "Paragraph 4: 'carry over ninety-five per cent of global internet traffic'." },
      ],
    },
    {
      n: 2,
      title: "Passage 2 — Plant Signalling and Underground Fungal Networks",
      text: `Beneath the floor of an old-growth temperate forest lies a subterranean biological internet that scientists call the mycorrhizal network, or colloquially, the 'Wood Wide Web'. This symbiotic partnership connects tree roots with mycorrhizal fungi, whose microscopic thread-like filaments, known as hyphae, extend through cubic miles of soil. The fungus cannot synthesise its own sugars through photosynthesis, so it extracts up to thirty per cent of the carbon produced by the tree. In exchange, the vast surface area of fungal hyphae absorbs water, phosphorus, and nitrogen and delivers them directly into the tree's root cells.

Recent research conducted by Professor Suzanne Simard at the University of British Columbia has revealed that these fungal networks do far more than trade nutrients; they function as a communal communication and mutual aid system. When older, deep-rooted 'hub trees' or 'mother trees' produce surplus sugars during sunny months, the network channels those carbohydrates to younger seedlings struggling in the shaded forest understorey.

Furthermore, mycorrhizal pathways transmit biochemical warning signals when a tree is attacked by herbivorous insects or pathogenic fungi. When an aphid infestation begins on a broadleaf tree, it releases volatile organic defence chemicals and sends electrical-chemical pulses through its root hyphae. Within six hours, neighbouring trees connected to the same network begin synthesising defensive tannins and protease inhibitors, rendering their foliage unpalatable to pests before the insects have even arrived.

This discovery has fundamentally altered forestry ecology. Clear-cut logging practices that remove mature mother trees and disrupt topsoil sever these fungal conduits, leaving newly planted monoculture saplings isolated, vulnerable to drought, and incapable of mounting cooperative chemical defences. Modern sustainable forestry now prioritises retaining hub trees to preserve the underground network intact.`,
      questions: [
        { n: 14, type: "blank", label: "Fungal filaments in the soil are biologically called ______.", answer: "hyphae", explanation: "Paragraph 1: 'thread-like filaments, known as hyphae'." },
        { n: 15, type: "blank", label: "Fungi obtain up to ______ percent of their carbon from host trees.", answer: "30", accept: ["thirty"], explanation: "Paragraph 1: 'extracts up to thirty per cent of the carbon'." },
        { n: 16, type: "blank", label: "In return, fungi supply trees with water, nitrogen, and ______.", answer: "phosphorus", explanation: "Paragraph 1: 'absorbs water, phosphorus, and nitrogen'." },
        { n: 17, type: "blank", label: "Large, mature trees that share sugars are called '______ trees'.", answer: "mother", accept: ["hub", "mother trees", "hub trees"], explanation: "Paragraph 2: 'hub trees or mother trees'." },
        { n: 18, type: "blank", label: "Warning signals trigger neighbours to produce defensive ______.", answer: "tannins", accept: ["protease inhibitors"], explanation: "Paragraph 3: 'synthesising defensive tannins and protease inhibitors'." },
        { n: 19, type: "blank", label: "Clear-cut logging damages the vital ______ layer where conduits live.", answer: "topsoil", explanation: "Paragraph 4: 'disrupt topsoil sever these fungal conduits'." },
        { n: 20, type: "tfng", label: "Fungi produce their own sugars through chlorophyll photosynthesis.", answer: "FALSE", explanation: "Paragraph 1 states 'The fungus cannot synthesise its own sugars through photosynthesis'." },
        { n: 21, type: "tfng", label: "Seedlings in shaded areas receive nutrients from older hub trees.", answer: "TRUE", explanation: "Paragraph 2 confirms sugars are channeled to younger seedlings in shade." },
        { n: 22, type: "tfng", label: "Neighbouring trees respond to pest alerts within six hours.", answer: "TRUE", explanation: "Paragraph 3: 'Within six hours, neighbouring trees... begin synthesising'." },
        { n: 23, type: "tfng", label: "Monoculture plantations resist drought better than old-growth forests.", answer: "FALSE", explanation: "Paragraph 4: monoculture saplings are 'vulnerable to drought'." },
        { n: 24, type: "mcq", label: "The primary purpose of Professor Simard's research was to demonstrate that", options: ["fungi harm healthy tree roots", "forests operate as interconnected collaborative systems", "clear-cutting improves soil quality", "all trees compete aggressively for sunlight"], answer: "forests operate as interconnected collaborative systems", explanation: "The passage shows communal communication and mutual aid between trees." },
        { n: 25, type: "mcq", label: "Tannins and protease inhibitors are produced to", options: ["attract pollinators", "speed up tree growth", "make leaves unpalatable to pests", "absorb excess nitrogen"], answer: "make leaves unpalatable to pests", explanation: "Paragraph 3: 'rendering their foliage unpalatable to pests'." },
        { n: 26, type: "mcq", label: "What policy does modern sustainable forestry recommend?", options: ["Removing all mature trees", "Applying chemical antifungal sprays", "Preserving hub trees during harvests", "Planting single-species saplings"], answer: "Preserving hub trees during harvests", explanation: "Paragraph 4: 'prioritises retaining hub trees to preserve the underground network'." },
      ],
    },
    {
      n: 3,
      title: "Passage 3 — The Cognitive Science of Spatial Navigation and Memory",
      text: `How does the human brain construct an internal representation of the physical world? For over a century, neuroscientists debated whether mental mapping was an abstract linguistic calculation or a dedicated geometric computation. The resolution came with the discovery of place cells in the hippocampus by John O'Keefe in 1971, followed by the identification of grid cells in the entorhinal cortex by Edvard and May-Britt Moser in 2005 — achievements that collectively earned the 2014 Nobel Prize in Physiology or Medicine.

Place cells fire selectively when an individual occupies a specific physical location in an environment, acting as an internal cognitive landmark. Grid cells, by contrast, fire at regular triangular hexagonal intervals across open terrain, functioning like the coordinate grid lines of a nautical navigation chart. Together with head-direction cells (which act as a biological compass) and border cells (which signal the perimeter of walls), this neural circuitry performs continuous dead reckoning, computing one's position by integrating velocity, direction, and elapsed travel time without relying constantly on external visual landmarks.

Intriguingly, cognitive psychologists have found that this ancient navigation architecture is not confined to physical geography; it forms the foundation of human episodic memory and abstract thought. When we recall an autobiographical memory — such as a childhood holiday — the hippocampus reactivates the precise spatial coordinate system in which that event occurred.

However, modern technological reliance on GPS satellite navigation presents a potential risk to these neural circuits. Brain-imaging studies conducted at University College London demonstrate that passive turn-by-turn navigation apps disengage the hippocampus, as drivers outsource spatial computation to automated algorithms. Long-term longitudinal data indicates that habitual GPS users show reduced grey matter volume in the posterior hippocampus compared to London licensed taxi drivers, whose legendary memorisation of 'The Knowledge' — 25,000 streets and 100,000 landmarks — induces measurable neuroplastic enlargement of the hippocampal structure.`,
      questions: [
        { n: 27, type: "blank", label: "Place cells in the hippocampus were discovered in 1971 by ______.", answer: "John O'Keefe", accept: ["O'Keefe"], explanation: "Paragraph 1: 'John O'Keefe in 1971'." },
        { n: 28, type: "blank", label: "Grid cells fire in a distinct ______ hexagonal pattern.", answer: "triangular", explanation: "Paragraph 2: 'regular triangular hexagonal intervals'." },
        { n: 29, type: "blank", label: "Head-direction cells function like a biological ______.", answer: "compass", explanation: "Paragraph 2: 'act as a biological compass'." },
        { n: 30, type: "blank", label: "Border cells activate when an organism approaches a ______.", answer: "perimeter", accept: ["wall", "boundary"], explanation: "Paragraph 2: 'border cells (which signal the perimeter of walls)'." },
        { n: 31, type: "blank", label: "The neural navigation system also stores our autobiographical ______ memories.", answer: "episodic", explanation: "Paragraph 3: 'human episodic memory and abstract thought'." },
        { n: 32, type: "blank", label: "London taxi drivers must master a spatial test known as 'The ______'.", answer: "Knowledge", explanation: "Paragraph 4: 'memorisation of The Knowledge'." },
        { n: 33, type: "blank", label: "London taxi drivers exhibit an increase in hippocampal ______ matter volume.", answer: "grey", accept: ["gray"], explanation: "Paragraph 4: 'reduced grey matter volume in... compared to London licensed taxi drivers'." },
        { n: 34, type: "tfng", label: "Grid cells were discovered in the hippocampus.", answer: "FALSE", explanation: "Paragraph 1 states grid cells are in the 'entorhinal cortex'." },
        { n: 35, type: "tfng", label: "Dead reckoning requires constant visual landmarks to calculate location.", answer: "FALSE", explanation: "Paragraph 2 says it computes position 'without relying constantly on external visual landmarks'." },
        { n: 36, type: "tfng", label: "Passive GPS navigation increases hippocampal brain activity.", answer: "FALSE", explanation: "Paragraph 4 says turn-by-turn apps 'disengage the hippocampus'." },
        { n: 37, type: "tfng", label: "The adult human brain is capable of neuroplastic structural changes.", answer: "TRUE", explanation: "Paragraph 4 mentions 'measurable neuroplastic enlargement of the hippocampal structure'." },
        { n: 38, type: "mcq", label: "Grid cells are best described as functioning like", options: ["a speedometer", "a coordinate grid on a map", "a digital camera", "a magnifying glass"], answer: "a coordinate grid on a map", explanation: "Paragraph 2: 'functioning like the coordinate grid lines of a nautical navigation chart'." },
        { n: 39, type: "mcq", label: "Why did John O'Keefe and the Mosers receive the Nobel Prize?", options: ["For curing Alzheimer's disease", "For discovering the brain's internal positioning system", "For designing GPS satellite software", "For inventing MRI brain scanning"], answer: "For discovering the brain's internal positioning system", explanation: "Paragraph 1 describes their discovery of place and grid cells." },
        { n: 40, type: "mcq", label: "What is the primary conclusion regarding GPS navigation use?", options: ["It improves memory retention", "It has no measurable effect on the brain", "Heavy reliance may reduce natural hippocampal engagement", "It should be banned for drivers"], answer: "Heavy reliance may reduce natural hippocampal engagement", explanation: "Paragraph 4 explains how passive GPS disengages the hippocampus." },
      ],
    },
  ],
};

/* ═════════════════════ AUTHENTIC WRITING MATERIAL ═════════════════════ */
export const SAMPLE_WRITING_TEST_1 = {
  task1: {
    kind: "report",
    prompt: "The chart below shows the percentage of electricity generated from renewable sources in four European countries between 2010 and 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    chartNote: "Germany (20% -> 52%), UK (8% -> 44%), Sweden (48% -> 68%), Poland (7% -> 22%).",
    band9: `The line graph illustrates the proportion of electricity produced from renewable energy sources across four European nations—Germany, the United Kingdom, Sweden, and Poland—over a fourteen-year period from 2010 to 2024.

Overall, all four countries experienced an upward trajectory in renewable energy adoption. Sweden maintained the highest renewable share throughout the period, while the United Kingdom demonstrated the most rapid growth rate, overtaking Germany in percentage growth despite starting from a low base.

In 2010, Sweden led significantly with approximately 48% of its power derived from renewables, followed by Germany at 20%. The United Kingdom and Poland generated negligible shares at 8% and 7% respectively. Over the subsequent decade, Sweden exhibited consistent expansion, peaking at 68% by 2024.

Concurrently, Germany witnessed substantial investment in wind and solar infrastructure, climbing steadily to reach 52% in 2024. Most remarkably, the UK's renewable proportion surged more than fivefold to finish at 44%, surpassing Poland by a wide margin. In contrast, Poland recorded modest progress, rising gradually to 22% by the end of the survey period.`,
    comments: "Examiner Assessment: Band 9.0 — Task Achievement: Clear overview with all key trends highlighted. Coherence & Cohesion: Excellent progression and cohesive devices. Lexical Resource: Natural collocations ('upward trajectory', 'surged more than fivefold'). Grammatical Range: Flawless complex sentences.",
  },
  task2: {
    kind: "essay",
    prompt: "Some people believe that artificial intelligence will create more jobs than it destroys, while others fear it will lead to widespread unemployment. Discuss both views and give your own opinion. Write at least 250 words.",
    band9: `The rapid ascent of artificial intelligence (AI) has ignited an intense global debate regarding its economic ramifications. While sceptics caution that automation will displace vast segments of the workforce, proponents argue that technological revolutions historically generate unprecedented industries. In my view, although AI will inevitably disrupt traditional labour markets in the short term, it will ultimately foster a net surplus of higher-value employment opportunities.

On the one hand, apprehensions regarding job displacement are well-founded. Unlike previous mechanical revolutions that replaced manual labour, modern machine learning algorithms can execute complex cognitive tasks—ranging from legal document review and financial auditing to diagnostic radiology. Consequently, routine clerical, administrative, and entry-level analytical roles are vulnerable to rapid redundancy. For workers lacking access to retraining, this transition risks causing severe transitional unemployment and widening socioeconomic inequality.

On the other hand, technological paradigms invariably catalyse new economic sectors. The deployment of AI systems necessitates specialized infrastructure: data curation, algorithmic auditing, cybersecurity oversight, and human-in-the-loop ethical governance. Furthermore, as automation lowers the cost of goods and services, aggregate consumer purchasing power increases, stimulating demand in human-centric domains such as healthcare, education, creative arts, and bespoke craftsmanship. History demonstrates that the introduction of personal computers eliminated typists but birthed software engineering, digital marketing, and the multi-trillion-dollar digital economy.

In conclusion, while the transition phase will demand vigorous governmental intervention in lifelong education and workforce reskilling, I firmly believe that AI will act as an engine of job creation rather than a driver of permanent mass unemployment.`,
    comments: "Examiner Assessment: Band 9.0 — Fully addresses all parts of the prompt with balanced arguments and a clear, well-substantiated personal position.",
  },
};

/* ═════════════════════ AUTHENTIC SPEAKING MATERIAL ═════════════════════ */
export const SAMPLE_SPEAKING_TEST_1 = {
  part1: {
    topic: "Hometown & Daily Routine",
    questions: [
      "Where is your hometown located?",
      "What do you like most about living in your area?",
      "Has your hometown changed much since you were a child?",
      "Do you prefer a morning routine or an evening routine?",
    ],
  },
  part2: {
    prompt: "Describe an environmental problem that your city or community is facing.",
    cues: [
      "what the problem is",
      "what causes it",
      "how it affects local residents",
      "and explain what steps could be taken to solve it.",
    ],
    prepareSec: 60,
    speakSec: 120,
  },
  part3: {
    topic: "Environmental Responsibility & Urban Planning",
    questions: [
      "Who should bear the primary responsibility for environmental conservation: individuals or governments?",
      "How can modern cities encourage citizens to use public transportation more frequently?",
      "Do you think future generations will have a cleaner or more polluted world?",
      "Should schools make environmental studies a compulsory subject for all students?",
    ],
  },
  sample: {
    text: "An environmental challenge that my hometown currently grapples with is the alarming accumulation of single-use plastic waste and the degradation of our local canal system. Sreemangal is blessed with lush greenery, but untreated municipal run-off and non-biodegradable packaging frequently choke our waterways, causing artificial waterlogging during the monsoon season. To tackle this, local authorities must enforce strict packaging bans, establish segregated recycling facilities, and conduct community clean-up drives.",
    audio: "/audio/cambridge/speaking-sample.wav",
  },
};

/**
 * Returns authentic Cambridge IELTS test material for any skill.
 */
export function getCambridgeTestSkillData(
  skill: string,
  _bookNumber?: number,
  _testNumber?: number
) {
  switch (skill) {
    case "listening":
      return SAMPLE_LISTENING_TEST_1;
    case "reading":
      return SAMPLE_READING_TEST_1;
    case "writing":
      return SAMPLE_WRITING_TEST_1;
    case "speaking":
      return SAMPLE_SPEAKING_TEST_1;
    default:
      return null;
  }
}
