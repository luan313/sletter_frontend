import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // Para onde o usuário está tentando ir?
  const urlQueOUsuarioQuerIr = request.nextUrl.pathname
  const isAuthRoute = urlQueOUsuarioQuerIr.startsWith('/login') || urlQueOUsuarioQuerIr.startsWith('/signup')
  const isDashboardRoute = urlQueOUsuarioQuerIr.startsWith('/dashboard')
  const isLandingPage = urlQueOUsuarioQuerIr === '/'

  // REGRA 1: Não tá logado e quer ver o painel? Manda pro login.
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // REGRA 2: Tá logado e quer ver login ou landing page? Manda direto pro painel.
  if (user && (isAuthRoute || isLandingPage)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Se não quebrou nenhuma regra, deixa passar!
  return supabaseResponse
}

// O Middleware deve vigiar o site inteiro, exceto imagens e arquivos estáticos
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}