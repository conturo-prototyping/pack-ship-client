import React from "react";
import { styled } from "@mui/system";
import TabsUnstyled from "@mui/base/TabsUnstyled";
import Tabs from "@mui/material/Tabs";
import TabPanelUnstyled from "@mui/base/TabPanelUnstyled";
import { buttonUnstyledClasses } from "@mui/base/ButtonUnstyled";
import TabUnstyled, { tabUnstyledClasses } from "@mui/base/TabUnstyled";
import { Box } from "@mui/material";

const Tab = styled(TabUnstyled, {
  shouldForwardProp: (props) =>
    props !== "fullWidth" &&
    props !== "indicator" &&
    props !== "selectionFollowsFocus" &&
    props !== "textColor",
})(({ theme }) => {
  return `
  font-family: IBM Plex Sans, sans-serif;
  color: grey;
  background-color: ${theme.palette.secondary.light};
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  width: 100%;
  padding: 12px 16px;
  border: none;
  display: flex;
  justify-content: center;

  &:hover {
    background-color: ${theme.palette.primary.light}};
  }


  &.${buttonUnstyledClasses.focusVisible} {
    outline: none;
  }

  &.${tabUnstyledClasses.selected} {
    background-color: white;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    color: black;
  }

  &.${buttonUnstyledClasses.disabled} {
    cursor: not-allowed;
  }
`;
});

const TabPanel = styled(TabPanelUnstyled)`
  width: 100%;
  font-family: IBM Plex Sans, sans-serif;
  font-size: 0.875rem;
`;

export default function PackShipTabs({
  onTabChange,
  queueTotal,
  queueTab,
  historyTab,
}) {
  return (
    <Box
      bgcolor="secondary.light"
      borderRadius="8px"
      boxSizing="border-box"
      p={1}>
      <TabsUnstyled defaultValue={0}>
        <Tabs value={false} onChange={onTabChange}>
          <Tab value={0}>Queue ({queueTotal})</Tab>
          <Tab value={1}>History</Tab>
        </Tabs>
        <TabPanel value={0}>{queueTab}</TabPanel>
        <TabPanel value={1}>{historyTab}</TabPanel>
      </TabsUnstyled>
    </Box>
  );
}
