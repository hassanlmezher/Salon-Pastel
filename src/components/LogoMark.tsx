export function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/70 bg-gradient-to-br from-[#f6e9db] via-[#f0decb] to-[#d4b98f] shadow-soft">
        <span className="font-display text-2xl italic text-gold-700">P</span>
      </div>
      <div>
        <p className="font-display text-[2rem] leading-none text-ink sm:text-[2.35rem]">
          Salon Pastel
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.35em] text-taupe/80">
          Quiet luxury booking
        </p>
      </div>
    </div>
  );
}
