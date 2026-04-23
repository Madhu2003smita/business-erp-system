import React from "react";
import "../styles/textinput.styles.css";

const TextInput = ({ labelName, textType, placeholder, onChange }) => {
  return (
    <span className="input-field">
      <label id="input-label">{labelName}</label>
      <input
        className="text-input"
        type={textType}
        placeholder={placeholder}
        onChange={onChange}
      />
    </span>
  );
};
export default TextInput;
