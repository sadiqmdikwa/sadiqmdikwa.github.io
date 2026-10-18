import { useEffect } from "react";
import { Sparkles } from "lucide-react";

interface AdBannerProps {
  slotId?: string;
  adClient?: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
}

export default function AdBanner({
  slotId = "1234567890",
  adClient = "ca-pub-7053832075827963",
  format = "auto",
  className = ""
}: AdBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn("AdSense push notice:", e);
    }
  }, [slotId, adClient]);

  return (
    <div className={`w-full max-w-lg mx-auto bg-gray-950/80 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] p-2.5 sm:p-3.5 border border-white/10 shadow-xl overflow-hidden my-2 sm:my-4 text-left transition-all ${className}`}>
      {/* Top Header Label */}
      <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1 px-1">
        <span className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-geoYellow animate-pulse" />
          <span>Advertisement</span>
        </span>
        <span className="text-gray-600">Google AdSense</span>
      </div>

      {/* Official Live Google AdSense Unit - Fixed Mobile Height Constraint */}
      <div className="h-[90px] sm:h-[100px] flex items-center justify-center bg-black/40 rounded-xl sm:rounded-2xl border border-white/5 p-1 overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "90px", maxHeight: "100px" }}
          data-ad-client={adClient}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  );
}
