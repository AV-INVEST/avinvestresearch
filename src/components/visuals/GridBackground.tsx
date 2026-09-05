export default function GridBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-trading bg-grid-trading opacity-80 mask-fade-y" />
      <div className="absolute inset-x-0 -top-40 h-[40rem] bg-radial-glow opacity-70" />
      <div className="absolute -bottom-32 left-1/2 h-[30rem] w-[80%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,255,106,0.10),transparent_60%)]" />
    </div>
  );
}
