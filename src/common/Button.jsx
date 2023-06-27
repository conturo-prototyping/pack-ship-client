import * as React from "react";
import Button from "@mui/material/Button";

const CommonButton = ({
  onClick,
  label,
  disabled = false,
  variant = "contained",
  autoFocus = false,
  color = "primary",
  type = undefined,
  sx = undefined,
  component = "button",
  children,
}) => {
  return (
    <Button
      color={color}
      disabled={disabled}
      variant={variant}
      onClick={onClick}
      autoFocus={autoFocus}
      type={type}
      sx={sx}
      component={component}>
      {label}
      {children}
    </Button>
  );
};

export default CommonButton;
