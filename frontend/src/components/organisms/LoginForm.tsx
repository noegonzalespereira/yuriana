"use client";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "../molecules/FormField";
import { Button } from "@/components/ui/button";
import { UserIcon, LockIcon, Loader } from "lucide-react";
import { useState } from "react";

export const LoginForm = () => {
  const { login } = useAuth();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      await login(data.correo, data.password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--yuriana-base-white)] p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-6 border border-slate-100">
      {error && (
        <div className="bg-red-50 text-[var(--yuriana-base-error)] p-3 rounded-xl text-xs text-center font-black uppercase border border-red-200 animate-pulse">
          {error}
        </div>
      )}
      <FormField 
        label="Usuario:" 
        icon={<UserIcon size={20}/>} 
        type="email" 
        placeholder="Introduzca su usuario"
        register={register("correo", { required: true })}
      />
      <FormField 
        label="Contraseña:" 
        icon={<LockIcon size={20}/>} 
        type="password" 
        placeholder="Introduzca su contraseña"
        register={register("password", { required: true })}
      />
      <div className="pt-4 flex justify-center">
        <Button 
          disabled={loading}
          className="w-2/3 bg-[var(--yuriana-base-yellow)] hover:opacity-90 text-[var(--yuriana-base-black)] rounded-full py-6 text-lg font-black uppercase tracking-wider shadow-lg transition-transform active:scale-95"
        >
          {loading ? <Loader className="animate-spin" /> : "Ingresar"}
        </Button>
      </div>
    </form>
  );
};