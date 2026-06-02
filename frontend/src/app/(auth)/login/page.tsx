import { LoginForm } from "@/components/organisms/LoginForm";
import { DynamicLogo } from "@/components/molecules/DynamicLogo";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--yuriana-sidebar-bg)] flex flex-col items-center justify-center p-4 select-none">
      <div className="mb-6 text-center space-y-4">
        <h1 className="text-4xl font-black text-white uppercase tracking-wider drop-shadow-md">
          Yuriana S.R.L.
        </h1>
        <div className="animate-in fade-in zoom-in-75 duration-500 flex justify-center">
          <DynamicLogo size={150} />
        </div>
      </div>

      <LoginForm />
    </main>
  );
}