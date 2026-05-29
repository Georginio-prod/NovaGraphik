import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me'
const EXPIRES = '7d'

if (process.env.NODE_ENV === 'production' && SECRET === 'dev-insecure-secret-change-me') {
  console.warn('[auth] ⚠ JWT_SECRET non défini en production — définissez-le dans .env')
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: EXPIRES })
}

// Rejects anyone who is not an authenticated admin.
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' })
  }
  try {
    const payload = jwt.verify(header.slice(7), SECRET)
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' })
    }
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expirée' })
  }
}
