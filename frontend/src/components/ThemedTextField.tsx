import React from "react";
import { TextField, useTheme, TextFieldProps } from "@mui/material";

interface ThemedTextFieldProps extends TextFieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
}

const ThemedTextField: React.FC<ThemedTextFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  sx,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <TextField
      fullWidth
      variant="outlined"
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      type={type}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        input: { color: theme.palette.text.primary },
        "& label": { color: theme.palette.text.secondary },
        "& label.Mui-focused": { color: theme.palette.primary.main },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: theme.palette.divider,
          },
          "&:hover fieldset": {
            borderColor: theme.palette.primary.light,
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
          },
        },
        ...sx,
      }}
      {...rest}
    />
  );
};

export default ThemedTextField;
