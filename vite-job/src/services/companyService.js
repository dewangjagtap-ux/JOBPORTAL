// companyService uses localStorage mock data
const JOBS_KEY = 'jobs'
const COMPANIES_KEY = 'companies'

function readJobs(){ try { return JSON.parse(localStorage.getItem(JOBS_KEY)) || [] } catch(e){ return [] } }
function readCompanies(){ try { return JSON.parse(localStorage.getItem(COMPANIES_KEY)) || [] } catch(e){ return [] } }

function seedCompaniesIfEmpty(){
  try{
    const raw = localStorage.getItem(COMPANIES_KEY)
    if (raw) return
    const sample = [
      { id: 1, name: 'Acme Corp', email: 'hr@acme.com', approved: true },
      { id: 2, name: 'Globex', email: 'contact@globex.com', approved: true }
    ]
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(sample))
  }catch(e){}
}

const getApplicants = async (params, currentCompanyId) => {
  // return applicants for jobs matching company id
  const jobs = readJobs()
  const applicants = []
  jobs.forEach(j => {
    if (!currentCompanyId || Number(j.companyId) === Number(currentCompanyId)) {
      (j.applicants || []).forEach(a => applicants.push({ ...a, jobTitle: j.title, jobId: j.id, companyId: j.companyId }))
    }
  })
  return Promise.resolve(applicants)
}

const updateApplicationStatus = async (jobId, studentId, status) => {
  const jobs = readJobs()
  const job = jobs.find(j => Number(j.id) === Number(jobId))
  if (!job) return Promise.reject(new Error('Job not found'))
  job.applicants = job.applicants || []
  const app = job.applicants.find(a => Number(a.studentId) === Number(studentId))
  if (!app) return Promise.reject(new Error('Application not found'))
  app.status = status
  try { localStorage.setItem(JOBS_KEY, JSON.stringify(jobs)) } catch (e) {}

  // update global applications list status as well
  try {
    const appsRaw = localStorage.getItem('applications')
    const apps = appsRaw ? JSON.parse(appsRaw) : []
    const a = apps.find(x => Number(x.jobId) === Number(jobId) && Number(x.studentId) === Number(studentId))
    if (a) { a.status = status; localStorage.setItem('applications', JSON.stringify(apps)) }
    // notify listeners
    try { window.dispatchEvent(new CustomEvent('localDataChanged', { detail: { key: 'applications' } })) } catch (e) {}
  } catch (e) {}

  return Promise.resolve(true)
}

const getCompanies = async () => {
  seedCompaniesIfEmpty()
  return Promise.resolve(readCompanies())
}

const companyService = { getApplicants, getCompanies, updateApplicationStatus }
export default companyService
