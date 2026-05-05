/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import TextInput from "../../../shared/components/TextInput";
import Button from "../../../shared/components/Button";
import CheckBox from "../../../shared/components/CheckBox";

import "../styles/loginform.styles.css";
import handleApiCall from "../../../shared/services/apiService";
import { apiMethods, endPoints } from "../../../shared/constants/api";
import { gooeyToast } from "goey-toast";
import { useNavigate } from "react-router";
import { paths } from "../../../shared/constants/routes";

const LoginForm = ({ setToggleForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      const payload = { email, password };
      const result = await handleApiCall(
        endPoints.login,
        apiMethods.post,
        payload,
      );
       console.log("FULL RESULT:", result);

      localStorage.setItem("token", result?.token);
      gooeyToast.success("Login successfully");
      navigate(paths.dashboard);
    } catch (err) {
      console.log("err", err);
      gooeyToast.error("Login failed");
    }
  };
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
        value={email}
      />
      <TextInput
        labelName="Password:"
        textType="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />

      <Button
        BtnName="Login"
        onClick={() => {
          handleLogin();
        }}
      />
      <h4 className="frgtn-password-heading">Forgotten Password?</h4>
    </div>
  );
};
export default LoginForm;
