import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import CustomThemeProvider from "./themes/customThemeProvider";
import { LicenseInfo } from '@mui/x-data-grid-pro';

LicenseInfo.setLicenseKey(
  '9ced39d34515975c7f9210f3e5c84842T1JERVI6Mzg4NDEsRVhQSVJZPTE2Nzc3NzA0MTcwMDAsS0VZVkVSU0lPTj0x',
);

ReactDOM.render(
  <React.StrictMode>
    <CustomThemeProvider>
      <App />
    </CustomThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
