/**
 * Cambridge IELTS Library seed — generates the FULL catalog:
 *   books 1-19 × (Academic + General Training where published) × 4 tests,
 *   every test carrying listening / reading / writing / speaking payloads.
 *
 * All passages, questions, transcripts and band-9 samples are ORIGINAL
 * practice content written in the Cambridge style for Sadia's IELTS — no
 * copyrighted Cambridge text is reproduced. Audio clips live in
 * /public/audio/cambridge (generated via TTS) and are shared by the parts.
 *
 * Run: bun scripts/cambridge-seed.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/* ── deterministic PRNG so re-seeding yields the same catalog ─────────── */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── shared question shape (contract with the test player) ────────────── */
type QType = "blank" | "mcq" | "tfng" | "match";
interface Q {
  n: number;
  type: QType;
  label: string;
  options?: string[];
  answer: string;
  accept?: string[];
  explanation: string;
}

/* ═════════════════════ READING — ACADEMIC PASSAGES ═════════════════════
   10 original passages. Each carries 12 authored questions:
   4 mcq + 4 tfng + 4 blank, tightly tied to the text.                    */
interface Passage {
  title: string;
  paragraphs: string[];
  mcq: Array<{ label: string; options: [string, string, string, string]; answer: string; explanation: string }>;
  tfng: Array<{ label: string; answer: "TRUE" | "FALSE" | "NOT GIVEN"; explanation: string }>;
  blank: Array<{ label: string; answer: string; accept?: string[]; explanation: string }>;
}

const PASSAGES: Passage[] = [
  {
    title: "The Science of Sleep and Memory",
    paragraphs: [
      "For centuries sleep was treated as a passive shutdown of the mind — a nightly pause between productive hours. Modern neuroscience has overturned that view entirely. While we sleep, the brain runs a sophisticated maintenance programme: it replays the day's experiences, strengthens the connections that matter and prunes away the noise. Researchers at the Sleep & Cognition Lab in Rotterdam have shown that people who sleep for at least seven hours after learning a new task outperform sleep-deprived peers by up to forty per cent the following morning.",
      "The most striking discoveries concern slow-wave sleep, the deep stage that dominates the first half of the night. During this phase the hippocampus — a small seahorse-shaped structure that acts as the brain's temporary filing cabinet — replays the day's memories at high speed and gradually transfers them to the cortex for long-term storage. Students who revised vocabulary before bed, for example, remembered measurably more words a week later than students who revised in the morning, even when total study time was identical.",
      "Sleep deprivation, by contrast, does more than dull attention. Brain-imaging studies reveal that after a single night of missed sleep the amygdala, the brain's emotional alarm centre, becomes up to sixty per cent more reactive, while the prefrontal regions that normally regulate it grow quieter. This imbalance explains why tired people overreact to minor frustrations — and why exam-week all-nighters so often backfire, weakening exactly the memory circuits the student is trying to reinforce.",
      "The practical implications reach far beyond the classroom. Hospitals have redesigned night-shift rosters after studies linked fatigue to surgical errors, and elite sports teams now schedule training around players' circadian rhythms. The message from the research is remarkably consistent: sleep is not the price we pay for learning, it is the mechanism by which learning sticks.",
    ],
    mcq: [
      { label: "According to the first paragraph, early views of sleep treated it as", options: ["an active maintenance process", "a passive pause in mental activity", "a danger to physical health", "the cause of vivid dreams"], answer: "a passive pause in mental activity", explanation: "Paragraph 1 says sleep 'was treated as a passive shutdown of the mind'." },
      { label: "The Rotterdam study found that sleeping at least seven hours after learning improved next-morning performance by as much as", options: ["twenty per cent", "thirty per cent", "forty per cent", "sixty per cent"], answer: "forty per cent", explanation: "Paragraph 1 states the advantage was 'up to forty per cent'." },
      { label: "During slow-wave sleep, the hippocampus mainly", options: ["produces emotional reactions", "replays and transfers memories", "controls breathing patterns", "generates new brain cells"], answer: "replays and transfers memories", explanation: "Paragraph 2: the hippocampus 'replays the day's memories... and gradually transfers them to the cortex'." },
      { label: "What happens to the amygdala after one night without sleep?", options: ["It becomes less reactive", "It stops working entirely", "It becomes far more reactive", "It shrinks in size"], answer: "It becomes far more reactive", explanation: "Paragraph 3 reports the amygdala can become 'up to sixty per cent more reactive'." },
    ],
    tfng: [
      { label: "The studies compared learners with equal amounts of total study time.", answer: "TRUE", explanation: "The comparison held 'even when total study time was identical'." },
      { label: "Slow-wave sleep occurs mostly in the final hours of the night.", answer: "FALSE", explanation: "Deep slow-wave sleep 'dominates the first half of the night'." },
      { label: "Morning revision is proven more effective than bedtime revision.", answer: "FALSE", explanation: "The opposite was reported: bedtime vocabulary revision produced better recall." },
      { label: "Hospitals changed shift schedules because of fatigue-related research.", answer: "TRUE", explanation: "Hospitals 'have redesigned night-shift rosters' after such studies." },
    ],
    blank: [
      { label: "The hippocampus acts as the brain's temporary ______ where fresh memories are filed.", answer: "filing cabinet", explanation: "It is described as 'the brain's temporary filing cabinet'." },
      { label: "Replayed memories are gradually moved to the ______ for long-term storage.", answer: "cortex", explanation: "Memories are transferred 'to the cortex'." },
      { label: "When we are sleep-deprived, the prefrontal regions that regulate emotion grow ______.", answer: "quieter", explanation: "The regulating regions 'grow quieter'." },
      { label: "Sports teams now plan training sessions around players' ______.", answer: "circadian rhythms", accept: ["circadian"], explanation: "Training is scheduled 'around players' circadian rhythms'." },
    ],
  },
  {
    title: "Urban Farming in Dense Cities",
    paragraphs: [
      "On the roof of an unremarkable office block in central Lyon, tomato vines climb ten metres of vertical rope while basil and mint crowd stacked hydroponic trays below. The farm produces roughly four tonnes of vegetables a year on 600 square metres — modest by rural standards, remarkable in a district where a square metre of land costs more than most people earn in six months. Urban farming, once a hobby of eco-enthusiasts, is quietly becoming serious infrastructure.",
      "Its strongest argument is distance. A conventional lettuce sold in a city supermarket may have travelled 2,000 kilometres and lost sweetness and vitamins on every cold truck of the journey. Rooftop produce reaches the kitchen within the hour, and because it is grown in controlled conditions it needs no chemical pesticides. Chefs in Lyon, Paris and Singapore report that restaurant kitchens are willing to pay a premium for herbs cut minutes before service.",
      "The economics remain difficult, however. Glass, pumps, grow-lights and skilled labour are expensive, and critics note that vertical farms consume large amounts of electricity — most of it for lighting. The Lyon project survives by stacking revenue streams: restaurant sales, paid workshops, corporate team events and a subscription scheme for local families. Cities that subsidise water and rent, as Singapore does, see far more ventures survive their first five years.",
      "Planners are beginning to treat food growing the way they treat parks — as public equipment. Several European cities now require large new buildings to dedicate a share of roof space to either solar panels or cultivation. Whether the future city feeds itself is still an open question, but the direction is clear: the shortest food chain is the one that never leaves the neighbourhood.",
    ],
    mcq: [
      { label: "The Lyon rooftop farm is described as remarkable mainly because of", options: ["its unusually large size", "the price of land in the district", "the variety of herbs grown", "its robotic harvesting system"], answer: "the price of land in the district", explanation: "Output is contrasted with land that 'costs more than most people earn in six months'." },
      { label: "What is stated as the strongest argument for urban farming?", options: ["Lower labour costs", "Reduced transport distance", "Higher crop yields", "Government tax breaks"], answer: "Reduced transport distance", explanation: "'Its strongest argument is distance.'" },
      { label: "Critics of vertical farming point to", options: ["pest outbreaks", "electricity consumption", "water shortages", "crop theft"], answer: "electricity consumption", explanation: "Critics highlight large electricity use, 'most of it for lighting'." },
      { label: "The Lyon project stays profitable by", options: ["selling only to restaurants", "exporting to neighbouring towns", "combining several income streams", "replacing workers with machines"], answer: "combining several income streams", explanation: "Restaurant sales, workshops, events and subscriptions are listed." },
    ],
    tfng: [
      { label: "The Lyon farm covers more than 1,000 square metres.", answer: "FALSE", explanation: "It covers 600 square metres." },
      { label: "Rooftop-grown vegetables can lose nutrients during long transport.", answer: "FALSE", explanation: "It is conventional transported produce that loses 'sweetness and vitamins'; rooftop produce arrives within the hour." },
      { label: "Some cities make developers set aside roof space for growing food.", answer: "TRUE", explanation: "Several cities 'require large new buildings to dedicate a share of roof space'." },
      { label: "Singapore subsidises rent and water for urban farms.", answer: "TRUE", explanation: "Stated directly in the third paragraph." },
    ],
    blank: [
      { label: "Rooftop produce can reach the kitchen within a single ______ of being picked.", answer: "hour", explanation: "'within the hour'." },
      { label: "Because conditions are controlled, no chemical ______ are needed.", answer: "pesticides", explanation: "'it needs no chemical pesticides'." },
      { label: "Local families can join the farm through a ______ scheme.", answer: "subscription", explanation: "'a subscription scheme for local families'." },
      { label: "Planners increasingly regard food growing as ______ equipment for the city.", answer: "public", explanation: "Treated 'the way they treat parks — as public equipment'." },
    ],
  },
  {
    title: "The Return of the Night Trains",
    paragraphs: [
      "A decade ago the sleeper train seemed finished. Budget flights undercut every route, and rail companies across Europe scrapped their overnight services one by one. In 2025 the mood has reversed: four private operators have launched new sleeper routes, bookings grew thirty per cent last year, and one Austrian-based network now carries more overnight passengers than at any point since the 1990s.",
      "The renaissance is driven less by romance than by arithmetic. A flight from Vienna to Brussels plus a hotel night and airport transfers can cost more than a sleeper berth that delivers its passenger to the city centre at 8 a.m. Companies also face mounting pressure to cut business-travel emissions, and a night in a couchette produces roughly one-twentieth of the carbon of the equivalent flight.",
      "The new operators have learned from the past. Instead of converting day carriages, they built rolling stock with proper mattresses, sockets at every berth, quiet zones and showers — facilities the old national sleepers lacked. Wi-Fi is deliberately absent: operators found that passengers pay for the journey precisely to be offline, and surveys rank 'digital detox' among the top three reasons for choosing rail over air.",
      "Challenges remain. Sleeper carriages are expensive to build, night slots at major stations are scarce, and a single delayed freight train can hold up an entire corridor. Yet governments are responding: France has banned several short domestic flights, and Austria co-finances night services as public transport. The sleeper, written off twenty years ago, now looks less like nostalgia and more like a rehearsal for how Europe intends to travel.",
    ],
    mcq: [
      { label: "The revival of sleeper trains is best shown by", options: ["the closure of budget airlines", "record overnight passenger numbers", "cheaper hotel prices", "new high-speed lines"], answer: "record overnight passenger numbers", explanation: "One network carries more overnight passengers than at any time since the 1990s." },
      { label: "According to the second paragraph, the revival is mainly explained by", options: ["nostalgia for older trains", "cost and emissions arithmetic", "improved Wi-Fi", "government advertising"], answer: "cost and emissions arithmetic", explanation: "'driven less by romance than by arithmetic'." },
      { label: "Why did operators deliberately leave out Wi-Fi?", options: ["It was too expensive", "Passengers prefer being offline", "Signal is poor at night", "It drains the train's power"], answer: "Passengers prefer being offline", explanation: "Passengers choose the journey to be offline; 'digital detox' is a top-three reason." },
      { label: "One difficulty mentioned for sleeper networks is", options: ["scarce night slots at stations", "lack of station staff", "poor passenger demand", "shortage of linen"], answer: "scarce night slots at stations", explanation: "'night slots at major stations are scarce'." },
    ],
    tfng: [
      { label: "European rail companies scrapped their sleeper services about ten years ago.", answer: "TRUE", explanation: "'a decade ago... rail companies across Europe scrapped their overnight services'." },
      { label: "A night train produces about half the carbon of the equivalent flight.", answer: "FALSE", explanation: "Roughly one-twentieth, not half." },
      { label: "The new sleeper carriages were converted from older day carriages.", answer: "FALSE", explanation: "'Instead of converting day carriages, they built rolling stock'." },
      { label: "France has removed some short domestic flights.", answer: "TRUE", explanation: "France 'has banned several short domestic flights'." },
    ],
    blank: [
      { label: "A couchette delivers travellers to the city centre at 8 ______.", answer: "a.m.", accept: ["am", "in the morning"], explanation: "'delivers its passenger to the city centre at 8 a.m.'." },
      { label: "The new carriages have ______ at every berth.", answer: "sockets", accept: ["power sockets", "plug sockets"], explanation: "'sockets at every berth'." },
      { label: "A delayed ______ train can delay an entire corridor.", answer: "freight", explanation: "'a single delayed freight train'." },
      { label: "Austria co-finances night services as ______ transport.", answer: "public", explanation: "'co-finances night services as public transport'." },
    ],
  },
  {
    title: "Coral Gardening in the Pacific",
    paragraphs: [
      "When a marine heatwave bleached 80 per cent of the coral around Hauta Atoll in 2016, most scientists wrote the reef off. Ten years later, divers swim through corridors of staghorn thicker than before the disaster. The recovery was not luck. It was gardening — the deliberate propagation of coral fragments in underwater nurseries, then outplanting them onto dead reef like seedlings in a field.",
      "The technique exploits a coral's unusual biology: a broken fragment can regrow into a full colony, and corals grown from the same 'parent' can be attached to frames with epoxy or fishing line. Nursery-grown colonies grow up to fifty times faster than free larvae, because the fragile early life stage — when most coral dies — is skipped entirely. A two-centimetre fragment can become a basketball-sized colony in three years.",
      "Gardening cannot cure the underlying disease. Ocean warming still outpaces restoration, and a nursery that survives one heatwave may not survive the next. So conservationists now select 'thermally tolerant' parent colonies — those that stayed coloured while neighbours bleached — reasoning that their offspring inherit a measure of resistance. Early trials suggest such plantings survive heat stress at twice the rate of random fragments.",
      "The work has changed the people as much as the reef. At Hauta, villagers who once dynamited fish now run the nurseries, paid partly from a visitor fee that funds monitoring. The project's founder insists the science is simple; the hard part is governance — deciding who may fish, where, and when. Healthy reefs, it turns out, grow from agreements as much as from fragments.",
    ],
    mcq: [
      { label: "What happened to Hauta's coral in the 2016 heatwave?", options: ["It grew rapidly", "Most of it bleached", "It was eaten by starfish", "It was buried by sand"], answer: "Most of it bleached", explanation: "A heatwave 'bleached 80 per cent of the coral'." },
      { label: "Nursery-grown corals grow faster than larvae mainly because they", options: ["receive extra fertiliser", "skip the fragile early stage", "live in deeper water", "are kept in cooler currents"], answer: "skip the fragile early stage", explanation: "The fragile early life stage, 'when most coral dies', is skipped." },
      { label: "Conservationists choose parent corals that", options: ["grew the largest", "survived heat without bleaching", "lived at greatest depth", "reproduced fastest"], answer: "survived heat without bleaching", explanation: "'thermally tolerant' parents 'stayed coloured while neighbours bleached'." },
      { label: "The project's founder believes the hardest element is", options: ["the biology of coral", "funding the nurseries", "local governance", "diver training"], answer: "local governance", explanation: "'the hard part is governance'." },
    ],
    tfng: [
      { label: "A broken coral fragment can develop into a complete colony.", answer: "TRUE", explanation: "'a broken fragment can regrow into a full colony'." },
      { label: "Nursery fragments are attached using fishing line or epoxy.", answer: "TRUE", explanation: "Attached 'with epoxy or fishing line'." },
      { label: "Coral restoration has already solved the problem of ocean warming.", answer: "FALSE", explanation: "Warming 'still outpaces restoration'." },
      { label: "Villagers at Hauta receive part of their income from a visitor fee.", answer: "TRUE", explanation: "Villagers are 'paid partly from a visitor fee'." },
    ],
    blank: [
      { label: "Around ______ per cent of Hauta's coral bleached in 2016.", answer: "80", accept: ["eighty"], explanation: "'bleached 80 per cent'." },
      { label: "Nursery-grown colonies grow up to ______ times faster than free larvae.", answer: "fifty", accept: ["50"], explanation: "'up to fifty times faster'." },
      { label: "A two-centimetre fragment can reach the size of a ______ in three years.", answer: "basketball", explanation: "'basketball-sized colony in three years'." },
      { label: "Tolerant plantings survive heat stress at ______ times the usual rate.", answer: "twice", accept: ["2", "two times"], explanation: "'twice the rate of random fragments'." },
    ],
  },
  {
    title: "Salt: The First Global Commodity",
    paragraphs: [
      "Long before oil, salt moved the world's trade. Every human body needs it, armies need it to preserve rations, and before refrigeration no civilisation could store fish, meat or cheese without it. The Roman Republic partly paid its soldiers an allowance to buy salt — the origin of the word 'salary' — and Chinese officials a thousand years earlier had already made salt a state monopoly to finance armies and canals.",
      "The mineral's power lay in geography. Salt is common, but cheap salt is not: it must be mined, boiled from brine or evaporated from seawater, and each method ties production to particular places. Coastal France still shows the shallow evaporation pans of the Atlantic trade; central Europe's towns grew rich on underground deposits; the Sahara's salt slabs crossed the desert on camel caravans. Taxes on salt shaped routes, wars and revolutions alike — the French gabelle was so hated it survives in language as a synonym for unfair taxation.",
      "Industrial chemistry finally broke salt's monopoly on food preservation. Canning, then refrigeration, removed the need to cure everything, and salt slipped from strategic resource to cheap kitchen staple. Yet it kept its industrial crown: modern economies consume enormous quantities in chemical plants, where an electric current splits salt into chlorine and caustic soda — the feedstock of plastics, paper, soap and water treatment.",
      "Historians argue that salt deserves its reputation as the first global commodity because its trade routes taught the world long-distance commerce: contracts, credit and quality standards all matured on the salt roads before they reached silk or spice. The white crystals that now cost pennies were once so precious that empires rose and fell on their control.",
    ],
    mcq: [
      { label: "The word 'salary' originates from", options: ["a Roman soldier's salt allowance", "a Chinese tax office", "a French coastal town", "a caravan fee"], answer: "a Roman soldier's salt allowance", explanation: "Rome partly paid soldiers an allowance to buy salt, 'the origin of the word salary'." },
      { label: "The gabelle is described as", options: ["a famous evaporation pan", "a camel caravan route", "a deeply resented French salt tax", "an underground mine"], answer: "a deeply resented French salt tax", explanation: "The gabelle 'was so hated it survives... as a synonym for unfair taxation'." },
      { label: "Salt lost its food-preservation importance because of", options: ["canning and refrigeration", "the fall of empires", "new trade routes", "rising prices"], answer: "canning and refrigeration", explanation: "These technologies 'removed the need to cure everything'." },
      { label: "In modern chemical plants, electricity splits salt into", options: ["sodium and starch", "chlorine and caustic soda", "gold and brine", "soap and paper"], answer: "chlorine and caustic soda", explanation: "Stated directly in the third paragraph." },
    ],
    tfng: [
      { label: "Cheap salt is easy to obtain in most locations.", answer: "FALSE", explanation: "'Salt is common, but cheap salt is not'." },
      { label: "Salt caravans once travelled across the Sahara.", answer: "TRUE", explanation: "'the Sahara's salt slabs crossed the desert on camel caravans'." },
      { label: "Salt is no longer economically important today.", answer: "FALSE", explanation: "Modern economies consume 'enormous quantities' industrially." },
      { label: "Salt trade helped develop contracts and credit before other trades.", answer: "TRUE", explanation: "These practices 'matured on the salt roads before they reached silk or spice'." },
    ],
    blank: [
      { label: "Chinese officials made salt a state ______ to fund armies and canals.", answer: "monopoly", explanation: "'made salt a state monopoly'." },
      { label: "Seawater is concentrated in shallow evaporation ______ along the French coast.", answer: "pans", explanation: "'the shallow evaporation pans'." },
      { label: "Before refrigeration, salt was essential to ______ fish, meat and cheese.", answer: "preserve", accept: ["curing", "cure"], explanation: "No civilisation could 'store fish, meat or cheese without it'." },
      { label: "The salt crystals that once built empires now cost ______.", answer: "pennies", explanation: "'now cost pennies'." },
    ],
  },
  {
    title: "Inside the Honeybee Democracy",
    paragraphs: [
      "When a honeybee colony outgrows its hive, it must choose a new home — a decision made not by the queen but by several hundred scouts who debate it, in effect, like a committee. Scouts return from candidate tree cavities and dance on the comb: the longer and livelier the dance, the stronger the endorsement. Over days the swarm narrows hundreds of options to a single site, and the choice is almost always near-optimal for warmth, size and protection.",
      "Biologist Thomas Seeley, who has studied swarms for four decades, identified the rules that make this democracy work. Scouts compete honestly rather than follow leaders; each dancer degrades her own report over time, so stale information fades; and scouts that finish dancing are butted by others — a nudge that forces them to re-inspect rather than dogmatically repeat. The swarm therefore keeps searching until a quorum of scouts converges on one site, a design that avoids both gridlock and premature decisions.",
      "The colony's economics are equally elegant. Foragers allocate themselves to flowers by a feedback loop: a profitable patch earns energetic dances that recruit more bees, which then dilutes the patch's per-capita yield until foragers redistribute. No bee compares total supply and demand; the balance emerges from thousands of local decisions. Computer scientists have copied this 'hive allocation' pattern to route internet traffic and schedule warehouse robots.",
      "Seeley's conclusion reaches beyond apiculture. Groups — human or insect — decide well when information flows freely, loud voices are damped, and no one hoards influence. The honeybee, he argues, assembled a functioning democracy millions of years before any assembly building was raised, and its minutes are written in dance.",
    ],
    mcq: [
      { label: "Who makes the swarm's decision about a new home?", options: ["The queen alone", "Several hundred scout bees", "The oldest drones", "The beekeeper"], answer: "Several hundred scout bees", explanation: "The choice is made 'by several hundred scouts'." },
      { label: "A longer, livelier dance signals", options: ["a distant site", "a stronger endorsement of a site", "a warning of danger", "a request for food"], answer: "a stronger endorsement of a site", explanation: "Dance length and vigour encode endorsement." },
      { label: "Scouts are butted by others in order to", options: ["punish laziness", "make them re-inspect sites", "mark the winner", "signal the queen"], answer: "make them re-inspect sites", explanation: "The nudge 'forces them to re-inspect rather than dogmatically repeat'." },
      { label: "Engineers have applied hive allocation to", options: ["weather forecasting", "internet routing and warehouse robots", "bridge design", "aircraft scheduling"], answer: "internet routing and warehouse robots", explanation: "Copied 'to route internet traffic and schedule warehouse robots'." },
    ],
    tfng: [
      { label: "Scouts degrade their own dance reports over time.", answer: "TRUE", explanation: "'each dancer degrades her own report over time'." },
      { label: "The queen inspects each candidate cavity personally.", answer: "FALSE", explanation: "The scouts debate and decide; no queen inspection is mentioned." },
      { label: "Foragers abandon a patch as soon as one bee reports low yield.", answer: "FALSE", explanation: "Redistribution emerges gradually as per-capita yield dilutes." },
      { label: "Seeley links good group decisions to free information flow and damped loud voices.", answer: "TRUE", explanation: "The final paragraph lists exactly these conditions." },
    ],
    blank: [
      { label: "The swarm searches until a ______ of scouts agrees on one site.", answer: "quorum", explanation: "'keeps searching until a quorum of scouts converges'." },
      { label: "The chosen cavity is judged on warmth, size and ______.", answer: "protection", explanation: "'near-optimal for warmth, size and protection'." },
      { label: "A profitable flower patch earns ______ dances that recruit more bees.", answer: "energetic", explanation: "'earns energetic dances'." },
      { label: "Seeley says the colony's records are 'written in ______'.", answer: "dance", explanation: "'its minutes are written in dance'." },
    ],
  },
  {
    title: "Rebuilding with Bamboo",
    paragraphs: [
      "After the 2015 earthquake, engineers inspecting ruined villages in Nepal kept meeting the same contradiction: concrete buildings collapsed, while many older bamboo structures stood. Bamboo's hollow, fibre-rich stem carries tension like steel at a fraction of the weight, and its root network anchors hillsides. A material villagers had begun to abandon as 'the poor man's timber' was suddenly the most advanced thing in the valley.",
      "Modern bamboo engineering is not nostalgia. Treating poles with borax solutions repels the beetles that once rotted houses in three years; laminated bamboo beams are now tested to span school gymnasiums; and because the plant matures in four to six years — versus decades for structural timber — plantations can supply construction continuously. Seismic performance is the killer feature: bamboo's flexibility lets a frame sway and survive forces that snap brittle masonry.",
      "The obstacles are institutional more than technical. Building codes in most countries barely mention bamboo, so banks hesitate to finance it and insurers price it blindly. Standards bodies are catching up: international norms for structural bamboo appeared only recently, and architecture schools now teach joint design that traditional builders knew intuitively — lashing, pinning and splitting to let a joint flex instead of fracture.",
      "For disaster-prone coastlines, the material's next act may be climate adaptation. Bamboo plantations absorb carbon quickly, buffer storm surge and stabilise soil, so planting them doubles as infrastructure. Governments from the Philippines to Kenya now subsidise groves as flood defences. The grass that built scaffolding for centuries is being re-read as one of the cheapest resilience tools on the planet.",
    ],
    mcq: [
      { label: "After the Nepal earthquake, engineers were struck that", options: ["all concrete buildings survived", "many bamboo structures remained standing", "bamboo houses were cheaper to rebuild", "timber frames collapsed first"], answer: "many bamboo structures remained standing", explanation: "'concrete buildings collapsed, while many older bamboo structures stood'." },
      { label: "Bamboo treated with borax solves the historical problem of", options: ["earthquake damage", "beetle rot", "fire risk", "fungal staining"], answer: "beetle rot", explanation: "Borax 'repels the beetles that once rotted houses in three years'." },
      { label: "The main barriers to bamboo construction today are", options: ["technical weaknesses", "building codes and finance", "shortage of plantations", "weight of the material"], answer: "building codes and finance", explanation: "'The obstacles are institutional more than technical'." },
      { label: "Bamboo groves are subsidised by governments partly because they", options: ["produce drinking water", "act as flood defences", "replace solar panels", "lower urban noise"], answer: "act as flood defences", explanation: "Groves 'buffer storm surge and stabilise soil', so they are subsidised." },
    ],
    tfng: [
      { label: "Bamboo's fibrous, hollow stem handles tension well.", answer: "TRUE", explanation: "The stem 'carries tension like steel'." },
      { label: "Bamboo takes longer to mature than structural timber.", answer: "FALSE", explanation: "Bamboo matures in four to six years 'versus decades for structural timber'." },
      { label: "International structural bamboo standards have existed for many decades.", answer: "FALSE", explanation: "Norms appeared 'only recently'." },
      { label: "Architecture schools now teach bamboo joint design.", answer: "TRUE", explanation: "Schools 'now teach joint design'." },
    ],
    blank: [
      { label: "Laminated bamboo beams have been tested to span school ______.", answer: "gymnasiums", explanation: "Tested 'to span school gymnasiums'." },
      { label: "Bamboo's flexibility allows a frame to ______ and survive seismic forces.", answer: "sway", explanation: "'lets a frame sway and survive'." },
      { label: "Traditional joints are made by lashing, pinning and ______ the material.", answer: "splitting", explanation: "'lashing, pinning and splitting'." },
      { label: "Bamboo plantations ______ carbon quickly, helping climate adaptation.", answer: "absorb", accept: ["sequester", "store"], explanation: "Plantations 'absorb carbon quickly'." },
    ],
  },
  {
    title: "The Psychology of Queues",
    paragraphs: [
      "Queue research began with an unhappy observation: people would rather stand still for eight minutes than walk for four and wait for four, even though the second option ends sooner. The reason is procedural justice — we tolerate waiting when the system feels fair, and a moving line feels fairer than a stationary one. Airports understood this decades ago and curved the walk from gate to baggage claim so passengers keep moving.",
      "Uncertainty is the true enemy. Studies of telephone hold-lines show that a caller told 'about four minutes' abandons the call far less often than a caller told nothing, even when both wait six. This is why theme parks post estimated waits — the sign is less a forecast than a sedative — and why apps that show a driver's exact location cut taxi complaints dramatically without making the car arrive faster.",
      "Fairness rules cut even deeper. A single queue feeding several counters is objectively efficient and subjectively calming: no one can be 'overtaken' by a queue-jumper, so resentment falls. Supermarkets that merged their lanes saw complaints drop even when average waits rose slightly. Conversely, when hospitals prioritise patients by urgency, staff are trained to explain the rule to everyone in the room — because a queue that looks unfair breeds conflict even when it is not.",
      "The newest frontier is the elimination of the queue itself. Virtual lines — book a slot, get a buzz, walk in — remove the visible fairness problem entirely, but they introduce a subtler one: newcomers cannot see that others are waiting at all, so occasional anger migrates online, where review scores take the hit. The queue, it seems, is not really about time. It is about the story people are told while time passes.",
    ],
    mcq: [
      { label: "People prefer a moving line of equal total duration because", options: ["it is shorter", "it feels fairer", "it has more space", "it ends sooner"], answer: "it feels fairer", explanation: "'a moving line feels fairer than a stationary one'." },
      { label: "Theme parks post estimated wait times mainly to", options: ["improve accuracy", "calm visitors", "attract press", "reduce staff"], answer: "calm visitors", explanation: "'the sign is less a forecast than a sedative'." },
      { label: "A single queue feeding several counters reduces", options: ["actual wait times only", "resentment about queue-jumping", "staff workload", "checkout errors"], answer: "resentment about queue-jumping", explanation: "No one can be overtaken, 'so resentment falls'." },
      { label: "One drawback of virtual queues is that", options: ["they are slower", "newcomers cannot see others waiting", "they cost more to run", "staff dislike them"], answer: "newcomers cannot see others waiting", explanation: "Newcomers 'cannot see that others are waiting at all'." },
    ],
    tfng: [
      { label: "Curved airport walkways were designed to keep passengers moving.", answer: "TRUE", explanation: "Airports 'curved the walk... so passengers keep moving'." },
      { label: "Callers given a time estimate usually wait less time in total.", answer: "FALSE", explanation: "Both callers waited six minutes; only abandonment differed." },
      { label: "Some supermarkets merged lanes and saw complaints fall.", answer: "TRUE", explanation: "'Supermarkets that merged their lanes saw complaints drop'." },
      { label: "Hospital staff never explain priority rules to waiting patients.", answer: "FALSE", explanation: "Staff are trained to explain the rule 'to everyone in the room'." },
    ],
    blank: [
      { label: "The sense that a system is fair is called procedural ______.", answer: "justice", explanation: "'procedural justice'." },
      { label: "Showing a taxi driver's exact location cut ______ complaints.", answer: "taxi", explanation: "'cuts taxi complaints dramatically'." },
      { label: "Merged lanes calmed customers even when average waits rose ______.", answer: "slightly", explanation: "'even when average waits rose slightly'." },
      { label: "With virtual lines, some anger migrates to online ______ scores.", answer: "review", explanation: "'review scores take the hit'." },
    ],
  },
  {
    title: "Mapping the Deep Ocean",
    paragraphs: [
      "We have better maps of Mars than of our own sea floor — a phrase oceanographers repeat so often it has become a slogan, yet it remains literally true. Only about a quarter of the global seabed has been mapped to modern standards, even though the deep ocean covers more than half the planet. A United Nations-led project aims to finish the job by 2030, using a fleet of research vessels, autonomous submarines and, increasingly, commercial ships that share their sonar data while they sail.",
      "The reason for the gap is physics as much as funding. Radar and satellites cannot see through kilometres of water; depth must be measured by sound, and sound travels slowly — a survey ship mapping a patch of abyss at walking pace may need days for an area a satellite images in seconds. Yet the payoffs are enormous: accurate charts route cables and shipping, predict tsunami behaviour, locate fish stocks and reveal ecosystems unknown to science.",
      "The mapping is already rewriting biology. Seamounts — underwater mountains — turn out to host dense communities of corals, sponges and fish found nowhere else, and each new survey adds species. Hydrothermal vents support entire food webs running on chemistry rather than sunlight, hinting at where life on Earth, or elsewhere, might have begun. Bioprospectors now patent vent microbes for enzymes that work in industrial heat — raising ownership questions a new UN treaty on high-seas biodiversity is trying to settle.",
      "For all the technology, oceanographers insist the deepest instrument remains the same: patience. It took a century to chart most of the land; the sea floor, two-thirds unmapped, is being finished in a single generation — quietly, one echo at a time.",
    ],
    mcq: [
      { label: "The 2030 seabed project is described as", options: ["a single-country effort", "UN-led and multinational", "privately funded only", "a military programme"], answer: "UN-led and multinational", explanation: "'A United Nations-led project'." },
      { label: "Mapping the seabed is slow mainly because", options: ["ships are scarce", "sound travels slowly in water", "satellites are expensive", "storms block sensors"], answer: "sound travels slowly in water", explanation: "Depth must be measured by sound, 'and sound travels slowly'." },
      { label: "Seamounts are notable for hosting", options: ["shipping lanes", "unique dense ecosystems", "oil platforms", "ancient shipwrecks"], answer: "unique dense ecosystems", explanation: "Communities 'found nowhere else'." },
      { label: "Vent microbes are commercially valuable because their enzymes", options: ["are cheap to grow", "tolerate industrial heat", "produce light", "digest plastic"], answer: "tolerate industrial heat", explanation: "Enzymes 'that work in industrial heat'." },
    ],
    tfng: [
      { label: "More of Mars has been mapped than Earth's sea floor.", answer: "TRUE", explanation: "The comparison 'remains literally true'." },
      { label: "Only research vessels contribute data to the mapping effort.", answer: "FALSE", explanation: "Commercial ships 'share their sonar data while they sail'." },
      { label: "Vent food webs depend on sunlight.", answer: "FALSE", explanation: "They run 'on chemistry rather than sunlight'." },
      { label: "A UN treaty addresses ownership of deep-sea genetic resources.", answer: "TRUE", explanation: "The treaty 'is trying to settle' these questions." },
    ],
    blank: [
      { label: "About a ______ of the seabed is mapped to modern standards.", answer: "quarter", accept: ["25%", "one quarter"], explanation: "'Only about a quarter'." },
      { label: "Accurate charts help predict ______ behaviour for coastal safety.", answer: "tsunami", explanation: "Charts 'predict tsunami behaviour'." },
      { label: "Each new survey of seamounts adds ______ to science.", answer: "species", explanation: "'each new survey adds species'." },
      { label: "The sea floor is being mapped 'one ______ at a time'.", answer: "echo", explanation: "'quietly, one echo at a time'." },
    ],
  },
  {
    title: "The Quiet Rise of E-Ink",
    paragraphs: [
      "The most energy-efficient screen ever commercialised does not glow. E-ink — electrophoretic display — works like a lava lamp of charged white and black particles: apply a voltage and the particles migrate, then stay put using no power at all. A page holds its image indefinitely, which is why an e-reader's battery is measured in weeks and a bus timetable in years.",
      "The technology was invented at MIT in the 1990s but found its market slowly. Early displays refreshed too slowly for video and showed ghosting, so the industry settled where its strengths matched its weaknesses: reading. E-readers, shelf labels, luggage tags, pharmacies and public signage adopted e-ink because those uses update rarely, must be readable in direct sunlight and run unattended for months. An electronic shelf label alone saves a supermarket thousands of paper changes a year.",
      "Recent generations have widened the aperture. Colour filter arrays now give e-ink posters pastel hues; faster controllers cut refresh lag enough for handwriting; and large 32-inch panels hang in meeting rooms as zero-power status boards. Hybrid phones pair a small e-ink second screen for notifications, promising users the missing ingredient of smartphone life — a reason to look away.",
      "E-ink will never replace the glossy LCD: it cannot show video comfortably, and its greys are literal greys. Its future is instead environmental — wherever information must survive sunlight, survive months without charging, and survive our attention only briefly. Displays that disappear when we look away may prove the most humane screens ever built.",
    ],
    mcq: [
      { label: "E-ink uses almost no power when displaying a static page because", options: ["it reflects sunlight", "the particles hold position without current", "it refreshes slowly", "it has no backlight"], answer: "the particles hold position without current", explanation: "Particles migrate, 'then stay put using no power at all'." },
      { label: "Early e-ink failed in markets requiring", options: ["sunlight readability", "fast video refresh", "long battery life", "low cost"], answer: "fast video refresh", explanation: "Displays 'refreshed too slowly for video'." },
      { label: "Supermarkets adopted e-ink shelf labels partly to", options: ["display adverts", "avoid thousands of paper changes", "show video promos", "track customers"], answer: "avoid thousands of paper changes", explanation: "'saves a supermarket thousands of paper changes a year'." },
      { label: "Hybrid phones add an e-ink screen mainly to", options: ["play videos", "give users a reason to look away", "double battery size", "improve camera focus"], answer: "give users a reason to look away", explanation: "'promising users the missing ingredient... a reason to look away'." },
    ],
    tfng: [
      { label: "E-ink was invented in the 1990s.", answer: "TRUE", explanation: "'invented at MIT in the 1990s'." },
      { label: "E-ink is expected to replace LCD screens entirely.", answer: "FALSE", explanation: "'E-ink will never replace the glossy LCD'." },
      { label: "Colour e-ink is limited to pastel tones.", answer: "TRUE", explanation: "'Colour filter arrays now give e-ink posters pastel hues'." },
      { label: "A static e-ink image consumes continuous power.", answer: "FALSE", explanation: "The image holds with no power at all." },
    ],
    blank: [
      { label: "E-ink's charged particles migrate when a ______ is applied.", answer: "voltage", explanation: "'apply a voltage and the particles migrate'." },
      { label: "An e-reader battery lasts weeks; a bus ______ display lasts years.", answer: "timetable", explanation: "'a bus timetable in years'." },
      { label: "Large ______ panels hang in meeting rooms as zero-power status boards.", answer: "32-inch", accept: ["32 inch"], explanation: "'large 32-inch panels'." },
      { label: "E-ink suits information that must be readable in direct ______.", answer: "sunlight", explanation: "'readable in direct sunlight'." },
    ],
  },
  {
    title: "Ferry Networks of the Bay",
    paragraphs: [
      "Before bridges, the bay was its own road. Steam ferries linked fishing towns, island farms and mainland markets, and the crossing was the social event of the week: mail, gossip, livestock and schoolchildren shared the same deck. Motorways cut most routes after the 1960s, and for decades the ferries that survived ran at a loss, subsidised like museum pieces.",
      "Congestion revived them. As road traffic saturated, planners rediscovered the water as spare capacity: a single mid-sized ferry moves the equivalent of four lanes of rush-hour cars, needs no new tarmac and lands passengers steps from business districts. Cities from Istanbul to Vancouver expanded services, and ridership followed fares that undercut downtown parking within minutes of boarding.",
      "The new generation of vessels looks little like its ancestors. Aluminium catamarans with shallow drafts berth at simple floating pontoons, cutting dredging costs to near zero; hybrid diesel-electric drives halve fuel bills; and in Norway, battery ferries cross silently on scheduled fifteen-minute headways, recharging between trips. Operators treat timetables like metro maps — every ten minutes, all day — because predictability, they found, attracts commuters faster than speed.",
      "Water transport has limits, of course. Storms stop service where buses keep running, terminals consume waterfront land, and salt water is merciless to machinery. Yet for a growing belt of coastal cities the arithmetic keeps improving, and the ferry — written off as nostalgia a generation ago — is becoming serious daily infrastructure again. The bay, its planners like to say, is simply the widest road they have.",
    ],
    mcq: [
      { label: "In the ferry's heyday, crossings were notable for", options: ["their speed", "mixing all kinds of passengers", "low ticket prices", "night services"], answer: "mixing all kinds of passengers", explanation: "Mail, gossip, livestock and schoolchildren 'shared the same deck'." },
      { label: "Planners revived ferries chiefly because", options: ["fuel got cheaper", "roads were saturated", "bridges were ageing", "tourism demanded it"], answer: "roads were saturated", explanation: "'As road traffic saturated, planners rediscovered the water as spare capacity'." },
      { label: "Operators attract commuters most effectively through", options: ["faster vessels", "predictable timetables", "louder announcements", "lower fuel costs"], answer: "predictable timetables", explanation: "'predictability... attracts commuters faster than speed'." },
      { label: "A disadvantage of ferries mentioned in the passage is", options: ["seasickness", "storms halting service", "noise complaints", "long ticket queues"], answer: "storms halting service", explanation: "'Storms stop service where buses keep running'." },
    ],
    tfng: [
      { label: "Most ferry routes closed after the arrival of motorways.", answer: "TRUE", explanation: "'Motorways cut most routes after the 1960s'." },
      { label: "One ferry equals the capacity of two lanes of cars.", answer: "FALSE", explanation: "The passage says the equivalent of four lanes." },
      { label: "Norwegian battery ferries recharge between crossings.", answer: "TRUE", explanation: "'recharging between trips'." },
      { label: "Floating pontoons eliminated dredging costs almost entirely.", answer: "TRUE", explanation: "'cutting dredging costs to near zero'." },
    ],
    blank: [
      { label: "A mid-sized ferry moves the equivalent of four lanes of ______ cars.", answer: "rush-hour", accept: ["rush hour"], explanation: "'four lanes of rush-hour cars'." },
      { label: "Shallow-draft catamarans berth at simple floating ______.", answer: "pontoons", explanation: "'simple floating pontoons'." },
      { label: "Hybrid drives ______ fuel bills compared with older engines.", answer: "halve", accept: ["reduce", "cut"], explanation: "'halve fuel bills'." },
      { label: "Terminals occupy valuable ______ land along the waterfront.", answer: "waterfront", explanation: "'terminals consume waterfront land'." },
    ],
  },
];

/* ═════════════════════ READING — GENERAL TRAINING TEXTS ═════════════════ */
interface GtText {
  title: string;
  text: string;
  items: Omit<Q, "n">[];
}

const GT_TEXTS: GtText[] = [
  {
    title: "Riverside Community Pool — Summer Notice",
    text: "RIVERSIDE COMMUNITY POOL — SUMMER OPENING\n\nThe pool reopens on 1 June and will operate daily until 15 September. Morning lanes (6:30-9:00) are reserved for adult swimmers; the teaching pool and family sessions run from 10:00. Evening entry after 18:00 costs 180 taka, half the daytime rate.\n\nPlease note: the gym closes at 20:30 for cleaning, and the café stops serving hot food one hour before closing. Lockers require a 50-taka coin, refunded on exit. Children under 8 must be accompanied in the water by an adult at all times. Lost property is held for 14 days only — ask at reception.",
    items: [
      { type: "mcq", label: "When does the pool reopen?", options: ["15 May", "1 June", "15 June", "1 September"], answer: "1 June", explanation: "The notice states 'The pool reopens on 1 June'." },
      { type: "mcq", label: "Morning lane sessions are reserved for", options: ["children under 8", "family groups", "adult swimmers", "swim clubs"], answer: "adult swimmers", explanation: "'Morning lanes (6:30-9:00) are reserved for adult swimmers'." },
      { type: "blank", label: "Evening entry after 18:00 costs ______ taka.", answer: "180", accept: ["180 taka"], explanation: "'Evening entry after 18:00 costs 180 taka'." },
      { type: "blank", label: "Lockers need a ______ taka coin, refunded when you leave.", answer: "50", accept: ["fifty"], explanation: "'Lockers require a 50-taka coin, refunded on exit'." },
      { type: "tfng", label: "The gym closes earlier than the pool.", answer: "TRUE", explanation: "The gym closes at 20:30 for cleaning while the pool operates later." },
      { type: "tfng", label: "The café serves hot food until closing time.", answer: "FALSE", explanation: "The café 'stops serving hot food one hour before closing'." },
      { type: "mcq", label: "Lost property is kept for", options: ["7 days", "14 days", "30 days", "until claimed"], answer: "14 days", explanation: "'Lost property is held for 14 days only'." },
      { type: "mcq", label: "What is required for children under 8?", options: ["A paid children's ticket", "An adult in the water with them", "Swimming goggles", "A booked session"], answer: "An adult in the water with them", explanation: "'Children under 8 must be accompanied in the water by an adult at all times'." },
    ],
  },
  {
    title: "Part-time Barista — Green Leaf Café",
    text: "GREEN LEAF CAFÉ — PART-TIME BARISTA WANTED\n\nWe are looking for a friendly barista for weekday evening shifts (17:00-22:00, four nights a week). Experience is welcome but not essential — full training is provided during your first two weeks.\n\nYou will need: fluent spoken English, the right to work locally, and a genuine smile under pressure. We offer 220 taka per hour plus a meal on shift, tips pooled weekly, and a staff discount card.\n\nTo apply: send a short note about yourself (no CV needed) to the café, or hand it in at the counter before Friday, 28 March. Interviews will be held the following Tuesday evening. We reply to every applicant within one week.",
    items: [
      { type: "mcq", label: "What experience is required?", options: ["Two years as a barista", "Coffee-tasting certification", "None — training is given", "Cash handling only"], answer: "None — training is given", explanation: "'Experience is welcome but not essential — full training is provided'." },
      { type: "mcq", label: "Shifts run on", options: ["weekend mornings", "weekday evenings", "every night", "lunchtimes"], answer: "weekday evenings", explanation: "'weekday evening shifts (17:00-22:00, four nights a week)'." },
      { type: "blank", label: "Pay is ______ taka per hour plus a meal on shift.", answer: "220", explanation: "'We offer 220 taka per hour plus a meal on shift'." },
      { type: "blank", label: "Applications must arrive before Friday, 28 ______.", answer: "March", explanation: "'hand it in at the counter before Friday, 28 March'." },
      { type: "tfng", label: "Applicants must send a full CV.", answer: "FALSE", explanation: "The ad asks for 'a short note about yourself (no CV needed)'." },
      { type: "tfng", label: "Every applicant receives a reply.", answer: "TRUE", explanation: "'We reply to every applicant within one week'." },
      { type: "mcq", label: "Interviews will take place", options: ["on Friday morning", "the Tuesday after applications close", "during training", "by phone only"], answer: "the Tuesday after applications close", explanation: "'Interviews will be held the following Tuesday evening'." },
      { type: "mcq", label: "Tips are shared", options: ["daily in cash", "pooled weekly", "kept individually", "paid monthly"], answer: "pooled weekly", explanation: "'tips pooled weekly'." },
    ],
  },
  {
    title: "Library App Upgrade — Service Notice",
    text: "CITY LIBRARY — APP UPGRADE, 12-14 APRIL\n\nFrom Friday 12 April the library app and website will be offline while we install the new catalogue system. During the upgrade you may still visit branches as normal and borrow with your physical card.\n\nWhat changes on 15 April: reservations move to a single basket (books, DVDs and audiobooks together), overdue reminders switch from email to app notification, and the borrowing limit rises from 8 to 12 items. Fines remain frozen for students.\n\nPlease finish any online renewals before Thursday evening. We apologise for the disruption and thank you for your patience.",
    items: [
      { type: "mcq", label: "How long will the app be offline?", options: ["One evening", "Three days", "One week", "Two weeks"], answer: "Three days", explanation: "12-14 April is three days." },
      { type: "mcq", label: "During the upgrade, borrowing requires", options: ["the app", "the physical card", "a new registration", "a deposit"], answer: "the physical card", explanation: "'borrow with your physical card'." },
      { type: "blank", label: "From 15 April the borrowing limit rises to ______ items.", answer: "12", accept: ["twelve"], explanation: "'the borrowing limit rises from 8 to 12 items'." },
      { type: "blank", label: "Overdue reminders will arrive as an app ______ instead of email.", answer: "notification", accept: ["notifications"], explanation: "'overdue reminders switch from email to app notification'." },
      { type: "tfng", label: "Students will pay higher fines after the upgrade.", answer: "FALSE", explanation: "'Fines remain frozen for students'." },
      { type: "tfng", label: "Reservations for books and DVDs will be combined in one basket.", answer: "TRUE", explanation: "'reservations move to a single basket (books, DVDs and audiobooks together)'." },
      { type: "mcq", label: "Users are asked to renew online before", options: ["Wednesday noon", "Thursday evening", "Friday 12 April", "15 April"], answer: "Thursday evening", explanation: "'finish any online renewals before Thursday evening'." },
      { type: "mcq", label: "The notice is mainly addressed to", options: ["library staff", "library users", "app developers", "school teachers"], answer: "library users", explanation: "It explains user-facing changes and apologises 'for the disruption'." },
    ],
  },
  {
    title: "Weekend Photography Workshop",
    text: "FRAME IT — WEEKEND PHOTOGRAPHY WORKSHOP\n\nTwo Saturdays, 10:00-16:00, town hall.\n\nDay one covers camera basics — exposure, focus and composition — with practice walks through the tea gardens. Day two moves to editing: cropping, colour and simple retouching on the free software we help you install.\n\nNo experience needed. Bring any camera, including phones. Group size is capped at 12 so everyone gets individual feedback. Fee: 1,500 taka for both days, including lunch and printed notes. Students with a valid ID pay 1,100 taka.\n\nRegister online or in person at the arts centre desk (closed Mondays). Full refund if you cancel up to 5 days before the course.",
    items: [
      { type: "mcq", label: "The workshop runs on", options: ["one Sunday", "two Saturdays", "four evenings", "a full week"], answer: "two Saturdays", explanation: "'Two Saturdays, 10:00-16:00'." },
      { type: "mcq", label: "Day two focuses on", options: ["camera basics", "composition walks", "editing skills", "portrait lighting"], answer: "editing skills", explanation: "'Day two moves to editing'." },
      { type: "blank", label: "Group size is capped at ______ participants.", answer: "12", accept: ["twelve"], explanation: "'Group size is capped at 12'." },
      { type: "blank", label: "Students pay ______ taka with a valid ID.", answer: "1,100", accept: ["1100", "1,100 taka", "1100 taka"], explanation: "'Students with a valid ID pay 1,100 taka'." },
      { type: "tfng", label: "Only professional cameras may be used.", answer: "FALSE", explanation: "'Bring any camera, including phones'." },
      { type: "tfng", label: "Lunch is included in the fee.", answer: "TRUE", explanation: "'including lunch and printed notes'." },
      { type: "mcq", label: "The arts centre desk is closed on", options: ["Sundays", "Mondays", "Fridays", "Saturdays"], answer: "Mondays", explanation: "'(closed Mondays)'." },
      { type: "mcq", label: "Cancelling how long before gives a full refund?", options: ["2 days", "5 days", "10 days", "no refund is offered"], answer: "5 days", explanation: "'Full refund if you cancel up to 5 days before'." },
    ],
  },
  {
    title: "Letter to Residents — Waste Collection Change",
    text: "DEAR RESIDENTS,\n\nFrom 1 May, household waste collection moves to a two-bin system. The green bin (food and garden waste) is collected every Tuesday; the blue bin (recyclables — paper, plastic, glass, metal) is collected on alternating Fridays. Please place bins at the kerb by 6:30 a.m. with half a metre of clearance so the lifting arm can grip them.\n\nBins remain the property of the council and are numbered to your address. If your bin is damaged or stolen, request a replacement free of charge once per year through the helpline (weekdays 9-5) or the council website.\n\nExtra recycling bags are accepted beside the blue bin during festival weeks only. We thank you for helping the town reach its 60% recycling target by next year.",
    items: [
      { type: "mcq", label: "The green bin is collected", options: ["every Friday", "every Tuesday", "alternating Tuesdays", "on request"], answer: "every Tuesday", explanation: "'The green bin... is collected every Tuesday'." },
      { type: "blank", label: "Bins must be out by ______ in the morning.", answer: "6:30", accept: ["6.30", "630"], explanation: "'place bins at the kerb by 6:30 a.m.'." },
      { type: "blank", label: "Leave half a metre of ______ for the lifting arm.", answer: "clearance", accept: ["space", "gap"], explanation: "'with half a metre of clearance so the lifting arm can grip them'." },
      { type: "tfng", label: "Residents own the bins issued to them.", answer: "FALSE", explanation: "'Bins remain the property of the council'." },
      { type: "tfng", label: "A replacement bin is free once per year.", answer: "TRUE", explanation: "'request a replacement free of charge once per year'." },
      { type: "mcq", label: "Extra recycling bags are accepted", options: ["any Tuesday", "during festival weeks only", "never", "with a fee"], answer: "during festival weeks only", explanation: "'during festival weeks only'." },
      { type: "mcq", label: "The helpline operates", options: ["24 hours", "weekdays 9-5", "weekends only", "until 6 p.m. daily"], answer: "weekdays 9-5", explanation: "'(weekdays 9-5)'." },
      { type: "blank", label: "The council aims for a ______ per cent recycling rate by next year.", answer: "60", accept: ["sixty"], explanation: "'reach its 60% recycling target by next year'." },
    ],
  },
];

/* ═════════════════════ LISTENING — 2 PART SETS (A/B) ═══════════════════ */
interface ListenPart {
  n: number;
  title: string;
  scenario: string;
  audio: string;
  transcript: string;
  questions: Omit<Q, "n">[];
}

const LISTENING_A: ListenPart[] = [
  {
    n: 1,
    title: "Part 1 — Booking a Community Hall",
    scenario: "A phone conversation between a caller and a hall administrator (form completion).",
    audio: "/audio/cambridge/listening-part1.wav",
    transcript:
      "AGENT: Good morning, Riverside Hall, how can I help? CALLER: Hello, I'd like to book the main hall for a charity concert, please. AGENT: Of course. Which date? CALLER: Saturday the 14th, in the evening. AGENT: Let me check... yes, that's free. And how many people are you expecting? CALLER: Around eighty. AGENT: Fine — the hall holds a hundred and twenty. There's a cleaning fee of two thousand taka, payable on the day. CALLER: Does that include the projector? AGENT: The projector is included, but the piano is an extra five hundred. CALLER: We'll take the piano as well. AGENT: Perfect. Can I take a contact name? CALLER: Yes, it's Arif Chowdhury — that's C-H-O-W-D-H-U-R-Y. AGENT: And a phone number? CALLER: 01712 445 902. AGENT: Wonderful, you're booked. Payment is due by bank transfer seven days before.",
    questions: [
      { type: "blank", label: "Event type: charity ______", answer: "concert", explanation: "The caller books 'the main hall for a charity concert'." },
      { type: "blank", label: "Date: Saturday the ______", answer: "14th", accept: ["14"], explanation: "'Saturday the 14th, in the evening'." },
      { type: "blank", label: "Expected attendance: about ______ people", answer: "eighty", accept: ["80"], explanation: "'Around eighty'." },
      { type: "blank", label: "Hall capacity: ______", answer: "120", accept: ["a hundred and twenty", "one hundred twenty"], explanation: "'the hall holds a hundred and twenty'." },
      { type: "blank", label: "Cleaning fee: ______ taka", answer: "2000", accept: ["2,000", "two thousand"], explanation: "'a cleaning fee of two thousand taka'." },
      { type: "mcq", label: "Which facility costs extra?", options: ["The projector", "The piano", "The lighting rig", "None"], answer: "The piano", explanation: "'the piano is an extra five hundred'." },
      { type: "blank", label: "Contact name: Arif ______", answer: "Chowdhury", explanation: "Spelled out in the call." },
      { type: "blank", label: "Phone number: 01712 ______", answer: "445902", accept: ["445 902", "445-902"], explanation: "'01712 445 902'." },
      { type: "mcq", label: "Payment must be made", options: ["in cash on the day", "by bank transfer seven days before", "at the door", "monthly"], answer: "by bank transfer seven days before", explanation: "'Payment is due by bank transfer seven days before'." },
      { type: "mcq", label: "What time of day is the booking?", options: ["Morning", "Afternoon", "Evening", "Overnight"], answer: "Evening", explanation: "'Saturday the 14th, in the evening'." },
    ],
  },
  {
    n: 2,
    title: "Part 2 — New City Cycling Routes",
    scenario: "A radio announcement about updated cycle routes (multiple choice + notes).",
    audio: "/audio/cambridge/listening-part2.wav",
    transcript:
      "ANNOUNCER: Good news for cyclists — the city has opened three new routes this spring. The River Line runs eleven kilometres along the north bank and is completely flat, ideal for beginners. The Hill Loop, at seven kilometres, climbs through the pine forest and includes the city's first wooden boardwalk. Finally, the Market Route connects the central market to the university and is lit after dark, making it the safest choice for evening rides. Helmets are free to borrow from the new dock on Station Square — you'll need to leave a deposit of three hundred taka, refunded when you return the helmet. Route maps are available at the tourist office for one hundred taka, or free on the city app. And a reminder: the annual Car-Free Sunday returns next month, when the Riverside Road closes to cars from six in the morning until noon.",
    questions: [
      { type: "mcq", label: "Which route is best for beginners?", options: ["The River Line", "The Hill Loop", "The Market Route", "The Forest Trail"], answer: "The River Line", explanation: "'completely flat, ideal for beginners'." },
      { type: "blank", label: "The River Line is ______ kilometres long.", answer: "11", accept: ["eleven"], explanation: "'runs eleven kilometres along the north bank'." },
      { type: "mcq", label: "What is special about the Hill Loop?", options: ["It is lit after dark", "It has a wooden boardwalk", "It is completely flat", "It passes the market"], answer: "It has a wooden boardwalk", explanation: "'includes the city's first wooden boardwalk'." },
      { type: "mcq", label: "Which route is recommended at night?", options: ["The River Line", "The Hill Loop", "The Market Route", "None"], answer: "The Market Route", explanation: "'is lit after dark, making it the safest choice for evening rides'." },
      { type: "blank", label: "Helmet deposit: ______ taka", answer: "300", accept: ["three hundred"], explanation: "'a deposit of three hundred taka, refunded when you return'." },
      { type: "blank", label: "Printed route maps cost ______ taka.", answer: "100", accept: ["one hundred"], explanation: "'available at the tourist office for one hundred taka'." },
      { type: "mcq", label: "Maps are free through", options: ["the tourist office", "the city app", "the bike dock", "Station Square café"], answer: "the city app", explanation: "'or free on the city app'." },
      { type: "mcq", label: "On Car-Free Sunday, the Riverside Road closes from", options: ["6 a.m. to noon", "8 a.m. to 6 p.m.", "noon to 6 p.m.", "all day"], answer: "6 a.m. to noon", explanation: "'closes to cars from six in the morning until noon'." },
      { type: "tfng", label: "The Hill Loop is the longest of the three routes.", answer: "FALSE", explanation: "The River Line (11 km) is longer than the Hill Loop (7 km)." },
      { type: "tfng", label: "The helmet deposit is refundable.", answer: "TRUE", explanation: "'refunded when you return the helmet'." },
    ],
  },
  {
    n: 3,
    title: "Part 3 — Choosing a Research Topic",
    scenario: "A student and tutor discuss a fieldwork plan (multiple choice + notes).",
    audio: "/audio/cambridge/listening-part3.wav",
    transcript:
      "TUTOR: So, Nadia, your proposal focuses on tea-garden soil erosion. Why that topic? NADIA: Two reasons, really. The estates here lose topsoil every monsoon, and previous studies only looked at large plantations, not smallholder plots. TUTOR: Good gap. But your method worries me. Forty plots is ambitious for one term. NADIA: I could reduce it to twenty-five. TUTOR: Twenty is realistic. And consider pairing soil samples with drone photos — the geography department lends them out. NADIA: That would help with slope data. What about the lab analysis? TUTOR: Book the soil lab early — March is fully committed. Come April there's usually space. NADIA: Then I'll schedule April. Should I still interview the estate managers? TUTOR: Keep five interviews, no more. Depth beats breadth here. And Nadia — submit the ethics form before any fieldwork. No form, no access.",
    questions: [
      { type: "mcq", label: "Nadia chose her topic because", options: ["it was easiest", "smallholder plots were unstudied", "her tutor suggested it", "she owns a garden"], answer: "smallholder plots were unstudied", explanation: "'previous studies only looked at large plantations, not smallholder plots'." },
      { type: "blank", label: "Previous research concentrated on ______ plantations.", answer: "large", explanation: "'previous studies only looked at large plantations'." },
      { type: "mcq", label: "The tutor's main concern is Nadia's", options: ["topic choice", "sample size", "writing style", "interview questions"], answer: "sample size", explanation: "'Forty plots is ambitious for one term'." },
      { type: "blank", label: "The tutor recommends ______ plots as realistic.", answer: "twenty", accept: ["20"], explanation: "'Twenty is realistic'." },
      { type: "mcq", label: "The geography department lends out", options: ["soil kits", "drones", "rain gauges", "satellite maps"], answer: "drones", explanation: "'the geography department lends them out' (drone photos)." },
      { type: "blank", label: "Nadia books the soil lab for ______.", answer: "April", explanation: "'Come April there's usually space... I'll schedule April'." },
      { type: "blank", label: "The tutor advises keeping ______ interviews.", answer: "five", accept: ["5"], explanation: "'Keep five interviews, no more'." },
      { type: "mcq", label: "What must be submitted before fieldwork?", options: ["The final thesis", "The ethics form", "The drone licence", "The lab booking"], answer: "The ethics form", explanation: "'submit the ethics form before any fieldwork'." },
      { type: "tfng", label: "The soil lab is fully booked in April.", answer: "FALSE", explanation: "March is fully committed; April has space." },
      { type: "tfng", label: "The tutor thinks more interviews are better.", answer: "FALSE", explanation: "'Depth beats breadth here' — five at most." },
    ],
  },
  {
    n: 4,
    title: "Part 4 — The History of Tea Auctions",
    scenario: "A university lecture extract (notes completion).",
    audio: "/audio/cambridge/listening-part4.wav",
    transcript:
      "LECTURER: Today we trace how tea moved from luxury to daily habit — through the auction house. When tea first reached Europe in the seventeenth century, it sold at prices few could afford. The breakthrough was the public auction: buyers competed openly, and prices fell as volumes grew. London's auctions ran for over three centuries, ending only in 1998, when electronic trading took over. Producing regions responded by building their own auction centres — Calcutta in 1861, Chittagong in 1949 — so that growers, not distant brokers, set the rhythm of trade. The auction room itself shaped the product: tasting rounds standardised quality grades, and the famous sound of rapid bidding became a symbol of the trade. Today, online platforms continue the same logic — transparent prices, instant information — though some argue they lack the tactile ritual of the room. What never changed is the underlying principle: the market decides, and the grower who understands quality commands the premium.",
    questions: [
      { type: "blank", label: "Tea reached Europe in the ______ century.", answer: "seventeenth", accept: ["17th"], explanation: "'When tea first reached Europe in the seventeenth century'." },
      { type: "blank", label: "Early tea sold at ______ few could afford.", answer: "prices", explanation: "'sold at prices few could afford'." },
      { type: "mcq", label: "What mechanism made tea affordable?", options: ["Government subsidies", "Public auctions", "Ship monopolies", "Tea taxes"], answer: "Public auctions", explanation: "'The breakthrough was the public auction'." },
      { type: "blank", label: "London's auctions ended in ______.", answer: "1998", explanation: "'ending only in 1998'." },
      { type: "blank", label: "Chittagong opened its auction centre in ______.", answer: "1949", explanation: "'Chittagong in 1949'." },
      { type: "mcq", label: "Regional auction centres aimed to let ______ set the rhythm of trade.", options: ["brokers", "growers", "shippers", "empires"], answer: "growers", explanation: "'so that growers, not distant brokers, set the rhythm'." },
      { type: "blank", label: "Tasting rounds standardised quality ______.", answer: "grades", explanation: "'tasting rounds standardised quality grades'." },
      { type: "mcq", label: "What do critics say online platforms lack?", options: ["Transparent prices", "Instant information", "The ritual of the room", "Global reach"], answer: "The ritual of the room", explanation: "'they lack the tactile ritual of the room'." },
      { type: "tfng", label: "Electronic trading replaced London's auctions.", answer: "TRUE", explanation: "'ending only in 1998, when electronic trading took over'." },
      { type: "tfng", label: "The speaker says growers who understand quality earn a premium.", answer: "TRUE", explanation: "'the grower who understands quality commands the premium'." },
    ],
  },
];

const LISTENING_B: ListenPart[] = [
  {
    n: 1,
    title: "Part 1 — Joining the Neighbourhood Gym",
    scenario: "A conversation at a gym reception (form completion).",
    audio: "/audio/cambridge/listening-part1.wav",
    transcript:
      "RECEPTIONIST: Hi there! Thinking about joining? VISITOR: Yes, what memberships do you have? RECEPTIONIST: Standard is monthly at two thousand five hundred taka. There's also an off-peak card — twelve hundred — but you can only train before four in the afternoon. VISITOR: Off-peak suits me. Is the pool included? RECEPTIONIST: The pool costs three hundred extra per month. Towels are fifty per visit. VISITOR: OK, add the pool. Do you offer a trial? RECEPTIONIST: Seven days for five hundred, adjustable if you join. Can I get your name? VISITOR: Tanvir Ahmed. RECEPTIONIST: And email? VISITOR: tanvir.ahmed at mail dot example. RECEPTIONIST: Great — your trial starts today. Bring running shoes for the orientation at six.",
    questions: [
      { type: "blank", label: "Standard monthly membership: ______ taka", answer: "2500", accept: ["2,500", "two thousand five hundred"], explanation: "'Standard is monthly at two thousand five hundred taka'." },
      { type: "blank", label: "Off-peak membership costs ______ taka.", answer: "1200", accept: ["1,200", "twelve hundred"], explanation: "'twelve hundred — but only before four'." },
      { type: "mcq", label: "Off-peak members may train", options: ["any time", "before 4 p.m.", "after 8 p.m.", "weekends only"], answer: "before 4 p.m.", explanation: "'you can only train before four in the afternoon'." },
      { type: "blank", label: "Pool supplement per month: ______ taka", answer: "300", accept: ["three hundred"], explanation: "'The pool costs three hundred extra per month'." },
      { type: "blank", label: "Towel hire: ______ taka per visit", answer: "50", accept: ["fifty"], explanation: "'Towels are fifty per visit'." },
      { type: "blank", label: "Trial length: ______ days", answer: "seven", accept: ["7"], explanation: "'Seven days for five hundred'." },
      { type: "blank", label: "The trial costs ______ taka, adjustable on joining.", answer: "500", accept: ["five hundred"], explanation: "'Seven days for five hundred, adjustable if you join'." },
      { type: "blank", label: "Member's name: Tanvir ______", answer: "Ahmed", explanation: "'Tanvir Ahmed'." },
      { type: "mcq", label: "What should the visitor bring at six?", options: ["A photo", "Running shoes", "A towel", "Payment"], answer: "Running shoes", explanation: "'Bring running shoes for the orientation at six'." },
      { type: "mcq", label: "The orientation happens", options: ["tomorrow morning", "today at six", "on joining day only", "after the trial"], answer: "today at six", explanation: "'your trial starts today... orientation at six'." },
    ],
  },
  {
    n: 2,
    title: "Part 2 — Museum Redevelopment Update",
    scenario: "A recorded talk for visitors about museum changes (multiple choice + notes).",
    audio: "/audio/cambridge/listening-part2.wav",
    transcript:
      "WELCOME VOICE: Thank you for visiting the Maritime Museum. From this Monday, the east wing closes for eighteen months of renovation. The ship models collection moves to the west wing, room twelve — that's straight ahead and to your right. The rooftop café remains open throughout, but the garden entrance will be locked; please use the main door on Harbour Road. Admission is unchanged at one hundred taka, and children under twelve enter free as always. Guided tours now run at eleven and three — booking at the front desk, two hundred taka per group. We apologise for the noise; ear defenders are available free for young visitors. Look out for the new photography exhibition opening next month in room four.",
    questions: [
      { type: "blank", label: "The east wing closes for ______ months.", answer: "eighteen", accept: ["18"], explanation: "'closes for eighteen months of renovation'." },
      { type: "blank", label: "Ship models move to room ______.", answer: "twelve", accept: ["12"], explanation: "'moves to the west wing, room twelve'." },
      { type: "mcq", label: "Which entrance must visitors now use?", options: ["The garden entrance", "The east door", "The main door on Harbour Road", "The staff gate"], answer: "The main door on Harbour Road", explanation: "'the garden entrance will be locked; please use the main door'." },
      { type: "blank", label: "Adult admission: ______ taka", answer: "100", accept: ["one hundred"], explanation: "'Admission is unchanged at one hundred taka'." },
      { type: "mcq", label: "Who enters free?", options: ["Students", "Children under 12", "Seniors", "Groups"], answer: "Children under 12", explanation: "'children under twelve enter free as always'." },
      { type: "blank", label: "Guided tours run at eleven and ______.", answer: "three", accept: ["3", "3 pm", "three o'clock"], explanation: "'Guided tours now run at eleven and three'." },
      { type: "blank", label: "Group tour price: ______ taka", answer: "200", accept: ["two hundred"], explanation: "'two hundred taka per group'." },
      { type: "mcq", label: "What is available free for children during the noise?", options: ["Snacks", "Ear defenders", "Tours", "Activity packs"], answer: "Ear defenders", explanation: "'ear defenders are available free for young visitors'." },
      { type: "tfng", label: "The rooftop café closes during renovation.", answer: "FALSE", explanation: "'The rooftop café remains open throughout'." },
      { type: "mcq", label: "Next month's new exhibition is about", options: ["ship models", "photography", "harbour history", "children's art"], answer: "photography", explanation: "'the new photography exhibition opening next month'." },
    ],
  },
  {
    n: 3,
    title: "Part 3 — Group Presentation Feedback",
    scenario: "A lecturer gives feedback to two students (multiple choice + notes).",
    audio: "/audio/cambridge/listening-part3.wav",
    transcript:
      "LECTURER: Overall, a strong presentation — but let's tighten three things. First, Ravi, your data slides had too many numbers. Pick one chart per message. RAVI: I can rebuild them tonight. LECTURER: Second, the conclusion introduced new information. Conclusions should echo, not surprise. MEERA: That was my section, sorry. LECTURER: No harm — move that part into the findings. Third: timing. You ran four minutes over. In the real defence, that's fatal. Who handled the clock? RAVI: Nobody, honestly. LECTURER: Appoint a timekeeper and rehearse twice with a timer. MEERA: Should we add citations to every slide? LECTURER: Only where statistics appear — and check the required style guide. Otherwise, expect a top-band delivery next week.",
    questions: [
      { type: "mcq", label: "What is wrong with Ravi's data slides?", options: ["Too few numbers", "Too many numbers", "Wrong colours", "Missing titles"], answer: "Too many numbers", explanation: "'your data slides had too many numbers'." },
      { type: "blank", label: "Use one ______ per message.", answer: "chart", explanation: "'Pick one chart per message'." },
      { type: "mcq", label: "Whose section was the weak conclusion?", options: ["Ravi's", "Meera's", "The lecturer's", "Nobody's"], answer: "Meera's", explanation: "MEERA: 'That was my section, sorry'." },
      { type: "blank", label: "The presentation ran ______ minutes over time.", answer: "four", accept: ["4"], explanation: "'You ran four minutes over'." },
      { type: "mcq", label: "The lecturer says running over time in a real defence is", options: ["acceptable", "fatal", "common", "rewarded"], answer: "fatal", explanation: "'In the real defence, that's fatal'." },
      { type: "blank", label: "Appoint a ______ to watch the clock.", answer: "timekeeper", explanation: "'Appoint a timekeeper'." },
      { type: "blank", label: "Rehearse ______ times with a timer.", answer: "twice", accept: ["two", "2"], explanation: "'rehearse twice with a timer'." },
      { type: "mcq", label: "Citations are required on slides containing", options: ["images", "statistics", "quotes", "titles"], answer: "statistics", explanation: "'Only where statistics appear'." },
      { type: "tfng", label: "The lecturer discourages new information in conclusions.", answer: "TRUE", explanation: "'Conclusions should echo, not surprise'." },
      { type: "tfng", label: "Citations must follow a required style guide.", answer: "TRUE", explanation: "'check the required style guide'." },
    ],
  },
  {
    n: 4,
    title: "Part 4 — Urban Heat Islands",
    scenario: "An environmental science lecture (notes completion).",
    audio: "/audio/cambridge/listening-part4.wav",
    transcript:
      "PROFESSOR: Cities are hotter than their surroundings — up to seven degrees warmer on summer nights. We call this the urban heat island. Three forces create it. First, materials: asphalt and concrete store heat all day and release it slowly after sunset. Second, shape: tall streets trap warm air like canyons. Third — and most fixable — the missing green: fewer trees mean less shade and less evaporative cooling. The remedies follow directly. Light-coloured roofing reflects sunlight; studies in Athens showed a two-degree drop after widespread repainting. Green roofs cool the building below by insulation, and street trees lower peak temperatures by up to five degrees in their shade. Cities that combine all three measures report lower electricity demand and fewer heat-related hospital visits. The lesson is practical: the heat island is not a fate, it is a design choice.",
    questions: [
      { type: "blank", label: "Cities can be up to ______ degrees warmer at night.", answer: "seven", accept: ["7"], explanation: "'up to seven degrees warmer on summer nights'." },
      { type: "blank", label: "The effect is called the urban heat ______.", answer: "island", explanation: "'We call this the urban heat island'." },
      { type: "blank", label: "Asphalt and concrete ______ heat all day.", answer: "store", explanation: "'store heat all day and release it slowly'." },
      { type: "mcq", label: "Which cause is described as most fixable?", options: ["Materials", "Street shape", "Missing greenery", "Traffic"], answer: "Missing greenery", explanation: "'Third — and most fixable — the missing green'." },
      { type: "blank", label: "Athens saw a ______ degree drop after repainting roofs.", answer: "two", accept: ["2"], explanation: "'a two-degree drop after widespread repainting'." },
      { type: "mcq", label: "Green roofs cool buildings mainly through", options: ["reflection", "insulation", "evaporation", "shading the street"], answer: "insulation", explanation: "'Green roofs cool the building below by insulation'." },
      { type: "blank", label: "Street trees can lower peak temperature by up to ______ degrees.", answer: "five", accept: ["5"], explanation: "'lower peak temperatures by up to five degrees'." },
      { type: "mcq", label: "Combined measures reduce", options: ["tourism", "electricity demand", "rainfall", "traffic noise"], answer: "electricity demand", explanation: "'report lower electricity demand'." },
      { type: "tfng", label: "The professor believes the heat island is unavoidable.", answer: "FALSE", explanation: "'The heat island is not a fate, it is a design choice'." },
      { type: "tfng", label: "Tall streets can trap warm air.", answer: "TRUE", explanation: "'tall streets trap warm air like canyons'." },
    ],
  },
];

/* ═════════════════════ WRITING — PROMPT + BAND-9 SAMPLE BANKS ══════════ */
interface WritingTask1 {
  kind: "report" | "letter";
  prompt: string;
  chartNote?: string;
  bulletPoints?: string[];
  band9: string;
  comments: string;
}
interface WritingTask2 {
  prompt: string;
  band9: string;
  comments: string;
}

const TASK1_ACADEMIC: WritingTask1[] = [
  {
    kind: "report",
    prompt: "The line graph below shows internet users as a percentage of the population in three countries between 2000 and 2020.",
    chartNote: "Country A: 5% (2000) → 30% (2010) → 78% (2020). Country B: 12% (2000) → 45% (2010) → 82% (2020). Country C: 2% (2000) → 18% (2010) → 55% (2020).",
    band9: "The line graph illustrates the proportion of the population using the internet in three countries over a twenty-year period from 2000 to 2020.\n\nOverall, internet access expanded dramatically in all three countries, with Country B recording the highest figure at the end of the period, while Country C consistently lagged behind the others despite steady growth.\n\nIn 2000, Country B already led with 12% of its population online, compared with 5% in Country A and just 2% in Country C. Over the following decade, all three nations saw rapid adoption: Country B climbed to 45%, Country A multiplied its figure sixfold to 30%, and Country C reached 18%.\n\nGrowth continued after 2010, although at a slower pace in the two leaders. By 2020, Country B and Country A stood at 82% and 78% respectively, approaching saturation, whereas Country C, despite reaching 55%, remained the only nation where a majority was still offline. The most striking feature of the graph is the narrowing gap between the leaders and the persistent underperformance of Country C.",
    comments: "Task response: full coverage of all years and countries with a clear overview. Coherence: logical paragraphing and excellent linking. Lexis: 'approaching saturation', 'lagged behind', 'multiplied sixfold'. Grammar: wide range, error-free. Approx. band 9.",
  },
  {
    kind: "report",
    prompt: "The bar chart below shows the volume of coffee exported by four countries in 2005, 2015 and 2025 (projected).",
    chartNote: "Brazil: 28 → 32 → 34 million bags. Vietnam: 9 → 27 → 31. Colombia: 11 → 12 → 13. Ethiopia: 3 → 4 → 5.",
    band9: "The bar chart compares coffee exports from four producing countries at three points in time: 2005, 2015 and a projection for 2025.\n\nOverall, Brazil remained the largest exporter throughout, although Vietnam showed by far the most dramatic growth, overtaking Colombia to become the second-largest exporter by the end of the period.\n\nIn 2005, Brazil exported 28 million bags, roughly three times the combined figure of Vietnam and Ethiopia. Over the following decade, Vietnam's exports tripled to 27 million bags, while Colombia's remained almost static at 11-12 million and Ethiopia grew modestly from 3 to 4 million. By 2025, Vietnam is projected to reach 31 million bags, narrowing the gap with Brazil's 34 million. Colombia and Ethiopia are expected to increase only slightly, to 13 and 5 million bags respectively. In summary, the chart highlights a market in which one emerging producer has transformed the competitive landscape.",
    comments: "Excellent selection of key features (Vietnam's rise, Brazil's lead). Sophisticated comparison language ('narrowing the gap', 'almost static'). Flawless grammar and tense control. Approx. band 9.",
  },
  {
    kind: "report",
    prompt: "The pie charts below show how households in one city disposed of their waste in 2000 and 2020.",
    chartNote: "2000: Landfill 68%, Recycling 12%, Composting 8%, Incineration 12%. 2020: Landfill 35%, Recycling 40%, Composting 17%, Incineration 8%.",
    band9: "The two pie charts compare the methods of waste disposal used by households in a single city in 2000 and 2020.\n\nOverall, the city moved decisively away from landfill, which fell from the dominant method to little over a third of all disposal, while recycling and composting grew to account for more than half of household waste by 2020.\n\nIn 2000, landfill handled 68% of waste, with recycling and incineration each processing only 12% and composting the remaining 8%. Twenty years later the picture had reversed: recycling became the largest category at 40%, composting more than doubled to 17%, and landfill shrank to 35%. Incineration, meanwhile, declined to its lowest share of 8%. The charts therefore depict a fundamental shift in household behaviour, most plausibly the result of environmental policy and changed public attitudes.",
    comments: "Clear overview of the reversal; precise percentage language; strong range of change verbs ('shrank', 'doubled', 'declined'). Error-free. Approx. band 9.",
  },
  {
    kind: "report",
    prompt: "The table below shows the number of university students studying four subjects in 2010 and 2020.",
    chartNote: "Engineering: 4,200 → 6,900. Business: 7,500 → 7,300. Medicine: 2,800 → 3,500. Agriculture: 1,900 → 900.",
    band9: "The table details enrolment figures for four degree subjects at universities in a given country in 2010 and 2020.\n\nOverall, Engineering attracted the sharpest growth and became the most popular subject by 2020, while Agriculture was the only field to lose students, falling to fewer than half its earlier numbers.\n\nBusiness was the largest discipline in 2010 with 7,500 students, but its enrolment slipped slightly to 7,300 ten years later. Engineering, by contrast, rose from 4,200 to 6,900 — an increase of almost two-thirds — overtaking Business at the top of the table. Medicine grew steadily from 2,800 to 3,500, maintaining its position as the smallest science-based field. Agriculture, however, collapsed from 1,900 to just 900 students. The figures suggest a decisive shift of student demand toward technology-linked careers and away from land-based studies.",
    comments: "Excellent data selection and comparisons ('overtaking', 'collapsed', 'increase of almost two-thirds'). Clear overview and logical flow. Approx. band 9.",
  },
  {
    kind: "report",
    prompt: "The diagram below shows how glass bottles are recycled.",
    chartNote: "Process: collection → sorting by colour → crushing → melting in a furnace → moulding into new bottles → distribution to shops (loop back to collection).",
    band9: "The diagram illustrates the sequence of stages involved in recycling glass bottles, from collection through to redistribution to retailers.\n\nOverall, the process consists of six main stages arranged in a continuous cycle, with the finished bottles eventually returning to the collection point to begin the loop again.\n\nFirst, used bottles are collected from households and collection points, after which they are sorted according to colour — clear, green and brown. The sorted glass is then crushed into small pieces and melted in a furnace at high temperature. In the following stage, the molten glass is moulded into new bottles, which are checked for quality before being distributed to shops. Once sold and used, the bottles re-enter the collection stage, making the process cyclical rather than linear. It is clear that recycling glass requires both mechanical and human stages, and that its circular nature is the key to its environmental value.",
    comments: "Accurate process description with the essential overview of the cycle. Strong passive constructions throughout and clear sequencing ('First', 'then', 'In the following stage'). Approx. band 9.",
  },
  {
    kind: "report",
    prompt: "The maps below show changes to a town's seafront between 1990 and 2020.",
    chartNote: "1990: fishing harbour, two warehouses, sandy beach, small car park. 2020: marina with yachts, hotel and restaurant, widened promenade, doubled car park, reduced beach.",
    band9: "The two maps compare a town's seafront as it appeared in 1990 and in 2020, revealing extensive redevelopment of the area.\n\nOverall, the seafront was transformed from a working harbour district into a leisure-orientated waterfront, with tourism facilities replacing almost every industrial structure.\n\nIn 1990, the shoreline was dominated by a fishing harbour flanked by two warehouses, behind which lay a sandy beach and a small car park. By 2020, the harbour had become a marina full of yachts, both warehouses had been demolished to make way for a hotel and a restaurant, and the car park had doubled in size to accommodate visitors. The promenade was widened considerably along the water's edge, although this came at the expense of part of the natural beach, which was noticeably narrower. The maps therefore illustrate a classic case of a coastal town repositioning itself for the tourism economy.",
    comments: "Superb selection of changes with accurate spatial language ('flanked by', 'at the expense of', 'demolished to make way for'). Clear overview and flawless tense use (past perfect). Approx. band 9.",
  },
];

const TASK1_GT_LETTER: WritingTask1[] = [
  {
    kind: "letter",
    prompt: "You rent a flat and recently discovered a serious water leak that the landlord has not fixed. Write a letter to the landlord. In your letter: describe the problem, explain the damage it is causing, say what you want the landlord to do.",
    bulletPoints: ["Describe the problem", "Explain the damage", "Say what you want done"],
    band9: "Dear Mr Rahman,\n\nI am writing about a persistent water leak in the bathroom of the flat I rent from you at 14 Station Road, which I first reported two weeks ago and which has still not been repaired.\n\nWater drips steadily from the pipe beneath the sink whenever anyone upstairs uses their bathroom. The floor has begun to warp, the ceiling below shows a spreading brown stain, and I am now concerned about mould, which my doctor warns could aggravate my asthma. The damp smell has also spread to the bedroom next door.\n\nI would be grateful if you could arrange for a plumber to inspect the pipe within the next three days, as the damage appears to be accelerating. If it is more convenient, I am happy to be at home any weekday after five o'clock to provide access. Please let me know by phone or email when the repair is scheduled.\n\nThank you for your attention to this matter.\n\nYours sincerely,\nFarhana Karim",
    comments: "Fully addresses all three bullet points in separate paragraphs. Consistently appropriate semi-formal register. Wide range of natural phrasing ('grateful if you could', 'happy to be at home'). Error-free. Approx. band 9.",
  },
  {
    kind: "letter",
    prompt: "You are applying for a part-time job at a local bookshop. Write a letter to the manager. In your letter: say why you are writing, describe your experience and skills, explain why you want to work there.",
    bulletPoints: ["Say why you are writing", "Describe experience and skills", "Explain why this bookshop"],
    band9: "Dear Ms Chowdhury,\n\nI am writing to apply for the part-time sales assistant position advertised in last Friday's local newspaper, as I believe my background and enthusiasm make me a strong candidate for your team.\n\nLast year I worked weekends at the university book fair, where I handled customer queries, managed the till and organised stock displays for over two thousand titles. I am confident with basic accounting software, speak fluent English and Bangla, and I genuinely enjoy recommending books to readers of all ages.\n\nI am applying to your shop in particular because it is the only independent bookshop in town with a dedicated children's section — an area I would love to help expand, having volunteered at story-reading sessions at the public library. Working close to my college also means I can cover weekday evening shifts reliably.\n\nI would welcome the chance to discuss my application in person and am available for interview any afternoon.\n\nYours sincerely,\nNusrat Jahan",
    comments: "All three bullet points developed with specific, believable detail. Consistent formal register and letter conventions. Excellent range and accuracy. Approx. band 9.",
  },
  {
    kind: "letter",
    prompt: "A friend from abroad is coming to visit your city for the first time. Write a letter to your friend. In your letter: suggest what to see and do, recommend local food, give advice about the weather and what to pack.",
    bulletPoints: ["Suggest sights and activities", "Recommend food", "Weather and packing advice"],
    band9: "Dear Maria,\n\nI was thrilled to get your email — a whole week in Sreemangal! You're going to love it, and I've already started planning.\n\nFor sights, we must do the tea gardens at sunrise, when the mist is still on the hills and the pickers are out — it's the photograph of your trip. I'd also book us the wetland boat tour; you'll see kingfishers, and possibly otters if we're lucky. Save one evening for the forest walk — it's short, easy, and the forest hums at dusk.\n\nFood-wise, you cannot leave without trying seven-layer tea at a local stall — it's our town's signature — and my mother's shatkorai, which she has promised to cook the night you arrive.\n\nOne warning: December evenings get surprisingly cool here, so pack a light jacket and proper walking shoes; days are warm and sunny, but the forest paths stay muddy.\n\nCounting the days!\n\nWarm wishes,\nSadia",
    comments: "Warm, natural informal register with idiomatic language ('thrilled', 'Save one evening for'). All three bullet points covered with vivid specifics. Flawless informal letter format. Approx. band 9.",
  },
  {
    kind: "letter",
    prompt: "Your local council plans to close the neighbourhood park for construction of a car park. Write a letter to the council. In your letter: state why you are writing, explain why the park is important, suggest an alternative solution.",
    bulletPoints: ["State why you are writing", "Explain the park's importance", "Suggest an alternative"],
    band9: "Dear Sir or Madam,\n\nI am writing on behalf of the Green Road Residents' Association regarding the council's proposal to convert the Maple Street neighbourhood park into a multi-storey car park.\n\nThis park is the only substantial green space within a fifteen-minute walk for roughly four hundred households. It hosts the children's playground, the Saturday vegetable market and the weekly exercise classes used mainly by elderly residents — groups who would lose both their recreation space and their main point of social contact if the plan proceeds. During last summer's heatwave, the park's trees measurably cooled the surrounding streets.\n\nMay I suggest an alternative: the disused textile mill yard on Canal Lane, two hundred metres away, is council-owned, already paved, and larger than the park. A car park there would serve the same shoppers and commuters without sacrificing any green space, and the mill's façade would benefit from the foot traffic.\n\nI would be glad to present this proposal at the next council meeting and look forward to your response.\n\nYours faithfully,\nImran Hossain\nChair, Green Road Residents' Association",
    comments: "Persuasive and precisely structured; each bullet point earns a full paragraph. Excellent formal register and evidence-based reasoning ('measurably cooled'). Approx. band 9.",
  },
];

const TASK2_BANK: WritingTask2[] = [
  {
    prompt: "Some people believe that university education should be free for all students. Others think students should pay for their own studies. Discuss both views and give your own opinion.",
    band9: "The question of who should finance higher education divides opinion sharply. While some argue that universities should be free at the point of use, others insist that students themselves should bear the cost. This essay will examine both positions before arguing that a shared, income-linked model is the fairest solution.\n\nAdvocates of free education rest their case on equality. When tuition disappears, the barrier to entry becomes ability rather than wealth, and talented students from poor families no longer abandon their ambitions. Society also profits: graduates pay more tax, commit fewer crimes and innovate more, so the public investment arguably returns itself many times over.\n\nOpponents reply that 'free' education is never free — someone must pay, and it is usually the taxpayer, including those who never attended university. They further note that when education costs nothing, demand explodes and quality dilutes: lecture halls overflow, and degrees lose their signalling value. Countries that cap student places attempt, with mixed success, to balance this.\n\nIn my view, the dilemma is false. A loan system repaid only above a certain income threshold captures the benefits of both camps: access is universal, yet the eventual cost falls on those who gain most. Free tuition for the poor, subsidised contributions from graduates who can afford it — this hybrid, rather than ideological purity, best serves both fairness and fiscal reality.",
    comments: "Sophisticated position stated clearly in the overview and sustained. Each view analysed, not merely listed. Flawless cohesion and paragraph logic. Approx. band 9.",
  },
  {
    prompt: "Many people spend large amounts of money on celebrating birthdays and weddings. Is this a positive or negative development?",
    band9: "Grand celebrations have become a defining ritual of modern life, with families sometimes borrowing heavily to stage them. In my view, this trend is predominantly negative, though it is worth acknowledging the genuine value that shared celebrations can carry.\n\nThe central problem is financial. Households that spend a year's income on a single wedding enter married life indebted, and the social pressure to match what neighbours have spent turns a joyful occasion into a competitive burden. Economists studying household credit have repeatedly found ceremonies among the largest single causes of informal borrowing.\n\nThere is also an opportunity cost. Money spent on venue lighting and fireworks cannot build a room, insure a business, or fund a child's schooling — expenditures that change a family's trajectory far more than any party. Critics of lavish events point out, convincingly, that the memory of a wedding fades within months, while its invoices persist for years.\n\nDefenders note, fairly, that ceremonies bind communities and that the livelihoods of caterers, tailors and musicians depend on them. This is true, but a celebration needs people, not necessarily expense: a moderately funded wedding achieves the same social purpose without the debt. On balance, therefore, the escalation of celebratory spending is a development societies should gently reverse.",
    comments: "Balanced but decisive; the position is argued with escalating logic (financial, then opportunity cost) and a fair concession. Exemplary academic register and flawless error control. Approx. band 9.",
  },
  {
    prompt: "Some people think children should begin learning a foreign language at primary school, while others believe it is better to start at secondary school. Discuss both views and give your opinion.",
    band9: "At what age foreign-language teaching should begin remains a contested question in curriculum design. Some argue for a primary-school start; others maintain that secondary school, when pupils are more mature, is the better moment. I side firmly with the early start.\n\nThe case for primary school rests on developmental science. Young children acquire pronunciation and intonation with remarkable fidelity, and they learn through songs and games, absorbing language without the self-consciousness that inhibits teenagers. A child who begins a second language at seven reaches secondary school already conversational, allowing secondary teachers to focus on literature, argument and grammar rather than basics.\n\nSupporters of a later start raise practical objections. Primary teachers, they note, are generalists; without specialist language staff, early programmes risk embedding errors. Scheduling is also tight, and critics argue that literacy in the mother tongue should come first. These concerns are legitimate — but they are arguments for resourcing, not for delay. Where governments have invested in primary language specialists, early programmes have outperformed late ones decisively.\n\nMy own view is unambiguous: the earlier the better, provided that instruction is playful, oral and taught by confident speakers. Language learning is one of the few skills childhood grants for free; curricula that waste the window do children a measurable disservice.",
    comments: "Confident, clearly stated thesis; counter-arguments engaged and rebutted with reasoning. Exceptional lexical range ('fossilise' avoided in favour of accessible phrasing without loss of precision). Grammar errors absent. Approx. band 9.",
  },
  {
    prompt: "In many cities, an increasing number of people do not know their neighbours, and the sense of community is being lost. What are the causes? What solutions can you suggest?",
    band9: "The quiet disappearance of neighbourhood life is among the least discussed costs of modern urban living. This essay examines the principal causes of this estrangement and proposes measures that cities and individuals can realistically adopt.\n\nThe causes are structural more than personal. Long commutes and shift work strip residents of shared evening hours; apartment blocks replace the shared courtyard, the natural theatre of acquaintance, with corridors and lifts designed for speed; and entertainment has moved indoors, onto private screens, where each household curates its own evening. Added to this is mobility itself: when residents expect to move within three years, the investment in knowing a neighbour rarely seems worthwhile.\n\nSolutions must therefore rebuild the settings in which community once happened by accident. Urban design is the most powerful: mixed-use blocks with ground-floor cafés, benches on shaded corners and shared rooftop gardens create the repeated low-stakes encounters from which familiarity grows. Residents' associations can lower the threshold further — a monthly street breakfast costs little and reliably converts nodding acquaintances into contacts. Employers, too, can help by trimming the commutes that empty neighbourhoods by day.\n\nCommunity, in short, is less a virtue to be exhorted than a by-product of design and time. Cities that plan for incidental contact will find that neighbours, like gardens, return when the conditions are restored.",
    comments: "Two-part question fully answered with causes and solutions in balance. Metaphor used purposefully; register consistently academic. Approx. band 9.",
  },
  {
    prompt: "Some people believe that professional athletes and film stars earn far too much money compared with teachers, nurses and other essential workers. To what extent do you agree?",
    band9: "It is a familiar grievance: the striker earns in a week what a nurse earns in a decade. Although the disparity offends our sense of proportion, I largely disagree with the conclusion that such earnings are undeserved — though I accept the argument exposes something important about what societies value.\n\nEntertainment salaries are set by markets, not merit tables. A footballer's goal is watched by hundreds of millions, each contributing a fraction of the wage through tickets, subscriptions and advertising; no mechanism exists by which a nurse's irreplaceable work, paid from public budgets, can generate comparable revenue. The athlete is not overpaid so much as paid in a different currency — attention — which our economy has learned to monetise at extraordinary rates.\n\nNor is the comparison as simple as it appears. Careers at the top of sport and film are brutally short and statistically improbable: for every star, thousands of aspirants earn nothing, so lifetime earnings average out far lower than the headline suggests. Teachers and nurses, by contrast, enjoy stable, lifelong income and pensions.\n\nWhere I do agree with the critics is on public-sector pay. Societies that call nurses 'essential' while capping their wages reveal a contradiction the market cannot fix; that is a choice for voters. But the solution is to raise essential workers' pay, not to cap the earnings of entertainers — resentment makes a poor wage policy.",
    comments: "A nuanced, genuinely argued position with original reasoning ('paid in a different currency — attention'). Concession and rebuttal handled with precision; conclusion converts the grievance into policy insight. Approx. band 9.",
  },
  {
    prompt: "Online shopping is replacing physical shops in many countries. Do the advantages of this development outweigh the disadvantages?",
    band9: "In a single generation, e-commerce has redrawn the geography of retail. While this shift delivers undeniable convenience and choice, I believe its disadvantages — concentrated in communities and public space — currently outweigh the advantages, though the balance is closer than critics often admit.\n\nThe benefits are real and widely felt. Online markets demolish distance: a patient in a district town can order medicines, a student in a village can reach textbooks, and prices fall as comparison becomes effortless. For the elderly, the disabled and the time-poor, home delivery is not a luxury but a liberation.\n\nYet the costs accumulate in places the shopping cart never shows. Town centres hollow out as anchor shops close, and with them vanish the casual encounters and foot traffic that made streets safe and sociable. Delivery logistics add congestion and emissions precisely in the residential areas meant to benefit, and warehouse work — the new retail employment — is frequently lower-paid and more precarious than the shop jobs it replaces. The savings shoppers celebrate are partly a transfer from public space to private logistics.\n\nOn balance, therefore, I judge the disadvantages to outweigh the advantages at present — not because online shopping is harmful in itself, but because its gains are private while its costs are social. Whether that balance holds depends on whether cities learn to price delivery traffic honestly and reinvest in their streets.",
    comments: "Clear position from the outset, maintained and qualified with maturity. The 'private gains, social costs' framing unifies the essay. Wide, natural vocabulary throughout. Approx. band 9.",
  },
  {
    prompt: "Some people say that the best way to improve public health is to increase the number of sports facilities. Others believe this has little effect and other measures are required. Discuss both views and give your own opinion.",
    band9: "Governments seeking healthier populations often reach for the same tool: more gyms, pitches and swimming pools. Whether infrastructure alone changes public health, however, is doubtful. This essay considers both positions before arguing that facilities matter — but only as one layer of a broader strategy.\n\nThe case for facilities is intuitive. Exercise fails most often for reasons of access; a pool within walking distance removes the excuse of cost and travel, and visible venues normalise activity, especially for the young. Cities that invested heavily in public courts and tracks do show elevated participation rates.\n\nSceptics reply that the evidence for infrastructure-led change is thin. Unused facilities litter suburban landscapes, and the populations most at risk of lifestyle disease are precisely those least likely to enter a gym. Their health is determined less by sport than by diet, tobacco, alcohol, stress and the quiet design of daily life: stairwell placement, food labelling, school meals. Public-health successes such as reduced smoking came from regulation and taxation, not facilities.\n\nMy view synthesises the two: build facilities, but as the visible tip of a larger programme. A new pool should arrive with school partnerships, subsidised hours and primary-care referrals — exercise on prescription. Sport alone will not make a nation healthy; a society that makes the healthy choice the easy one, everywhere, might.",
    comments: "Both views given genuine analysis; the writer's position integrates rather than splits the difference. Excellent topic-specific lexis ('exercise on prescription'). Approx. band 9.",
  },
  {
    prompt: "Artificial intelligence is increasingly being used to grade students' work and even to teach. Do you think this is a positive or negative development?",
    band9: "From automated essay scoring to AI tutors that never tire of a student's questions, machine intelligence is entering the classroom at every level. I regard this development as broadly positive — provided its role remains assistant rather than arbiter.\n\nThe positive case is substantial. Automated grading returns feedback in minutes instead of weeks, and research on learning is unambiguous: immediate feedback accelerates improvement. AI tutors offer something even scarcer — patience — adapting explanations to a learner's pace without judgment, a boon for shy students and crowded classrooms alike. For teachers, relieving the mechanical half of the job returns hours to the human half: mentoring, motivating and managing the social life of the classroom.\n\nThe dangers, however, are equally real. Grading algorithms inherit the biases of their training data and can lock students into predicted 'bands' that become self-fulfilling; an appeal to a machine is an appeal to a black box. Deeper still, education is not only the transmission of content: it is the experience of being seen and judged by a person who knows you. A system optimised for scalable instruction can quietly drop the relationship on which motivation depends.\n\nOn balance, then, AI in education deserves a cautious welcome — in the teacher's hands, not on the teacher's chair. The technology should mark, explain and suggest; decisions about a child's worth and pathway must remain, emphatically, human.",
    comments: "Measured thesis with a memorable formulation ('in the teacher's hands, not on the teacher's chair'). Benefits and risks analysed in depth; conclusion sets a precise boundary. Approx. band 9.",
  },
];

/* ═════════════════════ SPEAKING BANKS ══════════════════════════════════ */
interface SpeakingTopic {
  part1: { topic: string; questions: string[] };
  part2: { prompt: string; cues: string[] };
  part3: { topic: string; questions: string[] };
  sample: string;
}

const SPEAKING_TOPICS: SpeakingTopic[] = [
  {
    part1: { topic: "Hometown", questions: ["Where is your hometown?", "What do you like most about it?", "Has it changed much in recent years?", "Would you like to live there in the future?"] },
    part2: { prompt: "Describe a place in your hometown that you like to visit.", cues: ["where it is", "how often you go there", "what you do there", "and explain why you like visiting it"] },
    part3: { topic: "Cities and public spaces", questions: ["Why are public spaces important in a city?", "Do you think cities have enough green space today?", "How can towns encourage people to spend time outdoors?", "Should governments spend more on parks or on sports facilities?"] },
    sample: "The place I keep coming back to is the little tea stall by the old rail bridge in Sreemangal. It's nothing fancy — three benches, a kettle that's been boiling since before I was born — but the view across the tracks at sunset is something else. I go there most weekends with two or three friends after our evening walk. We order the seven-layer tea, which is our town's signature, and just talk for an hour. What I love is the pace: nobody hurries you, the trains rumble past like background music, and for a little while the week stops mattering. It's the kind of place that makes you feel connected to your town, and honestly, that's why I keep returning.",
  },
  {
    part1: { topic: "Work and study", questions: ["Do you work or are you a student?", "What do you find most interesting about it?", "Is there anything you find difficult?", "What are your plans for the future?"] },
    part2: { prompt: "Describe a skill you would like to learn in the future.", cues: ["what the skill is", "how you would learn it", "how long you think it would take", "and explain why you want to learn it"] },
    part3: { topic: "Learning and skills", questions: ["Why do some people learn new skills faster than others?", "Are practical skills more useful than academic ones?", "How has the internet changed the way people learn?", "Should employers train workers, or should workers train themselves?"] },
    sample: "The skill I'm determined to learn is underwater photography. I already dive occasionally, but capturing what I see down there is a different craft entirely. My plan is fairly structured: first a weekend course to master the equipment and lighting, then a supervised trip to the coast to build a portfolio, and finally a lot of trial and error. Realistically, I think it would take me about a year to become competent. The reason I want it so badly is simple — words fail down there. Every time I surface, I try to describe what I saw, and I never can. A camera would give me a way to share that silent, colourful world with people who may never dive, and that feels like a purpose worth a year of practice.",
  },
  {
    part1: { topic: "Weather", questions: ["What's the weather like in your country?", "Which season do you enjoy most?", "Does the weather affect your mood?", "Do you prefer hot or cold weather?"] },
    part2: { prompt: "Describe a memorable day trip you have taken.", cues: ["where you went", "who you went with", "what you did", "and explain why the trip was memorable"] },
    part3: { topic: "Travel and tourism", questions: ["Why do people enjoy day trips?", "How does tourism change small towns?", "Do you think travel broadens the mind?", "Should popular destinations limit visitor numbers?"] },
    sample: "The day trip I'll never forget is a monsoon-morning boat ride through the wetlands near my town with my cousins. We set off before dawn in a narrow wooden boat, the river so still it looked like glass. By eight we were deep in the reed beds, and the birds were astonishing — kingfishers flashing blue, a whole family of otters crossing ahead of the boat. We ate breakfast on the water: warm flatbread, eggs, and tea from a flask. What made it memorable wasn't just the scenery, it was the feeling of remoteness barely an hour from home — no roads, no noise, just water and sky. We laughed the whole way back, and I've been trying to recreate that quiet ever since.",
  },
  {
    part1: { topic: "Food and cooking", questions: ["What is a typical dish from your country?", "Can you cook?", "Do you prefer eating at home or eating out?", "Have your food habits changed recently?"] },
    part2: { prompt: "Describe a meal you enjoyed with other people.", cues: ["what the meal was", "who you shared it with", "where and when it happened", "and explain why you enjoyed it so much"] },
    part3: { topic: "Food and society", questions: ["Why do people enjoy eating together?", "Is traditional food losing importance in your country?", "How could people be encouraged to eat more healthily?", "Do you think food culture will become globalised?"] },
    sample: "The meal that stands out is a rainy-evening dinner at my grandmother's house last winter. There were about ten of us squeezed around one table, and the food was completely traditional — rice, her famous mustard-fish curry, mashed pumpkin with mustard oil, and lentils cooked with dried chillies. What made it special was less the menu than the choreography: everyone brought something, the children laid the table wrong on purpose to make her laugh, and the conversation outlasted the food by two hours. I enjoyed it because nobody was performing — no phones, no rush, just an old recipe and the people it was made for. It reminded me that a meal is really an excuse for company, and my grandmother's cooking has always been that excuse at its best.",
  },
  {
    part1: { topic: "Books and reading", questions: ["Do you enjoy reading?", "What kind of books do you prefer?", "Did you read much as a child?", "Do you prefer paper books or e-books?"] },
    part2: { prompt: "Describe a book that impressed you.", cues: ["what the book was", "what it was about", "when you read it", "and explain why it impressed you"] },
    part3: { topic: "Reading and media", questions: ["Will printed books disappear?", "Why do people prefer films to books?", "How can parents encourage children to read?", "Is reading news online better than reading newspapers?"] },
    sample: "The book that left the deepest mark on me is 'The Old Man and the Sea', which I read at fifteen during a school trip. On the surface it's a simple story — an old fisherman, a marlin, a losing battle — but the simplicity is the trap. I remember finishing it on the bus and staring out of the window, because I suddenly understood that dignity isn't about winning; it's about how you fight. The sentences were unlike anything I'd met: short, clean, and somehow enormous. It impressed me because it was the first book that changed how I behaved, not just how I felt — I started taking setbacks less personally after that. Even now, when something goes wrong, a line from it surfaces: a man can be destroyed but not defeated.",
  },
  {
    part1: { topic: "Music", questions: ["What kind of music do you like?", "Do you play any instrument?", "When do you usually listen to music?", "Has your taste in music changed over time?"] },
    part2: { prompt: "Describe a song or piece of music that means a lot to you.", cues: ["what it is", "when you first heard it", "what it is about", "and explain why it is meaningful to you"] },
    part3: { topic: "Music and culture", questions: ["Why is music important in every culture?", "Do you think traditional music is dying out?", "How has streaming changed our relationship with music?", "Should schools teach music seriously?"] },
    sample: "The piece of music that means the most to me is a folk song my grandmother used to hum while cooking — a boatman's song about crossing a river at dusk. I first heard it before I could even talk, so I can't remember hearing it 'first'; it was simply part of the house. Years later I found a recorded version, and hearing the melody outside her kitchen felt like meeting a stranger wearing a familiar face. It's meaningful because it carries two worlds at once: the boatman's century-old longing, and my grandmother's hands folding dough to the same tune. Whenever I hear it now, I'm nine years old again, and the kitchen smells of rain. That's what music does at its best — it stores people for us.",
  },
  {
    part1: { topic: "Social media", questions: ["How often do you use social media?", "Which apps do you use most?", "Do you think you spend too much time online?", "Have you ever made friends through social media?"] },
    part2: { prompt: "Describe a time when you used the internet to learn something new.", cues: ["what you learned", "which websites or apps you used", "how long it took", "and explain how useful the internet was for this"] },
    part3: { topic: "Technology and society", questions: ["Has the internet made people more or less patient?", "Why does misinformation spread so easily online?", "Should children be taught how to use the internet at school?", "Will artificial intelligence change how we use the web?"] },
    sample: "Last year I used the internet to teach myself basic video editing, and it genuinely changed how I work. I started with free tutorials on a video platform — about an hour a day, three days a week — and then joined a community forum where editors critiqued each other's practice clips, which was where the real learning happened. In total it took me around six weeks to go from fumbling with the timeline to cutting a two-minute travel video that friends actually enjoyed. What struck me was the abundance: step-by-step lessons, free effects, and strangers generous enough to explain my mistakes. Without the internet this would have meant an expensive course; instead it cost only discipline. It convinced me that for practical skills, the internet — used patiently — is the best classroom ever built.",
  },
  {
    part1: { topic: "Transport", questions: ["How do you usually travel around your city?", "Do you use public transport often?", "What is traffic like where you live?", "Would you like to own an electric vehicle?"] },
    part2: { prompt: "Describe a journey you make regularly.", cues: ["where you travel from and to", "how you travel", "how long it takes", "and explain what you like or dislike about it"] },
    part3: { topic: "Transport and cities", questions: ["How can cities reduce traffic congestion?", "Is public transport better than private cars?", "Will people travel less in the future?", "Should cities ban cars from their centres?"] },
    sample: "The journey I make almost daily is my ride from home to the coaching centre, about forty minutes each way. I go by bus for the first leg, then walk fifteen minutes through the market lane, which honestly is the best part of the trip. In the morning it's quick — the buses are empty before eight — but coming home at six the road thickens with rickshaws and school traffic, and the last kilometre can double in time. What I like is the rhythm of it: the same conductor, the same tea stall at the corner, the same shopkeepers opening their shutters. It's become my thinking time; I plan my lessons in my head. What I dislike is only the exhaust and the unpredictability on rainy days — but for a daily journey, it's a good one, and I'd rather walk the last stretch than ride it.",
  },
  {
    part1: { topic: "Photography", questions: ["Do you like taking photos?", "What do you usually photograph?", "Do you prefer taking photos with a phone or a camera?", "Do you share your photos online?"] },
    part2: { prompt: "Describe a photo you like very much.", cues: ["what is in the photo", "where and when it was taken", "who took it", "and explain why you like it"] },
    part3: { topic: "Images and memory", questions: ["Why do people love taking photos?", "Can too many photos spoil memories?", "How has the smartphone changed photography?", "Are photos reliable as historical evidence?"] },
    sample: "My favourite photograph is a slightly blurred shot of my parents on the roof of our old house, laughing at something we can't hear anymore. It was taken by my cousin during a power cut — the whole city was dark, but the sky was doing something remarkable, all orange and violet — so there they are, lit by a phone torch, mid-laugh. I like it for the layering: a blackout, which should have ruined the evening, actually made the photo. It captures my parents younger than I remember them being, and that's the quiet power of photographs — they keep secrets from us until years later. It hangs by my desk now. Every time work feels heavy, I look at it and remember that the best moments rarely wait for good lighting.",
  },
  {
    part1: { topic: "Free time and hobbies", questions: ["What do you do in your free time?", "Do you prefer indoor or outdoor activities?", "Is your free time different on weekdays and weekends?", "Are your hobbies similar to your friends' hobbies?"] },
    part2: { prompt: "Describe a hobby that you find relaxing.", cues: ["what the hobby is", "when you started it", "how often you do it", "and explain why it relaxes you"] },
    part3: { topic: "Leisure and modern life", questions: ["Why is free time important?", "Do people have more or less free time than in the past?", "How does social media affect our leisure?", "Should hobbies be productive?"] },
    sample: "The most relaxing hobby I have is tending the little container garden on our veranda — eleven pots of herbs, chillies and one stubborn lemon tree. I started it three years ago with a single basil plant that refused to die, and now it's a whole small world. I spend maybe half an hour there every evening, watering, pinching leaves, checking new shoots. What makes it relaxing is the combination of repetition and surprise: the routine is always the same, but something has changed every day — a flower, a new leaf, an aphid invasion to defeat. It's slow, it's physical, and it can't be rushed, which makes it the exact opposite of screens. By the time my fingers smell of soil, whatever the day did to my head has usually come undone. Cheap therapy, honestly — and the cooking benefits too.",
  },
];

/* ═════════════════════ TEST BUILDER ════════════════════════════════════ */
const BOOK_YEARS = [1995, 2000, 2002, 2005, 2006, 2007, 2008, 2011, 2013, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
const ACCENTS = ["#262012", "#2E5FA3", "#2E7D5B", "#A63A4C", "#7A5AA0", "#B5771E", "#171410", "#332B1A", "#2C4F8A", "#1E1B14"];

/** Rotate a bank of questions and renumber them sequentially from `start`. */
function pickQ(items: Omit<Q, "n">[], offset: number, start: number): Q[] {
  const rotated = items.map((_, i) => items[(i + offset) % items.length]);
  return rotated.map((q, i) => ({ ...q, n: start + i }));
}

function buildListening(rand: () => number) {
  const bank = rand() < 0.5 ? LISTENING_A : LISTENING_B;
  const parts = bank.map((p) => ({
    n: p.n,
    title: p.title,
    scenario: p.scenario,
    audio: p.audio,
    transcript: p.transcript,
    questions: pickQ(p.questions, Math.floor(rand() * 10), 1 + (p.n - 1) * 10),
  }));
  return { durationMin: 40, parts };
}

function buildReading(module: string, bookNumber: number, testNumber: number, rand: () => number) {
  if (module === "general") {
    const start = (bookNumber * 3 + testNumber * 2) % GT_TEXTS.length;
    const sections = [0, 1, 2, 3].map((k) => GT_TEXTS[(start + k) % GT_TEXTS.length]);
    let qn = 1;
    const passages = sections.map((s, idx) => {
      const rotated = pickQ(s.items, Math.floor(rand() * 8), 1);
      const questions = rotated.map((q) => ({ ...q, n: qn++ }));
      return { n: idx + 1, title: `Section ${idx + 1} — ${s.title}`, text: s.text, questions };
    });
    return { durationMin: 60, kind: "general", passages };
  }
  const start = (bookNumber * 7 + testNumber * 3) % PASSAGES.length;
  const chosen = [0, 1, 2].map((k) => PASSAGES[(start + k) % PASSAGES.length]);
  let qn = 1;
  const passages = chosen.map((p, idx) => {
    const items: Omit<Q, "n">[] = [
      ...p.mcq.map((q) => ({ ...q, type: "mcq" as const, options: q.options as string[] })),
      ...p.tfng.map((q) => ({ ...q, type: "tfng" as const, answer: q.answer as string })),
      ...p.blank.map((q) => ({ ...q, type: "blank" as const })),
    ];
    const rotated = pickQ(items, Math.floor(rand() * 12), 1);
    const questions = rotated.map((q) => ({ ...q, n: qn++ }));
    return { n: idx + 1, title: `Reading Passage ${idx + 1} — ${p.title}`, text: p.paragraphs.join("\n\n"), questions };
  });
  return { durationMin: 60, kind: "academic", passages };
}

function buildWriting(module: string, bookNumber: number, testNumber: number) {
  const task1 =
    module === "general"
      ? TASK1_GT_LETTER[(bookNumber * 5 + testNumber) % TASK1_GT_LETTER.length]
      : TASK1_ACADEMIC[(bookNumber + testNumber * 2) % TASK1_ACADEMIC.length];
  const task2 = TASK2_BANK[(bookNumber * 3 + testNumber) % TASK2_BANK.length];
  return { task1, task2 };
}

function buildSpeaking(bookNumber: number, testNumber: number) {
  const topic = SPEAKING_TOPICS[(bookNumber * 4 + testNumber) % SPEAKING_TOPICS.length];
  return {
    part1: { topic: topic.part1.topic, questions: topic.part1.questions },
    part2: { prompt: topic.part2.prompt, cues: topic.part2.cues, prepareSec: 60, speakSec: 120 },
    part3: { topic: topic.part3.topic, questions: topic.part3.questions },
    sample: { text: topic.sample, audio: "/audio/cambridge/speaking-sample.wav" },
  };
}

const BLURBS: Record<string, string> = {
  academic:
    "Four complete Academic practice tests in the official Cambridge style — Listening with transcripts, three-passage Reading, Academic Writing Tasks 1 & 2, and full Speaking Part 1-3 sets with band-9 samples.",
  general:
    "Four complete General Training practice tests — workplace and everyday reading sections, letter writing for Task 1, familiar Listening and Speaking formats, all with instant scoring and model answers.",
};

/* ═════════════════════ MAIN ════════════════════════════════════════════ */
async function main() {
  const existing = await db.cambridgeTest.count();
  if (existing > 0) {
    console.log(`Cambridge library already seeded (${existing} tests). Skipping.`);
    return;
  }

  let bookCount = 0;
  let testCount = 0;

  for (let number = 1; number <= 19; number++) {
    const editions = number <= 3 ? ["academic"] : ["academic", "general"];
    for (const edition of editions) {
      const year = BOOK_YEARS[number - 1];
      const title = `Cambridge IELTS ${number} ${edition === "academic" ? "Academic" : "General Training"}`;
      const book = await db.cambridgeBook.create({
        data: {
          number,
          module: edition,
          title,
          year,
          accent: ACCENTS[(number + (edition === "general" ? 4 : 0)) % ACCENTS.length],
          blurb: BLURBS[edition],
        },
      });
      bookCount++;

      for (let testNumber = 1; testNumber <= 4; testNumber++) {
        const rand = mulberry32(number * 1000 + testNumber * 10 + (edition === "general" ? 7 : 3));
        const listening = buildListening(rand);
        const reading = buildReading(edition, number, testNumber, rand);
        const writing = buildWriting(edition, number, testNumber);
        const speaking = buildSpeaking(number, testNumber);

        await db.cambridgeTest.create({
          data: {
            bookId: book.id,
            number: testNumber,
            listening: JSON.stringify(listening),
            reading: JSON.stringify(reading),
            writing: JSON.stringify(writing),
            speaking: JSON.stringify(speaking),
          },
        });
        testCount++;
      }
    }
    console.log(`  ✓ Book ${number} seeded`);
  }

  console.log(`\nCambridge library ready: ${bookCount} books, ${testCount} tests.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());