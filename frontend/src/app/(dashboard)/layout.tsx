// app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/organisms/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Fijo */}
      <Sidebar />

      {/* Contenedor de Contenido Variable */}
      <div className="flex-1 flex flex-col">
        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}