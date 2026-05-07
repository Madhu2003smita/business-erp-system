import React, { useState } from "react";
import TextInput from "../../../shared/components/TextInput";
import Button from "../../../shared/components/Button";

import "../styles/signupform.styles.css";
import { apiMethods, endPoints } from "../../../shared/constants/api";
import handleApiCall from "../../../shared/services/apiService";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";

const SignUpForm = ({ setToggleForm }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCpassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const handleConfirmPassword = (val) => {
    if (val !== password) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
    setCpassword(val);
  };

  const handleSignup = async () => {
    try {
      const payload = { name: fullName, email, password };
      await handleApiCall(endPoints.register, apiMethods.post, payload);
      gooeyToast.success("Signed up successfully");
      setToggleForm("login");
    } catch (err) {
      console.log("err", err);
      gooeyToast.error(err.message || "Signup failed");
    }
  };
  return (
    <div className="signup-form">
      <h1 className="signup-heading">Sign Up</h1>
      <h5 className="log-in-heading">
        Already have an account ?{" "}
        <span className="log-in-toggle" onClick={() => setToggleForm("login")}>
          Log in
        </span>
      </h5>
      <TextInput
        labelName="Full Name:"
        textType="text"
        placeholder="Full Name..."
        onChange={(e) => setFullName(e.target.value)}
        value={fullName}
      />
      <TextInput
        labelName="Email:"
        textType="text"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <TextInput
        labelName="Password:"
        textType="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <TextInput
        labelName="Confirm password:"
        textType="password"
        onChange={(e) => handleConfirmPassword(e.target.value)}
        value={cPassword}
        isError={passwordMismatch}
      />

      <Button
        BtnName="Create Acccount"
        onClick={() => {
          handleSignup();
        }}
      ></Button>
    </div>
  );
};
export default SignUpForm;
