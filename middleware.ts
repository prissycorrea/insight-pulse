import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Ambientes que queremos proteger
const PROTECTED_ENVIRONMENTS = ['develop', 'homolog']

export function middleware(request: NextRequest) {
  // Pega o ambiente atual através da URL
  const hostname = request.headers.get('host') || ''
  const isProtectedEnvironment = PROTECTED_ENVIRONMENTS.some(env => 
    hostname.includes(env) || hostname.includes('dev')
  )

  // Se não for ambiente protegido, permite o acesso
  if (!isProtectedEnvironment) {
    return NextResponse.next()
  }

  // Verifica o header de autenticação
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return new NextResponse('Autenticação necessária', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Ambiente protegido"'
      }
    })
  }

  try {
    // Basic Auth
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [username, password] = credentials.split(':')

    const validUsername = process.env.AUTH_USERNAME
    const validPassword = process.env.AUTH_PASSWORD

    if (username === validUsername && password === validPassword) {
      return NextResponse.next()
    }
  } catch (error) {
    console.error('Erro na autenticação:', error)
  }

  return new NextResponse('Credenciais inválidas', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Ambiente protegido"'
    }
  })
}

// Configuração de quais rotas o middleware deve proteger
export const config = {
  matcher: [
    // Protege todas as rotas
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}