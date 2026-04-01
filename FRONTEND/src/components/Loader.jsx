function Loader({ label = "Loading workspace..." }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-[2rem] border border-white/10 bg-white/8 p-10 text-center shadow-[0_20px_80px_rgba(15,23,42,0.25)] backdrop-blur-2xl">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-cyan-300 border-r-indigo-400" />
      </div>
      <p className="text-sm font-medium text-slate-300">{label}</p>
    </div>
  );
}

export default Loader;
