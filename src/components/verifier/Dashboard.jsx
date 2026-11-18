import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/endpoints';
import LoadingSpinner from '../common/LoadingSpinner';
import { Page, Card, Badge, Empty, fmtDate } from '../ui';

const Queue = ({ title, items, hint }) => (
  <Card title={`${title} (${items.length})`}>
    {items.length === 0 ? <Empty>Nothing waiting.</Empty> : items.map((a) => (
      <Link key={a.id} to={`/applications/${a.id}`} className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded border-b last:border-0">
        <div><p className="font-medium">{a.client_name} <span className="text-xs text-gray-400">· {a.scheme_name}</span></p>
          <p className="text-sm text-gray-500">{hint} · {a.reference} · updated {fmtDate(a.updated_at)}</p></div>
        <Badge status={a.status} />
      </Link>
    ))}
  </Card>
);

const VerifierDashboard = () => {
  const [apps, setApps] = useState(null);
  useEffect(() => { API.applications({ status: 'doc_review,verification,corrective_actions' }).then(setApps); }, []);
  if (!apps) return <LoadingSpinner />;
  return (
    <Page title="Verification queue" subtitle="Review client documents and independently verify inspection reports">
      <Queue title="Documents to review" hint="Review each required document" items={apps.filter((a) => a.status === 'doc_review')} />
      <Queue title="Inspection reports to verify" hint="Check report, evidence and non-conformities" items={apps.filter((a) => a.status === 'verification')} />
      <Queue title="Waiting for client corrective actions" hint="Client is responding to non-conformities" items={apps.filter((a) => a.status === 'corrective_actions')} />
    </Page>
  );
};
export default VerifierDashboard;
