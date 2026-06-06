const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('yuriana_token') : null;

  // 1. Detectamos si el cuerpo de la petición es un FormData (Multipart/form-data)
  const esMultipart = options.body instanceof FormData;

  const defaultHeaders: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // 2. Solo inyectamos application/json si NO estamos enviando archivos físicos
  if (!esMultipart) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });

  // 3. Control de errores del servidor
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      const hasToken = localStorage.getItem('yuriana_token');
      if (hasToken) {
        window.dispatchEvent(new CustomEvent('yuriana:session-expired'));
      }
    }
    const error = await response.json().catch(() => ({ message: 'Error en el formato o respuesta del servidor' }));
    throw new Error(error.message || 'Error en la petición');
  }

  // 4. Doble verificación para evitar errores de parseo si el backend responde texto plano o vacío
  const contentTypeResponse = response.headers.get("content-type");
  if (contentTypeResponse && contentTypeResponse.includes("application/json")) {
    return response.json();
  }
  
  return response.text() as any;
};