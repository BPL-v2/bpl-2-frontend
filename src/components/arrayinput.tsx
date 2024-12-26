import React from "react";
import { Input } from "antd";

interface ArrayInputProps {
  value?: string[];
  onChange?: (value: string[]) => void;
}

const ArrayInput: React.FC<ArrayInputProps> = ({ value = [], onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      e.target.value.length > 0
        ? e.target.value.split(",").map((item) => item.trim())
        : [];
    if (onChange) {
      onChange(newValue);
    }
  };

  return <Input value={value.join(",")} onChange={handleChange} />;
};

export default ArrayInput;
