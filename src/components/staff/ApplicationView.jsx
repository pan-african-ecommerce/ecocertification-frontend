import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/endpoints';
import { downloadFile } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { Page, Card, Badge, Button, Field, inputCls, Empty, fmt, fmtDate, run } from '../ui';

const RES = { conform: ['Conform', 'text-green-700'], nonconform: ['Non-conform', 'text-red-700'], na: ['N/A', 'text-gray-500'] };

const Documents = ({ app, reload, canReview }) => {
  const [comment, setComment] = useState({});
  const review = async (id, status) => {
    if (await run(() => API.reviewDocument(id, { status, comments: comment[id] || '' }), 'Saved')) reload();
  };
  const finish = async () => { if (await run(() => API.finishDocReview(app.id), 'Review completed')) reload(); };
  const reviewing = app.status === 'doc_review' && canReview;
  return (
    <Card title="Client documents" actions={reviewing && <Button onClick={finish}>Finish document review</Button>}>
      {app.documents.length === 0 ? <Empty>No documents uploaded.</Empty> : app.documents.map((d) => (
        <div key={d.id} className="py-3 border-b last:border-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="text-sm font-medium">{d.title} <span className="text-xs text-gray-400">v{d.version}</span></p>
              <p className="text-xs text-gray-500">{d.file_name} · {d.uploaded_by_name} · {fmt(d.uploaded_at)}</p>
              {d.review_comments && <p className="text-xs text-orange-700">Review note: {d.review_comments}</p>}</div>
            <div className="flex items-center gap-2"><Badge status={d.status} />
              <Button variant="ghost" onClick={() => downloadFile(`/documents/${d.id}/download/`, d.file_name)}>Download</Button></div>
          </div>
          {reviewing && d.status === 'pending' && (
            <div className="mt-2 flex flex-wrap gap-2">
              <input className={`${inputCls} flex-1 min-w-[200px]`} placeholder="Comment (required unless approving)" value={comment[d.id] || ''} onChange={(e) => setComment({ ...comment, [d.id]: e.target.value })} />
              <Button onClick={() => review(d.id, 'approved')}>Approve</Button>
              <Button variant="secondary" onClick={() => review(d.id, 'changes_requested')}>Request changes</Button>
              <Button variant="danger" onClick={() => review(d.id, 'rejected')}>Reject</Button>
            </div>
          )}
        </div>
      ))}
    </Card>
  );
};

const Assign = ({ app, reload }) => {
  const [inspectors, setInspectors] = useState([]);
  const [f, setF] = useState({ inspector: '', scheduled_date: '', location: '', inspection_type: 'onsite' });
  useEffect(() => { API.inspectors().then(setInspectors); }, []);
  const problems = (i) => {
    const p = [];
    if (!i.is_active || !i.user.is_active) p.push('inactive');
    if (!i.qualified_schemes.includes(app.scheme_code)) p.push('not approved for this scheme');
    if (!i.conflict_of_interest_declaration) p.push('no impartiality declaration');
    if (i.conflicted_client_ids.includes(app.client)) p.push('conflict with this client');
    if (i.open_assignments >= i.max_assignments) p.push('at capacity');
    return p;
  };
  const go = async (e) => {
    e.preventDefault();
    const r = await run(() => API.assignInspection({ ...f, application: app.id, inspector: Number(f.inspector), scheduled_date: new Date(f.scheduled_date).toISOString() }), 'Inspector assigned');
    if (r) reload();
  };
  return (
    <Card title="Assign inspector">
      <form onSubmit={go} className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Inspector"><select required className={inputCls} value={f.inspector} onChange={(e) => setF({ ...f, inspector: e.target.value })}>
          <option value="">Select…</option>
          {inspectors.map((i) => { const p = problems(i); return (
            <option key={i.id} value={i.id} disabled={p.length > 0}>{i.user.first_name} {i.user.last_name} ({i.open_assignments}/{i.max_assignments}){p.length ? ` — ${p.join(', ')}` : ''}</option>); })}
        </select></Field>
        <Field label="Type"><select className={inputCls} value={f.inspection_type} onChange={(e) => setF({ ...f, inspection_type: e.target.value })}>
          <option value="onsite">On-site inspection</option><option value="document_review">Document review</option>
          <option value="surveillance">Surveillance audit</option><option value="witness">Witness audit</option></select></Field>
        <Field label="Date & time"><input required type="datetime-local" className={inputCls} value={f.scheduled_date} onChange={(e) => setF({ ...f, scheduled_date: e.target.value })} /></Field>
        <Field label="Location"><input className={inputCls} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
        <div className="sm:col-span-2"><Button type="submit">Assign inspection</Button></div>
      </form>
    </Card>
  );
};

const InspectionReport = ({ insp, app, reload, canVerify, isManager }) => {
  const [comments, setComments] = useState('');
  const [notes, setNotes] = useState({});
  const [cancelBusy, setCancelBusy] = useState(false);
  const awaiting = insp.status === 'submitted' && app.status === 'verification' && canVerify;
  const decide = async (decision) => {
    if (await run(() => API.verify(insp.id, { decision, comments }), 'Decision recorded')) { setComments(''); reload(); }
  };
  const reviewNC = async (id, accept) => {
    if (await run(() => API.reviewNC(id, { accept, notes: notes[id] || '' }), accept ? 'Closed' : 'Sent back to client')) reload();
  };
  const cancel = async () => { setCancelBusy(true); if (await run(() => API.cancelInspection(insp.id), 'Cancelled')) reload(); setCancelBusy(false); };
  const open = ['open'].some((s) => insp.nonconformities.some((n) => n.status === s));

  return (
    <Card title={`Inspection #${insp.id} — ${insp.inspection_type.replace('_', ' ')} by ${insp.inspector_name}`}
          actions={<><Badge status={insp.status} />{isManager && ['scheduled', 'in_progress', 'returned'].includes(insp.status) && <Button variant="secondary" busy={cancelBusy} onClick={cancel}>Cancel</Button>}</>}>
      <p className="text-sm text-gray-600 mb-3">{fmt(insp.scheduled_date)} · {insp.location || 'location tbc'}{insp.submitted_at ? ` · submitted ${fmt(insp.submitted_at)}` : ''}</p>
      {['scheduled', 'in_progress'].includes(insp.status) ? <Empty>Inspector is still working on this inspection.</Empty> : (
        <>
          {insp.recommendation && <p className="text-sm mb-2"><b>Recommendation:</b> {insp.recommendation.replace(/_/g, ' ')}</p>}
          {insp.report_summary && <p className="text-sm bg-gray-50 rounded p-3 mb-4 whitespace-pre-wrap">{insp.report_summary}</p>}
          <h4 className="text-sm font-semibold mb-2">Checklist results</h4>
          <div className="mb-4">{insp.checklist.map((c) => {
            const r = insp.responses[c.id]; const [label, color] = RES[r?.result] || ['—', 'text-gray-400'];
            const ev = insp.evidence.filter((e) => e.checklist_item === c.id);
            return (<div key={c.id} className="text-sm py-1.5 border-b last:border-0">
              <div className="flex justify-between gap-3"><span>{c.text}{c.critical && <span className="text-xs text-red-600 ml-1">critical</span>}</span><span className={`font-medium ${color}`}>{label}</span></div>
              {r?.notes && <p className="text-xs text-gray-500">{r.notes}</p>}
              {ev.map((e) => <button key={e.id} className="text-xs text-primary-700 underline mr-3" onClick={() => downloadFile(`/inspections/evidence/${e.id}/download/`, e.file_name)}>{e.file_name}</button>)}
            </div>);
          })}</div>
          {Object.keys(insp.field_data || {}).length > 0 && (<><h4 className="text-sm font-semibold mb-2">Field data</h4>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-4">{Object.entries(insp.field_data).map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded p-2"><dt className="text-xs text-gray-500">{k}</dt><dd>{String(v)}</dd></div>))}</dl></>)}
          {insp.evidence.filter((e) => !e.checklist_item).length > 0 && (<><h4 className="text-sm font-semibold mb-2">Evidence files</h4>
            <div className="flex flex-wrap gap-2 mb-4">{insp.evidence.filter((e) => !e.checklist_item).map((e) => (
              <button key={e.id} className="text-xs bg-gray-100 rounded px-2 py-1 text-primary-700 underline" onClick={() => downloadFile(`/inspections/evidence/${e.id}/download/`, e.file_name)}>{e.file_name}</button>))}</div></>)}
        </>
      )}

      {insp.nonconformities.length > 0 && (<><h4 className="text-sm font-semibold mb-2">Non-conformities</h4>
        {insp.nonconformities.map((n) => (
          <div key={n.id} className="border rounded-lg p-3 mb-2 text-sm">
            <div className="flex justify-between"><span><b className="capitalize">{n.severity}</b> · item {n.checklist_item || '—'}</span><Badge status={n.status} /></div>
            <p>{n.description}</p>
            {n.client_response && <p className="text-gray-600 mt-1"><b>Client response:</b> {n.client_response}</p>}
            {n.status === 'responded' && canVerify && (
              <div className="mt-2 flex flex-wrap gap-2">
                <input className={`${inputCls} flex-1 min-w-[180px]`} placeholder="Notes (required if not accepted)" value={notes[n.id] || ''} onChange={(e) => setNotes({ ...notes, [n.id]: e.target.value })} />
                <Button onClick={() => reviewNC(n.id, true)}>Accept & close</Button>
                <Button variant="secondary" onClick={() => reviewNC(n.id, false)}>Not accepted</Button>
              </div>)}
          </div>))}</>)}

      {insp.verifications.length > 0 && (<><h4 className="text-sm font-semibold mt-3 mb-2">Verification history</h4>
        {insp.verifications.map((v) => <p key={v.id} className="text-sm"><b>{v.decision.replace('_', ' ')}</b> — {v.verifier_name}, {fmt(v.decided_at)}{v.comments ? `: ${v.comments}` : ''}</p>)}</>)}

      {awaiting && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-semibold mb-2">Verification decision</h4>
          <textarea className={inputCls} rows={3} placeholder="Comments (required unless verifying)" value={comments} onChange={(e) => setComments(e.target.value)} />
          <div className="flex flex-wrap gap-2 mt-2">
            <Button onClick={() => decide('verified')} disabled={insp.nonconformities.some((n) => n.status !== 'closed')}>Verified — forward for decision</Button>
            <Button variant="secondary" onClick={() => decide('nc_required')} disabled={!open}>Corrective actions required</Button>
            <Button variant="danger" onClick={() => decide('returned')}>Return to inspector</Button>
          </div>
          {insp.nonconformities.some((n) => n.status !== 'closed') && <p className="text-xs text-gray-500 mt-2">All non-conformities must be closed before the report can be verified.</p>}
        </div>
      )}
    </Card>
  );
};

const Decision = ({ app, reload }) => {
  const [f, setF] = useState({ validity_years: app.scheme_detail.validity_years, scope: app.scope_description, notes: '' });
  const issue = async () => {
    if (!window.confirm('Issue the certificate? This is the formal certification decision.')) return;
    if (await run(() => API.issueCertificate({ application: app.id, ...f }), 'Certificate issued')) reload();
  };
  return (
    <Card title="Certification decision">
      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Validity (years)"><input type="number" min="1" max="5" className={inputCls} value={f.validity_years} onChange={(e) => setF({ ...f, validity_years: e.target.value })} /></Field>
        <Field label="Certified scope"><input className={inputCls} value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value })} /></Field>
      </div>
      <Button onClick={issue}>Issue certificate</Button>
    </Card>
  );
};

const StaffApplication = () => {
  const { id } = useParams();
  const { user, isManager, isVerifier } = useAuth();
  const [app, setApp] = useState(null);
  const [insps, setInsps] = useState([]);
  const [reason, setReason] = useState('');
  const load = useCallback(async () => {
    setApp(await API.application(id));
    setInsps(await API.inspections({ application: id }));
  }, [id]);
  useEffect(() => { load(); }, [load]);
  if (!app) return <LoadingSpinner />;

  const canReview = isManager || isVerifier;
  const active = insps.some((i) => ['scheduled', 'in_progress', 'returned', 'submitted'].includes(i.status));
  const terminal = ['rejected', 'revoked', 'expired'].includes(app.status);
  const reject = async () => { if (await run(() => API.rejectApplication(app.id, reason), 'Application rejected')) { setReason(''); load(); } };

  return (
    <Page title={app.client_name} wide subtitle={`${app.scheme_name} · ${app.reference} · ${app.scope_description || 'no scope entered'}`} actions={<Badge status={app.status} />}>
      <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">
        <div className="bg-white rounded-lg shadow-card p-4"><p className="text-gray-500">Self-assessment</p><p className="text-2xl font-bold">{app.compliance_score ?? '—'}{app.compliance_score != null && '%'}</p><p className="text-xs text-gray-400">{app.assessment_attempts} attempt(s)</p></div>
        <div className="bg-white rounded-lg shadow-card p-4"><p className="text-gray-500">Started</p><p className="text-lg font-semibold">{fmtDate(app.created_at)}</p></div>
        <div className="bg-white rounded-lg shadow-card p-4"><p className="text-gray-500">Certificate</p>{app.certificate ? <p className="font-mono text-sm">{app.certificate.certificate_number} <Badge status={app.certificate.status} /></p> : <p className="text-lg">—</p>}</div>
      </div>

      {app.status === 'rejected' && <Card title="Rejected"><p className="text-sm">{app.decision_notes}</p></Card>}
      <Documents app={app} reload={load} canReview={canReview} />
      {isManager && (app.status === 'ready_for_inspection' || (app.status === 'inspection' && !active)) && <Assign app={app} reload={load} />}
      {insps.map((i) => <InspectionReport key={i.id} insp={i} app={app} reload={load} canVerify={isManager || isVerifier} isManager={isManager} />)}
      {isManager && app.status === 'decision' && <Decision app={app} reload={load} />}
      {isManager && app.certificate && <Card title="Certificate"><Button onClick={() => downloadFile(`/certificates/${app.certificate.id}/pdf/`, 'certificate.pdf')}>Download PDF</Button></Card>}

      {isManager && !terminal && app.status !== 'certified' && (
        <Card title="Reject application">
          <div className="flex gap-2"><input className={inputCls} placeholder="Reason (shown to the client)" value={reason} onChange={(e) => setReason(e.target.value)} />
            <Button variant="danger" disabled={!reason.trim()} onClick={reject}>Reject</Button></div>
        </Card>
      )}

      <Card title="History">
        <ul className="space-y-2 text-sm">{[...app.events].reverse().map((e) => (
          <li key={e.id} className="flex gap-3"><span className="text-gray-400 w-40 shrink-0">{fmt(e.created_at)}</span>
            <span><b>{e.event}</b>{e.note ? ` — ${e.note}` : ''}{e.user_name ? <span className="text-gray-400"> ({e.user_name})</span> : null}</span></li>))}</ul>
      </Card>
    </Page>
  );
};
export default StaffApplication;
