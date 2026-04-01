function SectionCard({ title, description, actions, children }) {
  return (
    <section className="rounded-[2rem] border border-white/12 bg-white/8 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export default SectionCard;
