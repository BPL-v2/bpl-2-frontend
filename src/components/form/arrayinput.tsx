import React from "react";

interface ArrayInputProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  label: string;
}

const ArrayInput: React.FC<ArrayInputProps> = ({
  value = [],
  onChange,
  label,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      e.target.value.length > 0
        ? e.target.value.split(",").map((item) => item.trim())
        : [];
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <label className="floating-label">
      <span>{label}</span>
      <input value={value.join(",")} onChange={handleChange} />
    </label>
  );
};

export default ArrayInput;
