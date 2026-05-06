import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  let verificationSuccess = false

  // Fluxo PKCE: Supabase envia um "code" que trocamos por sessão
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      verificationSuccess = true
    }
  }
  // Fluxo implícito: Supabase envia token_hash + type
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })
    if (!error) {
      verificationSuccess = true
    }
  }

  if (verificationSuccess) {
    // Faz sign out para que o usuário precise logar manualmente
    await supabase.auth.signOut()

    // Redireciona para o login com mensagem de sucesso
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('verified', 'true')
    return NextResponse.redirect(redirectUrl)
  }

  // Se deu erro, redireciona para login com mensagem de erro
  const redirectUrl = new URL('/login', request.url)
  redirectUrl.searchParams.set('error', 'verification_failed')
  return NextResponse.redirect(redirectUrl)
}
