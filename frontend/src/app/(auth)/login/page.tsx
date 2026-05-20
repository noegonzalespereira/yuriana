import { LoginForm } from "@/components/organisms/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--yuriana-sidebar-bg)] flex flex-col items-center justify-center p-4 select-none">
      <div className="mb-6 text-center space-y-4">
        <h1 className="text-4xl font-black text-white uppercase tracking-wider drop-shadow-md">
          Yuriana S.R.L.
        </h1>
        <div className="bg-[var(--yuriana-base-white)] rounded-full p-6 w-44 h-44 flex items-center justify-center mx-auto shadow-2xl border-4 border-white/20 animate-in fade-in zoom-in-75 duration-500">
          <Image src="/logo-yuriana.png" alt="Yuriana Logo" width={130} height={130} priority />
        </div>
      </div>
      
      <LoginForm />
    </main>
  );
}