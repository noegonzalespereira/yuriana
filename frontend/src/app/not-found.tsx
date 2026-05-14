import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold text-yuriana-primary mb-4">Página no encontrada</h2>
      <p className="text-gray-600 mb-6">Lo sentimos, no pudimos encontrar el recurso solicitado.</p>
      <Link href="/login">
        <Button className="bg-yuriana-primary hover:bg-yuriana-accent">
          Volver al Inicio
        </Button>
      </Link>
    </div>
  )
}