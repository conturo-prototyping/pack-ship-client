import React, { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { themes } from "./base";

export const CustomThemeContext = React.createContext({
  currentTheme: themes.PACKINGTHEME,
  setTheme: null,
});

const CustomThemeProvider = (props) => {
  const { children } = props;
  const [theme, setThemeName] = useState(themes.PACKING);

  const contextValue = {
    currentTheme: theme,
    setTheme: setThemeName,
  };

  return (
    <CustomThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CustomThemeContext.Provider>
  );
};

export default CustomThemeProvider;
