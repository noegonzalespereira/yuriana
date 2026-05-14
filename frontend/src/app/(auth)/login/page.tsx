import { LoginForm } from "@/components/organisms/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-yuriana-orange flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-6 italic">Iniciar Sesión</h1>
        <div className="bg-white rounded-full p-6 w-48 h-48 flex items-center justify-center mx-auto shadow-xl">
          {/* Aquí va el logo de Yuriana S.R.L */}
          <Image src="/logo-yuriana.png" alt="Yuriana Logo" width={150} height={150} />
        </div>
      </div>
      
      <LoginForm />
    </main>
  );
}