import jwt from 'jsonwebtoken'

// Supabase signs access tokens with the project's JWT secret (HS256).
// Configure SUPABASE_JWT_SECRET in .env (Supabase Dashboard → Project settings → API → JWT settings).
const SECRET = process.env.SUPABASE_JWT_SECRET

if (!SECRET) {
  console.warn(
    '[auth] ⚠ SUPABASE_JWT_SECRET non défini — toutes les routes /api/admin/* refuseront l’accès.',
  )
}

// Any authenticated Supabase user is treated as admin
// (the brief: shared password used by every administrator).
export function requireAdmin(req, res, next) {
  if (!SECRET) return res.status(503).json({ error: 'Authentification non configurée' })
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' })
  }
  try {
    const payload = jwt.verify(header.slice(7), SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expirée' })
  }
}
