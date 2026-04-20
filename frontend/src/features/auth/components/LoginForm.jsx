import React from "react";
import TextInput from "../../../shared/components/TextInput";

import "../styles/loginform.styles.css";
import Button from "../../../shared/components/Button";

const LoginForm = () => {
  return (
    <div className="login-form">
      <h1>Login</h1>
      <TextInput
        labelName="Email:"
        textType="text"
        placeholder="example@gmail.com"
      />
      <TextInput labelName="Password:" textType="password" />
    </div>
  );
};
export default LoginForm;
