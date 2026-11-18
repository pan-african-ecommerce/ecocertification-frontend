import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/endpoints';
import LoadingSpinner from '../common/LoadingSpinner';
import { Page, Card, Badge, Table, Empty, fmtDate, inputCls, STATUS } from '../ui';

const ACTION = {
  ready_for_inspection: 'Assign inspector', decision: 'Certification decision', doc_review: 'Documents under review',
  verification: 'With verification', corrective_actions: 'Client correcting', inspection: 'Inspection ongoing',
};

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState(null);
  const [filter, setFilter] = useState({ status: '', scheme: '', q: '' });
  const [schemes, setSchemes] = useState([]);

  useEffect(() => { API.appStats().then(setStats); API.schemes().then(setSchemes); }, []);
  useEffect(() => {
    const p = Object.fromEntries(Object.entries(filter).filter(([, v]) => v));
    const t = setTimeout(() => API.applications(p).then(setApps), 250);
    return () => clearTimeout(t);
  }, [filter]);

  if (!stats || !apps) return <LoadingSpinner />;
  const s = stats.by_status;
  const tiles = [
    ['Need assignment', s.ready_for_inspection || 0, 'ready_for_inspection', 'text-cyan-700'],
    ['Awaiting decision', s.decision || 0, 'decision', 'text-pink-700'],
    ['In verification', (s.verification || 0) + (s.doc_review || 0), 'verification', 'text-purple-700'],
    ['In progress (all)', stats.total - (s.certified || 0) - (s.rejected || 0) - (s.revoked || 0) - (s.expired || 0), '', 'text-gray-800'],
    ['Certified', s.certified || 0, 'certified', 'text-green-700'],
  ];

  return (
    <Page wide title="Certification pipeline" subtitle="Every application, across all schemes">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {tiles.map(([label, n, st, cls]) => (
          <button key={label} onClick={() => setFilter({ ...filter, status: st })} className="bg-white p-4 rounded-lg shadow-card text-left hover:shadow-card-hover">
            <p className="text-xs text-gray-500">{label}</p><p className={`text-2xl font-bold ${cls}`}>{n}</p>
          </button>))}
      </div>
      <Card title="Applications" actions={<span className="text-xs text-gray-500">{apps.length} shown</span>}>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <input className={inputCls} placeholder="Search company…" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} />
          <select className={inputCls} value={filter.scheme} onChange={(e) => setFilter({ ...filter, scheme: e.target.value })}>
            <option value="">All schemes</option>{schemes.map((x) => <option key={x.id} value={x.code}>{x.name}</option>)}</select>
          <select className={inputCls} value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
            <option value="">All statuses</option>{Object.entries(STATUS).slice(0, 12).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select>
        </div>
        {apps.length === 0 ? <Empty>No applications match.</Empty> : (
          <Table head={['Company', 'Scheme', 'Score', 'Status', 'Next step', 'Updated']}>
            {apps.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><Link className="text-primary-700 font-medium" to={`/applications/${a.id}`}>{a.client_name}</Link><div className="text-xs text-gray-400">{a.reference}</div></td>
                <td className="px-4 py-3">{a.scheme_name}</td>
                <td className="px-4 py-3">{a.compliance_score != null ? `${a.compliance_score}%` : '—'}</td>
                <td className="px-4 py-3"><Badge status={a.status} /></td>
                <td className="px-4 py-3 text-gray-600">{ACTION[a.status] || ''}</td>
                <td className="px-4 py-3 text-gray-500">{fmtDate(a.updated_at)}</td>
              </tr>))}
          </Table>)}
      </Card>
    </Page>
  );
};
export default ManagerDashboard;
