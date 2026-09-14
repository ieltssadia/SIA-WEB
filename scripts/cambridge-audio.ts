/**
 * Generates the Cambridge library demo audio clips (TTS, British-accent
 * "jam" voice) into public/audio/cambridge/. Each clip stays under the
 * 1024-char TTS limit; texts are condensed narrations of the listening
 * scenarios (full transcripts live in the database).
 *
 * Run: bun scripts/cambridge-audio.ts
 */
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "public", "audio", "cambridge");
fs.mkdirSync(OUT, { recursive: true });

const CLIPS: Array<{ file: string; text: string }> = [
  {
    file: "listening-part1.wav",
    text: "Good morning, Riverside Hall, how can I help? Hello, I'd like to book the main hall for a charity concert, please. Of course. Which date? Saturday the fourteenth, in the evening. Let me check... yes, that's free. And how many people are you expecting? Around eighty. The hall holds a hundred and twenty. There's a cleaning fee of two thousand taka, payable on the day. The projector is included, but the piano is an extra five hundred. We'll take the piano as well. Can I take a contact name? Yes, it's Arif Chowdhury. And a phone number? Zero one seven one two, four four five, nine zero two. You're booked. Payment is due by bank transfer seven days before.",
  },
  {
    file: "listening-part2.wav",
    text: "Good news for cyclists — the city has opened three new routes this spring. The River Line runs eleven kilometres along the north bank and is completely flat, ideal for beginners. The Hill Loop, at seven kilometres, climbs through the pine forest and includes the city's first wooden boardwalk. Finally, the Market Route connects the central market to the university and is lit after dark, making it the safest choice for evening rides. Helmets are free to borrow from the new dock on Station Square. You'll need to leave a deposit of three hundred taka, refunded when you return the helmet. Route maps are available at the tourist office for one hundred taka, or free on the city app. And a reminder: the annual Car-Free Sunday returns next month, when the Riverside Road closes to cars from six in the morning until noon.",
  },
  {
    file: "listening-part3.wav",
    text: "So, Nadia, your proposal focuses on tea-garden soil erosion. Why that topic? Two reasons, really. The estates here lose topsoil every monsoon, and previous studies only looked at large plantations, not smallholder plots. Good gap. But your method worries me. Forty plots is ambitious for one term. I could reduce it to twenty-five. Twenty is realistic. And consider pairing soil samples with drone photos — the geography department lends them out. What about the lab analysis? Book the soil lab early. March is fully committed. Come April there's usually space. Then I'll schedule April. Should I still interview the estate managers? Keep five interviews, no more. Depth beats breadth here. And Nadia — submit the ethics form before any fieldwork. No form, no access.",
  },
  {
    file: "listening-part4.wav",
    text: "Today we trace how tea moved from luxury to daily habit — through the auction house. When tea first reached Europe in the seventeenth century, it sold at prices few could afford. The breakthrough was the public auction: buyers competed openly, and prices fell as volumes grew. London's auctions ran for over three centuries, ending only in nineteen ninety-eight, when electronic trading took over. Producing regions responded by building their own auction centres — Calcutta in eighteen sixty-one, Chittagong in nineteen forty-nine — so that growers, not distant brokers, set the rhythm of trade. The auction room itself shaped the product: tasting rounds standardised quality grades. Today, online platforms continue the same logic — transparent prices, instant information — though some argue they lack the tactile ritual of the room. The grower who understands quality commands the premium.",
  },
  {
    file: "speaking-sample.wav",
    text: "The place I keep coming back to is the little tea stall by the old rail bridge in Sreemangal. It's nothing fancy — three benches, a kettle that's been boiling since before I was born — but the view across the tracks at sunset is something else. I go there most weekends with two or three friends after our evening walk. We order the seven-layer tea, which is our town's signature, and just talk for an hour. What I love is the pace: nobody hurries you, the trains rumble past like background music, and for a little while the week stops mattering. It's the kind of place that makes you feel connected to your town, and honestly, that's why I keep returning.",
  },
];

async function main() {
  const zai = await ZAI.create();
  for (const clip of CLIPS) {
    if (clip.text.length > 1024) throw new Error(`${clip.file}: text too long (${clip.text.length})`);
    const out = path.join(OUT, clip.file);
    if (fs.existsSync(out) && fs.statSync(out).size > 10_000) {
      console.log(`  ↷ ${clip.file} already exists, skipping`);
      continue;
    }
    const response = await zai.audio.tts.create({
      input: clip.text,
      voice: "jam",
      speed: 1.0,
      response_format: "wav",
      stream: false,
    });
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    fs.writeFileSync(out, buffer);
    console.log(`  ✓ ${clip.file} (${Math.round(buffer.length / 1024)} KB)`);
  }
  console.log("\nCambridge audio ready.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});