import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { loadGameQuestions, type GameQuestion } from "../data/gameDataSource";
import { 
  Trophy, RefreshCw, ArrowRight, ArrowLeft, CheckCircle2, 
  XCircle, MapPin, Compass, Flag, Globe, Layers, AlertCircle, X,
  Volume2, VolumeX 
} from "lucide-react";
import AdBanner from "./AdBanner";

// Built-in verified question master bank covering all categories & regions
const DEFAULT_QUESTIONS: GameQuestion[] = [
  // Anomalies / Borders - Africa
  {
    id: "def_1",
    title: "Unclaimed Desert Territory",
    name: "Bir Tawil",
    lat: 21.8706,
    lng: 33.7342,
    category: "Anomalies",
    region: "Africa",
    clue: "A 2,060 km² trapezoid of desert between Egypt and Sudan that neither country claims due to conflicting 1899 and 1902 border maps.",
    fact: "Bir Tawil is one of the only habitable continental territories on Earth that is terra nullius (unclaimed by any recognized state)."
  },
  {
    id: "def_2",
    title: "East African Disputed Border Triangle",
    name: "Ilemi Triangle",
    lat: 4.9000,
    lng: 35.3000,
    category: "Borders",
    region: "Africa",
    clue: "A disputed border territory in East Africa claimed by South Sudan and Kenya, originating from conflicting colonial treaties.",
    fact: "The dispute dates back to 1902 and remains one of Africa's most intricate territorial frontiers."
  },
  {
    id: "def_3",
    title: "Landlocked Enclave Kingdom",
    name: "Lesotho",
    lat: -29.6100,
    lng: 28.2336,
    category: "Borders",
    region: "Africa",
    countryCode: "ls",
    clue: "A high-altitude, mountainous kingdom completely surrounded by South Africa.",
    fact: "Lesotho is the only independent country in the world that lies entirely above 1,000 metres (3,281 ft) in elevation."
  },
  {
    id: "def_4",
    title: "Spanish Enclave in North Africa",
    name: "Ceuta",
    lat: 35.8894,
    lng: -5.3213,
    category: "Anomalies",
    region: "Africa",
    clue: "A Spanish autonomous city located on the north coast of Africa sharing a land border with Morocco.",
    fact: "Along with Melilla, Ceuta forms the only land border between the European Union and an African country."
  },
  {
    id: "def_5",
    title: "Strategic Horn of Africa Gateway",
    name: "Djibouti",
    lat: 11.8251,
    lng: 42.5903,
    category: "Mixed Global",
    region: "Africa",
    countryCode: "dj",
    clue: "A small coastal country in the Horn of Africa bordering the Bab-el-Mandeb strait that hosts numerous military bases.",
    fact: "Lake Assal in Djibouti is the lowest point on the entire African continent (-155m below sea level)."
  },

  // Europe - Borders & Anomalies
  {
    id: "def_6",
    title: "Enclave Maze in the Low Countries",
    name: "Baarle-Hertog",
    lat: 51.4428,
    lng: 4.9317,
    category: "Anomalies",
    region: "Europe",
    countryCode: "be",
    clue: "A Belgian municipality consisting of 22 separate enclaves inside the Netherlands, cutting through buildings and cafes.",
    fact: "Because Dutch and Belgian tax laws differed, restaurants located on the border used to move customer tables at closing time!"
  },
  {
    id: "def_7",
    title: "Pyrenees Co-Principality",
    name: "Andorra",
    lat: 42.5063,
    lng: 1.5218,
    category: "Borders",
    region: "Europe",
    countryCode: "ad",
    clue: "A tiny sovereign co-principality nestled in the Pyrenees mountains between France and Spain.",
    fact: "Andorra is the only country in the world where Catalan is the sole official language."
  },
  {
    id: "def_8",
    title: "Six-Month Sovereignty Swap Island",
    name: "Pheasant Island",
    lat: 43.3422,
    lng: -1.7656,
    category: "Anomalies",
    region: "Europe",
    clue: "An uninhabited river island jointly governed by Spain and France that changes ownership every six months.",
    fact: "It was established as a condominium by the 1659 Treaty of the Pyrenees, ending the Franco-Spanish War."
  },
  {
    id: "def_9",
    title: "Italian Enclave inside Switzerland",
    name: "Campione d'Italia",
    lat: 45.9686,
    lng: 8.9708,
    category: "Anomalies",
    region: "Europe",
    clue: "An Italian town completely surrounded by the Swiss Canton of Ticino on Lake Lugano.",
    fact: "The enclave uses both the Swiss Franc and the Euro and has a unique customs agreement with the EU."
  },
  {
    id: "def_10",
    title: "Double-Landlocked Alpine Principality",
    name: "Liechtenstein",
    lat: 47.1660,
    lng: 9.5554,
    category: "Mixed Global",
    region: "Europe",
    countryCode: "li",
    clue: "One of only two doubly landlocked countries in the world, bordered solely by landlocked Switzerland and Austria.",
    fact: "Liechtenstein is the world's leading manufacturer of artificial false teeth!"
  },

  // Asia - Borders & Anomalies
  {
    id: "def_11",
    title: "Land of the Thunder Dragon",
    name: "Bhutan",
    lat: 27.5142,
    lng: 90.4336,
    category: "Flags",
    region: "Asia",
    countryCode: "bt",
    clue: "A Himalayan kingdom whose flag features a white dragon grasping jewels, and which measures progress by Gross National Happiness.",
    fact: "Bhutan is recognized as the world's only carbon-negative country, absorbing more carbon than it emits."
  },
  {
    id: "def_12",
    title: "Former Counter-Counter Enclave",
    name: "Dahala Khagrabari",
    lat: 26.1500,
    lng: 88.7500,
    category: "Anomalies",
    region: "Asia",
    clue: "Formerly the world's only third-order enclave: Indian land inside Bangladesh inside India inside Bangladesh.",
    fact: "The anomaly was successfully resolved in 2015 when India and Bangladesh ratified the Land Boundary Agreement."
  },
  {
    id: "def_13",
    title: "Omani Peninsula Exclave",
    name: "Musandam",
    lat: 26.0000,
    lng: 56.3000,
    category: "Borders",
    region: "Asia",
    countryCode: "om",
    clue: "An exclave of Oman separated from the rest of the sultanate by the United Arab Emirates, overlooking the Strait of Hormuz.",
    fact: "Known as the 'Norway of Arabia' for its rugged, fjord-like drowned river valleys (khors)."
  },
  {
    id: "def_14",
    title: "The Central Asian Alpine Lake Nation",
    name: "Kyrgyzstan",
    lat: 41.2044,
    lng: 74.7661,
    category: "Mixed Global",
    region: "Asia",
    countryCode: "kg",
    clue: "A mountainous Central Asian country whose red flag features a yellow sun with 40 rays around a traditional yurt crown (tunduk).",
    fact: "It is home to Issyk-Kul, the second-largest alpine lake in the world after Lake Titicaca."
  },
  {
    id: "def_15",
    title: "Only Non-Quadrilateral National Flag",
    name: "Nepal",
    lat: 28.3949,
    lng: 84.1240,
    category: "Flags",
    region: "Asia",
    countryCode: "np",
    clue: "The only country in the world with a non-rectangular national flag, shaped like two stacked pennants.",
    fact: "The unique geometry of Nepal's flag is explicitly defined with mathematical precision in their national constitution."
  },

  // Americas - Borders & Anomalies
  {
    id: "def_16",
    title: "The US Exclave in Canada",
    name: "Point Roberts",
    lat: 48.9883,
    lng: -123.0800,
    category: "Anomalies",
    region: "Americas",
    countryCode: "us",
    clue: "An American town located at the tip of the Tsawwassen peninsula below the 49th parallel, only reachable by land through British Columbia.",
    fact: "American high school students living in Point Roberts must take a daily bus across the international border twice each way to go to school."
  },
  {
    id: "def_17",
    title: "South American Dutch-Speaking Haven",
    name: "Suriname",
    lat: 3.9193,
    lng: -56.0278,
    category: "Mixed Global",
    region: "Americas",
    countryCode: "sr",
    clue: "The smallest sovereign country in South America, where Dutch remains the primary official language.",
    fact: "Over 90% of Suriname is covered by dense, undisturbed Amazonian rainforest."
  },
  {
    id: "def_18",
    title: "The Northernmost Boundary Chimney",
    name: "Northwest Angle",
    lat: 49.3843,
    lng: -95.1533,
    category: "Anomalies",
    region: "Americas",
    countryCode: "us",
    clue: "The only part of the contiguous United States located north of the 49th parallel, caused by an 18th-century mapping misunderstanding.",
    fact: "The border was defined based on Mitchell's map of 1755, which mistakenly placed the source of the Mississippi River much further northwest."
  },
  {
    id: "def_19",
    title: "The Caribbean Twin-Nation Island",
    name: "Saint Martin",
    lat: 18.0708,
    lng: -63.0501,
    category: "Borders",
    region: "Americas",
    clue: "The smallest inhabited sea island divided between two sovereign nations: France and the Kingdom of the Netherlands.",
    fact: "The partition was agreed upon under a tree in the 1648 Treaty of Concordia."
  },

  // Oceania & Global
  {
    id: "def_20",
    title: "The Date-Line Separated Islands",
    name: "Diomede Islands",
    lat: 65.7592,
    lng: -168.9622,
    category: "Borders",
    region: "Global",
    clue: "Two rocky islands in the Bering Strait: Big Diomede (Russia) and Little Diomede (USA), separated by 2.4 miles and 21 hours.",
    fact: "Big Diomede is nicknamed 'Tomorrow Island' and Little Diomede 'Yesterday Island'."
  },
  {
    id: "def_21",
    title: "The Micro-Island Republic without a Capital",
    name: "Nauru",
    lat: -0.5228,
    lng: 166.9315,
    category: "Flags",
    region: "Oceania",
    countryCode: "nr",
    clue: "The world's smallest independent republic, whose flag features a gold stripe over blue with a 12-pointed star below the equator.",
    fact: "Nauru has no officially designated capital city; government offices are located in the Yaren District."
  },
  {
    id: "def_22",
    title: "First Nation to Greet the New Day",
    name: "Kiribati",
    lat: 1.8709,
    lng: -157.3631,
    category: "Anomalies",
    region: "Oceania",
    countryCode: "ki",
    clue: "A Pacific island nation that moved the International Date Line in 1995 so its entire archipelago shares the same calendar day.",
    fact: "Kiribati's Millennium Island (Caroline Island) is the earliest place on Earth to welcome the new year."
  }
];

function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// CRITICAL STOP WORDS & MATCHING HELPER FROM SPECIFICATION
const STOP_WORDS = [
  "desert", "river", "mountain", "mountains", "mount", "mt", "lake", "sea", 
  "ocean", "island", "islands", "republic", "kingdom", "state", "states", 
  "united", "of", "the", "and", "peninsula", "strait", "canal", "falls", 
  "valley", "strip", "triangle"
];

function normalizeAnswer(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(word => word && !STOP_WORDS.includes(word))
    .join(" ")
    .trim();
}

function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isAnswerAcceptable(userGuess: string, officialAnswer: string): boolean {
  const rawGuess = userGuess.trim().toLowerCase();
  const rawTarget = officialAnswer.trim().toLowerCase();
  if (!rawGuess) return false;
  if (rawGuess === rawTarget) return true;

  // Check Levenshtein on full strings
  const fullTolerance = rawTarget.length > 5 ? 2 : 1;
  if (getLevenshteinDistance(rawGuess, rawTarget) <= fullTolerance) return true;

  // Check normalized core names (e.g., "sahara" vs "sahara desert" -> both become "sahara")
  const normGuess = normalizeAnswer(rawGuess);
  const normTarget = normalizeAnswer(rawTarget);
  if (normGuess && normTarget) {
    if (normGuess === normTarget) return true;
    const normTolerance = normTarget.length > 5 ? 2 : 1;
    if (getLevenshteinDistance(normGuess, normTarget) <= normTolerance) return true;
  }
  return false;
}

function playTone(type: "success" | "error" | "victory") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "victory") {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    }
  } catch (e) {
    // Ignore if audio is restricted
  }
}

type GameStep = "main_cat" | "sub_cat" | "settings" | "playing" | "results";

const STORAGE_KEY = "geoglobe_active_mission";

export default function GeoGame() {
  const navigate = useNavigate();

  // Multi-step Flow State
  const [step, setStep] = useState<GameStep>("main_cat");
  const [mainCat, setMainCat] = useState<string>("Mixed Global");
  const [subCat, setSubCat] = useState<string>("Global");
  const [gameLength, setGameLength] = useState<number | "unlimited">(5);

  // Active Session State
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [questionBank, setQuestionBank] = useState<GameQuestion[]>([]);
  const [isQuestionBankReady, setIsQuestionBankReady] = useState(false);
  const [questionBankError, setQuestionBankError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [gameState, setGameState] = useState<"playing" | "revealed">("playing");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shake, setShake] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isActive = true;

    loadGameQuestions()
      .then((loadedQuestions) => {
        if (!isActive) return;
        if (loadedQuestions.length === 0) {
          setQuestionBankError("The spreadsheet has no usable questions.");
          return;
        }
        setQuestionBank(loadedQuestions);
      })
      .catch((error) => {
        console.error("Unable to load the GeoGlobe question sheet:", error);
        if (isActive) setQuestionBankError("The live question sheet is unavailable.");
      })
      .finally(() => {
        if (isActive) setIsQuestionBankReady(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  // Save session state to localStorage on every state change
  const persistSession = useCallback((
    curStep: GameStep,
    qList: GameQuestion[],
    idx: number,
    sc: number,
    wr: number,
    mCat: string,
    sCat: string,
    gLen: number | "unlimited",
    gState: "playing" | "revealed",
    correct: boolean | null,
    uInput: string
  ) => {
    if (curStep === "playing") {
      const missionData = {
        step: curStep,
        questions: qList,
        index: idx,
        score: sc,
        wrong: wr,
        mainCat: mCat,
        subCat: sCat,
        gameLength: gLen,
        gameState: gState,
        isCorrect: correct,
        userInput: uInput,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(missionData));
    }
  }, []);

  // Restore session from localStorage on initial mount (e.g., returning from /preview-map)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.questions && parsed.questions.length > 0 && parsed.step === "playing") {
          setQuestions(parsed.questions);
          setCurrentIndex(parsed.index || 0);
          setScore(parsed.score || 0);
          setWrong(parsed.wrong || 0);
          setMainCat(parsed.mainCat || "Mixed Global");
          setSubCat(parsed.subCat || "Global");
          setGameLength(parsed.gameLength || 5);
          setGameState(parsed.gameState || "playing");
          setIsCorrect(parsed.isCorrect ?? null);
          setUserInput(parsed.userInput || "");
          setStep("playing");
        }
      }
    } catch (e) {
      console.warn("Failed to restore session:", e);
    }
  }, []);

  // Focus input when moving to a new question
  useEffect(() => {
    if (step === "playing" && gameState === "playing") {
      inputRef.current?.focus();
    }
  }, [step, currentIndex, gameState]);

  // Sequential Back button handler
  const handleSequentialBack = () => {
    if (step === "settings") {
      setStep("sub_cat");
    } else if (step === "sub_cat") {
      setStep("main_cat");
    } else if (step === "main_cat") {
      navigate("/");
    }
  };

  // Start the mission after selecting category, region, and settings
  const startGame = () => {
    let pool = [...questionBank];

    // Filter by main category if not Mixed Global
    if (mainCat !== "Mixed Global") {
      pool = pool.filter(q => q.category.toLowerCase() === mainCat.toLowerCase());
    }

    // Filter by region if not Global
    if (subCat !== "Global") {
      const regionPool = pool.filter(q => q.region.toLowerCase() === subCat.toLowerCase());
      if (regionPool.length >= 3) {
        pool = regionPool;
      }
    }

    // True Fisher-Yates Random Shuffle
    const shuffled = fisherYatesShuffle(pool);
    const finalCount = gameLength === "unlimited" ? shuffled.length : Math.min(gameLength, shuffled.length);
    const selectedQuestions = shuffled.slice(0, finalCount);

    setQuestions(selectedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setWrong(0);
    setUserInput("");
    setGameState("playing");
    setIsCorrect(null);
    setStep("playing");

    persistSession(
      "playing",
      selectedQuestions,
      0,
      0,
      0,
      mainCat,
      subCat,
      gameLength,
      "playing",
      null,
      ""
    );
  };

  // Submit Answer with Fuzzy Matching
  const handleSubmitAnswer = () => {
    if (!userInput.trim() || gameState === "revealed") return;

    const current = questions[currentIndex];
    const correct = isAnswerAcceptable(userInput, current.name);

    if (correct) {
      if (soundEnabled) playTone("success");
      const nextScore = score + 1;
      setScore(nextScore);
      setIsCorrect(true);
      setGameState("revealed");
      persistSession(
        "playing",
        questions,
        currentIndex,
        nextScore,
        wrong,
        mainCat,
        subCat,
        gameLength,
        "revealed",
        true,
        userInput
      );
    } else {
      if (soundEnabled) playTone("error");
      // Trigger error shake animation
      setShake(true);
      setTimeout(() => setShake(false), 500);
      const nextWrong = wrong + 1;
      setWrong(nextWrong);
      setIsCorrect(false);
      setGameState("revealed");
      persistSession(
        "playing",
        questions,
        currentIndex,
        score,
        nextWrong,
        mainCat,
        subCat,
        gameLength,
        "revealed",
        false,
        userInput
      );
    }
  };

  // Skip / Reveal
  const handleRevealSkip = () => {
    if (gameState === "revealed") return;
    if (soundEnabled) playTone("error");
    const nextWrong = wrong + 1;
    setWrong(nextWrong);
    setIsCorrect(false);
    setGameState("revealed");
    persistSession(
      "playing",
      questions,
      currentIndex,
      score,
      nextWrong,
      mainCat,
      subCat,
      gameLength,
      "revealed",
      false,
      userInput
    );
  };

  // Proceed to next question or complete game
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setUserInput("");
      setGameState("playing");
      setIsCorrect(null);
      persistSession(
        "playing",
        questions,
        nextIdx,
        score,
        wrong,
        mainCat,
        subCat,
        gameLength,
        "playing",
        null,
        ""
      );
    } else {
      // Game Finished
      localStorage.removeItem(STORAGE_KEY);
      if (soundEnabled) playTone("victory");
      setStep("results");
    }
  };

  // Quit active game
  const handleQuitGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfirmQuit(false);
    setStep("main_cat");
  };

  const current = questions[currentIndex];

  if (!isQuestionBankReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-400">
        <span className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-geoCyan border-t-transparent" />
          Loading your GeoGlobe questions...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full pb-20"
    >
      {questionBankError && (
        <div role="status" className="mb-5 rounded-xl border border-geoYellow/20 bg-geoYellow/5 px-4 py-3 text-xs text-geoYellow">
          {questionBankError} Using the built-in question bank for this session.
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: MAIN CATEGORY SELECTION
         ───────────────────────────────────────────────────────────── */}
      {step === "main_cat" && (
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleSequentialBack}
              className="flex items-center gap-2 text-gray-400 hover:text-geoCyan transition-colors text-sm font-semibold group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Home
            </button>
            <span className="text-xs uppercase tracking-widest text-geoYellow font-bold">
              Step 1 of 3
            </span>
          </div>

          <div className="bg-gray-800/90 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/10 text-center">
            <div className="w-14 h-14 bg-geoCyan/10 text-geoCyan rounded-2xl flex items-center justify-center mx-auto mb-4 border border-geoCyan/20 shadow-md">
              <Compass className="w-7 h-7" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Select Category
            </h1>
            <p className="text-gray-400 text-xs md:text-sm mb-6 leading-relaxed">
              Choose the geographic theme for your challenge.
            </p>

            <div className="space-y-3">
              {[
                { label: "Mixed Global", desc: "A blend of border puzzles, world anomalies & flags", icon: <Globe className="w-5 h-5 text-geoCyan" /> },
                { label: "Flags", desc: "Identify countries by their iconic national standards", icon: <Flag className="w-5 h-5 text-geoYellow" /> },
                { label: "Borders", desc: "Disputed frontiers, enclaves, and border quirks", icon: <MapPin className="w-5 h-5 text-emerald-400" /> },
                { label: "Anomalies", desc: "Unique geographical oddities and geographical curiosities", icon: <Layers className="w-5 h-5 text-purple-400" /> },
              ].map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => {
                    setMainCat(cat.label);
                    setStep("sub_cat");
                  }}
                  className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 group ${
                    mainCat === cat.label
                      ? "bg-geoCyan/15 border-geoCyan text-white"
                      : "bg-gray-900/60 hover:bg-gray-900 border-white/5 hover:border-geoCyan/40 text-gray-300"
                  }`}
                >
                  <div className="p-3 bg-gray-800 rounded-xl group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-base text-white group-hover:text-geoCyan transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-geoCyan group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 2: SUB-CATEGORY (REGION) SELECTION
         ───────────────────────────────────────────────────────────── */}
      {step === "sub_cat" && (
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleSequentialBack}
              className="flex items-center gap-2 text-gray-400 hover:text-geoCyan transition-colors text-sm font-semibold group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Category
            </button>
            <span className="text-xs uppercase tracking-widest text-geoYellow font-bold">
              Step 2 of 3
            </span>
          </div>

          <div className="bg-gray-800/90 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/10 text-center">
            <span className="text-xs font-bold text-geoCyan uppercase tracking-widest mb-1 block">
              {mainCat}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Select Region
            </h1>
            <p className="text-gray-400 text-xs md:text-sm mb-6">
              Focus your trivia on a specific continent or explore globally.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {["Global", "Africa", "Asia", "Europe", "Americas", "Oceania"].map((region) => (
                <button
                  key={region}
                  onClick={() => setSubCat(region)}
                  className={`p-4 rounded-2xl border font-bold text-sm transition-all flex flex-col items-center justify-center gap-2 ${
                    subCat === region
                      ? "bg-geoCyan text-gray-900 border-geoCyan shadow-lg scale-102"
                      : "bg-gray-900/60 hover:bg-gray-900 border-white/5 text-gray-300 hover:border-geoCyan/40"
                  }`}
                >
                  <Globe className={`w-5 h-5 ${subCat === region ? "text-gray-900" : "text-geoCyan"}`} />
                  {region}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("settings")}
              className="w-full bg-geoCyan hover:bg-geoYellow text-gray-900 font-bold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-base"
            >
              Continue to Settings <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 3: GAME SETTINGS (ROUND LENGTH)
         ───────────────────────────────────────────────────────────── */}
      {step === "settings" && (
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleSequentialBack}
              className="flex items-center gap-2 text-gray-400 hover:text-geoCyan transition-colors text-sm font-semibold group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Region
            </button>
            <span className="text-xs uppercase tracking-widest text-geoYellow font-bold">
              Step 3 of 3
            </span>
          </div>

          <div className="bg-gray-800/90 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/10 text-center">
            <div className="w-14 h-14 bg-geoYellow/10 text-geoYellow rounded-2xl flex items-center justify-center mx-auto mb-4 border border-geoYellow/20 shadow-md">
              <Trophy className="w-7 h-7" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Game Settings
            </h1>
            <p className="text-gray-400 text-xs md:text-sm mb-6">
              Choose how many questions you want in this session.
            </p>

            <div className="space-y-3 mb-8">
              {[
                { value: 5, label: "5 Questions", tag: "Quick Sprint" },
                { value: 10, label: "10 Questions", tag: "Standard Round" },
                { value: "unlimited" as const, label: "Unlimited", tag: "Endless Challenge" },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setGameLength(opt.value)}
                  className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
                    gameLength === opt.value
                      ? "bg-geoCyan/15 border-geoCyan text-white"
                      : "bg-gray-900/60 hover:bg-gray-900 border-white/5 hover:border-geoCyan/40 text-gray-300"
                  }`}
                >
                  <div>
                    <span className="font-bold text-base block text-white">{opt.label}</span>
                    <span className="text-xs text-gray-400">{opt.tag}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    gameLength === opt.value ? "border-geoCyan bg-geoCyan" : "border-gray-600"
                  }`}>
                    {gameLength === opt.value && <div className="w-2 h-2 rounded-full bg-gray-900"></div>}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-gray-900/60 rounded-2xl border border-white/5 text-xs text-gray-400 mb-6 text-left space-y-1">
              <p>📍 Theme: <b className="text-white">{mainCat}</b></p>
              <p>🌍 Region: <b className="text-white">{subCat}</b></p>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-geoCyan hover:bg-geoYellow text-gray-900 font-bold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-base shadow-geoCyan/20"
            >
              Start Game <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 4: PLAYING MODE (TRIVIA CARD)
         ───────────────────────────────────────────────────────────── */}
      {step === "playing" && current && (
        <div className="max-w-lg mx-auto">
          {/* Top Bar with Sequential Quit Confirmation */}
          <div className="flex items-center justify-between mb-4 px-2">
            <button
              onClick={() => setConfirmQuit(true)}
              className="text-xs text-gray-400 hover:text-rose-400 transition-colors font-semibold flex items-center gap-1.5"
            >
              <X className="w-4 h-4" /> Quit Game
            </button>

            <div className="flex items-center gap-3.5 text-xs font-bold">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-gray-400 hover:text-geoCyan transition-colors p-1"
                title={soundEnabled ? "Mute audio" : "Enable audio"}
                aria-label="Toggle audio effects"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-geoCyan" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-500" />
                )}
              </button>
              <span className="text-geoCyan">Score: {score}</span>
              <span className="text-gray-400">
                Q {currentIndex + 1} of {questions.length}
              </span>
            </div>
          </div>

          {/* Card Wrapper (matches contact form size: max-w-lg, p-6 md:p-8) */}
          <div className="bg-gray-800/90 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Visual Flag / Media Container */}
            <div className="w-full h-36 md:h-48 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 border border-gray-700/80 overflow-hidden relative shadow-inner">
              {current.category?.toLowerCase() === "flags" && current.countryCode ? (
                <img
                  src={`https://flagcdn.com/w640/${current.countryCode.toLowerCase()}.png`}
                  alt="Country Flag"
                  className="w-full h-full object-contain p-3"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <img
                    src="https://lh3.googleusercontent.com/d/1PYQ705DpgwDPAV7kERrpa8a0m8hFdq5w"
                    alt="GeoGlobe Logo"
                    className="w-12 h-12 object-contain mb-2 filter drop-shadow-[0_2px_8px_rgba(66,194,203,0.3)] animate-float"
                  />
                  <span className="text-xs font-bold text-geoCyan uppercase tracking-widest">
                    {current.category} • {current.region}
                  </span>
                </div>
              )}

              {/* Status Badge in corner */}
              {gameState === "revealed" && (
                <div className="absolute top-3 right-3">
                  {isCorrect ? (
                    <CheckCircle2 className="text-emerald-400 w-8 h-8 fill-emerald-500/20" />
                  ) : (
                    <XCircle className="text-rose-500 w-8 h-8 fill-rose-500/20" />
                  )}
                </div>
              )}
            </div>

            {/* Clue / Prompt */}
            <div className="text-center mb-6">
              <h2 className="text-lg md:text-xl font-bold text-white mb-2 leading-snug">
                {current.title}
              </h2>
              {current.clue && (
                <p className="text-gray-300 text-xs md:text-sm leading-relaxed max-w-md mx-auto">
                  {current.clue}
                </p>
              )}
            </div>

            {/* Answer Input */}
            <div className={`${shake ? "animate-shake" : ""} mb-4 relative`}>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (gameState === "playing") handleSubmitAnswer();
                    else handleNextQuestion();
                  }
                }}
                disabled={gameState === "revealed"}
                placeholder={gameState === "revealed" ? "Answer revealed" : "Type your answer..."}
                style={{ fontSize: "16px" }}
                className={`w-full bg-gray-900 border-2 outline-none text-white text-center text-base md:text-lg p-3.5 md:p-4 rounded-2xl transition-all placeholder-gray-500 shadow-inner ${
                  gameState === "revealed"
                    ? isCorrect
                      ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-300"
                      : "border-rose-500/50 bg-rose-950/20 text-rose-300"
                    : shake
                    ? "border-rose-500 ring-2 ring-rose-500/30"
                    : "border-gray-700 focus:border-geoCyan"
                }`}
              />
            </div>

            {/* Feedback Banner on Reveal */}
            <AnimatePresence>
              {gameState === "revealed" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-2xl border mb-6 text-center ${
                    isCorrect
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                      : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <p className="font-bold text-sm md:text-base">
                      {isCorrect ? `✓ Correct! Answer: ${current.name}` : `✗ Incorrect — Answer: ${current.name}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if ("speechSynthesis" in window) {
                          window.speechSynthesis.cancel();
                          const utt = new SpeechSynthesisUtterance(current.name);
                          utt.lang = "en-US";
                          utt.rate = 0.9;
                          window.speechSynthesis.speak(utt);
                        }
                      }}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-geoCyan hover:text-gray-950 text-white transition-all cursor-pointer"
                      title="Listen to pronunciation"
                      aria-label="Listen to answer pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {current.fact && (
                    <p className="text-xs text-gray-300 mt-1.5 italic leading-relaxed">
                      {current.fact}
                    </p>
                  )}

                  {/* View on Map Button linking directly to /map */}
                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={() => navigate(`/map?lat=${current.lat}&lng=${current.lng}&question=${encodeURIComponent(current.clue || current.title)}&answer=${encodeURIComponent(current.name)}&from=game`)}
                      className="bg-gray-900/60 hover:bg-geoCyan hover:text-gray-950 text-geoCyan px-4 py-2 rounded-full text-xs font-bold transition-all border border-geoCyan/40 flex items-center gap-1.5 shadow-sm active:scale-95 backdrop-blur-md"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      View on Map
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gameState === "playing" ? (
                <>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!userInput.trim()}
                    className="bg-geoCyan hover:bg-geoYellow text-gray-900 font-bold py-3 rounded-2xl transition-all shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                  <button
                    onClick={handleRevealSkip}
                    className="bg-gray-900/60 hover:bg-gray-900 border border-gray-700 text-gray-300 hover:text-white font-bold py-3 rounded-2xl transition-all text-sm"
                  >
                    Reveal / Skip
                  </button>
                </>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="sm:col-span-2 bg-geoYellow hover:bg-geoCyan text-gray-900 font-bold py-3.5 rounded-2xl transition-all shadow-lg text-sm md:text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  {currentIndex < questions.length - 1 ? "Next Question" : "View Results"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Ad Placement below active trivia card */}
          <AdBanner slotId="game-playing-slot" />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 5: GAME RESULTS SCREEN
         ───────────────────────────────────────────────────────────── */}
      {step === "results" && (
        <div className="max-w-lg mx-auto">
          <div className="bg-gray-800/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/10 text-center">
            <div className="w-20 h-20 bg-geoCyan/10 text-geoCyan rounded-3xl flex items-center justify-center mx-auto mb-6 border border-geoCyan/20 shadow-xl">
              <Trophy className="w-10 h-10 text-geoYellow" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Game Complete!</h1>
            <p className="text-gray-400 text-sm mb-6">
              You tested your geographic knowledge in <b>{mainCat}</b> ({subCat}).
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-900/60 p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-gray-400 uppercase font-semibold">Correct</span>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">{score}</p>
              </div>
              <div className="bg-gray-900/60 p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-gray-400 uppercase font-semibold">Missed</span>
                <p className="text-3xl font-extrabold text-rose-400 mt-1">{wrong}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setStep("main_cat")}
                className="w-full bg-geoCyan hover:bg-geoYellow text-gray-900 font-bold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Play Again
              </button>
              <button
                onClick={() => navigate("/map")}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-2xl transition-all border border-gray-700 flex items-center justify-center gap-2 text-sm"
              >
                <MapPin className="w-4 h-4 text-geoCyan" />
                Explore Interactive Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Game Confirmation Modal */}
      <AnimatePresence>
        {confirmQuit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Quit Active Game?</h3>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                Your current mission score and question progress will be reset.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmQuit(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuitGame}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Quit Game
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
