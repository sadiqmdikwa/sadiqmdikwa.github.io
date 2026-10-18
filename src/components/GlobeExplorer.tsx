import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import * as d3 from "d3-geo";
import * as topojson from "topojson-client";
import { X, Globe as GlobeIcon, Search, ZoomIn, ZoomOut, RotateCcw, Trophy, ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import AdBanner from "./AdBanner";
import { CountryData, COUNTRY_DATABASE, loadLiveGlobeCountries } from "../data/globeDataSource";

const COUNTRY_COLORS = ["#388e3c", "#fbc02d", "#d32f2f", "#1976d2", "#7b1fa2", "#e65100", "#00796b", "#0288d1", "#c2185b", "#512da8"];

function getCountryColor(name: string): string {
  if (!name) return "#388e3c";
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COUNTRY_COLORS[hash % COUNTRY_COLORS.length];
}

export default function GlobeExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const [countriesMap, setCountriesMap] = useState<{ [key: string]: CountryData }>(COUNTRY_DATABASE);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null);
  const [worldGeoJson, setWorldGeoJson] = useState<any | null>(null);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Live Autocomplete Search State
  const [searchInput, setSearchInput] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  const rotationRef = useRef<[number, number, number]>([-10, -15, 0]);
  const targetRotationRef = useRef<[number, number, number]>([-10, -15, 0]);
  const scaleRef = useRef<number>(280);
  const targetScaleRef = useRef<number>(280);
  const isDraggingRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);

  const filteredCountryNames = Object.keys(countriesMap).filter(name =>
    name.toLowerCase().includes(searchInput.toLowerCase().trim())
  );

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

  // Native non-passive wheel event listener allowing DEEP VECTOR ZOOM
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsAutoSpinning(false);
      if (e.deltaY < 0) {
        targetScaleRef.current = Math.min(1400, targetScaleRef.current + 80);
      } else {
        targetScaleRef.current = Math.max(140, targetScaleRef.current - 80);
      }
    };

    canvas.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", onNativeWheel);
    };
  }, []);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth || 1000;
        canvas.height = parent.clientHeight || 750;
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Shortest modulo 360 angle path interpolation
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
      if (worldGeoJson && worldGeoJson.features) {
        worldGeoJson.features.forEach((feature: any) => {
          const countryName = feature.properties?.name || "Country";
          const isSelected = selectedCountry && (selectedCountry.name === countryName || countryName.includes(selectedCountry.name));
          const isHovered = hoveredCountryName && countryName === hoveredCountryName;

          ctx.beginPath();
          path(feature);

          ctx.fillStyle = isSelected ? "#F4D03F" : isHovered ? "rgba(66, 194, 203, 0.8)" : getCountryColor(countryName);
          ctx.fill();

          ctx.lineWidth = isSelected || isHovered ? 1.8 : 0.4;
          ctx.strokeStyle = isSelected || isHovered ? "#ffffff" : "rgba(10, 20, 30, 0.6)";
          ctx.stroke();
        });
      }

      if (isAutoSpinning && !isDraggingRef.current) {
        targetRotationRef.current[0] += 0.2;
        rotationRef.current[0] = targetRotationRef.current[0];
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", updateSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [worldGeoJson, selectedCountry, hoveredCountryName, isAutoSpinning]);

  // Mouse Mouse Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsAutoSpinning(false);
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    startMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;

      if (Math.abs(e.clientX - startMouseRef.current.x) > 5 || Math.abs(e.clientY - startMouseRef.current.y) > 5) {
        hasDraggedRef.current = true;
      }

      targetRotationRef.current[0] += dx * 0.4;
      targetRotationRef.current[1] -= dy * 0.4;
      rotationRef.current[0] = targetRotationRef.current[0];
      rotationRef.current[1] = targetRotationRef.current[1];

      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }

    if (canvasRef.current && worldGeoJson) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const projection = d3.geoOrthographic()
        .scale(scaleRef.current)
        .translate([canvasRef.current.width / 2, canvasRef.current.height / 2])
        .rotate(rotationRef.current);

      const coords = projection.invert?.([x, y]);
      if (coords) {
        const hoveredCountry = worldGeoJson.features.find((f: any) => d3.geoContains(f, coords));
        if (hoveredCountry && hoveredCountry.properties?.name) {
          setHoveredCountryName(hoveredCountry.properties.name);
        } else {
          setHoveredCountryName(null);
        }
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Mobile Touch Controls (Single Finger Drag + Two-Finger Pinch-To-Zoom)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsAutoSpinning(false);
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      const touch = e.touches[0];
      lastMouseRef.current = { x: touch.clientX, y: touch.clientY };
      startMouseRef.current = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      touchStartDistRef.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastMouseRef.current.x;
      const dy = touch.clientY - lastMouseRef.current.y;

      if (Math.abs(touch.clientX - startMouseRef.current.x) > 5 || Math.abs(touch.clientY - startMouseRef.current.y) > 5) {
        hasDraggedRef.current = true;
      }

      targetRotationRef.current[0] += dx * 0.4;
      targetRotationRef.current[1] -= dy * 0.4;
      rotationRef.current[0] = targetRotationRef.current[0];
      rotationRef.current[1] = targetRotationRef.current[1];

      lastMouseRef.current = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const diff = dist - touchStartDistRef.current;

      targetScaleRef.current = Math.min(1400, Math.max(140, targetScaleRef.current + diff * 1.5));
      touchStartDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    touchStartDistRef.current = null;
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    setIsAutoSpinning(false);
    setIsSearchDropdownOpen(false);

    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

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

    if (clickedCountry) {
      const rawName = clickedCountry.properties?.name || "";
      const country: CountryData = countriesMap[rawName] || {
        name: rawName || "Selected Territory",
        code: rawName.substring(0, 2).toUpperCase() || "UN",
        capital: "Capital Region",
        population: "Estimated 10M+ people",
        region: "Global Frontier",
        area: "50,000+ km²",
        languages: "Official / Regional",
        lat: coords[1],
        lng: coords[0]
      };
      setSelectedCountry(country);
      targetScaleRef.current = 850;
      targetRotationRef.current = [-country.lng, -country.lat, 0];
    }
  };

  const handleZoomIn = () => {
    setIsAutoSpinning(false);
    targetScaleRef.current = Math.min(1400, targetScaleRef.current + 120);
  };

  const handleZoomOut = () => {
    setIsAutoSpinning(false);
    targetScaleRef.current = Math.max(140, targetScaleRef.current - 120);
  };

  const handleResetView = () => {
    targetRotationRef.current = [-10, -15, 0];
    targetScaleRef.current = 280;
    setSelectedCountry(null);
    setIsAutoSpinning(true);
  };

  const handleSearchSelect = (countryName: string) => {
    setIsAutoSpinning(false);
    const country = countriesMap[countryName];
    if (country) {
      setSelectedCountry(country);
      targetScaleRef.current = 850;
      targetRotationRef.current = [-country.lng, -country.lat, 0];
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full pb-20 font-sans text-white"
    >
      {/* Top Navigation Row */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-gray-900/40 hover:bg-gray-900/80 text-gray-300 hover:text-white px-4 py-2 rounded-full border border-white/10 transition-all text-xs font-semibold backdrop-blur-xl hover:border-geoCyan/40 active:scale-95 shadow-sm group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-geoCyan group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      {/* Minimalist Page Header */}
      <header className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 text-geoCyan font-semibold uppercase tracking-wider text-xs mb-2 bg-geoCyan/10 px-3 py-1 rounded-full border border-geoCyan/20">
            <GlobeIcon className="w-3.5 h-3.5" />
            Cartographic Atlas
          </div>
          <h1 className="text-3xl md:text-5xl text-white font-extrabold tracking-tight mb-2">
            3D Vector Globe Atlas
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Hover to highlight country borders, click to fill with color and smoothly zoom in. Mobile pinch-to-zoom supported.
          </p>
        </div>
        <div className="lg:col-span-5">
          <AdBanner slotId="globe-explorer-header-slot" className="my-0" />
        </div>
      </header>

      {/* Map Card Shell */}
      <div className="relative rounded-[2.5rem] border border-white/10 bg-gray-900/50 shadow-2xl backdrop-blur-xl overflow-hidden p-0 h-[650px] md:h-[720px] flex items-center justify-center">
        {/* Top Floating Search & Quiz Bar */}
        <div className="absolute top-5 left-5 right-5 z-30 flex items-center justify-between gap-3 pointer-events-none">
          {/* Live Typing Autocomplete Search Input (Press Enter to Search & Zoom!) */}
          <div className="relative pointer-events-auto hidden md:block w-64">
            <div className="flex items-center gap-2 bg-gray-900/90 border border-white/15 rounded-full px-3.5 py-2 backdrop-blur-xl shadow-2xl focus-within:border-geoCyan/60">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setIsSearchDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredCountryNames.length > 0) {
                    e.preventDefault();
                    const firstName = filteredCountryNames[0];
                    handleSearchSelect(firstName);
                    setSearchInput(firstName);
                    setIsSearchDropdownOpen(false);
                  }
                }}
                placeholder="Type country name..."
                className="w-full bg-transparent text-white text-xs outline-none placeholder-gray-500 font-medium"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setIsSearchDropdownOpen(false);
                  }}
                  className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Live Dropdown Results */}
            {isSearchDropdownOpen && filteredCountryNames.length > 0 && (
              <div className="absolute top-11 left-0 right-0 max-h-56 overflow-y-auto bg-gray-950/95 border border-white/15 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl text-xs space-y-1 video-preview-scroll z-50">
                {filteredCountryNames.map(name => {
                  const item = countriesMap[name];
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        handleSearchSelect(name);
                        setSearchInput(name);
                        setIsSearchDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-geoCyan/15 hover:text-geoCyan flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="font-bold text-white truncate">{name}</span>
                      <span className="text-[10px] font-mono text-geoCyan shrink-0 ml-2">{item?.code || "UN"}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pointer-events-auto ml-auto">
            <button
              onClick={() => navigate("/game")}
              className="inline-flex items-center gap-2 bg-geoYellow hover:bg-geoCyan text-gray-950 px-5 py-2 rounded-full border border-geoYellow/40 transition-all text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Start Quiz</span>
            </button>
          </div>
        </div>

        {/* 2D/3D Canvas Vector Globe with Mouse and Mobile Pinch-To-Zoom Touch Event Handlers */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleCanvasClick}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            touchAction: "none"
          }}
          className={`w-full h-full object-contain ${hoveredCountryName ? "cursor-pointer" : "cursor-grab"} active:cursor-grabbing`}
        />

        {/* Control Overlay Instructions */}
        <div className="absolute bottom-5 left-5 z-30 flex items-center gap-2 text-[11px] font-mono text-gray-400 bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md pointer-events-none">
          <span className="text-geoCyan font-bold">pinch/scroll</span> zoom • <span className="text-geoCyan font-bold">drag</span> rotate
        </div>

        {/* Bottom Left Floating Zoom Buttons */}
        <div className="absolute bottom-16 left-5 z-30 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-white/15 text-white flex items-center justify-center shadow-xl backdrop-blur-xl transition-all cursor-pointer hover:border-geoCyan/60 text-lg font-bold"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-white/15 text-white flex items-center justify-center shadow-xl backdrop-blur-xl transition-all cursor-pointer hover:border-geoCyan/60 text-lg font-bold"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleResetView}
            className="w-10 h-10 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-white/15 text-white flex items-center justify-center shadow-xl backdrop-blur-xl transition-all cursor-pointer hover:border-geoCyan/60"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-geoYellow" />
          </button>
        </div>

        {/* Compact Refined Popup Card Above Map */}
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-[310px] bg-[#080d1a]/95 text-white rounded-2xl p-3.5 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-2.5"
          >
            {/* Top Row: Flag (Increased size with hover zoom) + Close Button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-11 h-7 rounded-md overflow-hidden shadow-md border border-white/20 hover:scale-110 transition-transform duration-300">
                  <img
                    src={`https://flagcdn.com/w160/${selectedCountry.code.toLowerCase()}.png`}
                    alt={selectedCountry.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-geoCyan uppercase tracking-widest">{selectedCountry.code}</span>
              </div>

              <button
                onClick={() => {
                  setSelectedCountry(null);
                  targetScaleRef.current = 280;
                }}
                className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Date */}
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-black text-white tracking-tight leading-tight truncate">
                  {selectedCountry.name}
                </h3>
                <span className="text-[10px] text-gray-400 font-mono font-medium shrink-0">(as of 2026)</span>
              </div>
            </div>

            {/* Table: Capital, Population, Continent ONLY, Area, Languages */}
            <div className="space-y-1 text-xs border-y border-white/10 py-2">
              {selectedCountry.capital && (
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-gray-400 font-semibold text-[10px] uppercase">Capital</span>
                  <span className="font-bold text-white text-[11px] truncate max-w-[140px] text-right">{selectedCountry.capital}</span>
                </div>
              )}
              {selectedCountry.population && (
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-gray-400 font-semibold text-[10px] uppercase">Population</span>
                  <span className="font-bold text-white text-[11px]">{selectedCountry.population}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-400 font-semibold text-[10px] uppercase">Continent</span>
                <span className="font-bold text-geoYellow text-[11px] truncate">{selectedCountry.region.split("•")[0]?.trim() || "Global"}</span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-400 font-semibold text-[10px] uppercase">Total Area</span>
                <span className="font-bold text-white text-[11px]">{selectedCountry.area}</span>
              </div>
              {selectedCountry.languages && (
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-gray-400 font-semibold text-[10px] uppercase">Language(s)</span>
                  <span className="font-bold text-white text-[11px] truncate max-w-[140px] text-right">{selectedCountry.languages}</span>
                </div>
              )}
            </div>

            {/* Footer Row: Coordinates + Read More */}
            <div className="pt-0.5 flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] text-gray-400">
                📍 {selectedCountry.lat.toFixed(2)}°, {selectedCountry.lng.toFixed(2)}°
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-geoCyan hover:text-geoYellow font-extrabold uppercase tracking-wider text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Read More</span>
                <span>➔</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Video Preview Modal Style Detail Modal with Circular Stamp from Screenshot 2 */}
      <AnimatePresence>
        {isModalOpen && selectedCountry && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#080e1a] border border-white/20 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto video-preview-scroll space-y-6">
                {/* Circular Stamp Badge from Screenshot 2 */}
                <div className="flex flex-col items-center text-center pt-2">
                  <div className="relative w-40 h-40 rounded-full border-2 border-dashed border-geoYellow/70 flex flex-col items-center justify-center p-3 shadow-inner bg-black/40">
                    <div className="absolute inset-0 flex items-center justify-center animate-[spin_30s_linear_infinite] pointer-events-none">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 160 160">
                        <defs>
                          <path id="modalStampPath" d="M 18, 80 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0" />
                        </defs>
                        <text className="text-[10px] font-mono tracking-[0.25em] uppercase" fill="#F4D03F">
                          <textPath href="#modalStampPath" startOffset="0%">
                            ★ GEO-GLOBE ★ EXPLORATION ★ DISCOVERY ★
                          </textPath>
                        </text>
                      </svg>
                    </div>

                    {/* Large Flag Image */}
                    <div className="w-16 h-11 rounded-lg overflow-hidden shadow-lg border border-white/20 mb-1">
                      <img
                        src={`https://flagcdn.com/w320/${selectedCountry.code.toLowerCase()}.png`}
                        alt={selectedCountry.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <h2 className="text-xl font-black text-white tracking-tight leading-tight">{selectedCountry.name}</h2>
                    <span className="text-[10px] font-mono font-bold text-geoCyan uppercase">{selectedCountry.code}</span>
                  </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm bg-black/30 p-4 rounded-2xl border border-white/10">
                  {selectedCountry.capital && (
                    <div className="flex justify-between items-center pb-2 sm:pb-0 border-b sm:border-b-0 border-white/5">
                      <span className="text-gray-400 font-semibold uppercase text-[10px]">Capital</span>
                      <span className="font-bold text-white text-right">{selectedCountry.capital}</span>
                    </div>
                  )}
                  {selectedCountry.population && (
                    <div className="flex justify-between items-center pb-2 sm:pb-0 border-b sm:border-b-0 border-white/5">
                      <span className="text-gray-400 font-semibold uppercase text-[10px]">Population</span>
                      <span className="font-bold text-white text-right">{selectedCountry.population}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pb-2 sm:pb-0 border-b sm:border-b-0 border-white/5">
                    <span className="text-gray-400 font-semibold uppercase text-[10px]">Continent & Region</span>
                    <span className="font-bold text-geoYellow text-right text-xs">{selectedCountry.region}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 sm:pb-0 border-b sm:border-b-0 border-white/5">
                    <span className="text-gray-400 font-semibold uppercase text-[10px]">Total Area</span>
                    <span className="font-bold text-white text-right">{selectedCountry.area}</span>
                  </div>
                  {selectedCountry.languages && (
                    <div className="flex justify-between items-center sm:col-span-2 pt-2 border-t border-white/5">
                      <span className="text-gray-400 font-semibold uppercase text-[10px]">Official Language(s)</span>
                      <span className="font-bold text-white text-right">{selectedCountry.languages}</span>
                    </div>
                  )}
                </div>

                {/* Detailed Geographic Overview & Description + Wikipedia Link */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-geoCyan flex items-center gap-1.5">
                    <span>Geographic & Historical Overview</span>
                  </h4>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-normal bg-black/20 p-4 rounded-2xl border border-white/5">
                    {selectedCountry.desc || `${selectedCountry.name} is a sovereign nation located in ${selectedCountry.region}. It has a capital in ${selectedCountry.capital || "N/A"}, a total land area of ${selectedCountry.area}, and a population of ${selectedCountry.population || "N/A"}.`}
                  </p>

                  {/* Wikipedia Research Link */}
                  {selectedCountry.wikiUrl && (
                    <div className="pt-2">
                      <a
                        href={selectedCountry.wikiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-geoCyan hover:text-geoYellow transition-colors bg-geoCyan/10 hover:bg-geoCyan/20 px-4 py-2.5 rounded-xl border border-geoCyan/30"
                      >
                        <span>Learn more on Wikipedia</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-5 bg-black/40 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate(`/map?lat=${selectedCountry.lat}&lng=${selectedCountry.lng}&from=explorer`);
                  }}
                  className="w-full bg-geoCyan hover:bg-geoYellow text-gray-950 font-extrabold py-3.5 rounded-full transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <MapPin className="w-4 h-4" />
                  <span>View on Interactive Map</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
