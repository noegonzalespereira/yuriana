import Image from "next/image";

interface LogoProps {
  size?: number;
}

export const Logo = ({ size = 150 }: LogoProps) => {
  return (
    <div 
      className="bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-yuriana-orange/20"
      style={{ width: size, height: size }}
    >
      <Image 
        src="/logo-yuriana.png" 
        alt="Yuriana S.R.L. Logo" 
        width={size * 0.8} 
        height={size * 0.8} 
        priority
      />
    </div>
  );
};