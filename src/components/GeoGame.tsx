import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { loadGameQuestions, type GameQuestion } from "../data/gameDataSource";
import { 
  Trophy, RefreshCw, ArrowRight, ArrowLeft, CheckCircle2, 
  XCircle, MapPin, Compass, Flag, Globe, Layers, AlertCircle, X,
  Volume2, VolumeX, Sparkles, Flame, Clock, Play, Award, HelpCircle
} from "lucide-react";
import AdBanner from "./AdBanner";

// Built-in master question bank
const DEFAULT_QUESTIONS: GameQuestion[] = [
  // Africa
  { id: "def_1", title: "Unclaimed Desert Territory", name: "Bir Tawil", lat: 21.8706, lng: 33.7342, category: "Anomalies", region: "Africa", countryCode: "eg", clue: "Unclaimed trapezoid of desert between Egypt and Sudan.", fact: "Bir Tawil is one of the few unclaimed terra nullius territories on Earth." },
  { id: "def_2", title: "East African Disputed Border Triangle", name: "Ilemi Triangle", lat: 4.9000, lng: 35.3000, category: "Borders", region: "Africa", countryCode: "ke", clue: "Disputed border territory in East Africa claimed by South Sudan and Kenya.", fact: "The dispute dates back to 1902 colonial boundary agreements." },
  { id: "def_3", title: "Landlocked Enclave Kingdom", name: "Lesotho", lat: -29.6100, lng: 28.2336, category: "Borders", region: "Africa", countryCode: "ls", clue: "High-altitude mountainous kingdom completely surrounded by South Africa.", fact: "Lesotho lies entirely above 1,000 meters in elevation." },
  { id: "def_4", title: "Spanish Enclave in North Africa", name: "Ceuta", lat: 35.8894, lng: -5.3213, category: "Anomalies", region: "Africa", countryCode: "es", clue: "Spanish autonomous city sharing a land border with Morocco.", fact: "Ceuta and Melilla form the only EU land borders in Africa." },
  { id: "def_5", title: "Strategic Horn of Africa Nation", name: "Djibouti", lat: 11.8251, lng: 42.5903, category: "Mixed Global", region: "Africa", countryCode: "dj", clue: "Coastal Horn of Africa nation on the Bab-el-Mandeb strait.", fact: "Lake Assal in Djibouti is the lowest point in Africa (-155m)." },
  { id: "def_6", title: "Pyramids of the Black Pharaohs", name: "Sudan", lat: 15.5007, lng: 32.5599, category: "Countries", region: "Africa", countryCode: "sd", clue: "Northeast African country home to more ancient pyramids than Egypt.", fact: "Sudan contains over 220 Nubian pyramids at Meroë." },
  { id: "def_7", title: "World's Leading Cocoa Producer", name: "Ivory Coast", lat: 7.5400, lng: -5.5471, category: "Countries", region: "Africa", countryCode: "ci", clue: "West African nation renowned for producing 40% of global cocoa.", fact: "Its official French name is Côte d'Ivoire." },

  // Europe
  { id: "def_8", title: "Enclave Maze in the Low Countries", name: "Baarle-Hertog", lat: 51.4428, lng: 4.9317, category: "Anomalies", region: "Europe", countryCode: "be", clue: "Belgian enclave inside the Netherlands cutting through houses and cafes.", fact: "Consists of 22 Belgian enclaves inside Dutch territory." },
  { id: "def_9", title: "Pyrenees Co-Principality", name: "Andorra", lat: 42.5063, lng: 1.5218, category: "Borders", region: "Europe", countryCode: "ad", clue: "Sovereign principality in the Pyrenees between France and Spain.", fact: "Andorra is the only country with Catalan as its sole official language." },
  { id: "def_10", title: "Double-Landlocked Alpine Nation", name: "Liechtenstein", lat: 47.1660, lng: 9.5554, category: "Countries", region: "Europe", countryCode: "li", clue: "Alpine country bordered solely by landlocked Switzerland and Austria.", fact: "One of only two doubly landlocked countries in the world." },
  { id: "def_11", title: "Floating Venice Lagoon City", name: "Italy", lat: 41.8719, lng: 12.5674, category: "Capitals", region: "Europe", countryCode: "it", clue: "Boot-shaped Mediterranean nation with capital Rome.", fact: "Italy entirely surrounds two sovereign enclaves: Vatican City and San Marino." },

  // Asia
  { id: "def_12", title: "Land of the Thunder Dragon", name: "Bhutan", lat: 27.5142, lng: 90.4336, category: "Flags", region: "Asia", countryCode: "bt", clue: "Himalayan kingdom whose flag features a white dragon.", fact: "Bhutan is the world's only carbon-negative nation." },
  { id: "def_13", title: "Omani Peninsula Exclave", name: "Musandam", lat: 26.0000, lng: 56.3000, category: "Anomalies", region: "Asia", countryCode: "om", clue: "Exclave of Oman separated by the United Arab Emirates.", fact: "Known as the 'Norway of Arabia' for its dramatic fjords." },
  { id: "def_14", title: "Only Non-Rectangular Flag", name: "Nepal", lat: 28.3949, lng: 84.1240, category: "Flags", region: "Asia", countryCode: "np", clue: "Himalayan nation with a double-pennant non-rectangular flag.", fact: "Home to Mount Everest, the world's highest peak." },

  // Americas
  { id: "def_15", title: "US Exclave in Canada", name: "Point Roberts", lat: 48.9883, lng: -123.0800, category: "Anomalies", region: "Americas", countryCode: "us", clue: "American town below 49th parallel reachable by land only via Canada.", fact: "High school students cross international borders twice daily." },
  { id: "def_16", title: "Tropical Andes & Coffee Realm", name: "Colombia", lat: 4.5709, lng: -74.2973, category: "Countries", region: "Americas", countryCode: "co", clue: "South American country with capital Bogotá.", fact: "Colombia is the second most biodiverse country on Earth." },

  // Oceania
  { id: "def_17", title: "Micro-Island Republic", name: "Nauru", lat: -0.5228, lng: 166.9315, category: "Flags", region: "Oceania", countryCode: "nr", clue: "Smallest independent republic with gold stripe and 12-pointed star flag.", fact: "Nauru has no official capital city." },
  { id: "def_18", title: "First Nation to Welcome New Day", name: "Kiribati", lat: 1.8709, lng: -157.3631, category: "Anomalies", region: "Oceania", countryCode: "ki", clue: "Pacific island nation that adjusted the Date Line in 1995.", fact: "Millennium Island is the first landmass to welcome the new year." }
];

function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function GeoGame() {
  const navigate = useNavigate();

  // Game Engine View State
  const [viewState, setViewState] = useState<"hub" | "playing" | "summary">("hub");

  // Selection Filter State
  const [activeEngine, setActiveEngine] = useState<"map" | "marathon">("map");
  const [activeSection, setActiveSection] = useState<"flags" | "countries" | "capitals" | "mixed">("flags");

  // Game Questions State
  const [allQuestions, setAllQuestions] = useState<GameQuestion[]>(DEFAULT_QUESTIONS);
  const [currentQuestions, setCurrentQuestions] = useState<GameQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Active Round Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const timerRef = useRef<any>(null);

  // Load live questions on mount
  useEffect(() => {
    loadGameQuestions()
      .then(data => {
        if (data && data.length > 0) {
          setAllQuestions(data);
        }
      })
      .catch(err => console.warn("Failed to load live trivia sheet:", err));
  }, []);

  // Web Audio Victory / Defeat Sound
  const playSound = (type: "correct" | "incorrect" | "victory") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "correct") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "incorrect") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn("Audio error:", e);
    }
  };

  // Speech Pronunciation
  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Generate 4 Multiple Choice Options (1 correct + 3 distractor)
  const generateOptions = useCallback((currentQ: GameQuestion, pool: GameQuestion[]) => {
    const correctAnswer = currentQ.name;
    const distractors = Array.from(new Set(
      pool.map(q => q.name).filter(n => n !== correctAnswer)
    ));
    const shuffledDistractors = fisherYatesShuffle(distractors).slice(0, 3);
    const combined = fisherYatesShuffle([correctAnswer, ...shuffledDistractors]);
    setOptions(combined);
  }, []);

  // Launch a Game Round
  const startRound = (filteredCategory?: string, filteredRegion?: string) => {
    let pool = [...allQuestions];

    if (filteredCategory && filteredCategory !== "All" && filteredCategory !== "Mixed Global") {
      pool = pool.filter(q => q.category.toLowerCase().includes(filteredCategory.toLowerCase()));
    }
    if (filteredRegion && filteredRegion !== "Global") {
      pool = pool.filter(q => q.region.toLowerCase().includes(filteredRegion.toLowerCase()));
    }

    if (pool.length < 4) {
      pool = [...DEFAULT_QUESTIONS];
    }

    const round = fisherYatesShuffle(pool).slice(0, 10);
    setCurrentQuestions(round);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setTimeLeft(15);
    setViewState("playing");

    if (round.length > 0) {
      generateOptions(round[0], allQuestions);
    }
  };

  // Timer Countdown
  useEffect(() => {
    if (viewState !== "playing" || isAnswered) return;

    if (timeLeft <= 0) {
      handleAnswerSelect("__TIMEOUT__");
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [viewState, isAnswered, timeLeft]);

  // Handle Answer Click
  const handleAnswerSelect = (optionName: string) => {
    if (isAnswered) return;
    clearInterval(timerRef.current);

    const currentQ = currentQuestions[currentIdx];
    const isCorrect = optionName === currentQ.name;

    setSelectedAnswer(optionName);
    setIsAnswered(true);

    if (isCorrect) {
      playSound("correct");
      speakText(`Correct! ${currentQ.name}`);
      const speedBonus = timeLeft * 10;
      const comboMultiplier = streak >= 3 ? 2.0 : streak >= 1 ? 1.5 : 1.0;
      const points = Math.round((100 + speedBonus) * comboMultiplier);

      setScore(prev => prev + points);
      setCorrectCount(prev => prev + 1);
      setStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      playSound("incorrect");
      speakText(`Incorrect. The answer is ${currentQ.name}`);
      setStreak(0);
    }
  };

  // Next Question or End Round
  const handleNextQuestion = () => {
    if (currentIdx + 1 < currentQuestions.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(15);
      generateOptions(currentQuestions[nextIdx], allQuestions);
    } else {
      setViewState("summary");
      playSound("victory");
    }
  };

  const currentQ = currentQuestions[currentIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full pb-20 font-sans text-white max-w-5xl mx-auto"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          onClick={() => {
            if (viewState !== "hub") setViewState("hub");
            else navigate("/");
          }}
          className="inline-flex items-center gap-2 bg-gray-900/40 hover:bg-gray-900/80 text-gray-300 hover:text-white px-4 py-2 rounded-full border border-white/10 transition-all text-xs font-semibold backdrop-blur-xl hover:border-geoCyan/40 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-geoCyan" />
          <span>{viewState !== "hub" ? "Games Hub" : "Home"}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className="p-2 rounded-full bg-gray-900/40 border border-white/10 text-gray-300 hover:text-white cursor-pointer"
            title={speechEnabled ? "Mute Pronunciation" : "Enable Pronunciation"}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4 text-geoCyan" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STATE 1: GAMES HUB (Two Main Section Blocks)
         ───────────────────────────────────────────────────────────── */}
      {viewState === "hub" && (
        <div className="space-y-10">
          {/* Main Hero Header */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-geoYellow/10 border border-geoYellow/30 text-xs font-bold text-geoYellow uppercase tracking-wider mb-3">
              <Trophy className="w-3.5 h-3.5" />
              <span>GeoGlobe Games Hub</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
              Choose Your Challenge
            </h1>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
              Play quick 10-question map rounds or dive into regional marathon quizzes across flags, capitals, and country frontiers.
            </p>
          </div>

          <AdBanner slotId="game-hub-header-slot" className="my-0" />

          {/* ─────────────────────────────────────────────────────────────
              SECTION 1: "Quick Map Challenges" (Leaflet Map CSV Engine)
             ───────────────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-geoCyan" />
                <h2 className="text-xl font-extrabold text-white">Section 1: Quick Map Challenges</h2>
              </div>
              <span className="text-xs font-mono text-geoCyan font-bold bg-geoCyan/10 px-3 py-1 rounded-full border border-geoCyan/20">
                Leaflet CSV Engine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Mixed Global */}
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => startRound("All", "Global")}
                className="bg-gray-900/60 backdrop-blur-xl border border-white/10 hover:border-geoCyan/50 rounded-3xl p-5 cursor-pointer group flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-geoCyan/15 text-geoCyan flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-geoCyan transition-colors">Mixed Global</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    A blend of border puzzles, world anomalies & flags.
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs font-bold text-geoCyan border-t border-white/5 pt-3">
                  <span>Start 10-Q Round</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

              {/* Flags */}
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => startRound("Flags", "Global")}
                className="bg-gray-900/60 backdrop-blur-xl border border-white/10 hover:border-geoYellow/50 rounded-3xl p-5 cursor-pointer group flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-geoYellow/15 text-geoYellow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Flag className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-geoYellow transition-colors">Flags Quiz</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Identify countries by their iconic national standards.
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs font-bold text-geoYellow border-t border-white/5 pt-3">
                  <span>Start 10-Q Round</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

              {/* Borders */}
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => startRound("Borders", "Global")}
                className="bg-gray-900/60 backdrop-blur-xl border border-white/10 hover:border-geoCyan/50 rounded-3xl p-5 cursor-pointer group flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-geoCyan/15 text-geoCyan flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-geoCyan transition-colors">Borders</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Disputed frontiers, enclaves, and border quirks.
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs font-bold text-geoCyan border-t border-white/5 pt-3">
                  <span>Start 10-Q Round</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

              {/* Anomalies */}
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => startRound("Anomalies", "Global")}
                className="bg-gray-900/60 backdrop-blur-xl border border-white/10 hover:border-purple-400/50 rounded-3xl p-5 cursor-pointer group flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-purple-400 transition-colors">Anomalies</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Unique geographical oddities and curiosities.
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs font-bold text-purple-400 border-t border-white/5 pt-3">
                  <span>Start 10-Q Round</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 2: "Globe & Category Marathons" (Page/Mode Based Engine)
             ───────────────────────────────────────────────────────────── */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-geoYellow" />
                <h2 className="text-xl font-extrabold text-white">Section 2: Globe & Category Marathons</h2>
              </div>
              <span className="text-xs font-mono text-geoYellow font-bold bg-geoYellow/10 px-3 py-1 rounded-full border border-geoYellow/20">
                Page / Mode Engine
              </span>
            </div>

            {/* Sub-Category Tab Buttons */}
            <div className="flex flex-wrap items-center gap-2 bg-gray-900/80 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
              <button
                onClick={() => setActiveSection("flags")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  activeSection === "flags" ? "bg-geoYellow text-gray-950 shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                <Flag className="w-4 h-4" />
                <span>🚩 Flags</span>
              </button>

              <button
                onClick={() => setActiveSection("countries")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  activeSection === "countries" ? "bg-geoYellow text-gray-950 shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>🌍 Countries</span>
              </button>

              <button
                onClick={() => setActiveSection("capitals")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  activeSection === "capitals" ? "bg-geoYellow text-gray-950 shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>🏛️ Capitals</span>
              </button>

              <button
                onClick={() => setActiveSection("mixed")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  activeSection === "mixed" ? "bg-geoYellow text-gray-950 shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>🎲 Mixed & Special</span>
              </button>
            </div>

            {/* Grid of Regional Cards for Selected Sub-Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {["Africa", "Asia", "Europe", "North America", "South America", "Oceania"].map(reg => (
                <button
                  key={reg}
                  onClick={() => startRound(activeSection, reg)}
                  className="bg-gray-900/60 hover:bg-geoCyan/20 border border-white/10 hover:border-geoCyan rounded-2xl p-4 text-center transition-all cursor-pointer group shadow-md"
                >
                  <span className="text-2xl mb-1 block group-hover:scale-110 transition-transform">
                    {reg === "Africa" ? "🌍" : reg === "Asia" ? "🌏" : reg === "Europe" ? "🏰" : reg === "North America" ? "🗽" : reg === "South America" ? "🗿" : "🌊"}
                  </span>
                  <span className="text-xs font-bold text-white group-hover:text-geoCyan block truncate">{reg}</span>
                  <span className="text-[10px] text-gray-400 capitalize block mt-0.5">{activeSection}</span>
                </button>
              ))}
            </div>

            {/* Special All-in-One Marathon Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div
                onClick={() => startRound(activeSection, "Global")}
                className="bg-gradient-to-r from-geoYellow/20 via-gray-900 to-black border border-geoYellow/40 rounded-3xl p-6 cursor-pointer hover:border-geoYellow transition-all group shadow-xl flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-geoYellow uppercase tracking-wider block mb-1">ALL-IN-ONE MARATHON</span>
                  <h3 className="text-lg font-black text-white group-hover:text-geoYellow transition-colors">
                    {activeSection === "flags" ? "All 195 Flags Challenge" : activeSection === "capitals" ? "All 195 World Capitals" : "Countries of the World Run"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Test your global mastery across all continents.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-geoYellow text-gray-950 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current" />
                </div>
              </div>

              <div
                onClick={() => startRound("All", "Global")}
                className="bg-gradient-to-r from-geoCyan/20 via-gray-900 to-black border border-geoCyan/40 rounded-3xl p-6 cursor-pointer hover:border-geoCyan transition-all group shadow-xl flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-geoCyan uppercase tracking-wider block mb-1">RECALL CHALLENGE</span>
                  <h3 className="text-lg font-black text-white group-hover:text-geoCyan transition-colors">Timed Recall Memory Run</h3>
                  <p className="text-xs text-gray-400 mt-1">High-speed recall across all geopolitical frontiers.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-geoCyan text-gray-950 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STATE 2: PLAYING ROUND (15s Timed 10-Question Gameplay)
         ───────────────────────────────────────────────────────────── */}
      {viewState === "playing" && currentQ && (
        <div className="space-y-6">
          {/* Top Progress & Stats Bar */}
          <div className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400 uppercase font-bold">Question</span>
              <span className="text-base font-black text-white">{currentIdx + 1} <span className="text-gray-500 font-normal">/ {currentQuestions.length}</span></span>
            </div>

            {/* Score & Streak */}
            <div className="flex items-center gap-6 font-mono">
              <div className="flex items-center gap-1.5 text-geoYellow">
                <Trophy className="w-4 h-4" />
                <span className="text-base font-black">{score}</span>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1 text-orange-400 animate-pulse">
                  <Flame className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">{streak}x</span>
                </div>
              )}
            </div>

            {/* 15s Timer */}
            <div className={`flex items-center gap-1.5 font-mono text-sm font-black px-3 py-1 rounded-full border ${
              timeLeft <= 5 ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse" : "bg-black/40 text-geoCyan border-white/10"
            }`}>
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Question Card Header */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 text-center space-y-3 shadow-2xl relative overflow-hidden">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-geoCyan uppercase tracking-widest bg-geoCyan/10 px-3 py-1 rounded-full border border-geoCyan/20">
              <Compass className="w-3.5 h-3.5" />
              <span>{currentQ.region} • {currentQ.category}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {currentQ.title}
            </h2>

            {currentQ.clue && (
              <p className="text-xs md:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
                "{currentQ.clue}"
              </p>
            )}

            {/* Flag Badge or Country Emblem */}
            {currentQ.countryCode && (
              <div className="pt-2 flex justify-center">
                <div className="w-12 h-8 rounded-lg overflow-hidden border border-white/20 shadow-lg">
                  <img
                    src={`https://flagcdn.com/w320/${currentQ.countryCode.toLowerCase()}.png`}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4 Multiple Choice Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOpt = option === currentQ.name;

              let btnStyle = "bg-gray-900/60 hover:bg-gray-800 border-white/10 text-white";
              if (isAnswered) {
                if (isCorrectOpt) {
                  btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-500/20";
                } else if (isSelected) {
                  btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                } else {
                  btnStyle = "bg-gray-900/20 border-white/5 text-gray-500 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border text-left text-sm md:text-base font-semibold transition-all flex items-center justify-between cursor-pointer active:scale-98 ${btnStyle}`}
                >
                  <span className="truncate">{option}</span>
                  {isAnswered && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isAnswered && isSelected && !isCorrectOpt && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Fact Box & Next Button after answering */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/60 border border-white/15 rounded-3xl p-5 space-y-3 backdrop-blur-2xl"
            >
              <div className="flex items-center gap-2 text-geoYellow text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Geographic Fact</span>
              </div>
              <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-normal">
                {currentQ.fact || `${currentQ.name} is a vital location in ${currentQ.region}.`}
              </p>

              <button
                onClick={handleNextQuestion}
                className="w-full bg-geoCyan hover:bg-geoYellow text-gray-950 font-extrabold py-3.5 rounded-full transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STATE 3: SUMMARY SCREEN (Game Over Score & Badges)
         ───────────────────────────────────────────────────────────── */}
      {viewState === "summary" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900/80 backdrop-blur-2xl border border-white/15 rounded-[2.5rem] p-8 text-center space-y-6 shadow-2xl max-w-xl mx-auto"
        >
          <div className="w-20 h-20 rounded-full bg-geoYellow/20 border-2 border-geoYellow text-geoYellow flex items-center justify-center mx-auto shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-geoYellow uppercase tracking-widest block mb-1">ROUND COMPLETED</span>
            <h2 className="text-3xl font-black text-white tracking-tight">Challenge Summary</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-black/40 p-4 rounded-3xl border border-white/10 text-center font-mono">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Final Score</span>
              <span className="text-xl font-black text-geoYellow">{score}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Accuracy</span>
              <span className="text-xl font-black text-geoCyan">{Math.round((correctCount / currentQuestions.length) * 100)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Best Streak</span>
              <span className="text-xl font-black text-orange-400">{maxStreak}x</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => startRound("All", "Global")}
              className="flex-1 bg-geoYellow hover:bg-geoCyan text-gray-950 font-extrabold py-3.5 rounded-full transition-all text-xs uppercase tracking-wider shadow-lg cursor-pointer"
            >
              Play Again
            </button>
            <button
              onClick={() => setViewState("hub")}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-full transition-all text-xs uppercase tracking-wider border border-white/20 cursor-pointer"
            >
              Games Hub
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
