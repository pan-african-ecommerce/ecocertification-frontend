import React, { useEffect, useState } from 'react';
import API from '../../api/endpoints';
import { downloadFile } from '../../api/axios';
import LoadingSpinner from '../common/LoadingSpinner';
import { Page, Card, Badge, Table, Empty, Button, fmtDate, run } from '../ui';

const Certificates = () => {
  const [certs, setCerts] = useState(null);
  const load = () => API.certificates().then(setCerts);
  useEffect(() => { load(); }, []);
  if (!certs) return <LoadingSpinner />;

  const act = async (c, action) => {
    let reason = '';
    if (action !== 'reinstate') {
      reason = window.prompt(`Reason to ${action} ${c.certificate_number}:`);
      if (!reason) return;
    }
    if (await run(() => API.setCertStatus(c.id, { action, reason }), `Certificate ${action}d`)) load();
  };

  return (
    <Page wide title="Certificates" subtitle="Issued certificates and their status. Public verification uses the certificate number.">
      <Card>
        {certs.length === 0 ? <Empty>No certificates issued yet.</Empty> : (
          <Table head={['Number', 'Holder', 'Scheme', 'Issued', 'Expires', 'Status', '']}>
            {certs.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-mono text-xs">{c.certificate_number}</td>
                <td className="px-4 py-3">{c.client_name}</td><td className="px-4 py-3">{c.scheme_name}</td>
                <td className="px-4 py-3">{fmtDate(c.issued_at)}</td><td className="px-4 py-3">{fmtDate(c.expires_at)}</td>
                <td className="px-4 py-3"><Badge status={c.status} />{c.status_reason && <div className="text-xs text-gray-400">{c.status_reason}</div>}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Button variant="ghost" onClick={() => downloadFile(`/certificates/${c.id}/pdf/`, `${c.certificate_number}.pdf`)}>PDF</Button>
                  {c.status === 'active' && <><Button variant="ghost" onClick={() => act(c, 'suspend')}>Suspend</Button><Button variant="ghost" onClick={() => act(c, 'revoke')}>Revoke</Button></>}
                  {c.status === 'suspended' && <><Button variant="ghost" onClick={() => act(c, 'reinstate')}>Reinstate</Button><Button variant="ghost" onClick={() => act(c, 'revoke')}>Revoke</Button></>}
                </td>
              </tr>))}
          </Table>)}
      </Card>
    </Page>
  );
};
export default Certificates;
