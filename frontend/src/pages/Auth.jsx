import React, { useState } from "react";
import LoginForm from "../features/auth/components/LoginForm";
import SignUpForm from "../features/auth/components/SignUpForm";

import "./styles/auth-page.styles.css";
import Button from "../shared/components/Button";

const Auth = () => {
  const [toggleForm, setToggleForm] = useState("login");
  return (
    <div className="auth-page">
      {toggleForm === "login" ? (
        <LoginForm setToggleForm={setToggleForm} />
      ) : (
        <SignUpForm setToggleForm={setToggleForm} />
      )}
    </div>
  );
};

export default Auth;
