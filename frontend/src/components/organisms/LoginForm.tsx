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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
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
          className="w-2/3 bg-yuriana-yellow hover:bg-yuriana-yellow/90 text-white rounded-full py-6 text-xl font-bold"
        >
          {loading ? <Loader className="animate-spin" /> : "Ingresar"}
        </Button>
      </div>
    </form>
  );
};