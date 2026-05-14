interface TopBarTitleProps {
  title: string;
}

export const TopBarTitle = ({ title }: TopBarTitleProps) => {
  return (
    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider drop-shadow-md">
      {title}
    </h1>
  );
};