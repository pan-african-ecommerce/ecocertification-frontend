import http from './axios';

const list = (r) => r.data.results || r.data;
const form = (obj) => {
  const f = new FormData();
  Object.entries(obj).forEach(([k, v]) => v !== undefined && v !== null && f.append(k, v));
  return f;
};

const API = {
  // auth
  login: (d) => http.post('/auth/login/', d),
  register: (d) => http.post('/auth/register/', d),
  me: () => http.get('/auth/me/'),
  logout: (refresh) => http.post('/auth/logout/', { refresh }, { silent: true }),
  giveConsent: () => http.post('/auth/consent/', { consent_given: true, consent_version: '1.0' }),
  listStaff: () => http.get('/auth/staff/').then((r) => r.data),
  createStaff: (d) => http.post('/auth/staff/', d),
  setStaffActive: (id, is_active) => http.patch(`/auth/staff/${id}/`, { is_active }),

  // schemes
  schemes: () => http.get('/schemes/').then(list),
  updateScheme: (id, d) => http.patch(`/schemes/${id}/`, d),

  // client profile
  myCompany: () => http.get('/clients/me/').then((r) => r.data),
  updateCompany: (id, d) => http.patch(`/clients/${id}/`, d),

  // farmers
  farmers: (params) => http.get('/farmers/', { params }).then(list),
  farmerSummary: (params) => http.get('/farmers/summary/', { params }).then((r) => r.data),
  createFarmer: (d) => http.post('/farmers/', d),
  updateFarmer: (id, d) => http.patch(`/farmers/${id}/`, d),
  deleteFarmer: (id) => http.delete(`/farmers/${id}/`),
  importFarmers: (file) => http.post('/farmers/import/', form({ file })),

  // applications
  applications: (params) => http.get('/applications/', { params }).then(list),
  application: (id) => http.get(`/applications/${id}/`).then((r) => r.data),
  createApplication: (d) => http.post('/applications/', d),
  appStats: () => http.get('/applications/stats/').then((r) => r.data),
  selfAssessment: (id, answers) => http.post(`/applications/${id}/self-assessment/`, { answers }),
  submitDocuments: (id) => http.post(`/applications/${id}/submit-documents/`),
  finishDocReview: (id, note) => http.post(`/applications/${id}/finish-document-review/`, { note }),
  rejectApplication: (id, reason) => http.post(`/applications/${id}/reject/`, { reason }),

  // documents
  documents: (params) => http.get('/documents/', { params }).then(list),
  uploadDocument: (d) => http.post('/documents/', form(d)),
  deleteDocument: (id) => http.delete(`/documents/${id}/`),
  reviewDocument: (id, d) => http.post(`/documents/${id}/review/`, d),

  // inspectors
  inspectors: () => http.get('/inspectors/').then(list),
  updateInspector: (id, d) => http.patch(`/inspectors/${id}/`, d),
  declareCoi: (declared) => http.post('/inspectors/declare/', { declared }),

  // inspections
  inspections: (params) => http.get('/inspections/', { params }).then(list),
  inspection: (id) => http.get(`/inspections/${id}/`).then((r) => r.data),
  assignInspection: (d) => http.post('/inspections/', d),
  cancelInspection: (id) => http.post(`/inspections/${id}/cancel/`),
  startInspection: (id) => http.post(`/inspections/${id}/start/`),
  saveDraft: (id, d) => http.patch(`/inspections/${id}/draft/`, d),
  uploadEvidence: (id, d) => http.post(`/inspections/${id}/evidence/`, form(d)),
  deleteEvidence: (id) => http.delete(`/inspections/evidence/${id}/`),
  raiseNC: (id, d) => http.post(`/inspections/${id}/nonconformities/`, d),
  submitReport: (id) => http.post(`/inspections/${id}/submit-report/`),
  verify: (id, d) => http.post(`/inspections/${id}/verify/`, d),
  nonconformities: (params) => http.get('/inspections/nonconformities/', { params }).then(list),
  respondNC: (id, response) => http.post(`/inspections/nonconformities/${id}/respond/`, { response }),
  reviewNC: (id, d) => http.post(`/inspections/nonconformities/${id}/review/`, d),

  // certificates
  certificates: () => http.get('/certificates/').then(list),
  issueCertificate: (d) => http.post('/certificates/issue/', d),
  setCertStatus: (id, d) => http.post(`/certificates/${id}/set-status/`, d),

  // public
  certifiedRegister: (params) => http.get('/certificates/register/', { params, silent: true }).then((r) => r.data),
  verifyCertificate: (q) => http.get('/certificates/public/', { params: { q }, silent: true }),

  // audit
  auditLogs: (params) => http.get('/audit/logs/', { params }).then(list),
};

export default API;
