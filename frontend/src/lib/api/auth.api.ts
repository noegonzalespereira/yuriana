// src/lib/api/auth.api.ts
import { LoginDto, AuthResponse } from "@/types/auth.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const loginRequest = async (credentials: LoginDto): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    // Captura el UnauthorizedException de tu NestJS
    throw new Error(errorData.message || "Credenciales incorrectas");
  }

  return response.json();
};