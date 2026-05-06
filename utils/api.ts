import { createClient } from '@/utils/supabase/client'

const API_BASE_URL = 'http://localhost:8080'

/**
 * Faz uma requisição autenticada para o backend Sletter.
 * Envia automaticamente o token de sessão do Supabase como Bearer token.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('Usuário não autenticado.')
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(
      errorData?.detail || `Erro ${response.status}: ${response.statusText}`
    )
  }

  return response.json()
}
