import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy, Flag, Globe, Compass, Sparkles, Clock, Flame,
  RotateCcw, CheckCircle2, XCircle, ArrowRight, X
} from "lucide-react";
import { CountryData } from "../../data/globeDataSource";

export type GlobeQuizCategory = "flags" | "countries" | "capitals" | "mixed";
export type GlobeQuizRegion = "Global" | "Africa" | "Asia" | "Europe" | "North America" | "South America" | "Oceania";

export interface GlobeQuizQuestion {
  id: string;
  countryName: string;
  code: string;
  capital: string;
  region: string;
  lat: number;
  lng: number;
  promptType: "flag" | "country" | "capital";
}

interface GlobeQuizOverlayProps {
  countriesMap: { [key: string]: CountryData };
  onClose: () => void;
  onSelectTargetCountry: (countryName: string) => void;
  activeQuestion: GlobeQuizQuestion | null;
  quizStatus: "idle" | "playing" | "correct" | "incorrect" | "summary";
  score: number;
  streak: number;
  timeLeft: number;
  currentStep: number;
  totalSteps: number;
  onNextQuestion: () => void;
  onRestartQuiz: (cat: GlobeQuizCategory, reg: GlobeQuizRegion) => void;
  selectedCategory: GlobeQuizCategory;
  selectedRegion: GlobeQuizRegion;
  onCategoryChange: (cat: GlobeQuizCategory) => void;
  onRegionChange: (reg: GlobeQuizRegion) => void;
}

export default function GlobeQuizOverlay({
  onClose,
  activeQuestion,
  quizStatus,
  score,
  streak,
  timeLeft,
  currentStep,
  totalSteps,
  onNextQuestion,
  onRestartQuiz,
  selectedCategory,
  selectedRegion,
  onCategoryChange,
  onRegionChange,
}: GlobeQuizOverlayProps) {
  return (
    <div className="absolute inset-x-0 top-0 z-40 p-4 sm:p-5 pointer-events-none flex flex-col items-center gap-3">
      {/* Top Controller Bar */}
      <div className="pointer-events-auto w-full max-w-2xl bg-gray-950/90 border border-white/15 rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-2xl flex flex-col gap-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-geoYellow animate-pulse"></span>
            <span className="text-xs font-black text-white tracking-tight uppercase font-mono">
              3D Globe Quiz Engine
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1 text-geoYellow font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>{score} pts</span>
            </div>

            {streak > 0 && (
              <div className="flex items-center gap-1 text-orange-400 font-bold animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{streak}x</span>
              </div>
            )}

            <div className={`flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full border ${
              timeLeft <= 5 ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse" : "bg-black/50 text-geoCyan border-white/10"
            }`}>
              <Clock className="w-3 h-3" />
              <span>{timeLeft}s</span>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
              title="Exit 3D Quiz"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category & Region Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Categories */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-full border border-white/10">
            <button
              onClick={() => onCategoryChange("flags")}
              className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                selectedCategory === "flags" ? "bg-geoYellow text-gray-950 shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              🚩 Flags
            </button>
            <button
              onClick={() => onCategoryChange("countries")}
              className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                selectedCategory === "countries" ? "bg-geoYellow text-gray-950 shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              🌍 Countries
            </button>
            <button
              onClick={() => onCategoryChange("capitals")}
              className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                selectedCategory === "capitals" ? "bg-geoYellow text-gray-950 shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              🏛️ Capitals
            </button>
            <button
              onClick={() => onCategoryChange("mixed")}
              className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                selectedCategory === "mixed" ? "bg-geoYellow text-gray-950 shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              🎲 Mixed
            </button>
          </div>

          {/* Regional Selector */}
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value as GlobeQuizRegion)}
            className="bg-black/50 border border-white/10 rounded-full px-3 py-1 text-white text-[11px] outline-none cursor-pointer font-bold"
          >
            <option value="Global">🌐 Global (195)</option>
            <option value="Africa">🌍 Africa</option>
            <option value="Asia">🌏 Asia</option>
            <option value="Europe">🏰 Europe</option>
            <option value="North America">🗽 North America</option>
            <option value="South America">🗿 South America</option>
            <option value="Oceania">🌊 Oceania</option>
          </select>
        </div>
      </div>

      {/* Question Prompt Card Overlay */}
      {activeQuestion && quizStatus !== "summary" && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="pointer-events-auto w-full max-w-md bg-[#080d1a]/95 border border-geoCyan/40 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl text-center space-y-3"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 font-bold uppercase">
            <span className="text-geoCyan">Question {currentStep} of {totalSteps}</span>
            <span>{activeQuestion.region}</span>
          </div>

          {/* Prompt Content */}
          {activeQuestion.promptType === "flag" && (
            <div className="space-y-2">
              <div className="w-16 h-10 rounded-lg overflow-hidden shadow-lg border border-white/20 mx-auto">
                <img
                  src={`https://flagcdn.com/w320/${activeQuestion.code.toLowerCase()}.png`}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Which nation does this flag belong to?
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                Tap the correct country directly on the 3D Globe!
              </p>
            </div>
          )}

          {activeQuestion.promptType === "capital" && (
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-geoYellow font-bold uppercase">CAPITAL CITY PROMPT</span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                "{activeQuestion.capital}"
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                Click the sovereign country on the 3D Globe that has this capital!
              </p>
            </div>
          )}

          {activeQuestion.promptType === "country" && (
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-geoCyan font-bold uppercase">3D GLOBE MARATHON</span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Find "{activeQuestion.countryName}"
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                Locate and click this country on the 3D sphere!
              </p>
            </div>
          )}

          {/* Answer Feedback Banner */}
          {quizStatus === "correct" && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 p-2.5 rounded-2xl text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Correct! +{100 + timeLeft * 10} pts</span>
            </div>
          )}

          {quizStatus === "incorrect" && (
            <div className="bg-rose-950/80 border border-rose-500/50 p-2.5 rounded-2xl text-rose-300 font-bold text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Correct Answer: <strong>{activeQuestion.countryName}</strong></span>
              </div>
              <button
                onClick={onNextQuestion}
                className="bg-geoCyan hover:bg-geoYellow text-gray-950 px-3 py-1 rounded-full font-bold text-[11px] shrink-0 cursor-pointer"
              >
                Next ➔
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Summary Dialog */}
      {quizStatus === "summary" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-auto w-full max-w-md bg-[#080d1a]/95 border border-white/20 rounded-[2.5rem] p-6 shadow-2xl text-center space-y-5 backdrop-blur-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-geoYellow/20 border-2 border-geoYellow text-geoYellow flex items-center justify-center mx-auto shadow-lg">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-geoYellow uppercase tracking-widest block mb-1">3D GLOBE QUIZ COMPLETE</span>
            <h2 className="text-2xl font-black text-white">{selectedRegion} {selectedCategory.toUpperCase()}</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/10 text-center font-mono">
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Total Points</span>
              <span className="text-lg font-black text-geoYellow">{score} pts</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Best Streak</span>
              <span className="text-lg font-black text-orange-400">{streak}x</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onRestartQuiz(selectedCategory, selectedRegion)}
              className="flex-1 bg-geoYellow hover:bg-geoCyan text-gray-950 font-extrabold py-3 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Play Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer"
            >
              Close Quiz
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
