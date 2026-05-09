import React from "react";
import "../styles/badge.styles.css";

const badgeColors = {
  active: "badge-green",
  inactive: "badge-gray",
  on_leave: "badge-yellow",
  terminated: "badge-red",
  pending: "badge-yellow",
  approved: "badge-green",
  rejected: "badge-red",
  posted: "badge-green",
  draft: "badge-yellow",
  reversed: "badge-red",
  asset: "badge-green",
  liability: "badge-red",
  equity: "badge-blue",
  revenue: "badge-green",
  expense: "badge-yellow",
  delivered: "badge-green",
};

const Badge = ({ status }) => {
  const colorClass = badgeColors[status] || "badge-gray";
  return (
    <span className={`badge ${colorClass}`}>
      {status?.replace("_", " ")}
    </span>
  );
};

export default Badge;
