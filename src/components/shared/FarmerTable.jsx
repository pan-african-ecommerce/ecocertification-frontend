import React from 'react';
import { Badge, Table, Empty } from '../ui';

export const SYSTEM_LABEL = { organic: 'Organic', conversion: 'In conversion', conventional: 'Conventional' };

export const FarmerTable = ({ farmers, actions }) => (
  farmers.length === 0 ? <Empty>No farmers registered.</Empty> : (
    <Table head={['Farmer', 'Location', 'Farm size', 'Crops', 'System', 'GPS', ...(actions ? [''] : [])]}>
      {farmers.map((f) => (
        <tr key={f.id} className={f.is_active ? '' : 'opacity-50'}>
          <td className="px-4 py-2"><p className="font-medium text-gray-900">{f.full_name}</p><p className="text-xs text-gray-500">{[f.national_id, f.phone].filter(Boolean).join(' · ')}</p></td>
          <td className="px-4 py-2">{[f.village, f.district].filter(Boolean).join(', ') || '—'}</td>
          <td className="px-4 py-2 whitespace-nowrap">{f.farm_size_ha != null ? `${f.farm_size_ha} ha` : '—'}{f.number_of_plots ? <span className="text-xs text-gray-400"> · {f.number_of_plots} plots</span> : null}</td>
          <td className="px-4 py-2">{f.main_crops || '—'}</td>
          <td className="px-4 py-2"><Badge status={f.production_system === 'organic' ? 'approved' : f.production_system === 'conversion' ? 'pending' : 'draft'} label={SYSTEM_LABEL[f.production_system]} /></td>
          <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{f.latitude != null && f.longitude != null ? `${f.latitude}, ${f.longitude}` : '—'}</td>
          {actions && <td className="px-4 py-2 text-right whitespace-nowrap">{actions(f)}</td>}
        </tr>
      ))}
    </Table>
  )
);
export default FarmerTable;
