/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import TextInput from "../../../shared/components/TextInput";
import Button from "../../../shared/components/Button";
import CheckBox from "../../../shared/components/CheckBox";

import "../styles/loginform.styles.css";

const LoginForm = ({ setToggleForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="login-form">
      <h1 className="login-heading">Login</h1>
      <h5 className="sign-up-heading">
        Don't have an account?
        <span
          className="sign-up-toggle"
          onClick={() => setToggleForm("signup")}
        >
          Sign-up
        </span>
      </h5>
      <TextInput
        labelName="Email:"
        textType="text"
        placeholder="example@gmail.com"
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextInput
        labelName="Password:"
        textType="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        BtnName="Login"
        onClick={() => {
          console.log("Email=", email);
          console.log("Password=", password);
        }}
      />
      <h4 className="frgtn-password-heading">Forgotten Password?</h4>
    </div>
  );
};
export default LoginForm;
