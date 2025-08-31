import Sentiment from "sentiment";

const sentiment = new Sentiment();

function countMatches(text: string, regex: RegExp) {
  const m = text.match(regex);
  return m ? m.length : 0;
}

function tokenize(text: string) {
  const words = (text.toLowerCase().match(/[a-zA-Z0-9@#']+/g) || []);
  return words;
}

function sentences(text: string) {
  const s = text.split(/[.!?\n]+/).map(t => t.trim()).filter(Boolean);
  return s;
}

function fleschReadingEase(text: string) {
  const sents = Math.max(sentences(text).length, 1);
  const words = tokenize(text);
  const wordCount = Math.max(words.length, 1);
  const syllables = words.reduce((acc, w) => acc + Math.max(1, Math.ceil(w.length / 3)), 0);
  const ASL = wordCount / sents;
  const ASW = syllables / wordCount;
  const score = 206.835 - 1.015 * ASL - 84.6 * ASW;
  return Math.round(score * 10) / 10;
}

export function analyzeText(text: string, platform: string = "generic") {
  const wordCount = tokenize(text).length;
  const charCount = text.length;
  const sentenceCount = sentences(text).length;
  const hashtags = countMatches(text, /#[\w]+/g);
  const mentions = countMatches(text, /@[\w]+/g);
  const urls = countMatches(text, /(https?:\/\/|www\.)\S+/gi);
  const emojis = countMatches(text, /\p{Emoji}/gu);
  const ctas = ["buy now", "learn more", "sign up", "comment below", "share this", "link in bio", "follow us", "subscribe"];
  const ctaPresent = ctas.some((c) => text.toLowerCase().includes(c));

  const sent = sentiment.analyze(text);
  const readability = fleschReadingEase(text);

  const lengthAdvice: string[] = [];
  const targets: Record<string, [number, number]> = {
    twitter: [71, 100],
    x: [71, 100],
    instagram: [138, 150],
    linkedin: [140, 190],
    generic: [80, 180],
  };
  const [minT, maxT] = targets[platform as keyof typeof targets] || targets.generic;
  if (charCount < minT) lengthAdvice.push(`Consider adding a bit more context (${minT}–${maxT} chars performs well).`);
  if (charCount > maxT) lengthAdvice.push(`Try to tighten to about ${minT}–${maxT} chars for skimmability.`);

  const suggestions: string[] = [
    ...(hashtags < 1 ? ["Add 2–3 relevant hashtags to improve discovery."] : []),
    ...(mentions < 1 ? ["Mention collaborators or brands (use @) to increase reach."] : []),
    ...(urls < 1 ? ["Include a clear link or CTA to drive action."] : []),
    ...(emojis < 1 ? ["A couple of well-placed emojis can humanize the post."] : []),
    ...(!ctaPresent ? ["Add a call-to-action (e.g., “Learn more”, “Comment below”)."] : []),
    ...(readability < 60 ? ["Simplify phrasing for better readability (shorter sentences/words)."] : []),
    ...lengthAdvice,
    ...(sent.score < 0 ? ["Tone appears negative—consider reframing towards benefits."] : []),
  ];

  const platformTips: Record<string, string[]> = {
    twitter: ["Use 1–2 hashtags", "Visuals increase engagement", "Start with a hook"],
    instagram: ["Lead with story, then CTA", "Use 3–5 hashtags", "Consider carousel if long"],
    linkedin: ["Value upfront in first 2 lines", "Use formatting (•, –, line breaks)", "Include a question to spark comments"],
    generic: ["Keep it concise", "One clear message", "Strong opener + CTA"],
  };

  return {
    stats: {
      wordCount, charCount, sentenceCount, hashtags, mentions, urls, emojis,
      sentiment: sent.score, readability
    },
    suggestions,
    platformTips,
  };
}
