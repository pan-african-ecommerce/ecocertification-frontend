import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/endpoints';
import { downloadFile } from '../../api/axios';
import LoadingSpinner from '../common/LoadingSpinner';
import { Page, Card, Badge, Button, Field, inputCls, Empty, fmt, run } from '../ui';

const RESULTS = [['conform', 'Conform', 'bg-green-600'], ['nonconform', 'Non-conform', 'bg-red-600'], ['na', 'N/A', 'bg-gray-500']];

const InspectionWorkspace = () => {
  const { id } = useParams();
  const [insp, setInsp] = useState(null);
  const [resp, setResp] = useState({});
  const [summary, setSummary] = useState('');
  const [rec, setRec] = useState('');
  const [fieldData, setFieldData] = useState([]);   // [{k, v}]
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ncForm, setNcForm] = useState(null);

  const hydrate = (i) => {
    setInsp(i);
    setResp(i.responses || {});
    setSummary(i.report_summary || '');
    setRec(i.recommendation || '');
    setFieldData(Object.entries(i.field_data || {}).map(([k, v]) => ({ k, v: String(v) })));
    setDirty(false);
  };
  const load = useCallback(async () => hydrate(await API.inspection(id)), [id]);
  useEffect(() => { load(); }, [load]);
  // Refresh server-side lists (evidence, non-conformities) WITHOUT discarding unsaved form edits.
  const refresh = async () => setInsp(await API.inspection(id));

  if (!insp) return <LoadingSpinner />;
  const editable = insp.status === 'in_progress';
  const sections = [...new Set(insp.checklist.map((c) => c.section))];
  const unanswered = insp.checklist.filter((c) => !resp[c.id]);

  const setResult = (cid, result) => { setResp({ ...resp, [cid]: { ...(resp[cid] || {}), result } }); setDirty(true); };
  const setNotes = (cid, notes) => { setResp({ ...resp, [cid]: { result: 'na', ...(resp[cid] || {}), notes } }); setDirty(true); };

  const save = async (silent) => {
    setSaving(true);
    const fd = Object.fromEntries(fieldData.filter((f) => f.k.trim()).map((f) => [f.k.trim(), isNaN(f.v) || f.v === '' ? f.v : Number(f.v)]));
    const r = await run(() => API.saveDraft(id, { responses: resp, report_summary: summary, recommendation: rec, field_data: fd }), silent ? null : 'Draft saved');
    setSaving(false);
    if (r?.data) { hydrate(r.data); return true; }
    return false;
  };

  const start = async () => { if (await run(() => API.startInspection(id))) load(); };
  const submit = async () => {
    if (dirty && !(await save(true))) return;
    if (!window.confirm('Submit the report for verification? You will not be able to edit it afterwards unless it is returned to you.')) return;
    if (await run(() => API.submitReport(id), 'Report submitted for verification')) load();
  };
  const upload = async (file, item) => {
    if (!file) return;
    await run(() => API.uploadEvidence(id, { file, caption: file.name, checklist_item: item || '' }), 'Evidence uploaded');
    refresh();
  };
  const delEvidence = async (eid) => { await run(() => API.deleteEvidence(eid)); refresh(); };
  const raiseNC = async () => {
    if (await run(() => API.raiseNC(id, { ...ncForm, due_date: ncForm.due_date || null }), 'Non-conformity raised')) { setNcForm(null); refresh(); }
  };

  const lastReturn = insp.verifications?.find((v) => v.decision === 'returned');

  return (
    <Page title={insp.client_name} subtitle={`${insp.scheme_name} · ${insp.application_reference} · ${fmt(insp.scheduled_date)} · ${insp.location || 'location tbc'}`}
          actions={<Badge status={insp.status} />}>
      {insp.status === 'returned' && lastReturn && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm"><b>Returned by {lastReturn.verifier_name}:</b> {lastReturn.comments}</div>
      )}
      {['scheduled', 'returned'].includes(insp.status) && (
        <Card title="Start inspection"><p className="text-sm text-gray-600 mb-3">Starting records the time and unlocks the checklist and evidence upload.</p>
          <Button onClick={start}>{insp.status === 'returned' ? 'Resume rework' : 'Start inspection'}</Button></Card>
      )}

      <Card title="Checklist" actions={editable && <Button variant="secondary" busy={saving} disabled={!dirty} onClick={() => save(false)}>Save draft</Button>}>
        {sections.map((s) => (
          <div key={s} className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{s}</h3>
            {insp.checklist.filter((c) => c.section === s).map((c) => {
              const r = resp[c.id];
              const ev = insp.evidence.filter((e) => e.checklist_item === c.id);
              return (
                <div key={c.id} className="border rounded-lg p-3 mb-2">
                  <p className="text-sm text-gray-900">{c.text} {c.critical && <span className="text-xs text-red-600 ml-1">critical</span>}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {RESULTS.map(([val, label, color]) => (
                      <button key={val} disabled={!editable} onClick={() => setResult(c.id, val)}
                              className={`px-3 py-1 rounded-full text-xs border ${r?.result === val ? `${color} text-white border-transparent` : 'bg-white text-gray-600 border-gray-300'} disabled:opacity-60`}>
                        {label}
                      </button>
                    ))}
                    {editable && (
                      <label className="px-3 py-1 rounded-full text-xs border border-dashed border-gray-400 cursor-pointer text-gray-600 hover:bg-gray-50">
                        + Evidence<input type="file" className="hidden" onChange={(e) => { upload(e.target.files[0], c.id); e.target.value = ''; }} />
                      </label>
                    )}
                    {editable && r?.result === 'nonconform' && (
                      <button className="px-3 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-200"
                              onClick={() => setNcForm({ checklist_item: c.id, severity: c.critical ? 'major' : 'minor', description: '', due_date: '' })}>
                        Raise non-conformity
                      </button>
                    )}
                  </div>
                  <input className={`${inputCls} mt-2`} placeholder="Notes / observations" disabled={!editable}
                         value={r?.notes || ''} onChange={(e) => setNotes(c.id, e.target.value)} />
                  {ev.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{ev.map((e) => (
                    <span key={e.id} className="text-xs bg-gray-100 rounded px-2 py-1">
                      <button className="text-primary-700 underline" onClick={() => downloadFile(`/inspections/evidence/${e.id}/download/`, e.file_name)}>{e.file_name}</button>
                      {editable && <button className="ml-2 text-red-600" onClick={() => delEvidence(e.id)}>×</button>}
                    </span>))}</div>}
                </div>
              );
            })}
          </div>
        ))}
      </Card>

      {ncForm && (
        <Card title="New non-conformity">
          <Field label="Severity"><select className={inputCls} value={ncForm.severity} onChange={(e) => setNcForm({ ...ncForm, severity: e.target.value })}>
            <option value="minor">Minor</option><option value="major">Major</option></select></Field>
          <Field label="Description"><textarea className={inputCls} rows={3} value={ncForm.description} onChange={(e) => setNcForm({ ...ncForm, description: e.target.value })} /></Field>
          <Field label="Corrective action due date"><input type="date" className={inputCls} value={ncForm.due_date} onChange={(e) => setNcForm({ ...ncForm, due_date: e.target.value || null })} /></Field>
          <div className="flex gap-2"><Button onClick={raiseNC} disabled={!ncForm.description.trim()}>Raise</Button><Button variant="secondary" onClick={() => setNcForm(null)}>Cancel</Button></div>
        </Card>
      )}

      <Card title={`Non-conformities (${insp.nonconformities.length})`}>
        {insp.nonconformities.length === 0 ? <Empty>None raised.</Empty> : insp.nonconformities.map((n) => (
          <div key={n.id} className="flex justify-between gap-3 py-2 text-sm border-b last:border-0">
            <span><b className="capitalize">{n.severity}</b> · item {n.checklist_item || '—'} · {n.description}</span><Badge status={n.status} />
          </div>
        ))}
      </Card>

      <Card title="Field data" actions={editable && <Button variant="secondary" onClick={() => { setFieldData([...fieldData, { k: '', v: '' }]); setDirty(true); }}>+ Add</Button>}>
        {fieldData.length === 0 ? <Empty>Record measurements, e.g. area_ha = 12.5, samples_taken = 2, gps_points = 14.</Empty> :
          fieldData.map((f, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input className={inputCls} placeholder="Name" disabled={!editable} value={f.k} onChange={(e) => { const n = [...fieldData]; n[i] = { ...f, k: e.target.value }; setFieldData(n); setDirty(true); }} />
              <input className={inputCls} placeholder="Value" disabled={!editable} value={f.v} onChange={(e) => { const n = [...fieldData]; n[i] = { ...f, v: e.target.value }; setFieldData(n); setDirty(true); }} />
            </div>
          ))}
      </Card>

      <Card title="General evidence">
        <div className="flex flex-wrap gap-2 mb-3">
          {insp.evidence.filter((e) => !e.checklist_item).map((e) => (
            <span key={e.id} className="text-xs bg-gray-100 rounded px-2 py-1">
              <button className="text-primary-700 underline" onClick={() => downloadFile(`/inspections/evidence/${e.id}/download/`, e.file_name)}>{e.file_name}</button>
              {editable && <button className="ml-2 text-red-600" onClick={() => delEvidence(e.id)}>×</button>}
            </span>))}
          {insp.evidence.filter((e) => !e.checklist_item).length === 0 && <span className="text-sm text-gray-500">No general files yet (photos, field notes, lab results, GPS tracks…).</span>}
        </div>
        {editable && <label className="inline-block px-4 py-2 text-sm rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50">
          Upload file<input type="file" className="hidden" onChange={(e) => { upload(e.target.files[0]); e.target.value = ''; }} /></label>}
      </Card>

      <Card title="Report">
        <Field label="Summary of findings"><textarea className={inputCls} rows={5} disabled={!editable} value={summary} onChange={(e) => { setSummary(e.target.value); setDirty(true); }} /></Field>
        <Field label="Recommendation">
          <select className={inputCls} disabled={!editable} value={rec} onChange={(e) => { setRec(e.target.value); setDirty(true); }}>
            <option value="">Select…</option><option value="certify">Recommend certification</option>
            <option value="certify_with_conditions">Recommend with conditions</option><option value="do_not_certify">Do not recommend</option>
          </select>
        </Field>
        {editable && (
          <div className="flex items-center gap-3">
            <Button onClick={submit} disabled={unanswered.length > 0 || !rec || !summary.trim()}>Submit report for verification</Button>
            {unanswered.length > 0 && <span className="text-xs text-gray-500">{unanswered.length} checklist item(s) unanswered</span>}
          </div>
        )}
      </Card>
    </Page>
  );
};
export default InspectionWorkspace;
