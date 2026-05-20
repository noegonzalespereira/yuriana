import { ModuleHeader } from "@/components/organisms/ModuleHeader";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <ModuleHeader 
        title="Dashboard Principal" 
        subtitle="Panel de control de transporte y logística - Yuriana S.R.L." 
      />

      {/* Grid de Cards de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* <StatCard title="Ingresos Totales" value="45023000" unit="Bs" color="border-orange-500" />
        <StatCard title="Gastos Totales" value="1230154" unit="Bs" color="border-green-500" />
        <StatCard title="Total Pagos por Cobrar" value="145841" unit="Bs" color="border-blue-500" />
        <StatCard title="Total Pagos Cobrados" value="351246300" unit="Bs" color="border-black" /> */}
      </div>

      {/* Aquí irían los organismos de Tablas y Estado de Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
              {/* <EstadoResultados /> */}
          </div>
          <div>
              {/* <DocumentosVencidos /> */}
          </div>
      </div>
    </div>
  );
}