import React from "react";
import LoginForm from "../features/auth/components/LoginForm";

import "./styles/login-page.styles.css";

const Auth = () => {
  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
};

export default Auth;
