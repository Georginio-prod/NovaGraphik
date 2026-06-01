import { createRemoteJWKSet, jwtVerify } from 'jose'

// Supabase moved (late 2025) from a single HS256 JWT secret to **asymmetric
// signing keys** (RS256/ES256). The signing-key system exposes its public
// keys via a JWKS endpoint, so the backend now verifies access tokens
// against that endpoint instead of a shared secret.
//
//   Project URL :  https://<project-ref>.supabase.co
//   JWKS        :  https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
//
// We read the project URL from `SUPABASE_URL` (or fall back to
// `VITE_SUPABASE_URL` so the same value can be reused from the frontend
// configuration).
const PROJECT_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '')

let JWKS = null
let mode = 'disabled'

if (PROJECT_URL) {
  JWKS = createRemoteJWKSet(new URL(`${PROJECT_URL}/auth/v1/.well-known/jwks.json`), {
    cacheMaxAge: 10 * 60 * 1000, // 10 min — same default as Supabase clients
    timeoutDuration: 5000,
  })
  mode = 'jwks'
  console.log(`[auth] verifying tokens against ${PROJECT_URL}/auth/v1/.well-known/jwks.json`)
} else {
  console.warn(
    '[auth] ⚠ SUPABASE_URL (or VITE_SUPABASE_URL) non défini — toutes les routes /api/admin/* refuseront l’accès.',
  )
}

// Any authenticated Supabase user is treated as admin
// (the brief: shared password used by every administrator).
export async function requireAdmin(req, res, next) {
  if (mode === 'disabled') {
    return res.status(503).json({ error: 'Authentification non configurée' })
  }
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' })
  }
  try {
    const { payload } = await jwtVerify(header.slice(7), JWKS, {
      // Supabase access tokens carry `aud: "authenticated"` and
      // `iss: "<project-url>/auth/v1"`.
      issuer: `${PROJECT_URL}/auth/v1`,
      audience: 'authenticated',
    })
    req.user = payload
    next()
  } catch (err) {
    console.warn('[auth] JWT verification failed:', err?.code || err?.message)
    return res.status(401).json({ error: 'Session invalide ou expirée' })
  }
}
