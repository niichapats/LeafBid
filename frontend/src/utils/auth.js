export function saveToken(token) {
  localStorage.setItem('leafbid_token', token)
}

export function getToken() {
  return localStorage.getItem('leafbid_token')
}

export function removeToken() {
  localStorage.removeItem('leafbid_token')
}

export function getUser() {
  const token = getToken()
  if (!token) {
    return null
  }

  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const decoded = JSON.parse(atob(paddedBase64))
    return {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      displayName: decoded.displayName,
    }
  } catch (error) {
    return null
  }
}

export function isLoggedIn() {
  return Boolean(getToken())
}
