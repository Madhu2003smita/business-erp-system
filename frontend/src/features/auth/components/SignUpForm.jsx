import React from "react";
import TextInput from "../../../shared/components/TextInput";
import Button from "../../../shared/components/Button";

import "../styles/signupform.styles.css";

const SignUpForm = ({ setToggleForm }) => {
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
      />
      <TextInput
        labelName="Email:"
        textType="text"
        placeholder="Enter your email"
      />
      <TextInput labelName="Password:" textType="password" />
      <TextInput labelName="Confirm password:" textType="password" />
      <div className="terms-n-cond">
        <input type="checkbox" id="termsandcond" />
        <h5>
          I agree to the <span className="terms-toggle"> Terms </span>and
          <span className="privacy-policy-toggle"> Privacy Policy</span>
        </h5>
      </div>
      <Button BtnName="Create Acccount"></Button>
    </div>
  );
};
export default SignUpForm;
