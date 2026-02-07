// studentService using localStorage as mock backend
const JOBS_KEY = 'cpp_jobs'

function readJobs(){ try { return JSON.parse(localStorage.getItem(JOBS_KEY)) || [] } catch(e){ return [] } }

const getApplications = async (studentId) => {
  // retrieve applications stored under key 'cpp_applications_<studentId>'
  try {
    const key = `cpp_applications_${studentId}`
    const apps = JSON.parse(localStorage.getItem(key)) || []
    return Promise.resolve(apps)
  } catch (e) { return Promise.resolve([]) }
}

const uploadResume = async (studentId, file) => {
  // read file as data URL and store in localStorage under 'cpp_resume_<studentId>'
  if (!file) return Promise.reject(new Error('No file'))
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = { name: file.name, type: file.type, dataURL: reader.result }
        localStorage.setItem(`cpp_resume_${studentId}`, JSON.stringify(data))
        resolve(data)
      } catch (e) { reject(e) }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

const studentService = { getApplications, uploadResume }
export default studentService
