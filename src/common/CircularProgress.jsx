import { CircularProgress } from "@mui/material";

export const PackShipProgress = () => {
  return (
    <CircularProgress
      sx={{
        position: "absolute",
        top: "calc(50% - 4rem)",
        left: "calc(50% - 4rem)",
      }}
      size="8rem"
      thickness={8}
    />
  );
};
