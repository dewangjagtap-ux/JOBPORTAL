// adminService mocked using localStorage
const COMPANIES_KEY = 'cpp_companies'

function readCompanies(){ try { return JSON.parse(localStorage.getItem(COMPANIES_KEY)) || [] } catch(e){ return [] } }
function writeCompanies(list){ try { localStorage.setItem(COMPANIES_KEY, JSON.stringify(list)) } catch(e){} }

const approveCompany = async (companyId, approve = true) => {
  const companies = readCompanies()
  const idx = companies.findIndex(c => Number(c.id) === Number(companyId))
  if (idx === -1) return Promise.reject(new Error('Company not found'))
  companies[idx].approved = !!approve
  writeCompanies(companies)
  return Promise.resolve({ ok: true })
}

const adminService = { approveCompany }
export default adminService
