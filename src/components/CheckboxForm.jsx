import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

const CheckboxForm = ({
  onChange,
  label,
  checkBoxSx,
  formControlSx,
  checked = true,
  disabled = false,
}) => {
  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox sx={{ ...checkBoxSx }} checked={checked} />}
        label={label}
        onChange={(_, checked) => onChange(checked)}
        sx={{ ...formControlSx }}
        disabled={disabled}
      />
    </FormGroup>
  );
};

export default CheckboxForm;
