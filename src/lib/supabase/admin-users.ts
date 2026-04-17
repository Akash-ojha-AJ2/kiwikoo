type AdminAuthClient = {
  auth: {
    admin: {
      listUsers: (args: { page: number; perPage: number }) => Promise<{
        data: { users: Array<any> } | null
        error: { message?: string } | null
      }>
    }
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

async function listAllUsersPageByPage(
  service: AdminAuthClient,
  matcher: (user: any) => boolean,
  perPage = 1000
) {
  let page = 1

  while (true) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage })
    if (error) {
      throw new Error(error.message || 'Failed to list auth users')
    }

    const users = data?.users || []
    const match = users.find(matcher)
    if (match) return match

    if (users.length < perPage) return null
    page += 1
  }
}

export async function findAuthUserByEmail(service: AdminAuthClient, email: string) {
  const normalizedTarget = normalizeEmail(email)
  return listAllUsersPageByPage(
    service,
    (user) => normalizeEmail(String(user?.email || '')) === normalizedTarget
  )
}

export async function findAuthUserById(service: AdminAuthClient, userId: string) {
  return listAllUsersPageByPage(service, (user) => String(user?.id || '') === userId)
}
