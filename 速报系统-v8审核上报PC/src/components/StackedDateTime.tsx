import React from 'react';

export const StackedDateTime: React.FC<{ value?: string }> = ({ value }) => {
  if (!value) return <span>—</span>;
  const [date, time] = value.split(' ');
  return (
    <div className="leading-relaxed">
      <div>{date}</div>
      {time && <div className="text-gray-400">{time}</div>}
    </div>
  );
};
