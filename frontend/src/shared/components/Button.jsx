import React from "react";
import "../styles/button.styles.css";

const Button = ({ BtnName, onClick }) => {
  return (
    <button className="login-button" onClick={onClick}>
      {BtnName}
    </button>
  );
};

export default Button;
