import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/endpoints';
import { downloadFile } from '../../api/axios';
import LoadingSpinner from '../common/LoadingSpinner';
import { Page, Card, Badge, Button, inputCls, Empty, fmt, fmtDate, run } from '../ui';

const STEPS = [['assessment', 'Self-assessment'], ['documents', 'Documents'], ['doc_review', 'Review'],
  ['inspection', 'Inspection'], ['verification', 'Verification'], ['decision', 'Decision'], ['certified', 'Certified']];
const ORDER = ['assessment', 'documents', 'doc_review', 'ready_for_inspection', 'inspection', 'corrective_actions',
  'verification', 'decision', 'certified'];
const stepIndex = (status) => {
  const i = ORDER.indexOf(status);
  const map = { ready_for_inspection: 'inspection', corrective_actions: 'verification' };
  const key = map[status] || status;
  const k = STEPS.findIndex(([s]) => s === key);
  return i < 0 ? -1 : k;
};

const Stepper = ({ status }) => {
  const cur = stepIndex(status);
  return (
    <ol className="flex flex-wrap gap-2 mb-6 text-xs">
      {STEPS.map(([k, label], i) => (
        <li key={k} className={`px-3 py-1.5 rounded-full border ${i < cur ? 'bg-primary-100 border-primary-200 text-primary-800'
          : i === cur ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
          {i + 1}. {label}
        </li>
      ))}
    </ol>
  );
};

const Assessment = ({ app, reload }) => {
  const qs = app.scheme_detail.assessment_questions;
  const [ans, setAns] = useState(app.self_assessment || {});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const sections = [...new Set(qs.map((q) => q.section))];
  const submit = async () => {
    setBusy(true);
    const r = await run(() => API.selfAssessment(app.id, Object.fromEntries(qs.map((q) => [q.id, !!ans[q.id]]))));
    setBusy(false);
    if (r?.data) { setResult(r.data); if (r.data.passed) reload(); }
  };
  return (
    <Card title={`Self-assessment (${app.scheme_detail.pass_threshold}% needed to continue)`}>
      {app.compliance_score != null && !result && (
        <p className="text-sm text-orange-700 mb-4">Last attempt: {app.compliance_score}%. Update your answers once you have improved your system.</p>
      )}
      {sections.map((s) => (
        <div key={s} className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{s}</h3>
          {qs.filter((q) => q.section === s).map((q) => (
            <label key={q.id} className="flex items-start gap-3 py-1.5 cursor-pointer">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={!!ans[q.id]} onChange={(e) => setAns({ ...ans, [q.id]: e.target.checked })} />
              <span className="text-sm text-gray-800">{q.text}</span>
            </label>
          ))}
        </div>
      ))}
      <Button busy={busy} onClick={submit}>Calculate my score</Button>
      {result && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${result.passed ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>{result.message}</div>
      )}
    </Card>
  );
};

const Documents = ({ app, reload }) => {
  const required = app.scheme_detail.required_documents;
  const byType = Object.fromEntries(app.documents.map((d) => [d.doc_type, d]));
  const canUpload = ['documents', 'corrective_actions'].includes(app.status);
  const [busyType, setBusyType] = useState(null);

  const upload = async (type, label, file) => {
    if (!file) return;
    setBusyType(type);
    await run(() => API.uploadDocument({ application: app.id, doc_type: type, title: label, file }), 'Uploaded');
    setBusyType(null);
    reload();
  };
  const remove = async (id) => { await run(() => API.deleteDocument(id), 'Removed'); reload(); };
  const submit = async () => { if (await run(() => API.submitDocuments(app.id), 'Submitted for review')) reload(); };

  const allIn = required.every((r) => byType[r.type]);
  return (
    <Card title="Required documents"
          actions={app.status === 'documents' && <Button disabled={!allIn} onClick={submit}>Submit for review</Button>}>
      {app.status === 'documents' && !allIn && <p className="text-sm text-gray-500 mb-3">Upload every document, then submit them for review (PDF, images, Excel, CSV, Word, GeoJSON/KML…, max 50 MB).</p>}
      <div className="divide-y">
        {required.map((r) => {
          const d = byType[r.type];
          return (
            <div key={r.type} className="py-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{r.label}</p>
                {d ? (
                  <p className="text-xs text-gray-500">{d.file_name} · v{d.version} · {fmt(d.uploaded_at)}</p>
                ) : <p className="text-xs text-gray-400">Not uploaded</p>}
                {d?.review_comments && <p className="text-xs text-orange-700 mt-1">Reviewer: {d.review_comments}</p>}
              </div>
              <div className="flex items-center gap-2">
                {d && <Badge status={d.status} />}
                {d && <Button variant="ghost" onClick={() => downloadFile(`/documents/${d.id}/download/`, d.file_name)}>Download</Button>}
                {d && app.status === 'documents' && d.status === 'pending' && <Button variant="ghost" onClick={() => remove(d.id)}>Remove</Button>}
                {app.status === 'documents' && (!d || d.status === 'rejected' || d.status === 'changes_requested' || d.status === 'pending') && (
                  <label className="px-3 py-2 text-sm rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50">
                    {busyType === r.type ? 'Uploading…' : d ? 'Replace' : 'Upload'}
                    <input type="file" className="hidden" disabled={!canUpload} onChange={(e) => { upload(r.type, r.label, e.target.files[0]); e.target.value = ''; }} />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const NCs = ({ app, reload }) => {
  const [ncs, setNcs] = useState(null);
  const [text, setText] = useState({});
  const load = useCallback(async () => setNcs(await API.nonconformities({ application: app.id })), [app.id]);
  useEffect(() => { load(); }, [load, app.status]);
  if (!ncs || ncs.length === 0) return null;
  const respond = async (id) => {
    if (await run(() => API.respondNC(id, text[id] || ''), 'Response sent')) { load(); reload(); }
  };
  return (
    <Card title="Non-conformities to resolve">
      {ncs.map((n) => (
        <div key={n.id} className="border rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium capitalize">{n.severity} non-conformity</span>
            <Badge status={n.status} />
          </div>
          <p className="text-sm text-gray-800">{n.description}</p>
          {n.due_date && <p className="text-xs text-gray-500 mt-1">Due {fmtDate(n.due_date)}</p>}
          {n.review_notes && <p className="text-xs text-orange-700 mt-1">Reviewer: {n.review_notes}</p>}
          {n.client_response && <p className="text-xs text-gray-600 mt-1">Your response: {n.client_response}</p>}
          {n.status === 'open' && (
            <div className="mt-3">
              <textarea className={inputCls} rows={3} placeholder="Describe the corrective action you took…"
                        value={text[n.id] || ''} onChange={(e) => setText({ ...text, [n.id]: e.target.value })} />
              <Button className="mt-2" onClick={() => respond(n.id)}>Send response</Button>
            </div>
          )}
        </div>
      ))}
      <p className="text-xs text-gray-500">Upload any supporting evidence in the documents section above (type “other” is accepted during corrective actions).</p>
    </Card>
  );
};

const ApplicationDetail = () => {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [insp, setInsp] = useState([]);
  const load = useCallback(async () => {
    setApp(await API.application(id));
    setInsp(await API.inspections({ application: id }));
  }, [id]);
  useEffect(() => { load(); }, [load]);
  if (!app) return <LoadingSpinner />;

  return (
    <Page title={app.scheme_name} subtitle={`${app.reference} · ${app.scope_description || 'No scope entered'}`} actions={<Badge status={app.status} />}>
      {!['rejected', 'revoked', 'expired'].includes(app.status) && <Stepper status={app.status} />}

      {app.status === 'rejected' && <Card title="Application rejected"><p className="text-sm">{app.decision_notes}</p></Card>}
      {app.certificate && (
        <Card title="Certificate" actions={app.certificate.status === 'active' &&
          <Button onClick={() => downloadFile(`/certificates/${app.certificate.id}/pdf/`, `${app.certificate.certificate_number}.pdf`)}>Download PDF</Button>}>
          <p className="font-mono">{app.certificate.certificate_number} <Badge status={app.certificate.status} /></p>
          <p className="text-sm text-gray-600 mt-1">Valid until {fmtDate(app.certificate.expires_at)}</p>
        </Card>
      )}

      {app.status === 'assessment' && <Assessment app={app} reload={load} />}
      {app.status !== 'assessment' && <Documents app={app} reload={load} />}
      {app.status === 'corrective_actions' || app.status === 'verification' || app.status === 'decision' || app.status === 'certified'
        ? <NCs app={app} reload={load} /> : null}

      {insp.length > 0 && (
        <Card title="Inspections">
          {insp.map((i) => (
            <div key={i.id} className="flex justify-between py-2 text-sm">
              <span>{i.inspection_type.replace('_', ' ')} · {fmt(i.scheduled_date)} · {i.location || 'location tbc'} · {i.inspector_name}</span>
              <Badge status={i.status} />
            </div>
          ))}
        </Card>
      )}

      <Card title="History">
        {app.events.length === 0 ? <Empty>No events yet.</Empty> : (
          <ul className="space-y-2 text-sm">
            {[...app.events].reverse().map((e) => (
              <li key={e.id} className="flex gap-3"><span className="text-gray-400 w-40 shrink-0">{fmt(e.created_at)}</span>
                <span><b>{e.event}</b>{e.note ? ` — ${e.note}` : ''}{e.user_name ? <span className="text-gray-400"> ({e.user_name})</span> : null}</span></li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
};
export default ApplicationDetail;
