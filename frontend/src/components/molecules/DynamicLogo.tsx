"use client";
import { useEffect, useState } from "react";
import { Logo } from "@/components/atoms/Logo";
import { getEmpresa } from "@/lib/api/empresa.api";

interface DynamicLogoProps {
  size?: number;
}

export const DynamicLogo = ({ size = 150 }: DynamicLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    getEmpresa()
      .then((data) => {
        if (data?.logo_url) setLogoUrl(data.logo_url);
      })
      .catch(() => {});
  }, []);

  return <Logo size={size} src={logoUrl || "/logo-yuriana.png"} />;
};
