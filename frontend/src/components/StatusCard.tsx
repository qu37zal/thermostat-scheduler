import React from 'react';

interface StatusCardProps {
  title: string;
  value: string | number | undefined;
  backgroundColor: string;
  borderColor: string;
  unit?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  backgroundColor,
  borderColor,
  unit = '',
}) => {
  return (
    <div
      style={{
        padding: '1.5rem',
        backgroundColor,
        borderRadius: '8px',
        border: `2px solid ${borderColor}`,
      }}
    >
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
        <strong>{title}</strong>
      </div>
      <div style={{ fontSize: value !== undefined && String(value).length < 10 ? '2.5rem' : '1.5rem', fontWeight: 'bold' }}>
        {value !== undefined ? `${value}${unit}` : 'N/A'}
      </div>
    </div>
  );
};

export default StatusCard;
