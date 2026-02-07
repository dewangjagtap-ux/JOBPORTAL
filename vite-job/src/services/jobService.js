// jobService backed by localStorage as a mock backend
const JOBS_KEY = 'jobs'
const APPLICATIONS_KEY = 'applications'

function seedJobsIfEmpty() {
  try {
    const raw = localStorage.getItem(JOBS_KEY)
    if (raw) return
    const sample = [
      { id: 1, title: 'Frontend Engineer', companyId: 'acme', companyName: 'Acme Corp', location: 'Bangalore', description: 'Build responsive React apps', skills: ['React','CSS','JS'], applicants: [] },
      { id: 2, title: 'Backend Engineer', companyId: 'globex', companyName: 'Globex', location: 'Hyderabad', description: 'Work on APIs and databases', skills: ['Node','Express','MongoDB'], applicants: [] },
      { id: 3, title: 'Data Analyst', companyId: 'initech', companyName: 'Initech', location: 'Remote', description: 'Analyze placement data', skills: ['SQL','Python'], applicants: [] }
    ]
    localStorage.setItem(JOBS_KEY, JSON.stringify(sample))
  } catch (e) { /* ignore storage errors for demo */ }
}

function readJobs() {
  try { return JSON.parse(localStorage.getItem(JOBS_KEY)) || [] } catch (e) { return [] }
}

function writeJobs(jobs) {
  try { localStorage.setItem(JOBS_KEY, JSON.stringify(jobs)) } catch (e) {}
}

function readApplications() {
  try { return JSON.parse(localStorage.getItem(APPLICATIONS_KEY)) || [] } catch (e) { return [] }
}

function writeApplications(apps) {
  try { localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps)) } catch (e) {}
}

function notifyChange(key) {
  try { window.dispatchEvent(new CustomEvent('localDataChanged', { detail: { key } })) } catch (e) { /* ignore */ }
}

const getJobs = async (params) => {
  seedJobsIfEmpty()
  const jobs = readJobs()
  // simple filtering can be added using params later
  return Promise.resolve(jobs)
}

const postJob = async (job) => {
  const jobs = readJobs()
  const id = jobs.reduce((m, j) => Math.max(m, j.id || 0), 0) + 1
  const newJob = { id, applicants: [], createdAt: new Date().toISOString(), ...job }
  jobs.unshift(newJob)
  writeJobs(jobs)
  notifyChange('jobs')
  return Promise.resolve(newJob)
}

const deleteJob = async (jobId) => {
  const jobs = readJobs()
  const next = jobs.filter(j => Number(j.id) !== Number(jobId))
  writeJobs(next)
  // remove associated applications
  try {
    const apps = readApplications().filter(a => Number(a.jobId) !== Number(jobId))
    writeApplications(apps)
  } catch (e) {}
  notifyChange('jobs')
  notifyChange('applications')
  return Promise.resolve(true)
}

const apply = async (jobId, applicant) => {
  // applicant: { studentId, name, email }
  seedJobsIfEmpty()
  const jobs = readJobs()
  const job = jobs.find(j => Number(j.id) === Number(jobId))
  if (!job) return Promise.reject(new Error('Job not found'))

  // require resume to be uploaded for student
  try {
    const resumeKey = `cpp_resume_${applicant.studentId}`
    const resume = localStorage.getItem(resumeKey)
    if (!resume) return Promise.resolve({ ok: false, message: 'Please upload your resume before applying' })
  } catch (e) {}

  // prevent duplicates (check global applications)
  const apps = readApplications()
  const existsGlobal = apps.some(a => Number(a.jobId) === Number(jobId) && Number(a.studentId) === Number(applicant.studentId))
  if (existsGlobal) return Promise.resolve({ ok: false, message: 'Already applied' })

  const app = { id: Date.now(), jobId: job.id, companyId: job.companyId, studentId: applicant.studentId, name: applicant.name, email: applicant.email, status: 'Applied', appliedAt: new Date().toISOString(), jobTitle: job.title, companyName: job.companyName }

  // push into global applications list
  const nextApps = readApplications()
  nextApps.unshift(app)
  writeApplications(nextApps)
  notifyChange('applications')

  // also add to job.applicants for company view
  job.applicants = job.applicants || []
  job.applicants.push({ studentId: applicant.studentId, name: applicant.name, email: applicant.email, status: 'Applied', appliedAt: app.appliedAt })
  writeJobs(jobs)
  notifyChange('jobs')

  return Promise.resolve({ ok: true, application: app })
}

const jobService = { getJobs, postJob, apply, deleteJob }
export default jobService
