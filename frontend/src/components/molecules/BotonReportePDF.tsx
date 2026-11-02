// src/components/molecules/BotonReportePDF.tsx
"use client";
import { useState, type ReactElement } from "react";
import { Download, Loader2 } from "lucide-react";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";

const CLASE =
  "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--yuriana-base-orange)] text-white text-xs font-black uppercase shadow-md hover:opacity-90";
const CLASE_DISABLED =
  "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--yuriana-base-orange)] text-white text-xs font-black uppercase shadow-md opacity-50 cursor-not-allowed";

interface Props {
  document: ReactElement<DocumentProps>;
  fileName: string;
  disabled?: boolean;
  label?: string;
}

/** Descarga un PDF ya armado con los datos de la pantalla. */
export const BotonReportePDF = ({ document, fileName, disabled, label = "Descargar reporte" }: Props) =>
  disabled ? (
    <button type="button" disabled className={CLASE_DISABLED}>
      <Download size={14} /> {label}
    </button>
  ) : (
    <PDFDownloadLink document={document} fileName={fileName} className={CLASE}>
      {({ loading }: { loading: boolean }) =>
        loading ? (
          <><Loader2 size={14} className="animate-spin" /> Generando...</>
        ) : (
          <><Download size={14} /> {label}</>
        )
      }
    </PDFDownloadLink>
  );

interface PropsGenerar {
  /** Obtiene los datos y devuelve el documento; se ejecuta al hacer clic. */
  onGenerar: () => Promise<{ document: ReactElement<DocumentProps>; fileName: string }>;
  label?: string;
}

/** Descarga un PDF que necesita cargar datos adicionales al momento del clic. */
export const BotonReporteBajoDemanda = ({ onGenerar, label = "Reporte general" }: PropsGenerar) => {
  const [generando, setGenerando] = useState(false);

  const handleClick = async () => {
    setGenerando(true);
    try {
      const { document, fileName } = await onGenerar();
      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // quien llama a onGenerar ya notifica el error
    } finally {
      setGenerando(false);
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={generando} className={generando ? CLASE_DISABLED : CLASE}>
      {generando ? <><Loader2 size={14} className="animate-spin" /> Generando...</> : <><Download size={14} /> {label}</>}
    </button>
  );
};
