import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Trophy, RefreshCw, ArrowRight, ArrowLeft, CheckCircle2, 
  XCircle, MapPin, Compass, Flag, Globe, Layers, Sparkles, X,
  Volume2, VolumeX, Building2, Flame
} from "lucide-react";
import AdBanner from "./AdBanner";
import { COUNTRY_DATABASE, loadLiveGlobeCountries, CountryData } from "../data/globeDataSource";

type GameMainCategory = "flags" | "countries" | "capitals" | "mixed";

interface ModeConfig {
  id: string;
  title: string;
  category: GameMainCategory;
  continentFilter?: string;
  icon: any;
  color: string;
  borderColor: string;
  countLabel: string;
  description: string;
  questionType: "flag" | "country" | "capital" | "mixed";
}

const GAME_MODES: ModeConfig[] = [
  // ── 1. FLAGS CATEGORY ──────────────────────────────────────
  {
    id: "flags_africa",
    title: "Africa Flags",
    category: "flags",
    continentFilter: "Africa",
    icon: Flag,
    color: "from-amber-500/20 via-yellow-500/10 to-transparent",
    borderColor: "border-amber-500/30",
    countLabel: "54 Flags",
    description: "Identify official national flags across African sovereign states.",
    questionType: "flag"
  },
  {
    id: "flags_asia",
    title: "Asia Flags",
    category: "flags",
    continentFilter: "Asia",
    icon: Flag,
    color: "from-red-500/20 via-rose-500/10 to-transparent",
    borderColor: "border-red-500/30",
    countLabel: "48 Flags",
    description: "Test flag recognition from Turkey to Japan and Southeast Asia.",
    questionType: "flag"
  },
  {
    id: "flags_europe",
    title: "Europe Flags",
    category: "flags",
    continentFilter: "Europe",
    icon: Flag,
    color: "from-blue-500/20 via-indigo-500/10 to-transparent",
    borderColor: "border-blue-500/30",
    countLabel: "44 Flags",
    description: "Identify national flags across Nordic, Western, and Balkan Europe.",
    questionType: "flag"
  },
  {
    id: "flags_namerica",
    title: "North America Flags",
    category: "flags",
    continentFilter: "North America",
    icon: Flag,
    color: "from-sky-500/20 via-cyan-500/10 to-transparent",
    borderColor: "border-sky-500/30",
    countLabel: "23 Flags",
    description: "Recognize flags from Canada to Central America & Caribbean nations.",
    questionType: "flag"
  },
  {
    id: "flags_samerica",
    title: "South America Flags",
    category: "flags",
    continentFilter: "South America",
    icon: Flag,
    color: "from-emerald-500/20 via-teal-500/10 to-transparent",
    borderColor: "border-emerald-500/30",
    countLabel: "12 Flags",
    description: "Identify flags across Latin America from Colombia to Chile.",
    questionType: "flag"
  },
  {
    id: "flags_oceania",
    title: "Oceania Flags",
    category: "flags",
    continentFilter: "Oceania",
    icon: Flag,
    color: "from-purple-500/20 via-violet-500/10 to-transparent",
    borderColor: "border-purple-500/30",
    countLabel: "Pacific Islands",
    description: "Recognize flags of Australia, New Zealand, and Pacific Island nations.",
    questionType: "flag"
  },
  {
    id: "flags_all",
    title: "🏳️ Flag Quiz (All 195 Flags)",
    category: "flags",
    icon: Flag,
    color: "from-geoYellow/20 via-amber-500/10 to-transparent",
    borderColor: "border-geoYellow/40",
    countLabel: "All 195 Flags",
    description: "The ultimate global marathon test covering all recognized world flags.",
    questionType: "flag"
  },

  // ── 2. COUNTRIES CATEGORY ──────────────────────────────────
  {
    id: "countries_africa",
    title: "Africa Quiz",
    category: "countries",
    continentFilter: "Africa",
    icon: Globe,
    color: "from-amber-500/20 via-yellow-500/10 to-transparent",
    borderColor: "border-amber-500/30",
    countLabel: "54 Countries",
    description: "Locate and identify sovereign nations across the African continent.",
    questionType: "country"
  },
  {
    id: "countries_asia",
    title: "Asia Quiz",
    category: "countries",
    continentFilter: "Asia",
    icon: Globe,
    color: "from-red-500/20 via-rose-500/10 to-transparent",
    borderColor: "border-red-500/30",
    countLabel: "48 Countries",
    description: "Identify Asian countries from the Middle East to Far East Asia.",
    questionType: "country"
  },
  {
    id: "countries_europe",
    title: "Europe Quiz",
    category: "countries",
    continentFilter: "Europe",
    icon: Globe,
    color: "from-blue-500/20 via-indigo-500/10 to-transparent",
    borderColor: "border-blue-500/30",
    countLabel: "44 Countries",
    description: "Identify European nations from Iceland to the Mediterranean.",
    questionType: "country"
  },
  {
    id: "countries_namerica",
    title: "North America Quiz",
    category: "countries",
    continentFilter: "North America",
    icon: Globe,
    color: "from-sky-500/20 via-cyan-500/10 to-transparent",
    borderColor: "border-sky-500/30",
    countLabel: "23 Countries",
    description: "Locate North American, Central American, and Caribbean states.",
    questionType: "country"
  },
  {
    id: "countries_samerica",
    title: "South America Quiz",
    category: "countries",
    continentFilter: "South America",
    icon: Globe,
    color: "from-emerald-500/20 via-teal-500/10 to-transparent",
    borderColor: "border-emerald-500/30",
    countLabel: "12 Countries",
    description: "Locate South American nations along the Andes and Amazon.",
    questionType: "country"
  },
  {
    id: "countries_oceania",
    title: "Oceania Quiz",
    category: "countries",
    continentFilter: "Oceania",
    icon: Globe,
    color: "from-purple-500/20 via-violet-500/10 to-transparent",
    borderColor: "border-purple-500/30",
    countLabel: "Pacific Nations",
    description: "Locate Australia, New Zealand, and scattered Pacific island states.",
    questionType: "country"
  },
  {
    id: "countries_all",
    title: "🌍 Countries of the World",
    category: "countries",
    icon: Globe,
    color: "from-geoCyan/20 via-sky-500/10 to-transparent",
    borderColor: "border-geoCyan/40",
    countLabel: "Marathon All 195",
    description: "A marathon geography run identifying every country on the planet.",
    questionType: "country"
  },

  // ── 3. CAPITALS CATEGORY ───────────────────────────────────
  {
    id: "capitals_africa",
    title: "Africa Capitals",
    category: "capitals",
    continentFilter: "Africa",
    icon: Building2,
    color: "from-amber-500/20 via-yellow-500/10 to-transparent",
    borderColor: "border-amber-500/30",
    countLabel: "54 Capitals",
    description: "Match African capital cities to their respective nations.",
    questionType: "capital"
  },
  {
    id: "capitals_asia",
    title: "Asia Capitals",
    category: "capitals",
    continentFilter: "Asia",
    icon: Building2,
    color: "from-red-500/20 via-rose-500/10 to-transparent",
    borderColor: "border-red-500/30",
    countLabel: "48 Capitals",
    description: "Match capital cities across Asian nations and island states.",
    questionType: "capital"
  },
  {
    id: "capitals_europe",
    title: "Europe Capitals",
    category: "capitals",
    continentFilter: "Europe",
    icon: Building2,
    color: "from-blue-500/20 via-indigo-500/10 to-transparent",
    borderColor: "border-blue-500/30",
    countLabel: "44 Capitals",
    description: "Test your knowledge of historical and modern European capital cities.",
    questionType: "capital"
  },
  {
    id: "capitals_namerica",
    title: "North America Capitals",
    category: "capitals",
    continentFilter: "North America",
    icon: Building2,
    color: "from-sky-500/20 via-cyan-500/10 to-transparent",
    borderColor: "border-sky-500/30",
    countLabel: "23 Capitals",
    description: "Match capitals across Canada, USA, Mexico, and the Caribbean.",
    questionType: "capital"
  },
  {
    id: "capitals_samerica",
    title: "South America Capitals",
    category: "capitals",
    continentFilter: "South America",
    icon: Building2,
    color: "from-emerald-500/20 via-teal-500/10 to-transparent",
    borderColor: "border-emerald-500/30",
    countLabel: "12 Capitals",
    description: "Match South American national capitals from Bogotá to Santiago.",
    questionType: "capital"
  },
  {
    id: "capitals_oceania",
    title: "Oceania Capitals",
    category: "capitals",
    continentFilter: "Oceania",
    icon: Building2,
    color: "from-purple-500/20 via-violet-500/10 to-transparent",
    borderColor: "border-purple-500/30",
    countLabel: "Pacific Capitals",
    description: "Test capital city recall across Australia and Pacific island nations.",
    questionType: "capital"
  },
  {
    id: "capitals_all",
    title: "🏛️ Capitals Quiz (All 195)",
    category: "capitals",
    icon: Building2,
    color: "from-amber-400/20 via-yellow-500/10 to-transparent",
    borderColor: "border-amber-400/40",
    countLabel: "All 195 Capitals",
    description: "Master all 195 capital cities worldwide in one comprehensive challenge.",
    questionType: "capital"
  },

  // ── 4. MIXED & SPECIAL MODES CATEGORY ──────────────────────
  {
    id: "mixed_africa",
    title: "Africa Mixed",
    category: "mixed",
    continentFilter: "Africa",
    icon: Layers,
    color: "from-amber-500/20 via-yellow-500/10 to-transparent",
    borderColor: "border-amber-500/30",
    countLabel: "Countries & Capitals",
    description: "Dynamic combination of flags, capitals, and country locations in Africa.",
    questionType: "mixed"
  },
  {
    id: "mixed_asia",
    title: "Asia Mixed",
    category: "mixed",
    continentFilter: "Asia",
    icon: Layers,
    color: "from-red-500/20 via-rose-500/10 to-transparent",
    borderColor: "border-red-500/30",
    countLabel: "Countries & Capitals",
    description: "Mixed geography challenge covering Asian flags, capitals, and locations.",
    questionType: "mixed"
  },
  {
    id: "mixed_europe",
    title: "Europe Mixed",
    category: "mixed",
    continentFilter: "Europe",
    icon: Layers,
    color: "from-blue-500/20 via-indigo-500/10 to-transparent",
    borderColor: "border-blue-500/30",
    countLabel: "Countries & Capitals",
    description: "Combined European trivia featuring flags, capitals, and map frontiers.",
    questionType: "mixed"
  },
  {
    id: "mixed_namerica",
    title: "North America Mixed",
    category: "mixed",
    continentFilter: "North America",
    icon: Layers,
    color: "from-sky-500/20 via-cyan-500/10 to-transparent",
    borderColor: "border-sky-500/30",
    countLabel: "Countries & Capitals",
    description: "Mixed trivia covering North American flags, capitals, and islands.",
    questionType: "mixed"
  },
  {
    id: "mixed_samerica",
    title: "South America Mixed",
    category: "mixed",
    continentFilter: "South America",
    icon: Layers,
    color: "from-emerald-500/20 via-teal-500/10 to-transparent",
    borderColor: "border-emerald-500/30",
    countLabel: "Countries & Capitals",
    description: "Combined South American challenge with flags, capitals, and geography.",
    questionType: "mixed"
  },
  {
    id: "mixed_oceania",
    title: "Oceania Mixed",
    category: "mixed",
    continentFilter: "Oceania",
    icon: Layers,
    color: "from-purple-500/20 via-violet-500/10 to-transparent",
    borderColor: "border-purple-500/30",
    countLabel: "Countries & Capitals",
    description: "Mixed Pacific trivia featuring flags, island capitals, and map locations.",
    questionType: "mixed"
  }
];

export interface QuizQuestionItem {
  prompt: string;
  correctAnswer: string;
  options: string[];
  flagCode?: string;
  capitalName?: string;
  countryName: string;
  lat: number;
  lng: number;
  fact: string;
}

export default function GeoGame() {
  const navigate = useNavigate();

  const [countriesData, setCountriesData] = useState<{ [key: string]: CountryData }>(COUNTRY_DATABASE);
  const [activeCategoryTab, setActiveCategoryTab] = useState<GameMainCategory>("flags");
  const [selectedMode, setSelectedMode] = useState<ModeConfig | null>(null);
  const [questionCountLimit, setQuestionCountLimit] = useState<number>(10); // 5, 10, 20, or 999 (unlimited)

  // Quiz Play State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    loadLiveGlobeCountries().then(data => {
      if (data && Object.keys(data).length > 0) {
        setCountriesData(data);
      }
    });
  }, []);

  const playSound = (type: "correct" | "incorrect" | "complete") => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "incorrect") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.setValueAtTime(130, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn("Audio error:", e);
    }
  };

  // Generate Questions dynamically based on mode configuration
  const startQuizForMode = (mode: ModeConfig) => {
    setSelectedMode(mode);
    const allList = Object.values(countriesData);

    // Filter by Continent if specified
    let filteredList = allList;
    if (mode.continentFilter) {
      filteredList = allList.filter(c => c.region.toLowerCase().includes(mode.continentFilter!.toLowerCase()));
    }

    if (filteredList.length === 0) filteredList = allList;

    // Shuffle countries
    const shuffled = [...filteredList].sort(() => 0.5 - Math.random());
    const limit = questionCountLimit >= 999 ? shuffled.length : Math.min(questionCountLimit, shuffled.length);
    const targetCountries = shuffled.slice(0, limit);

    const generatedQuestions: QuizQuestionItem[] = targetCountries.map((c) => {
      // Pick 3 random wrong options
      const wrongCandidates = allList.filter(other => other.name !== c.name).sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [c.name, ...wrongCandidates.map(w => w.name)].sort(() => 0.5 - Math.random());

      let prompt = "";
      let qType = mode.questionType;

      if (qType === "mixed") {
        const types: ("flag" | "country" | "capital")[] = ["flag", "country", "capital"];
        qType = types[Math.floor(Math.random() * types.length)];
      }

      if (qType === "flag") {
        prompt = "Which country's official national flag is shown below?";
      } else if (qType === "capital") {
        prompt = `Which country has the official capital city of ${c.capital || "this region"}?`;
      } else {
        prompt = `Which nation is located in ${c.region} with an area of ${c.area}?`;
      }

      return {
        prompt,
        correctAnswer: c.name,
        options,
        flagCode: c.code,
        capitalName: c.capital,
        countryName: c.name,
        lat: c.lat,
        lng: c.lng,
        fact: c.desc || `${c.name} is a sovereign nation in ${c.region} with capital ${c.capital || "N/A"}.`
      };
    });

    setQuizQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsQuizCompleted(false);
    setIsPlaying(true);
  };

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;

    const currentQ = quizQuestions[currentQuestionIndex];
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQ.correctAnswer) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      playSound("correct");
    } else {
      setStreak(0);
      playSound("incorrect");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsQuizCompleted(true);
      playSound("complete");
    }
  };

  const currentModes = GAME_MODES.filter(m => m.category === activeCategoryTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full pb-20 font-sans text-white max-w-6xl mx-auto px-4"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          onClick={() => isPlaying ? setIsPlaying(false) : navigate(-1)}
          className="inline-flex items-center gap-2 bg-gray-900/40 hover:bg-gray-900/80 text-gray-300 hover:text-white px-4 py-2 rounded-full border border-white/10 transition-all text-xs font-semibold backdrop-blur-xl hover:border-geoCyan/40 active:scale-95 shadow-sm group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-geoCyan group-hover:-translate-x-0.5 transition-transform" />
          <span>{isPlaying ? "Back to Menu" : "Back"}</span>
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 bg-gray-900/40 hover:bg-gray-800 text-gray-300 rounded-full border border-white/10 transition-all cursor-pointer"
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-geoCyan" />}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODE SELECTION MENU (When not playing)
         ───────────────────────────────────────────────────────────── */}
      {!isPlaying && (
        <div className="space-y-8">
          {/* Main Title & Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-geoYellow font-black uppercase tracking-widest text-xs px-4 py-1.5 rounded-full bg-geoYellow/10 border border-geoYellow/20 backdrop-blur-md">
              <Trophy className="w-4 h-4 text-geoYellow" />
              Interactive Geography Arena
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              GeoGlobe Challenge Arena
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Master flags, identify sovereign countries, match capitals, and conquer global regional challenges.
            </p>
          </div>

          {/* Ad Banner */}
          <AdBanner slotId="game-playing-slot" className="my-2" />

          {/* Category Tabs Switcher (Flags, Countries, Capitals, Mixed) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-900/80 p-2 rounded-[2rem] border border-white/15 backdrop-blur-2xl shadow-2xl max-w-3xl mx-auto">
            <button
              onClick={() => setActiveCategoryTab("flags")}
              className={`py-3 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeCategoryTab === "flags"
                  ? "bg-geoYellow text-gray-950 shadow-lg scale-[1.02]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Flag className="w-4 h-4 shrink-0" />
              <span>🚩 Flags</span>
            </button>
            <button
              onClick={() => setActiveCategoryTab("countries")}
              className={`py-3 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeCategoryTab === "countries"
                  ? "bg-geoCyan text-gray-950 shadow-lg scale-[1.02]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>🌍 Countries</span>
            </button>
            <button
              onClick={() => setActiveCategoryTab("capitals")}
              className={`py-3 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeCategoryTab === "capitals"
                  ? "bg-amber-400 text-gray-950 shadow-lg scale-[1.02]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>🏛️ Capitals</span>
            </button>
            <button
              onClick={() => setActiveCategoryTab("mixed")}
              className={`py-3 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeCategoryTab === "mixed"
                  ? "bg-emerald-400 text-gray-950 shadow-lg scale-[1.02]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>🎲 Mixed</span>
            </button>
          </div>

          {/* Question Count Selector Row */}
          <div className="flex items-center justify-center gap-3 bg-black/40 p-3 rounded-full border border-white/10 max-w-md mx-auto text-xs font-bold">
            <span className="text-gray-400 font-mono text-[11px] uppercase mr-1">Questions:</span>
            {[5, 10, 20, 999].map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCountLimit(count)}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  questionCountLimit === count
                    ? "bg-geoCyan text-gray-950 font-black shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {count === 999 ? "Unlimited" : count}
              </button>
            ))}
          </div>

          {/* Game Mode Cards Grid (Matching App Card Styling) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentModes.map((mode) => {
              const ModeIcon = mode.icon;
              return (
                <motion.div
                  key={mode.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startQuizForMode(mode)}
                  className={`bg-gradient-to-br ${mode.color} bg-gray-900/60 border ${mode.borderColor} rounded-[2rem] p-6 backdrop-blur-2xl shadow-xl flex flex-col justify-between cursor-pointer group hover:shadow-2xl transition-all space-y-4`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-black/50 border border-white/15 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                        <ModeIcon className="w-6 h-6 text-geoYellow" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/10 text-geoYellow font-mono text-[11px] font-bold border border-white/10">
                        {mode.countLabel}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-geoYellow transition-colors">
                        {mode.title}
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed font-normal mt-1">
                        {mode.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-geoCyan group-hover:text-geoYellow transition-colors">
                    <span>PLAY CHALLENGE</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ACTIVE QUIZ PLAYING LOOP
         ───────────────────────────────────────────────────────────── */}
      {isPlaying && quizQuestions.length > 0 && !isQuizCompleted && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Top Progress & Stats Bar */}
          <div className="bg-gray-900/80 border border-white/15 rounded-3xl p-4 backdrop-blur-2xl shadow-2xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Question</span>
              <span className="font-bold text-white text-sm">{currentQuestionIndex + 1} / {quizQuestions.length}</span>
            </div>

            {/* Streak Counter */}
            {streak > 1 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-bounce">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{streak} Streak!</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-gray-400">Score</span>
              <span className="font-bold text-geoYellow text-sm">{score}</span>
            </div>
          </div>

          {/* Active Question Card */}
          <div className="bg-[#080d1a]/95 border border-white/15 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-2xl shadow-2xl space-y-6 text-center">
            {/* Category Mode Badge */}
            <span className="px-3.5 py-1 rounded-full bg-geoCyan/15 text-geoCyan border border-geoCyan/30 text-xs font-mono font-bold uppercase tracking-wider inline-block">
              {selectedMode?.title}
            </span>

            {/* Question Prompt */}
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
              {quizQuestions[currentQuestionIndex].prompt}
            </h2>

            {/* Flag Image Preview (If Flag Question) */}
            {quizQuestions[currentQuestionIndex].flagCode && (
              <div className="my-4 flex justify-center">
                <div className="w-32 h-20 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform">
                  <img
                    src={`https://flagcdn.com/w320/${quizQuestions[currentQuestionIndex].flagCode?.toLowerCase()}.png`}
                    alt="National Flag"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Multiple Choice Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
                const isCorrect = option === quizQuestions[currentQuestionIndex].correctAnswer;
                const isSelected = selectedOption === option;

                let btnStyle = "bg-black/40 hover:bg-white/10 text-white border-white/15";
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-600/90 text-white border-emerald-400 font-extrabold shadow-lg";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-600/90 text-white border-rose-400 font-extrabold shadow-lg";
                  } else {
                    btnStyle = "bg-black/20 text-gray-500 border-white/5 opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleOptionClick(option)}
                    className={`p-4 rounded-2xl border transition-all text-sm font-bold flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-300" />}
                  </button>
                );
              })}
            </div>

            {/* Fact Box after answering */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 text-left text-xs text-gray-300 space-y-2 mt-4"
              >
                <span className="font-mono text-geoYellow font-bold uppercase text-[10px] block">Geographic Fact</span>
                <p className="leading-relaxed">{quizQuestions[currentQuestionIndex].fact}</p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="bg-geoCyan hover:bg-geoYellow text-gray-950 font-extrabold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          RESULTS SUMMARY VIEW
         ───────────────────────────────────────────────────────────── */}
      {isPlaying && isQuizCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto bg-[#080d1a]/95 border border-white/15 rounded-[2.5rem] p-8 text-center backdrop-blur-2xl shadow-2xl space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-geoYellow/20 border-2 border-geoYellow flex items-center justify-center mx-auto text-geoYellow shadow-lg">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-geoCyan uppercase tracking-widest block mb-1">
              CHALLENGE COMPLETED
            </span>
            <h2 className="text-3xl font-black text-white">{selectedMode?.title}</h2>
          </div>

          <div className="bg-black/40 p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="text-4xl font-black text-geoYellow">
              {Math.round((score / quizQuestions.length) * 100)}%
            </div>
            <p className="text-xs text-gray-400 font-mono">
              You answered <strong className="text-white">{score}</strong> out of <strong className="text-white">{quizQuestions.length}</strong> questions correctly!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => startQuizForMode(selectedMode!)}
              className="flex-1 bg-geoCyan hover:bg-geoYellow text-gray-950 font-extrabold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              onClick={() => setIsPlaying(false)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>Select Mode</span>
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
