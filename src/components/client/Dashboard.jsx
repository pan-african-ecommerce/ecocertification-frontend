import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/endpoints';
import LoadingSpinner from '../common/LoadingSpinner';
import { Page, Card, Badge, Button, Field, inputCls, Empty, fmtDate, run } from '../ui';

const NEXT = {
  assessment: 'Complete the self-assessment',
  documents: 'Upload the required documents',
  doc_review: 'Documents are being reviewed',
  ready_for_inspection: 'Waiting for an inspector to be assigned',
  inspection: 'Inspection in progress',
  verification: 'Inspection report under verification',
  corrective_actions: 'Action needed: respond to non-conformities',
  decision: 'Awaiting the certification decision',
  certified: 'Certified',
};

const ClientDashboard = () => {
  const [apps, setApps] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({ scheme: '', scope_description: '' });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [a, s, c] = await Promise.all([API.applications(), API.schemes(), API.myCompany()]);
    setApps(a); setSchemes(s); setCompany(c);
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    const r = await run(() => API.createApplication(form), 'Application started');
    setBusy(false);
    if (r) { setForm({ scheme: '', scope_description: '' }); load(); }
  };

  if (!apps) return <LoadingSpinner />;
  const open = new Set(apps.filter((a) => !['rejected', 'revoked', 'expired'].includes(a.status)).map((a) => String(a.scheme)));
  const available = schemes.filter((s) => !open.has(String(s.id)));

  return (
    <Page title={company?.company_name || 'My applications'} subtitle="Your certification applications and what to do next">
      <Card title="Applications">
        {apps.length === 0 ? <Empty>No applications yet. Start one below.</Empty> : (
          <div className="divide-y">
            {apps.map((a) => (
              <Link key={a.id} to={`/applications/${a.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-gray-50 px-2 rounded">
                <div>
                  <p className="font-medium text-gray-900">{a.scheme_name} <span className="text-xs text-gray-400 ml-1">{a.reference}</span></p>
                  <p className={`text-sm ${a.status === 'corrective_actions' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    {NEXT[a.status] || a.status_display} · started {fmtDate(a.created_at)}
                  </p>
                </div>
                <Badge status={a.status} />
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card title="Apply for a certification scheme">
        {available.length === 0 ? <Empty>You have an open application for every available scheme.</Empty> : (
          <form onSubmit={create} className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Scheme">
              <select required className={inputCls} value={form.scheme} onChange={(e) => setForm({ ...form, scheme: e.target.value })}>
                <option value="">Select…</option>
                {available.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Scope (products / sites)" hint="e.g. Washed Arabica coffee, 3 farms in Sidama">
              <input className={inputCls} value={form.scope_description} onChange={(e) => setForm({ ...form, scope_description: e.target.value })} />
            </Field>
            <div className="sm:col-span-2"><Button type="submit" busy={busy}>Start application</Button></div>
          </form>
        )}
      </Card>
    </Page>
  );
};
export default ClientDashboard;
