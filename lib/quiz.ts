import { N1_VOCABULARY, N1_GRAMMAR, N1_KANJI } from "@/data/n1-content";
import type { VocabItem, GrammarItem, KanjiItem } from "@/data/n1-content";

export type QuestionType =
  | "kanji_reading"   // 問1: 漢字読み
  | "context_fill"    // 問2: 文脈規定
  | "synonym"         // 問3: 言い換え類義
  | "grammar_fill"    // 問4: 文法1 - fill in the blank
  | "usage";          // 問5: 用法 - which sentence uses it correctly

export interface JLPTQuestion {
  id: string;
  type: QuestionType;
  sectionLabel: string;       // e.g. "問1"
  instruction: string;        // exam instruction text (Japanese)
  stem: string;               // the question sentence/prompt
  underlined?: string;        // the word being tested (if underlined)
  blank?: string;             // position marker for fill-in
  options: string[];          // exactly 4 options
  correctIndex: number;       // 0-3
  explanation: string;
  sourceItemKey: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOthers<T>(all: T[], exclude: T, count: number): T[] {
  return shuffle(all.filter((x) => x !== exclude)).slice(0, count);
}

function insertCorrect(options: string[], correct: string): { options: string[]; correctIndex: number } {
  const pos = Math.floor(Math.random() * 4);
  const opts = [...options.slice(0, pos), correct, ...options.slice(pos)].slice(0, 4);
  return { options: opts, correctIndex: pos };
}

// ── question generators ───────────────────────────────────────────────────────

/** 問1 漢字読み: underline the word, pick the correct reading */
function makeKanjiReading(item: VocabItem, allVocab: VocabItem[]): JLPTQuestion {
  const wrongReadings = pickOthers(allVocab, item, 3).map((v) => v.reading);
  const { options, correctIndex } = insertCorrect(wrongReadings, item.reading);

  return {
    id: `kr-${item.word}`,
    type: "kanji_reading",
    sectionLabel: "問１",
    instruction: "次の文の＿＿をつけた言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。",
    stem: item.exampleJa.replace(item.word, `（${item.word}）`),
    underlined: item.word,
    options,
    correctIndex,
    explanation: `「${item.word}」の読み方は「${item.reading}」です。意味：${item.meaning}`,
    sourceItemKey: `vocab:${item.word}`,
  };
}

/** 問2 文脈規定: blank in sentence, pick the correct word */
function makeContextFill(item: VocabItem, allVocab: VocabItem[]): JLPTQuestion {
  const sentence = item.exampleJa.replace(item.word, "（　　）");
  const distractors = pickOthers(allVocab, item, 3).map((v) => v.word);
  const { options, correctIndex } = insertCorrect(distractors, item.word);

  return {
    id: `cf-${item.word}`,
    type: "context_fill",
    sectionLabel: "問２",
    instruction: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
    stem: sentence,
    options,
    correctIndex,
    explanation: `正解は「${item.word}」（${item.reading}）。意味：${item.meaning}`,
    sourceItemKey: `vocab:${item.word}`,
  };
}

/** 問3 言い換え類義: pick the option closest in meaning to the underlined word */
function makeSynonym(item: VocabItem, allVocab: VocabItem[]): JLPTQuestion {
  const distractors = pickOthers(allVocab, item, 3).map((v) => v.meaning);
  const { options, correctIndex } = insertCorrect(distractors, item.meaning);

  return {
    id: `syn-${item.word}`,
    type: "synonym",
    sectionLabel: "問３",
    instruction: "次の文の＿＿をつけた言葉に意味が最も近いものを、1・2・3・4から一つ選びなさい。",
    stem: item.exampleJa.replace(item.word, `（${item.word}）`),
    underlined: item.word,
    options,
    correctIndex,
    explanation: `「${item.word}」は「${item.meaning}」という意味です。`,
    sourceItemKey: `vocab:${item.word}`,
  };
}

/** 問4 文法1: fill in grammar pattern blank */
function makeGrammarFill(item: GrammarItem, allGrammar: GrammarItem[]): JLPTQuestion {
  // Build sentence with the pattern replaced by a blank
  const patternCore = item.pattern.replace(/^〜/, "");
  const sentence = item.example.includes(patternCore)
    ? item.example.replace(patternCore, "（　　）")
    : `${item.example.replace(/。$/, "")}（　　）。`;

  const distractors = pickOthers(allGrammar, item, 3).map((g) => g.pattern.replace(/^〜/, ""));
  const { options, correctIndex } = insertCorrect(distractors, patternCore);

  return {
    id: `gf-${item.pattern}`,
    type: "grammar_fill",
    sectionLabel: "問４",
    instruction: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
    stem: sentence,
    options,
    correctIndex,
    explanation: `「${item.pattern}」= ${item.meaning}。${item.notes}`,
    sourceItemKey: `grammar:${item.pattern}`,
  };
}

/** 問5 用法: which sentence uses the kanji/word correctly */
function makeUsage(item: KanjiItem, _allKanji: KanjiItem[]): JLPTQuestion {
  const [correct, ...examples] = item.examples;
  if (!correct) {
    return makeFallbackKanjiQuestion(item);
  }

  // Build 3 wrong usage sentences (swap meanings to create plausible wrong answers)
  const wrongSentences = [
    `この問題は${item.kanji}（${item.examples[1]?.reading ?? "ふめい"}）で解決できる。`,
    `彼女は${item.kanji}（${item.examples[2]?.reading ?? "ふめい"}）な表情をした。`,
    `その決定は${item.kanji}（${item.readings.on[0]}）すると思う。`,
  ].slice(0, 3);

  const correctSentence = correct.word + "（" + correct.reading + "）：" + correct.meaning;
  const { options, correctIndex } = insertCorrect(wrongSentences, correctSentence);

  return {
    id: `use-${item.kanji}`,
    type: "usage",
    sectionLabel: "問５",
    instruction: `次の「${item.kanji}」の読み方・使い方として最もよいものを、1・2・3・4から一つ選びなさい。`,
    stem: `「${item.kanji}」— ${item.meanings.join("、")}`,
    options,
    correctIndex,
    explanation: `「${item.kanji}」の主な読み：音読み ${item.readings.on.join("・")}、訓読み ${item.readings.kun.join("・")}。`,
    sourceItemKey: `kanji:${item.kanji}`,
  };
}

function makeFallbackKanjiQuestion(item: KanjiItem): JLPTQuestion {
  const correct = item.readings.on[0];
  const wrong = ["コウ", "シン", "テイ", "ジョ"].filter((r) => r !== correct).slice(0, 3);
  const { options, correctIndex } = insertCorrect(wrong, correct);
  return {
    id: `use-${item.kanji}`,
    type: "usage",
    sectionLabel: "問５",
    instruction: "次の漢字の読み方として最もよいものを、1・2・3・4から一つ選びなさい。",
    stem: item.kanji,
    options,
    correctIndex,
    explanation: `「${item.kanji}」の音読みは「${item.readings.on[0]}」、意味：${item.meanings.join("、")}`,
    sourceItemKey: `kanji:${item.kanji}`,
  };
}

// ── public API ────────────────────────────────────────────────────────────────

export interface QuizSet {
  title: string;
  questions: JLPTQuestion[];
}

export function generateStaticQuizSet(count = 10): QuizSet {
  const questions: JLPTQuestion[] = [];
  const vocab = shuffle(N1_VOCABULARY);
  const grammar = shuffle(N1_GRAMMAR);
  const kanji = shuffle(N1_KANJI);

  // Distribute evenly across question types
  const perType = Math.max(1, Math.floor(count / 5));
  let remaining = count;

  // 問1 kanji reading
  for (let i = 0; i < perType && remaining > 0 && vocab[i]; i++, remaining--) {
    questions.push(makeKanjiReading(vocab[i], N1_VOCABULARY));
  }
  // 問2 context fill
  for (let i = perType; i < perType * 2 && remaining > 0 && vocab[i]; i++, remaining--) {
    questions.push(makeContextFill(vocab[i], N1_VOCABULARY));
  }
  // 問3 synonym
  for (let i = perType * 2; i < perType * 3 && remaining > 0 && vocab[i]; i++, remaining--) {
    questions.push(makeSynonym(vocab[i], N1_VOCABULARY));
  }
  // 問4 grammar fill
  for (let i = 0; i < perType && remaining > 0 && grammar[i]; i++, remaining--) {
    questions.push(makeGrammarFill(grammar[i], N1_GRAMMAR));
  }
  // 問5 kanji usage
  for (let i = 0; i < Math.ceil(remaining) && kanji[i]; i++) {
    questions.push(makeUsage(kanji[i], N1_KANJI));
  }

  return { title: "JLPT N1 練習問題", questions: shuffle(questions).slice(0, count) };
}

export function generateQuizByType(type: QuestionType, count = 5): QuizSet {
  const titles: Record<QuestionType, string> = {
    kanji_reading: "問１ 漢字の読み方",
    context_fill: "問２ 文脈規定",
    synonym: "問３ 言い換え類義",
    grammar_fill: "問４ 文の文法",
    usage: "問５ 用法",
  };

  const vocab = shuffle(N1_VOCABULARY).slice(0, count + 2);
  const grammar = shuffle(N1_GRAMMAR).slice(0, count + 2);
  const kanji = shuffle(N1_KANJI).slice(0, count + 2);

  const questions: JLPTQuestion[] = [];
  for (let i = 0; i < count; i++) {
    if (type === "kanji_reading" && vocab[i]) questions.push(makeKanjiReading(vocab[i], N1_VOCABULARY));
    else if (type === "context_fill" && vocab[i]) questions.push(makeContextFill(vocab[i], N1_VOCABULARY));
    else if (type === "synonym" && vocab[i]) questions.push(makeSynonym(vocab[i], N1_VOCABULARY));
    else if (type === "grammar_fill" && grammar[i]) questions.push(makeGrammarFill(grammar[i], N1_GRAMMAR));
    else if (type === "usage" && kanji[i]) questions.push(makeUsage(kanji[i], N1_KANJI));
  }

  return { title: titles[type], questions };
}
