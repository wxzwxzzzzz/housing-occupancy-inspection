import React from 'react';
import type { DetailField } from '../types';

export interface DetailFooterProps {
  fields: DetailField[];
}

const DetailFooter: React.FC<DetailFooterProps> = ({ fields }) => {
  if (!fields || fields.length === 0) return null;

  return (
    <div className="opp-detail-footer">
      {fields.map((f, i) => (
        <div key={i} className="opp-field">
          <span className="opp-field-label">{f.label}</span>
          <span
            className="opp-field-value"
            title={typeof f.value === 'string' ? f.value : undefined}
          >
            {f.value ?? '--'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default DetailFooter;
