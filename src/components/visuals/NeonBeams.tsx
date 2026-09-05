export default function NeonBeams() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -left-1/4 top-0 h-[120%] w-40 animate-beam-sweep bg-gradient-to-r from-transparent via-av-green/20 to-transparent blur-2xl" />
        <div
          className="absolute -left-1/4 top-0 h-[120%] w-24 animate-beam-sweep bg-gradient-to-r from-transparent via-av-green/15 to-transparent blur-xl"
          style={{ animationDelay: '2.5s', animationDuration: '9s' }}
        />
      </div>
      <div className="absolute left-1/2 top-[45%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-av-green/20 animate-pulse-glow" />
      <div
        className="absolute right-[10%] top-[30%] h-40 w-40 rounded-full bg-av-green/10 animate-pulse-glow"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="absolute left-[5%] bottom-[15%] h-56 w-56 rounded-full bg-av-green/10 animate-pulse-glow"
        style={{ animationDelay: '0.8s' }}
      />
    </div>
  );
}
