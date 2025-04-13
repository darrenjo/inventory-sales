import React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";

interface ThemedTextFieldProps extends TextFieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
  error?: boolean;
  helperText?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  sx?: TextFieldProps["sx"];
}

const ThemedTextField: React.FC<ThemedTextFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  error = false,
  helperText = "",
  onBlur,
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
      onBlur={onBlur}
      required={required}
      type={type}
      error={error}
      helperText={helperText}
      slotProps={{
        formHelperText: {
          sx: {
            marginLeft: 0,
            marginTop: 0.5,
            color: error
              ? theme.palette.error.main
              : theme.palette.text.secondary,
          },
        },
      }}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        input: { color: theme.palette.text.primary },
        "& label": {
          color: error
            ? theme.palette.error.main
            : theme.palette.text.secondary,
        },
        "& label.Mui-focused": {
          color: error ? theme.palette.error.main : theme.palette.primary.main,
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: error
              ? theme.palette.error.main
              : theme.palette.divider,
          },
          "&:hover fieldset": {
            borderColor: error
              ? theme.palette.error.light
              : theme.palette.primary.light,
          },
          "&.Mui-focused fieldset": {
            borderColor: error
              ? theme.palette.error.main
              : theme.palette.primary.main,
          },
        },
        ...sx,
      }}
      {...rest}
    />
  );
};

export default ThemedTextField;
