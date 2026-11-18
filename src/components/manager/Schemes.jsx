import React, { useEffect, useState } from 'react';
import API from '../../api/endpoints';
import LoadingSpinner from '../common/LoadingSpinner';
import { Page, Card, Badge, Button, inputCls, run } from '../ui';

const Schemes = () => {
  const [schemes, setSchemes] = useState(null);
  const [open, setOpen] = useState(null);
  const load = () => API.schemes().then(setSchemes);
  useEffect(() => { load(); }, []);
  if (!schemes) return <LoadingSpinner />;
  const patch = async (s, d) => { if (await run(() => API.updateScheme(s.id, d), 'Scheme updated')) load(); };

  return (
    <Page wide title="Certification schemes" subtitle="Each scheme defines its required documents, self-assessment questions and inspection checklist. Add or fully edit schemes in the admin site (/admin/schemes).">
      {schemes.map((s) => (
        <Card key={s.id} title={<span>{s.name} <span className="text-xs text-gray-400 ml-2">{s.code}</span></span>}
              actions={<><Badge status={s.is_active ? 'active' : 'cancelled'} label={s.is_active ? 'Active' : 'Inactive'} />
                <Button variant="secondary" onClick={() => patch(s, { is_active: !s.is_active })}>{s.is_active ? 'Deactivate' : 'Activate'}</Button>
                <Button variant="ghost" onClick={() => setOpen(open === s.id ? null : s.id)}>{open === s.id ? 'Hide' : 'Details'}</Button></>}>
          <p className="text-sm text-gray-600 mb-3">{s.description}</p>
          <div className="flex flex-wrap gap-4 text-sm items-center">
            <label>Pass threshold % <input type="number" className={`${inputCls} w-24 inline-block ml-1`} defaultValue={s.pass_threshold} onBlur={(e) => Number(e.target.value) !== s.pass_threshold && patch(s, { pass_threshold: Number(e.target.value) })} /></label>
            <label>Validity (years) <input type="number" className={`${inputCls} w-24 inline-block ml-1`} defaultValue={s.validity_years} onBlur={(e) => Number(e.target.value) !== s.validity_years && patch(s, { validity_years: Number(e.target.value) })} /></label>
            <span className="text-gray-500">{s.required_documents.length} documents · {s.assessment_questions.length} questions · {s.inspection_checklist.length} checklist items</span>
          </div>
          {open === s.id && (
            <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
              <div><h4 className="font-semibold mb-1">Required documents</h4><ul className="list-disc ml-5">{s.required_documents.map((d) => <li key={d.type}>{d.label}</li>)}</ul></div>
              <div><h4 className="font-semibold mb-1">Self-assessment</h4><ul className="list-disc ml-5">{s.assessment_questions.map((q) => <li key={q.id}>{q.text} <span className="text-gray-400">({q.weight})</span></li>)}</ul></div>
              <div><h4 className="font-semibold mb-1">Inspection checklist</h4><ul className="list-disc ml-5">{s.inspection_checklist.map((c) => <li key={c.id}>{c.text}{c.critical && <span className="text-red-600"> *</span>}</li>)}</ul></div>
            </div>)}
        </Card>))}
    </Page>
  );
};
export default Schemes;
