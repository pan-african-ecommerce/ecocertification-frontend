import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { Page, Card, Badge, Empty, fmt, Button } from '../ui';

const InspectorDashboard = () => {
  const [items, setItems] = useState(null);
  const [me, setMe] = useState(null);
  const { user } = useAuth();
  const load = async () => {
    setItems(await API.inspections());
    setMe((await API.inspectors())[0]);
  };
  useEffect(() => { load(); }, []);
  if (!items) return <LoadingSpinner />;

  const todo = items.filter((i) => ['scheduled', 'in_progress', 'returned'].includes(i.status));
  const done = items.filter((i) => !['scheduled', 'in_progress', 'returned'].includes(i.status));
  const declare = async () => { await API.declareCoi(true); load(); };

  return (
    <Page title="My inspections" subtitle={`Welcome ${user.first_name}. Collect findings, evidence and data for each assigned inspection.`}>
      {me && !me.conflict_of_interest_declaration && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm flex items-center justify-between gap-3">
          <span>You have no current impartiality declaration, so you cannot be assigned inspections.</span>
          <Button onClick={declare}>I declare no conflict of interest</Button>
        </div>
      )}
      <Card title={`To do (${todo.length})`}>
        {todo.length === 0 ? <Empty>Nothing assigned right now.</Empty> : todo.map((i) => (
          <Link key={i.id} to={`/inspections/${i.id}`} className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded border-b last:border-0">
            <div>
              <p className="font-medium">{i.client_name} <span className="text-gray-400 text-xs">· {i.scheme_name}</span></p>
              <p className="text-sm text-gray-500">{fmt(i.scheduled_date)} · {i.location || 'Location tbc'}</p>
              {i.status === 'returned' && <p className="text-xs text-red-600">Returned by verification — see comments inside</p>}
            </div>
            <Badge status={i.status} />
          </Link>
        ))}
      </Card>
      <Card title="Completed">
        {done.length === 0 ? <Empty>No completed inspections yet.</Empty> : done.map((i) => (
          <Link key={i.id} to={`/inspections/${i.id}`} className="flex items-center justify-between py-2 text-sm hover:bg-gray-50 px-2 rounded">
            <span>{i.client_name} · {i.scheme_name} · {fmt(i.scheduled_date)}</span><Badge status={i.status} />
          </Link>
        ))}
      </Card>
    </Page>
  );
};
export default InspectorDashboard;
