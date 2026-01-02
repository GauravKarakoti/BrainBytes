import { getOptionalUser } from '@/lib/auth0'

const parseAdminEmails = () =>
  process.env.AUTH0_ADMIN_EMAILS?.split(',')
    .map((value) => value.trim())
    .filter(Boolean) ?? []

export const getIsAdmin = async () => {
  const user = await getOptionalUser()

  if (!user?.email) {
    return false
  }

  const adminEmails = parseAdminEmails()
  return adminEmails.includes(user.email)
}
