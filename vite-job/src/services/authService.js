// Mock auth service using localStorage. No network calls.
const STORAGE_USER_KEY = 'authUser'

const login = async ({ email, password, role }) => {
  // role must be passed from UI (student/company); fall back to inference
  const lc = (email || '').toLowerCase()
  const inferred = lc.includes('company') ? 'company' : lc.includes('admin') ? 'admin' : 'student'
  const finalRole = role || inferred
  const id = Date.now()
  const rawName = email ? email.split('@')[0].replace('.', ' ').replace(/\d+/g, '') : `User${id}`
  const name = capitalize(rawName)
  const user = { id, name, email, role: finalRole }

  // persist auth user in localStorage per spec
  try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user)) } catch (e) { /* ignore */ }

  return Promise.resolve({ user })
}

function capitalize(s){
  return String(s || '').replace(/(^|\s)\S/g, t => t.toUpperCase())
}

const logout = () => {
  try { localStorage.removeItem(STORAGE_USER_KEY) } catch (e) {}
  return Promise.resolve()
}

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_USER_KEY)) } catch (e) { return null }
}

const authService = { login, logout, getStoredUser }
export default authService
