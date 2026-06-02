import Image from "next/image";

interface LogoProps {
  size?: number;
  src?: string;
}

export const Logo = ({ size = 150, src = "/logo-yuriana.png" }: LogoProps) => {
  return (
    <div
      className="bg-[var(--yuriana-base-white)] rounded-full flex items-center justify-center shadow-xl border-4 border-[var(--yuriana-card-border)]"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt="Yuriana S.R.L. Logo"
        width={size * 0.8}
        height={size * 0.8}
        priority
        unoptimized={src.startsWith("http")}
        className="rounded-full object-contain"
      />
    </div>
  );
};
