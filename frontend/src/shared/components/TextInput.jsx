import React from "react";
import "../styles/textinput.styles.css";

const TextInput = ({ labelName, textType, placeholder }) => {
  return (
    <span className="input-field">
      <label id="input-label">{labelName}</label>
      <input type={textType} placeholder={placeholder} />
    </span>
  );
};
export default TextInput;
