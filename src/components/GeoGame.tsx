import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3-geo";
import * as topojson from "topojson-client";
import { loadGameQuestions, type GameQuestion } from "../data/gameDataSource";
import { loadLiveGlobeCountries, CountryData, COUNTRY_DATABASE } from "../data/globeDataSource";
import {
  Trophy, RefreshCw, ArrowRight, ArrowLeft, CheckCircle2, 
  XCircle, MapPin, Compass, Flag, Globe, Layers, AlertCircle, X,
  Volume2, VolumeX, Sparkles, Building2, Flame
} from "lucide-react";
import AdBanner from "./AdBanner";

// Original Coordinate Map Pin Question Bank (Fully Preserved)
const DEFAULT_MAP_QUESTIONS: GameQuestion[] = [
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
    fact: "Lesotho is the only independent country in the world that lies entirely above 1,000 metres in elevation."
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
    title: "Enclave Maze in the Low Countries",
    name: "Baarle-Hertog",
    lat: 51.4428,
    lng: 4.9317,
    category: "Anomalies",
    region: "Europe",
    countryCode: "be",
    clue: "A Belgian municipality consisting of 22 separate enclaves inside the Netherlands.",
    fact: "Because Dutch and Belgian tax laws differed, restaurants located on the border used to move customer tables at closing time!"
  }
];

export type QuizType = "map_pins" | "globe_flags" | "globe_countries" | "globe_capitals" | "globe_mixed";

export interface QuizCategory {
  id: string;
  type: QuizType;
  title: string;
  subtitle: string;
  icon: any;
  continentFilter?: string; // "Africa", "Asia", "Europe", "Americas", "Oceania"
  badge: string;
  color: string;
}

const QUIZ_CATEGORIES: QuizCategory[] = [
  // 🚩 Flags Modes
  { id: "flag_all", type: "globe_flags", title: "Flag Quiz (All 195 Flags)", subtitle: "Master every national flag in the world on the 3D globe", icon: Flag, badge: "All-in-One", color: "from-amber-500/20 border-amber-500/40 text-amber-300" },
  { id: "flag_africa", type: "globe_flags", continentFilter: "Africa", title: "Africa Flags Quiz", subtitle: "Identify African nations by their national flags", icon: Flag, badge: "Regional", color: "from-emerald-500/20 border-emerald-500/40 text-emerald-300" },
  { id: "flag_asia", type: "globe_flags", continentFilter: "Asia", title: "Asia Flags Quiz", subtitle: "Identify Asian nations from Turkey to Japan", icon: Flag, badge: "Regional", color: "from-rose-500/20 border-rose-500/40 text-rose-300" },
  { id: "flag_europe", type: "globe_flags", continentFilter: "Europe", title: "Europe Flags Quiz", subtitle: "Test your knowledge of European flags", icon: Flag, badge: "Regional", color: "from-sky-500/20 border-sky-500/40 text-sky-300" },
  { id: "flag_americas", type: "globe_flags", continentFilter: "Americas", title: "Americas Flags Quiz", subtitle: "Flags of North & South America", icon: Flag, badge: "Regional", color: "from-purple-500/20 border-purple-500/40 text-purple-300" },
  { id: "flag_oceania", type: "globe_flags", continentFilter: "Oceania", title: "Oceania Flags Quiz", subtitle: "Flags of Australia, NZ & Pacific islands", icon: Flag, badge: "Regional", color: "from-teal-500/20 border-teal-500/40 text-teal-300" },

  // 🌍 Countries Modes
  { id: "country_all", type: "globe_countries", title: "Countries of the World", subtitle: "Marathon run of identifying every sovereign country", icon: Globe, badge: "All-in-One", color: "from-geoCyan/20 border-geoCyan/40 text-geoCyan" },
  { id: "country_africa", type: "globe_countries", continentFilter: "Africa", title: "Africa Countries Quiz", subtitle: "Locate all 54 African countries on the 3D globe", icon: Globe, badge: "Regional", color: "from-emerald-500/20 border-emerald-500/40 text-emerald-300" },
  { id: "country_asia", type: "globe_countries", continentFilter: "Asia", title: "Asia Countries Quiz", subtitle: "Locate Asian nations on the 3D globe", icon: Globe, badge: "Regional", color: "from-rose-500/20 border-rose-500/40 text-rose-300" },
  { id: "country_europe", type: "globe_countries", continentFilter: "Europe", title: "Europe Countries Quiz", subtitle: "Locate European countries from Iceland to Greece", icon: Globe, badge: "Regional", color: "from-sky-500/20 border-sky-500/40 text-sky-300" },
  { id: "country_americas", type: "globe_countries", continentFilter: "Americas", title: "Americas Countries Quiz", subtitle: "Locate countries across North & South America", icon: Globe, badge: "Regional", color: "from-purple-500/20 border-purple-500/40 text-purple-300" },
  { id: "country_oceania", type: "globe_countries", continentFilter: "Oceania", title: "Oceania Countries Quiz", subtitle: "Locate Pacific island nations on the 3D globe", icon: Globe, badge: "Regional", color: "from-teal-500/20 border-teal-500/40 text-teal-300" },

  // 🏛️ Capital Cities Modes
  { id: "capital_all", type: "globe_capitals", title: "Capitals Quiz (All 195)", subtitle: "Match world capital cities to their country on 3D globe", icon: Building2, badge: "All-in-One", color: "from-geoYellow/20 border-geoYellow/40 text-geoYellow" },
  { id: "capital_africa", type: "globe_capitals", continentFilter: "Africa", title: "Africa Capitals Quiz", subtitle: "Name and tap African countries from their capitals", icon: Building2, badge: "Regional", color: "from-emerald-500/20 border-emerald-500/40 text-emerald-300" },
  { id: "capital_asia", type: "globe_capitals", continentFilter: "Asia", title: "Asia Capitals Quiz", subtitle: "Capital city challenges across Asia", icon: Building2, badge: "Regional", color: "from-rose-500/20 border-rose-500/40 text-rose-300" },
  { id: "capital_europe", type: "globe_capitals", continentFilter: "Europe", title: "Europe Capitals Quiz", subtitle: "Match European capitals to their country", icon: Building2, badge: "Regional", color: "from-sky-500/20 border-sky-500/40 text-sky-300" },

  // 🎲 Mixed & Special Modes
  { id: "mixed_africa", type: "globe_mixed", continentFilter: "Africa", title: "Africa Mixed Challenge", subtitle: "Combined flags, capitals & country prompts for Africa", icon: Sparkles, badge: "Mixed", color: "from-amber-500/20 border-amber-500/40 text-amber-300" },
  { id: "mixed_asia", type: "globe_mixed", continentFilter: "Asia", title: "Asia Mixed Challenge", subtitle: "Combined flags, capitals & country prompts for Asia", icon: Sparkles, badge: "Mixed", color: "from-rose-500/20 border-rose-500/40 text-rose-300" },

  // 📍 Map Video Pins (Original Mode)
  { id: "map_pins_all", type: "map_pins", title: "Documentary Video Pins", subtitle: "Guess exact coordinates of territorial anomalies from video clips", icon: MapPin, badge: "Map Pins", color: "from-geoCyan/20 border-geoCyan/40 text-geoCyan" }
];

export default function GeoGame() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active Category & Game Settings
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>(QUIZ_CATEGORIES[0]);
  const [activeGroupTab, setActiveGroupTab] = useState<"flags" | "countries" | "capitals" | "mixed" | "map">("flags");
  const [questionLimit, setQuestionLimit] = useState<number | "unlimited">(10);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  // 3D Globe & Map Question Banks
  const [countriesMap, setCountriesMap] = useState<{ [key: string]: CountryData }>(COUNTRY_DATABASE);
  const [worldGeoJson, setWorldGeoJson] = useState<any | null>(null);
  const [questions, setQuestions] = useState<CountryData[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  // Score & Gameplay State
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ status: "correct" | "wrong" | null; text: string }>({ status: null, text: "" });
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // 3D Globe Render References
  const rotationRef = useRef<[number, number, number]>([-10, -15, 0]);
  const targetRotationRef = useRef<[number, number, number]>([-10, -15, 0]);
  const scaleRef = useRef<number>(240);
  const targetScaleRef = useRef<number>(240);
  const isDraggingRef = useRef<boolean>(false);

  // Load GeoJSON and Live Data
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(res => res.json())
      .then(topology => {
        const geojson = topojson.feature(topology, topology.objects.countries);
        setWorldGeoJson(geojson);
      })
      .catch(err => console.warn("Failed to load world topology:", err));

    loadLiveGlobeCountries()
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setCountriesMap(data);
        }
      })
      .catch(err => console.warn("Failed to load live globe countries:", err));
  }, []);

  // Audio Chime Feedback
  const playSound = (type: "correct" | "wrong") => {
    if (isSoundMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";

      if (type === "correct") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15); // E3
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  };

  // Start Selected Quiz Game
  const handleStartGame = () => {
    let pool = Object.values(countriesMap);

    // Filter by Continent if specified
    if (selectedCategory.continentFilter) {
      pool = pool.filter(c => c.region.toLowerCase().includes(selectedCategory.continentFilter!.toLowerCase()));
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selectedList = questionLimit === "unlimited" ? shuffled : shuffled.slice(0, Math.min(questionLimit, shuffled.length));

    setQuestions(selectedList);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setFeedback({ status: null, text: "" });
    setIsGameOver(false);
    setIsGameActive(true);

    if (selectedList.length > 0) {
      targetRotationRef.current = [-selectedList[0].lng, -selectedList[0].lat, 0];
    }
  };

  // 3D Globe Render Loop
  useEffect(() => {
    if (!isGameActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth || 800;
        canvas.height = parent.clientHeight || 600;
      }
    };
    updateSize();

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      let dLat = targetRotationRef.current[1] - rotationRef.current[1];
      let dLng = (targetRotationRef.current[0] - rotationRef.current[0]) % 360;
      if (dLng > 180) dLng -= 360;
      if (dLng < -180) dLng += 360;

      scaleRef.current += (targetScaleRef.current - scaleRef.current) * 0.08;
      rotationRef.current[0] += dLng * 0.08;
      rotationRef.current[1] += dLat * 0.08;

      const projection = d3.geoOrthographic()
        .scale(scaleRef.current)
        .translate([width / 2, height / 2])
        .rotate(rotationRef.current)
        .clipAngle(90);

      const path = d3.geoPath().projection(projection).context(ctx);
      const graticule = d3.geoGraticule10();

      // 1. Ocean Base Sphere
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = "#081420";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(66, 194, 203, 0.4)";
      ctx.stroke();

      // 2. Graticule Lines
      ctx.beginPath();
      path(graticule);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();

      // 3. Country Polygons
      const targetCountry = questions[currentIdx];

      if (worldGeoJson && worldGeoJson.features) {
        worldGeoJson.features.forEach((feature: any) => {
          const name = feature.properties?.name || "Country";
          const isTarget = targetCountry && (targetCountry.name === name || name.includes(targetCountry.name));

          ctx.beginPath();
          path(feature);

          ctx.fillStyle = isTarget && feedback.status === "wrong" ? "#e53935" : "#1e293b";
          ctx.fill();

          ctx.lineWidth = isTarget ? 1.8 : 0.4;
          ctx.strokeStyle = isTarget ? "#F4D03F" : "rgba(255, 255, 255, 0.2)";
          ctx.stroke();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isGameActive, worldGeoJson, questions, currentIdx, feedback]);

  // Handle Answer Selection on 3D Globe
  const handleCountryTap = (clickedName: string) => {
    if (feedback.status !== null || questions.length === 0) return;

    const target = questions[currentIdx];
    const isCorrect = clickedName.toLowerCase() === target.name.toLowerCase() || target.name.toLowerCase().includes(clickedName.toLowerCase());

    if (isCorrect) {
      playSound("correct");
      const newScore = score + 100;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setFeedback({ status: "correct", text: `Bingo! That's ${target.name}!` });
    } else {
      playSound("wrong");
      setStreak(0);
      setFeedback({ status: "wrong", text: `Incorrect! That was ${clickedName}. Target was ${target.name}.` });
    }

    // Advance to Next Question
    setTimeout(() => {
      setFeedback({ status: null, text: "" });
      if (currentIdx + 1 < questions.length) {
        const next = currentIdx + 1;
        setCurrentIdx(next);
        targetRotationRef.current = [-questions[next].lng, -questions[next].lat, 0];
      } else {
        setIsGameOver(true);
      }
    }, 1800);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !worldGeoJson) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const projection = d3.geoOrthographic()
      .scale(scaleRef.current)
      .translate([canvas.width / 2, canvas.height / 2])
      .rotate(rotationRef.current);

    const coords = projection.invert?.([x, y]);
    if (!coords) return;

    const clickedCountry = worldGeoJson.features.find((f: any) => d3.geoContains(f, coords));
    if (clickedCountry && clickedCountry.properties?.name) {
      handleCountryTap(clickedCountry.properties.name);
    }
  };

  const currentQuestion = questions[currentIdx];

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
          onClick={() => isGameActive ? setIsGameActive(false) : navigate(-1)}
          className="inline-flex items-center gap-2 bg-gray-900/40 hover:bg-gray-900/80 text-gray-300 hover:text-white px-4 py-2 rounded-full border border-white/10 transition-all text-xs font-semibold backdrop-blur-xl hover:border-geoCyan/40 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-geoCyan" />
          <span>{isGameActive ? "Exit Game" : "Back"}</span>
        </button>

        <button
          onClick={() => setIsSoundMuted(!isSoundMuted)}
          className="w-9 h-9 rounded-full bg-gray-900/60 hover:bg-gray-800 border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer"
        >
          {isSoundMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-geoYellow" />}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. GAME LOBBY VIEW (MODES & CATEGORIES SELECTION)
         ───────────────────────────────────────────────────────────── */}
      {!isGameActive && (
        <div className="space-y-8">
          <header className="text-center md:text-left grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7">
              <div className="inline-flex items-center gap-2 text-geoYellow font-semibold uppercase tracking-wider text-xs mb-2 bg-geoYellow/10 px-3 py-1 rounded-full border border-geoYellow/20">
                <Trophy className="w-3.5 h-3.5" />
                Geography Challenge Arena
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                GeoGlobe Quiz Center
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Test your knowledge of national flags, capitals, country boundaries, and disputed map anomalies!
              </p>
            </div>
            <div className="md:col-span-5">
              <AdBanner slotId="game-lobby-slot" className="my-0" />
            </div>
          </header>

          {/* Group Filter Tabs (Flags, Countries, Capitals, Mixed, Map Pins) */}
          <div className="flex flex-wrap gap-2 bg-gray-900/80 p-1.5 rounded-2xl sm:rounded-full border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => setActiveGroupTab("flags")}
              className={`flex-1 py-3 px-4 rounded-xl sm:rounded-full font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeGroupTab === "flags" ? "bg-geoYellow text-gray-950 shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>🚩 FLAGS</span>
            </button>

            <button
              onClick={() => setActiveGroupTab("countries")}
              className={`flex-1 py-3 px-4 rounded-xl sm:rounded-full font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeGroupTab === "countries" ? "bg-geoCyan text-gray-950 shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>🌍 COUNTRIES</span>
            </button>

            <button
              onClick={() => setActiveGroupTab("capitals")}
              className={`flex-1 py-3 px-4 rounded-xl sm:rounded-full font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeGroupTab === "capitals" ? "bg-amber-400 text-gray-950 shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>🏛️ CAPITALS</span>
            </button>

            <button
              onClick={() => setActiveGroupTab("mixed")}
              className={`flex-1 py-3 px-4 rounded-xl sm:rounded-full font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeGroupTab === "mixed" ? "bg-rose-400 text-gray-950 shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>🎲 MIXED</span>
            </button>

            <button
              onClick={() => setActiveGroupTab("map")}
              className={`flex-1 py-3 px-4 rounded-xl sm:rounded-full font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeGroupTab === "map" ? "bg-purple-400 text-gray-950 shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>📍 MAP PINS</span>
            </button>
          </div>

          {/* Question Limit Selector */}
          <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/10 text-xs">
            <span className="font-bold text-gray-300">Question Count:</span>
            <div className="flex gap-2">
              {[5, 10, "unlimited"].map(count => (
                <button
                  key={count}
                  onClick={() => setQuestionLimit(count as any)}
                  className={`px-3.5 py-1.5 rounded-full font-mono font-bold uppercase transition-all cursor-pointer ${
                    questionLimit === count ? "bg-geoCyan text-gray-950 shadow-md" : "bg-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUIZ_CATEGORIES.filter(c => {
              if (activeGroupTab === "flags") return c.type === "globe_flags";
              if (activeGroupTab === "countries") return c.type === "globe_countries";
              if (activeGroupTab === "capitals") return c.type === "globe_capitals";
              if (activeGroupTab === "mixed") return c.type === "globe_mixed";
              return c.type === "map_pins";
            }).map(category => {
              const IconComp = category.icon;
              const isSelected = selectedCategory.id === category.id;

              return (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`relative rounded-3xl p-5 border bg-gradient-to-br ${category.color} transition-all cursor-pointer group hover:scale-[1.02] flex flex-col justify-between ${
                    isSelected ? "ring-2 ring-geoYellow shadow-2xl" : "bg-gray-900/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-black/60 border border-white/15 flex items-center justify-center shrink-0">
                        <IconComp className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black/50 px-2.5 py-1 rounded-full border border-white/10">
                        {category.badge}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-white group-hover:text-geoYellow transition-colors mb-1">
                      {category.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-normal">
                      {category.subtitle}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(category);
                      handleStartGame();
                    }}
                    className="mt-5 w-full bg-geoYellow hover:bg-geoCyan text-gray-950 font-black py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Start Challenge</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. ACTIVE GAMEPLAY VIEW (3D GLOBE / MAP INTERACTIVE)
         ───────────────────────────────────────────────────────────── */}
      {isGameActive && (
        <div className="space-y-6">
          {/* Top Scoreboard Bar */}
          <div className="grid grid-cols-3 gap-3 bg-gray-900/80 p-4 rounded-3xl border border-white/10 backdrop-blur-xl text-center">
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase block mb-0.5">SCORE</span>
              <span className="text-xl font-black text-geoYellow">{score}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase block mb-0.5">PROGRESS</span>
              <span className="text-xl font-black text-white">
                {currentIdx + 1} / {questions.length}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase block mb-0.5">STREAK</span>
              <span className="text-xl font-black text-geoCyan flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span>{streak}</span>
              </span>
            </div>
          </div>

          {/* Active Question Prompt Banner */}
          {currentQuestion && (
            <div className="bg-gray-950/90 border border-white/15 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl text-center space-y-3">
              {selectedCategory.type === "globe_flags" && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-12 rounded-lg overflow-hidden border-2 border-white/30 shadow-2xl">
                    <img
                      src={`https://flagcdn.com/w320/${currentQuestion.code.toLowerCase()}.png`}
                      alt="Question Flag"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-lg font-black text-white">Which country's flag is this?</h3>
                </div>
              )}

              {selectedCategory.type === "globe_capitals" && (
                <div>
                  <span className="text-xs font-mono text-geoYellow uppercase tracking-wider block mb-1">CAPITAL CITY</span>
                  <h3 className="text-2xl font-black text-white">{currentQuestion.capital}</h3>
                  <p className="text-xs text-gray-400 mt-1">Which country has this capital city?</p>
                </div>
              )}

              {selectedCategory.type === "globe_countries" && (
                <div>
                  <span className="text-xs font-mono text-geoCyan uppercase tracking-wider block mb-1">TARGET NATION</span>
                  <h3 className="text-2xl font-black text-white">{currentQuestion.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">Locate and tap this country on the 3D globe!</p>
                </div>
              )}

              {selectedCategory.type === "globe_mixed" && (
                <div>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block mb-1">MIXED CHALLENGE</span>
                  <h3 className="text-2xl font-black text-white">{currentQuestion.name} ({currentQuestion.capital})</h3>
                  <p className="text-xs text-gray-400 mt-1">Tap the matching country on the 3D globe!</p>
                </div>
              )}

              {/* Feedback Banner */}
              {feedback.status && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-3 rounded-2xl text-xs font-bold ${
                    feedback.status === "correct" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  }`}
                >
                  {feedback.text}
                </motion.div>
              )}
            </div>
          )}

          {/* Interactive 3D Canvas Globe Game Arena */}
          <div className="relative rounded-[2.5rem] border border-white/10 bg-gray-900/50 shadow-2xl overflow-hidden h-[480px] sm:h-[550px] flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              style={{ width: "100%", height: "100%", display: "block" }}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Instruction Overlay */}
            <div className="absolute bottom-4 left-4 z-20 text-[11px] font-mono text-gray-400 bg-black/60 px-4 py-1.5 rounded-full border border-white/10">
              Tap any country to answer!
            </div>
          </div>
        </div>
      )}

      {/* Game Over Results Modal */}
      <AnimatePresence>
        {isGameOver && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#080d1a] border border-white/20 rounded-[2.5rem] w-full max-w-md p-6 sm:p-8 text-center shadow-2xl space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-geoYellow/20 border-2 border-geoYellow text-geoYellow mx-auto flex items-center justify-center shadow-lg">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-geoCyan uppercase tracking-widest block mb-1">CHALLENGE COMPLETE</span>
                <h2 className="text-3xl font-black text-white">Awesome Job!</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-2xl border border-white/10 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5 font-semibold">FINAL SCORE</span>
                  <span className="text-2xl font-black text-geoYellow">{score}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 font-semibold">BEST STREAK</span>
                  <span className="text-2xl font-black text-geoCyan">{bestStreak}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsGameActive(false)}
                  className="w-1/2 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Lobby
                </button>
                <button
                  onClick={handleStartGame}
                  className="w-1/2 bg-geoYellow hover:bg-geoCyan text-gray-950 font-black py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  Play Again ➔
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
