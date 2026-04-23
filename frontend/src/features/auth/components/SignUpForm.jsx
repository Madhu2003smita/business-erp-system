import React, { useState } from "react";
import TextInput from "../../../shared/components/TextInput";
import Button from "../../../shared/components/Button";

import "../styles/signupform.styles.css";

const SignUpForm = ({ setToggleForm }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");
  return (
    <div className="signup-form">
      <h1 className="signup-heading">Sign Up</h1>
      <h5 className="log-in-heading">
        Already have an account?
        <span className="log-in-toggle" onClick={() => setToggleForm("login")}>
          Log in
        </span>
      </h5>
      <TextInput
        labelName="Full Name:"
        textType="text"
        placeholder="Full Name..."
        onChange={(e) => setFullName(e.target.value)}
      />
      <TextInput
        labelName="Email:"
        textType="text"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextInput
        labelName="Password:"
        textType="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextInput
        labelName="Confirm password:"
        textType="password"
        onChange={(e) => setCpassword(e.target.value)}
      />

      <div className="terms-n-cond">
        <input type="checkbox" id="termsandcond" />
        <h5>
          I agree to the <span className="terms-toggle"> Terms </span>and
          <span className="privacy-policy-toggle"> Privacy Policy</span>
        </h5>
      </div>
      <Button
        BtnName="Create Acccount"
        onClick={() => {
          console.log("Full Name=", fullName);
          console.log("Email=", email);
          console.log("Password=", password);
          console.log("Confirm Password=", cpassword);
        }}
      ></Button>
    </div>
  );
};
export default SignUpForm;
