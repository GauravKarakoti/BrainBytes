import { getOptionalUser } from '@/lib/auth0'

const parseAdminEmails = () =>
  process.env.AUTH0_ADMIN_EMAILS?.split(',')
    .map((value) => value.trim())
    .filter(Boolean) ?? []

// Accept an optional user-like object to avoid fetching session again when caller already has the user
export const getIsAdmin = async (user?: { email?: string } | null) => {
  let email: string | undefined | null

  if (user && user.email) {
    email = user.email
  } else {
    const _user = await getOptionalUser()
    email = _user?.email
  }

  if (!email) {
    return false
  }

  const adminEmails = parseAdminEmails()
  return adminEmails.includes(email)
}
