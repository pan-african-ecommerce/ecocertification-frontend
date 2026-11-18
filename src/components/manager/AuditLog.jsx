import React, { useEffect, useState } from 'react';
import API from '../../api/endpoints';
import LoadingSpinner from '../common/LoadingSpinner';
import { Page, Card, Table, Empty, fmt } from '../ui';

const AuditLog = () => {
  const [logs, setLogs] = useState(null);
  const [events, setEvents] = useState(true);
  useEffect(() => { setLogs(null); API.auditLogs({ hide_http: events ? '1' : '' }).then(setLogs); }, [events]);
  return (
    <Page wide title="Audit log" subtitle="Append-only record of who did what and when (latest 20 per page).">
      <Card actions={<label className="text-sm"><input type="checkbox" className="mr-2" checked={events} onChange={(e) => setEvents(e.target.checked)} />Business events only</label>}>
        {!logs ? <LoadingSpinner /> : logs.length === 0 ? <Empty>No entries.</Empty> : (
          <Table head={['Time', 'User', 'Action', 'Details', 'IP']}>
            {logs.map((l) => (
              <tr key={l.id}><td className="px-4 py-2 whitespace-nowrap">{fmt(l.timestamp)}</td><td className="px-4 py-2">{l.username || 'system'}</td>
                <td className="px-4 py-2 font-mono text-xs">{l.action}{l.status_code ? ` → ${l.status_code}` : ''}</td>
                <td className="px-4 py-2 text-xs text-gray-500 max-w-md truncate">{Object.entries(l.details || {}).map(([k, v]) => `${k}=${v}`).join(' ')}</td>
                <td className="px-4 py-2 text-xs text-gray-400">{l.ip_address}</td></tr>))}
          </Table>)}
      </Card>
    </Page>
  );
};
export default AuditLog;
