type Props = { size?: number };

export default function PatAvatar({ size = 140 }: Props) {
  const glowSize = Math.round(size * 1.5);
  const innerSize = Math.round(size * 0.8);

  return (
    <div className="relative flex items-center justify-center animate-float sm:max-w-[112px] md:max-w-[140px]">
      {/* Outer glow ring */}
      <div
        className="absolute rounded-full animate-glow bg-[#1a7cf7]/30"
        style={{ width: glowSize, height: glowSize }}
      />
      
      {/* Main circle */}
      <div
        className="relative rounded-full bg-white shadow-[0_0_30px_rgba(26,124,247,0.3)] border-2 border-[#b45cff]/60 flex items-center justify-center animate-pulse-slow"
        style={{ width: size, height: size }}
      >
        {/* Inner circle */}
        <div
          className="rounded-full bg-[#1a7cf7]/10 flex items-center justify-center"
          style={{ width: innerSize, height: innerSize }}
        >
          {/* Pulse dots */}
          <div className="flex gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1a7cf7] animate-pulse" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#1a7cf7] animate-pulse delay-75" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#1a7cf7] animate-pulse delay-150" />
          </div>
        </div>
      </div>
    </div>
  );
}