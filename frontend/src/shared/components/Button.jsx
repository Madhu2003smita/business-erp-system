import React from "react";
import "../styles/button.styles.css";

const Button = ({ BtnName }) => {
  return <button className="login-button">{BtnName}</button>;
};

export default Button;
