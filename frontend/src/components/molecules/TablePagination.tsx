interface TablePaginationProps {
  pagina: number;
  totalPaginas: number;
  totalRegistros: number;
  registrosMostrados: number;
  onPageChange: (page: number) => void;
}

export const TablePagination = ({
  pagina,
  totalPaginas,
  totalRegistros,
  registrosMostrados,
  onPageChange,
}: TablePaginationProps) => {
  const paginaActual = Math.min(pagina, totalPaginas);

  const pages = Array.from({ length: totalPaginas }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPaginas || Math.abs(p - paginaActual) <= 1)
    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
      <p className="text-xs text-[var(--yuriana-input-placeholder)] font-medium">
        Mostrando {registrosMostrados} de {totalRegistros} registro{totalRegistros !== 1 ? "s" : ""}
      </p>

      {totalPaginas > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, pagina - 1))}
            disabled={paginaActual === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-xs font-bold text-[var(--yuriana-input-placeholder)] hover:border-[var(--yuriana-base-orange)] hover:text-[var(--yuriana-base-orange)] disabled:opacity-30 transition-all"
          >
            ‹
          </button>

          {pages.map((p, i) =>
            p === "..." ? (
              <span
                key={`dots-${i}`}
                className="w-8 h-8 flex items-center justify-center text-xs text-[var(--yuriana-input-placeholder)]"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-black transition-all ${
                  paginaActual === p
                    ? "bg-[var(--yuriana-base-orange)] text-white border-[var(--yuriana-base-orange)] shadow"
                    : "border-border text-[var(--yuriana-input-placeholder)] hover:border-[var(--yuriana-base-orange)] hover:text-[var(--yuriana-base-orange)]"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPaginas, pagina + 1))}
            disabled={paginaActual === totalPaginas}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-xs font-bold text-[var(--yuriana-input-placeholder)] hover:border-[var(--yuriana-base-orange)] hover:text-[var(--yuriana-base-orange)] disabled:opacity-30 transition-all"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};
