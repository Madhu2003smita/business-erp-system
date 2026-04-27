import React from "react";
import "../styles/textinput.styles.css";

const TextInput = ({
  labelName,
  textType,
  placeholder,
  onChange,
  value,
  isError,
}) => {
  return (
    <span className="input-field">
      <label id="input-label">{labelName}</label>
      <input
        className={isError ? "text-input-error" : "text-input"}
        type={textType}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
      />
    </span>
  );
};
export default TextInput;
