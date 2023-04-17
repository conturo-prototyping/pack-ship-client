import { Box, Card, CardActionArea, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

const withStyledDismiss = (Component) => (props) => {
  const { onClearClick } = props;

  return (
    <Box sx={{ padding: "20px" }}>
      <CardActionArea>
        <Card>
          <Component {...props} />
          {onClearClick && (
            <Box
              sx={{
                position: "absolute",
                top: "-5%",
                right: "-5%",
              }}
            >
              <IconButton
                sx={{ backgroundColor: "red" }}
                onClick={onClearClick}
              >
                <ClearIcon />
              </IconButton>
            </Box>
          )}
        </Card>
      </CardActionArea>
    </Box>
  );
};

export default withStyledDismiss;
