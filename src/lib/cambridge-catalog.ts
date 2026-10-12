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
      title: "Part 1 — Hinchingbrooke Country Park School Visit",
      scenario: "A telephone conversation between a school teaching assistant and a country park ranger discussing an educational field trip.",
      audio: "/audio/cambridge/listening-part1.mp3",
      transcript: `SALLY: Good morning. Hinchingbrooke Country Park, Sally speaking. I'm one of the rangers.
JOHN: Oh hello. My name's John Chapman, and I'm a teaching assistant at a local primary school. I've been asked to arrange a visit to the park for two of our classes.
SALLY: OK. What would you like to know?
JOHN: Well, I'm new to this area, so perhaps you could tell me something about the park first, please.
SALLY: Of course. Altogether the park covers 170 acres, that's 69 hectares. There are three main types of habitat: wetland, grassland and woodland. The woods are well established and varied, with an oak plantation, and other areas of mixed species.
JOHN: Right.
SALLY: The wetland is quite varied, too. The original farmland was dug up around 40 years ago to extract gravel. Once this work was completed, the gravel pits filled with water, forming the two large lakes. There are also several smaller ones, ponds and a stream that flows through the park.
JOHN: OK, so I suppose with these different habitats there's quite a variety of wildlife.
SALLY: There certainly is – a lot of different species of birds and insects, and also animals like deer and rabbits.
JOHN: And I understand you organise educational visits for school parties.
SALLY: That's right. We can organise a wide range of activities and adapt them to suit all ages.
JOHN: Can you give me some examples of the activities?
SALLY: Well, one focus is on science, where we help children to discover and study plants, trees and insects. They also collect and analyse data about the things they see.
JOHN: Uhuh.
SALLY: Another focus is on geography. The park is a great environment to learn and practice reading a map and using a compass to navigate around the park.
JOHN: Do you do anything connected with history?
SALLY: Yes, we do. For instance, the children can explore how the use of the land has changed over time. Then there's leisure and tourism.
JOHN: That focuses on your visitors, I would imagine.
SALLY: Yes, mostly. The children find out about them, their requirements, the problems they may cause and how we manage these. And another subject we cover is music: here the children experiment with natural materials to create sounds and explore rhythm and tempo.
JOHN: That must be fun!
SALLY: Most children really enjoy it. And of course, all the activities are educational, too. Learning outside the classroom encourages children to be creative, and to explore and discover for themselves.
JOHN: I would imagine they get a sense of freedom that might not be a normal part of their lives.
SALLY: That's right. And very often the children discover that they can do things they didn't know they could do, and they develop new skills. This gives them greater self-confidence.
JOHN: It sounds great. So, what about the practical side of it? How much does it cost for a full-day visit? We would expect to bring between 30 and 40 children.
SALLY: If there are over 30, it costs £4.95 for each child who attends on the day. We invoice you afterwards, so you don't pay for children who can't come because of sickness, for example. There's no charge for leaders and other adults - as many as you want to bring.
JOHN: That sounds very fair. Well, thanks for all the information. I'll need to discuss it with my colleagues, and I hope to get back to you soon to make a booking.
SALLY: We'll look forward to hearing from you. Goodbye.
JOHN: Goodbye, and thank you.`,
      questions: [
        { n: 1, type: "blank", label: "Total area of the country park: ______ acres (69 hectares)", answer: "170", accept: ["one hundred and seventy", "170 acres"], explanation: "Sally mentions: 'Altogether the park covers 170 acres'." },
        { n: 2, type: "blank", label: "Gravel extraction took place around ______ years ago", answer: "40", accept: ["forty"], explanation: "Sally notes: 'The original farmland was dug up around 40 years ago to extract gravel'." },
        { n: 3, type: "blank", label: "Three main habitats: wetland, grassland and ______", answer: "woodland", accept: ["woods"], explanation: "Sally: 'three main types of habitat: wetland, grassland and woodland'." },
        { n: 4, type: "blank", label: "Two large lakes formed after gravel pits filled with ______", answer: "water", explanation: "Sally: 'the gravel pits filled with water, forming the two large lakes'." },
        { n: 5, type: "blank", label: "Science activity: study plants, trees and ______", answer: "insects", explanation: "Sally: 'help children to discover and study plants, trees and insects'." },
        { n: 6, type: "blank", label: "Geography activity: practicing how to read a ______ and use a compass", answer: "map", explanation: "Sally: 'learn and practice reading a map and using a compass'." },
        { n: 7, type: "blank", label: "History activity: exploring how the use of the ______ changed over time", answer: "land", explanation: "Sally: 'children can explore how the use of the land has changed over time'." },
        { n: 8, type: "blank", label: "Music activity: using natural materials to explore rhythm and ______", answer: "tempo", explanation: "Sally: 'create sounds and explore rhythm and tempo'." },
        { n: 9, type: "blank", label: "Developing new outdoor skills provides children with greater ______", answer: "self-confidence", accept: ["confidence"], explanation: "Sally: 'This gives them greater self-confidence'." },
        { n: 10, type: "blank", label: "Cost per child for groups over 30: £______", answer: "4.95", accept: ["4.95 pounds", "four ninety-five"], explanation: "Sally: 'If there are over 30, it costs £4.95 for each child'." },
      ],
    },
    {
      n: 2,
      title: "Part 2 — Stanthorpe Twinning Association & Farley House",
      scenario: "An address to the Stanthorpe Twinning Association detailing a French exchange visit and an excursion to Farley House.",
      audio: "/audio/cambridge/listening-part2.mp3",
      transcript: `SPEAKER: It's great to see so many members of the Twinning Association here tonight. Since the twinning link between our two towns, Stanthorpe here in England and Malatte in France, was established, the relationship between the towns has gone from strength to strength.
Last month, 25 members of the association from Stanthorpe spent a weekend in Malatte. Our hosts had arranged a great programme. We learned how cheese is produced in the region and had the chance to taste the products. The theme park trip had to be cancelled, but we all had a great time on the final boat trip down the river - that was the real highlight.
This is a special year for the Association because it's 25 years since we were founded. In Malatte, they're planning to mark this by building a footbridge in the municipal park. We've been discussing what to do here and we've decided to plant a poplar tree in the museum gardens. We considered buying a garden seat to put there, but the authorities weren't happy with that idea.
In terms of fundraising to support our activities, we've done very well. Our pancake evening was well attended and made record profits. And everyone enjoyed the demonstration of French cookery, which was nearly as successful. Numbers for our film show were limited because of the venue so we're looking for somewhere bigger next year.
We're looking forward to welcoming our French visitors here next week, and I know that many of you here will be hosting individuals or families. The coach from France will arrive at 5 pm on Friday. Don't try to do too much that first evening as they'll be tired, so have dinner in the house or garden rather than eating out. The weather looks as if it'll be OK so you might like to plan a barbecue. Then the next morning's market day in town, and that's always a good place to stroll round.
On Saturday evening, we'll all meet up at the football club, where once again we'll have Toby Sharp and his band performing English and Scottish country songs. Toby will already be well known to many of you as last year he organized our special quiz night and presented the prizes.
Now on Sunday, we'll be taking our visitors to Farley House. There's an excellent farm shop in the grounds where our visitors can buy local produce – it's in the old stables, which is the first building you come to. They're built round a courtyard, and the shop's in the far corner on the left. There's also a small café on the right as you go in.
I know that one or two of our visitors may not be all that mobile. The main entrance to the house has a lot of steps so you might want to use the disabled entry. This is on the far side of the house from the car park.
Children will probably be most interested in the adventure playground. That's at the northern end of the larger lake, in a bend on the path that leads to the lake.
There are a number of lovely gardens near the house. The kitchen gardens are rectangular and surrounded by a wall. They're to the north-east of the house, quite near the smaller lake. They're still in use and have a great collection of fruit and vegetables.
The Temple of the Four Winds is a bit more of a walk – but it's worth it. Take the path from the car park and go past the western sides of the stables and the house. Then when the path forks, take the right-hand path. Go up there with the woods on your left and the temple is right at the end. There are great views over the whole area.`,
      questions: [
        { n: 11, type: "mcq", label: "How many members travelled to Malatte on the recent trip?", options: ["15", "20", "25", "30"], answer: "25", explanation: "Speaker: '25 members of the association from Stanthorpe spent a weekend in Malatte'." },
        { n: 12, type: "mcq", label: "Which event was described as the highlight of the weekend in France?", options: ["Cheese tasting session", "Boat trip on the river", "Theme park excursion", "French cookery class"], answer: "Boat trip on the river", explanation: "'the final boat trip down the river - that was the real highlight'." },
        { n: 13, type: "blank", label: "Stanthorpe will celebrate its 25th anniversary by planting a poplar tree in the ______ gardens", answer: "museum", explanation: "Speaker: 'decided to plant a poplar tree in the museum gardens'." },
        { n: 14, type: "blank", label: "The fundraising event that produced record profits was the ______ evening", answer: "pancake", explanation: "'Our pancake evening was well attended and made record profits'." },
        { n: 15, type: "blank", label: "The coach carrying French visitors arrives at ______ pm on Friday", answer: "5", accept: ["5:00", "five"], explanation: "'The coach from France will arrive at 5 pm on Friday'." },
        { n: 16, type: "blank", label: "Saturday evening musical performance is scheduled at the ______ club", answer: "football", explanation: "'we'll all meet up at the football club, where once again we'll have Toby Sharp'." },
        { n: 17, type: "blank", label: "At Farley House, local produce can be purchased at the farm shop in the old ______", answer: "stables", explanation: "'farm shop in the grounds... it's in the old stables'." },
        { n: 18, type: "blank", label: "Accessible entry for disabled visitors is located on the far side from the ______", answer: "car park", accept: ["carpark", "parking"], explanation: "'This is on the far side of the house from the car park'." },
        { n: 19, type: "blank", label: "The adventure playground is situated at the northern end of the larger ______", answer: "lake", explanation: "'That's at the northern end of the larger lake'." },
        { n: 20, type: "blank", label: "To reach the Temple of the Four Winds, take the ______ fork on the path", answer: "right-hand", accept: ["right"], explanation: "'when the path forks, take the right-hand path'." },
      ],
    },
    {
      n: 3,
      title: "Part 3 — Food Waste Innovations & Consumer Trends",
      scenario: "Two university students, Colin and Marie, discuss their food science projects and modern consumer eating trends.",
      audio: "/audio/cambridge/listening-part3.mp3",
      transcript: `COLIN: I haven't seen you for a bit, Marie.
MARIE: No. I've been busy with my project.
COLIN: You're making a vegan alternative to eggs, aren't you? Something that doesn't use animal products?
MARIE: Yes. I'm using chickpeas. I had two main aims when I first started looking for an alternative to eggs, but actually I've found chickpeas have got more advantages.
COLIN: Right.
MARIE: But how about your project on reusing waste food – you were looking at bread, weren't you?
COLIN: Yes. It's been hard work, but I've enjoyed it. The basic process was quite straightforward - breaking the stale bread down to a paste then reforming it.
MARIE: But you were using 3-D printing, weren't you, to make the paste into biscuits?
COLIN: Yeah, I'd used that before, but in this project, I had time to play around with different patterns for the biscuits and finding how I could add fruit and vegetables to make them a more appetising colour, and I was really pleased with what I managed to produce.
MARIE: It must've been a great feeling to make something appetising out of bits of old bread that would've been thrown away otherwise.
COLIN: It was. And I'm hoping that some of the restaurants in town will be interested in the biscuits. I'm going to send them some samples.
MARIE: I came across something on the internet yesterday that might interest you. It was a company that's developed touch-sensitive sensors for food labels. It's a special sort of label on the food package. When the label's smooth, the food is fresh and then when you can feel bumps on the label, that means the food's gone bad. It started off as a project to help visually impaired people know whether food was fit to eat or not.
COLIN: Interesting. So just solid food?
MARIE: No, things like milk and juice as well. But actually, I thought it might be really good for drug storage in hospitals and pharmacies.
COLIN: Right. And coming back to food, maybe it'd be possible to use it for other things besides freshness. Like how many kilograms a joint of meat is, for example.
MARIE: Yes, there's all sorts of possibilities.
COLIN: I was reading an article about food trends predicting how eating habits might change in the next few years.
MARIE: Oh things like more focus on local products? That seems so obvious, but the shops are still full of imported foods.
COLIN: Yes, they need to be more proactive to address that.
MARIE: And somehow motivate consumers to change, yes.
COLIN: One thing everyone's aware of is the need for a reduction in unnecessary packaging - but just about everything you buy in supermarkets is still covered in plastic. The government needs to do something about it.
MARIE: Absolutely. It's got to change.
COLIN: Do you think there'll be more interest in gluten and lactose-free food?
MARIE: For people with allergies or food intolerances? I don't know. Lots of people I know have been buying that type of food for years now.
COLIN: Yes, even if they haven't been diagnosed with an allergy.
MARIE: That's right. One thing I've noticed is the number of branded products related to celebrity chefs – people watch them cooking on TV and then buy things like spice mixes or frozen foods with the chef's name on. I bought something like that once, but I won't again.
COLIN: Yeah – I bought a ready-made spice mix for chicken which was supposed to be used by a chef I'd seen on television, and it didn't actually taste of anything.
MARIE: Mm. Did the article mention 'ghost kitchens' used to produce takeaway food?
COLIN: No. What are they?
MARIE: Well, they might have the name of a restaurant, but actually they're a cooking facility just for delivery meals – the public don't ever go there. But people aren't aware of that – it's all kept very quiet.
COLIN: So people don't realise the food's not actually from the restaurant?
MARIE: Right.
COLIN: Did you know more and more people are using all sorts of different mushrooms now, to treat different health concerns? Things like heart problems?
MARIE: Hmm. They might be taking a big risk there.
COLIN: Yes, it's hard to know which varieties are safe to eat.`,
      questions: [
        { n: 21, type: "blank", label: "Marie is developing a plant-based egg substitute made from ______", answer: "chickpeas", accept: ["chickpea"], explanation: "Marie: 'Yes. I'm using chickpeas.'" },
        { n: 22, type: "blank", label: "Colin transformed stale bread paste into biscuits using ______ printing", answer: "3-D", accept: ["3D", "three dimensional", "3-dimensional"], explanation: "Marie: 'you were using 3-D printing, weren't you'." },
        { n: 23, type: "blank", label: "Colin improved biscuit colour by introducing fruit and ______", answer: "vegetables", accept: ["veg"], explanation: "Colin: 'finding how I could add fruit and vegetables to make them a more appetising colour'." },
        { n: 24, type: "blank", label: "Food label sensors indicate spoiled food when users can feel ______ on the surface", answer: "bumps", accept: ["bumps on the label"], explanation: "Marie: 'when you can feel bumps on the label, that means the food's gone bad'." },
        { n: 25, type: "blank", label: "Marie believes the sensory packaging technology could also monitor ______ storage", answer: "drug", accept: ["medicine", "pharmaceutical", "drugs"], explanation: "Marie: 'thought it might be really good for drug storage in hospitals'." },
        { n: 26, type: "blank", label: "Colin calls for government regulation to eliminate unnecessary supermarket ______", answer: "packaging", accept: ["plastic packaging", "plastic"], explanation: "Colin: 'need for a reduction in unnecessary packaging... The government needs to do something'." },
        { n: 27, type: "blank", label: "Both students were disappointed because celebrity chef items lacked ______", answer: "taste", accept: ["flavor", "flavour"], explanation: "Colin: 'it didn't actually taste of anything'." },
        { n: 28, type: "blank", label: "Ghost kitchens produce takeaway delivery meals without access for the ______", answer: "public", accept: ["customers"], explanation: "Marie: 'the public don't ever go there'." },
        { n: 29, type: "blank", label: "Marie cautions that self-treating illness with wild ______ carries major risks", answer: "mushrooms", explanation: "Colin mentions mushrooms and Marie responds: 'They might be taking a big risk there'." },
        { n: 30, type: "blank", label: "The sensory label innovation was originally designed for ______ impaired consumers", answer: "visually", accept: ["vision"], explanation: "Marie: 'started off as a project to help visually impaired people'." },
      ],
    },
    {
      n: 4,
      title: "Part 4 — Archaeology and Climate History at Céide Fields",
      scenario: "An archaeological lecture examining prehistoric settlement, agriculture, and preservation at Céide Fields in Ireland.",
      audio: "/audio/cambridge/listening-part4.mp3",
      transcript: `LECTURER: For my presentation today, I'm going to talk about the Céide Fields in the northwest of Ireland, one of the largest Neolithic sites in the world. I recently visited this site and observed the work that is currently being done by a team of archaeologists there.
The site was first discovered in the 1930s by a local teacher, Patrick Caulfield. He noticed that when local people were digging in the bog, they were constantly hitting against what seemed to be rows of stones. He realised that these must be walls and that they must be thousands of years old for them to predate the bog which subsequently grew over them.
He wrote to the National Museum in Dublin to ask them to investigate, but no one took him seriously. It wasn't until 40 years later, when Patrick Caulfield's son Seamus, who had become an archaeologist by then, began to explore further. He inserted iron probes into the bog to map the formation of the stones, a traditional method which local people had always used for finding fuel buried in the bog for thousands of years. Carbon dating later proved that the site was over 5,000 years old and was the largest Neolithic site in Ireland.
Thanks to the bog which covers the area, the remains of the settlement at Céide Fields, which is over 5,000 years old, are extremely well-preserved. A bog is 90 percent water; its soil is so saturated that when the grasses and heathers that grow on its surface die, they don't fully decay but accumulate in layers. Objects remain so well preserved in these conditions because of the acidity of the peat and the deficiency of oxygen. At least 175 days of rain a year are required for this to happen; this part of Ireland gets an average of 225 days.
The Neolithic farmers at Céide would have enjoyed several centuries of relative peace and stability. Neolithic farmers generally lived in larger communities than their predecessors, with a number of houses built around a community building. As they lived in permanent settlements, Neolithic farmers were able to build bigger houses. These weren't round as people often assume, but rectangular with a small hole in the roof that allowed smoke to escape. This is one of many innovations and indicates that the Neolithic farmers were the first people to cook indoors. Another new technology that Neolithic settlers brought to Ireland was pottery. Fragments of Neolithic pots have been found in Céide and elsewhere in Ireland. The pots were used for many things; as well as for storing food, pots were filled with a small amount of fat and when this was set alight, they served as lamps.
It's thought that the Céide Fields were mainly used as paddocks for animals to graze in. Evidence from the Céide Fields suggests that each plot of land was of a suitable size to sustain an extended family. They may have used a system of rotational grazing in order to prevent over-grazing and to allow for plant recovery and regrowth. This must have been a year-round activity as no structures have been found which would have been used to shelter animals in the winter.
However, archaeologists believe that this way of life at Céide ceased abruptly. Why was this? Well, several factors may have contributed to the changing circumstances. The soil would have become less productive and led to the abandonment of farming. The crop rotation system was partly responsible for this as it would have been very intensive and was not sustainable. But there were also climatic pressures too. The farmers at Céide would have enjoyed a relatively dry period, but this began to change and the conditions became wetter as there was a lot more rain. It was these conditions that encouraged the bog to form over the area which survives today.`,
      questions: [
        { n: 31, type: "blank", label: "The ancient stone structures were first noticed in the 1930s by a local ______", answer: "teacher", explanation: "Lecturer: 'discovered in the 1930s by a local teacher, Patrick Caulfield'." },
        { n: 32, type: "blank", label: "Patrick Caulfield recognized that the buried stones formed stone ______", answer: "walls", explanation: "Lecturer: 'He realised that these must be walls'." },
        { n: 33, type: "blank", label: "Seamus Caulfield mapped the stone alignments using iron ______", answer: "probes", explanation: "Lecturer: 'He inserted iron probes into the bog to map the formation'." },
        { n: 34, type: "blank", label: "Radiocarbon analysis confirmed the Neolithic settlement was over ______ years old", answer: "5000", accept: ["5,000", "five thousand"], explanation: "Lecturer: 'site was over 5,000 years old'." },
        { n: 35, type: "blank", label: "Organic remains survive in the peat bog due to high acidity and lack of ______", answer: "oxygen", explanation: "Lecturer: 'acidity of the peat and the deficiency of oxygen'." },
        { n: 36, type: "blank", label: "Neolithic dwellings were built with a roof opening to release ______", answer: "smoke", explanation: "Lecturer: 'rectangular with a small hole in the roof that allowed smoke to escape'." },
        { n: 37, type: "blank", label: "Clay vessels fueled with animal fat functioned as early ______", answer: "lamps", accept: ["lights"], explanation: "Lecturer: 'filled with a small amount of fat and when this was set alight, they served as lamps'." },
        { n: 38, type: "blank", label: "Stone enclosures primarily served as grazing ______ for domestic livestock", answer: "paddocks", accept: ["pastures"], explanation: "Lecturer: 'mainly used as paddocks for animals to graze in'." },
        { n: 39, type: "blank", label: "Pasture land was preserved through a systematic ______ grazing strategy", answer: "rotational", explanation: "Lecturer: 'used a system of rotational grazing in order to prevent over-grazing'." },
        { n: 40, type: "blank", label: "The settlement was ultimately abandoned due to soil degradation and increased ______", answer: "rain", accept: ["rainfall"], explanation: "Lecturer: 'conditions became wetter as there was a lot more rain'." },
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
