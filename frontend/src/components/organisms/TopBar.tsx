interface TopBarProps {
  title: string;
  subtitle: string;
}

export const TopBar = ({ title, subtitle }: TopBarProps) => {
  return (
    <div className="w-full bg-yuriana-orange rounded-2xl p-6 text-center text-white mb-8 shadow-lg border-b-4 border-black/10 transition-all">
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest drop-shadow-md">
        {title}
      </h1>
      <div className="flex items-center justify-center gap-2 mt-1">
        <p className="text-xs md:text-sm font-medium opacity-90 italic">
          {subtitle}
        </p>
      </div>
    </div>
  );
};