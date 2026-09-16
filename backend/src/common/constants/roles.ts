/**
 * Nombres de rol tal como se guardan en la tabla `rol` (columna `nombre`) y
 * tal como viajan en el JWT (`payload.rol`). Usar esta constante en los
 * decoradores @Roles(...) en vez de escribir el string a mano, para que un
 * typo lo marque el editor/compilador en vez de fallar en silencio.
 */
export const ROL = {
  ADMIN: 'ADMIN',
  CONTADOR: 'CONTADOR',
} as const;
