import React from 'react';
import '../styles/statcard.css';

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-info">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
      <div className="stat-card-icon">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;