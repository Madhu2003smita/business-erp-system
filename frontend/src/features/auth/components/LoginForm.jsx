/* eslint-disable react/no-unescaped-entities */
import React from "react";
import TextInput from "../../../shared/components/TextInput";
import Button from "../../../shared/components/Button";
import CheckBox from "../../../shared/components/CheckBox";

import "../styles/loginform.styles.css";

const LoginForm = ({ setToggleForm }) => {
  return (
    <div className="login-form">
      <h1 className="login-heading">Login</h1>
      <h5 className="sign-up-heading">
        Don't have an account?{" "}
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
      />
      <TextInput labelName="Password:" textType="password" />
      <Button BtnName="Login" />
      <h4 className="frgtn-password-heading">Forgotten Password?</h4>
    </div>
  );
};
export default LoginForm;
