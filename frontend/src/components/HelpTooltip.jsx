import { Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const HelpTooltip = ({ tooltipText }) => {
  return (
    <Tooltip title={tooltipText}>
      <HelpOutlineIcon />
    </Tooltip>
  );
};

export default HelpTooltip;
