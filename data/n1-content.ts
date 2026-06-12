export interface VocabItem {
  word: string;
  reading: string;
  meaning: string;
  exampleJa: string;
  exampleEn: string;
  tags: string[];
}

export interface GrammarItem {
  pattern: string;
  meaning: string;
  usage: string;
  example: string;
  exampleTranslation: string;
  notes: string;
}

export interface KanjiItem {
  kanji: string;
  readings: { on: string[]; kun: string[] };
  meanings: string[];
  examples: Array<{ word: string; reading: string; meaning: string }>;
  strokeCount: number;
}

export const N1_VOCABULARY: VocabItem[] = [
  { word: "明晰", reading: "めいせき", meaning: "lucid, clear, sharp", exampleJa: "彼女の明晰な判断力に感銘を受けた。", exampleEn: "I was impressed by her clear judgment.", tags: ["adjective", "intellect"] },
  { word: "逡巡", reading: "しゅんじゅん", meaning: "hesitation, vacillation", exampleJa: "彼は逡巡した後、決断を下した。", exampleEn: "After hesitating, he made a decision.", tags: ["noun", "emotion"] },
  { word: "顛末", reading: "てんまつ", meaning: "full particulars, whole story", exampleJa: "事件の顛末を説明してください。", exampleEn: "Please explain the full story of the incident.", tags: ["noun", "narrative"] },
  { word: "忸怩", reading: "じくじ", meaning: "shame, embarrassment, remorse", exampleJa: "忸怩たる思いで謝罪した。", exampleEn: "I apologized with deep remorse.", tags: ["adjective", "emotion"] },
  { word: "蓋然性", reading: "がいぜんせい", meaning: "probability, likelihood", exampleJa: "その仮説の蓋然性は高い。", exampleEn: "The probability of that hypothesis is high.", tags: ["noun", "academic"] },
  { word: "嚆矢", reading: "こうし", meaning: "beginning, origin, pioneer", exampleJa: "この発明は近代技術の嚆矢となった。", exampleEn: "This invention became the pioneer of modern technology.", tags: ["noun", "literary"] },
  { word: "跋扈", reading: "ばっこ", meaning: "rampancy, running riot", exampleJa: "悪が跋扈する社会。", exampleEn: "A society where evil runs rampant.", tags: ["noun", "formal"] },
  { word: "忖度", reading: "そんたく", meaning: "reading/guessing others' intentions", exampleJa: "上司を忖度して行動した。", exampleEn: "I acted by guessing my boss's intentions.", tags: ["noun", "social"] },
  { word: "瑕疵", reading: "かし", meaning: "flaw, defect, blemish", exampleJa: "契約の瑕疵を指摘した。", exampleEn: "I pointed out a flaw in the contract.", tags: ["noun", "legal"] },
  { word: "齟齬", reading: "そご", meaning: "discrepancy, inconsistency", exampleJa: "両者の意見に齟齬が生じた。", exampleEn: "A discrepancy arose between the two opinions.", tags: ["noun", "formal"] },
  { word: "恣意", reading: "しい", meaning: "arbitrariness, self-will", exampleJa: "恣意的な判断は避けるべきだ。", exampleEn: "Arbitrary judgments should be avoided.", tags: ["noun", "academic"] },
  { word: "凡庸", reading: "ぼんよう", meaning: "mediocrity, commonplaceness", exampleJa: "凡庸な作品では満足できない。", exampleEn: "I cannot be satisfied with mediocre work.", tags: ["noun", "adjective"] },
  { word: "奔放", reading: "ほんぽう", meaning: "free-spirited, unrestrained", exampleJa: "奔放な生き方を選んだ。", exampleEn: "I chose a free-spirited way of living.", tags: ["adjective"] },
  { word: "逼迫", reading: "ひっぱく", meaning: "urgency, pressure, tight situation", exampleJa: "財政が逼迫している。", exampleEn: "The finances are in a tight situation.", tags: ["noun", "formal"] },
  { word: "焦燥", reading: "しょうそう", meaning: "impatience, irritation, anxiety", exampleJa: "焦燥感が募る一方だった。", exampleEn: "My sense of impatience only grew.", tags: ["noun", "emotion"] },
  { word: "懐柔", reading: "かいじゅう", meaning: "winning over, conciliation", exampleJa: "相手を懐柔する戦略をとった。", exampleEn: "I took a strategy to win over the opponent.", tags: ["noun", "strategy"] },
  { word: "杞憂", reading: "きゆう", meaning: "needless worry, groundless fear", exampleJa: "それは杞憂に過ぎなかった。", exampleEn: "That turned out to be needless worry.", tags: ["noun", "idiom"] },
  { word: "邂逅", reading: "かいこう", meaning: "chance meeting, unexpected encounter", exampleJa: "旧友との邂逅を喜んだ。", exampleEn: "I rejoiced at the chance meeting with an old friend.", tags: ["noun", "literary"] },
  { word: "慟哭", reading: "どうこく", meaning: "wailing, lamentation", exampleJa: "彼女の慟哭が部屋に響いた。", exampleEn: "Her wailing echoed through the room.", tags: ["noun", "emotion"] },
  { word: "恬淡", reading: "てんたん", meaning: "indifferent to worldly things, calm", exampleJa: "恬淡とした生き方に憧れる。", exampleEn: "I admire a life of serene indifference.", tags: ["adjective", "literary"] },
];

export const N1_GRAMMAR: GrammarItem[] = [
  {
    pattern: "〜にほかならない",
    meaning: "nothing other than, none other than",
    usage: "Noun + にほかならない",
    example: "彼の成功は努力の結果にほかならない。",
    exampleTranslation: "His success is nothing other than the result of hard work.",
    notes: "Used to strongly assert that something is exactly/only this thing."
  },
  {
    pattern: "〜をもって",
    meaning: "with, by means of; as of (time)",
    usage: "Noun + をもって",
    example: "本日をもって、この店は閉店いたします。",
    exampleTranslation: "As of today, this store will close.",
    notes: "Formal expression. Two uses: means/method, or point in time."
  },
  {
    pattern: "〜ならではの",
    meaning: "unique to, only possible with",
    usage: "Noun + ならではの + Noun",
    example: "これは日本ならではの文化だ。",
    exampleTranslation: "This is a culture unique to Japan.",
    notes: "Highlights a special quality that only the named entity possesses."
  },
  {
    pattern: "〜に即して",
    meaning: "in accordance with, based on",
    usage: "Noun + に即して",
    example: "現実に即した計画を立てよう。",
    exampleTranslation: "Let's make a plan based on reality.",
    notes: "More formal than 〜に基づいて. Often used with abstract concepts."
  },
  {
    pattern: "〜いかんによらず",
    meaning: "regardless of, irrespective of",
    usage: "Noun + いかんによらず / いかんにかかわらず",
    example: "結果のいかんによらず、全力を尽くす。",
    exampleTranslation: "Regardless of the result, I will do my best.",
    notes: "Very formal. いかん means 'how/what kind'. Common in official documents."
  },
  {
    pattern: "〜を皮切りに",
    meaning: "starting with, beginning with",
    usage: "Noun + を皮切りに(して)",
    example: "東京を皮切りに、全国ツアーが始まった。",
    exampleTranslation: "The national tour started with Tokyo.",
    notes: "Marks the first event in a series. 皮切り originally means 'first incision'."
  },
  {
    pattern: "〜ともなると",
    meaning: "when it comes to, once one becomes",
    usage: "Noun + ともなると / ともなれば",
    example: "部長ともなると、責任も大きい。",
    exampleTranslation: "When one becomes a department head, the responsibility is great.",
    notes: "Implies that reaching a certain level/status brings expected consequences."
  },
  {
    pattern: "〜にして",
    meaning: "at (age/time); both ... and ...",
    usage: "Noun + にして",
    example: "三歳にして、ピアノを弾いた。",
    exampleTranslation: "He played piano at the age of three.",
    notes: "Literary/formal. Can also mean 'and yet' implying contrast."
  },
  {
    pattern: "〜べくもない",
    meaning: "cannot possibly, there is no way to",
    usage: "Verb dictionary form + べくもない",
    example: "彼の才能には及ぶべくもない。",
    exampleTranslation: "There is no way I can match his talent.",
    notes: "Very literary/formal. べく is classical potential form of べし."
  },
  {
    pattern: "〜ずにはおかない",
    meaning: "cannot help but, will surely",
    usage: "Verb negative stem + ずにはおかない",
    example: "この映画は感動せずにはおかない。",
    exampleTranslation: "This movie will surely move you.",
    notes: "Expresses an irresistible effect. Stronger than 〜てしまう."
  },
  {
    pattern: "〜に足る",
    meaning: "worthy of, sufficient to",
    usage: "Verb dictionary form + に足る / Noun + に足る",
    example: "信頼するに足る人物だ。",
    exampleTranslation: "He is a person worthy of trust.",
    notes: "Formal/literary. Negative form 〜に足らない means 'not worth'."
  },
  {
    pattern: "〜とあれば",
    meaning: "if it is the case that, given that",
    usage: "Phrase + とあれば",
    example: "あなたの頼みとあれば、断れない。",
    exampleTranslation: "Given that it is your request, I cannot refuse.",
    notes: "The speaker accepts/responds to a special circumstance."
  },
  {
    pattern: "〜ごとき / ごとく",
    meaning: "like, as if, such as",
    usage: "Noun + の + ごとき / Verb + ごとく",
    example: "嵐のごとく現れた。",
    exampleTranslation: "He appeared like a storm.",
    notes: "Classical/literary equivalent of 〜ような/ように. Very formal."
  },
  {
    pattern: "〜をよそに",
    meaning: "ignoring, indifferent to, in spite of",
    usage: "Noun + をよそに",
    example: "周囲の心配をよそに、彼は旅に出た。",
    exampleTranslation: "Ignoring everyone's worries, he set out on a journey.",
    notes: "Implies the subject acts without regard to others' feelings/situations."
  },
  {
    pattern: "〜ないではすまない",
    meaning: "must do, cannot get away without doing",
    usage: "Verb negative + ないではすまない",
    example: "謝らないではすまないだろう。",
    exampleTranslation: "You won't get away without apologizing.",
    notes: "Social/moral obligation is implied. Someone will be held accountable."
  },
];

export const N1_KANJI: KanjiItem[] = [
  {
    kanji: "憂",
    readings: { on: ["ユウ"], kun: ["うれ.える", "うれ.い", "う.い"] },
    meanings: ["grief", "distress", "worry", "gloom"],
    examples: [
      { word: "憂鬱", reading: "ゆううつ", meaning: "melancholy, depression" },
      { word: "憂慮", reading: "ゆうりょ", meaning: "concern, anxiety" },
      { word: "憂い", reading: "うれい", meaning: "sorrow, grief" },
    ],
    strokeCount: 15,
  },
  {
    kanji: "憤",
    readings: { on: ["フン"], kun: ["いきどお.る"] },
    meanings: ["aroused", "stirred up", "indignant", "angry"],
    examples: [
      { word: "憤怒", reading: "ふんぬ", meaning: "rage, fury" },
      { word: "憤慨", reading: "ふんがい", meaning: "indignation" },
      { word: "義憤", reading: "ぎふん", meaning: "righteous indignation" },
    ],
    strokeCount: 15,
  },
  {
    kanji: "謹",
    readings: { on: ["キン"], kun: ["つつし.む"] },
    meanings: ["discreet", "modest", "respectful", "careful"],
    examples: [
      { word: "謹慎", reading: "きんしん", meaning: "self-restraint, confinement" },
      { word: "謹啓", reading: "きんけい", meaning: "respectful salutation" },
      { word: "謹んで", reading: "つつしんで", meaning: "humbly, respectfully" },
    ],
    strokeCount: 17,
  },
  {
    kanji: "粛",
    readings: { on: ["シュク"], kun: ["つつし.む"] },
    meanings: ["solemn", "respectful", "purge", "quiet"],
    examples: [
      { word: "粛清", reading: "しゅくせい", meaning: "purge, liquidation" },
      { word: "厳粛", reading: "げんしゅく", meaning: "solemn, grave" },
      { word: "自粛", reading: "じしゅく", meaning: "self-restraint" },
    ],
    strokeCount: 11,
  },
  {
    kanji: "憧",
    readings: { on: ["ショウ", "ドウ"], kun: ["あこが.れる"] },
    meanings: ["yearn for", "long for", "adore"],
    examples: [
      { word: "憧れ", reading: "あこがれ", meaning: "longing, yearning, aspiration" },
      { word: "憧憬", reading: "しょうけい", meaning: "longing, yearning" },
    ],
    strokeCount: 15,
  },
  {
    kanji: "懐",
    readings: { on: ["カイ", "エ"], kun: ["ふところ", "なつ.かしい", "なつ.く"] },
    meanings: ["bosom", "breast", "cherish", "miss", "nostalgia"],
    examples: [
      { word: "懐古", reading: "かいこ", meaning: "nostalgia for the past" },
      { word: "懐疑", reading: "かいぎ", meaning: "skepticism, doubt" },
      { word: "懐かしい", reading: "なつかしい", meaning: "dear, longed-for, nostalgic" },
    ],
    strokeCount: 16,
  },
  {
    kanji: "滑",
    readings: { on: ["カツ", "コツ"], kun: ["すべ.る", "なめ.らか"] },
    meanings: ["slippery", "slide", "glide", "smooth"],
    examples: [
      { word: "滑稽", reading: "こっけい", meaning: "funny, comical, ridiculous" },
      { word: "潤滑", reading: "じゅんかつ", meaning: "lubrication, smoothness" },
      { word: "滑走", reading: "かっそう", meaning: "glide, taxi (airplane)" },
    ],
    strokeCount: 13,
  },
  {
    kanji: "欺",
    readings: { on: ["ギ"], kun: ["あざむ.く"] },
    meanings: ["deceive", "cheat", "delude"],
    examples: [
      { word: "欺瞞", reading: "ぎまん", meaning: "deception, fraud" },
      { word: "詐欺", reading: "さぎ", meaning: "fraud, swindle" },
      { word: "欺く", reading: "あざむく", meaning: "to deceive, to cheat" },
    ],
    strokeCount: 12,
  },
];

export function getItemKey(category: string, item: VocabItem | GrammarItem | KanjiItem): string {
  if (category === "VOCABULARY") return `vocab:${(item as VocabItem).word}`;
  if (category === "GRAMMAR") return `grammar:${(item as GrammarItem).pattern}`;
  if (category === "KANJI") return `kanji:${(item as KanjiItem).kanji}`;
  return `item:${JSON.stringify(item).slice(0, 20)}`;
}
