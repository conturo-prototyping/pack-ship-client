import { IconButton } from "@mui/material";
import { useSnackbar } from "notistack";
import CloseIcon from "@mui/icons-material/Close";

export const snackbarVariants = {
  success: {
    autoHideDuration: 3000,
    variant: "success",
  },
  error: {
    autoHideDuration: 10000,
    variant: "error",
  },
};

export const usePackShipSnackbar = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const action = (key) => (
    <IconButton onClick={() => closeSnackbar(key)}>
      <CloseIcon sx={{ color: "white" }} />
    </IconButton>
  );

  const enqueuePackShipSnackbar = (msg, variant) => {
    enqueueSnackbar(msg, {
      ...variant,
      action,
    });
  };

  return enqueuePackShipSnackbar;
};
