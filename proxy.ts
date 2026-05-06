import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Configuração padrão do Supabase para ler os Cookies de login
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // O "Segurança" verifica se o usuário tem credencial (está logado)
  const { data: { user } } = await supabase.auth.getUser()

  // Só considera "logado" se o usuário existir E tiver email confirmado
  const isLoggedIn = user && user.email_confirmed_at

  // Para onde o usuário está tentando ir?
  const urlQueOUsuarioQuerIr = request.nextUrl.pathname
  const isAuthRoute = urlQueOUsuarioQuerIr.startsWith('/login') || urlQueOUsuarioQuerIr.startsWith('/signup')
  const isProtectedDashboardRoute =
    urlQueOUsuarioQuerIr.startsWith('/home') ||
    urlQueOUsuarioQuerIr.startsWith('/discover') ||
    urlQueOUsuarioQuerIr.startsWith('/inventory') ||
    urlQueOUsuarioQuerIr.startsWith('/collections')
  const isLandingPage = urlQueOUsuarioQuerIr === '/'

  // REGRA 1: Não tá logado e quer acessar a área restrita (/home)? Manda pro login.
  if (!isLoggedIn && isProtectedDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // REGRA 2: Tá logado e quer ver login ou landing page? Manda direto pro painel.
  if (isLoggedIn && (isAuthRoute || isLandingPage)) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Se não quebrou nenhuma regra, deixa passar!
  return supabaseResponse
}

// O Proxy deve vigiar o site inteiro, exceto imagens e arquivos estáticos
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}