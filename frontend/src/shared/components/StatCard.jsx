import React from 'react';
import '../styles/statcard.css';

const StatCard = ({ title, value, icon, loading }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-info">
        <h3>{title}</h3>
        {loading ? (
          <div className="stat-card-skeleton" />
        ) : (
          <p>{value}</p>
        )}
      </div>
      <div className="stat-card-icon">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
