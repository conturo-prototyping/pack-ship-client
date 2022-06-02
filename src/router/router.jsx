import React, { useContext, useEffect, useState } from "react";
import {
  Navigate,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import PackingQueue from "../packing_queue/PackingQueue";
import ShippingQueue from "../shipping_queue/ShippingQueue";
import { CustomThemeContext } from "../themes/customThemeProvider";
import { themes } from "../themes/base";
import GoogleButton from "react-google-button";
import axios from "axios";
import { LoginSuccess } from "../components/LoginSuccess";
import { CircularProgress } from "@mui/material";

export const ROUTE_PACKING_SLIP = "/packing-slips";
export const ROUTE_SHIPMENTS = "/shipments";

const Router = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { setTheme } = useContext(CustomThemeContext);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAuthUser = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/users/me`, {
        withCredentials: true,
      })
      .then((res) => {

        const { user } = res.data;
        setIsUserAuthenticated(true);
        setAuthUser(user);

        // Only change pages on re-auth if it comes from login page. Otherwise refreshes should remain on page.
        if (
          location.pathname === "/login" ||
          location.pathname === "/"
        ) {
          navigate(ROUTE_PACKING_SLIP); 
        }
      })
      .catch((err) => {
        console.log("Not properly authenticated.");
        console.error(err);
        setIsUserAuthenticated(false);
        setAuthUser(null);
      });
  };

  useEffect(() => {
    fetchAuthUser().finally(() => {
      setLoading(false);
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    switch (location.pathname) {
      case ROUTE_SHIPMENTS:
        setTheme(themes.SHIPMENT);
        break;

      case ROUTE_PACKING_SLIP:
      default:
        setTheme(themes.PACKING);
    }
  }, [location, setTheme]);

  const PrivateRoute = ({ children }) => {
    if (!isUserAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  /**
   * Show google SSO & login window
   */
  const redirectToGoogleSSO = () => {
    let timer = null;
    const googleLoginURL = process.env.REACT_APP_API_URL + "/auth/google";
    const newWindow = window.open(
      googleLoginURL,
      "_blank",
      "width=500,height=600"
    );

    if (newWindow) {
      timer = setInterval(() => {
        if (newWindow.closed) {
          fetchAuthUser();
          if (timer) clearInterval(timer);
        }
      }, 500);
    }
  };

  return loading ? (
    <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%" }} />
  ) : (
    <Routes>
      <Route path="" element={<Navigate to="/login" />} />
      <Route
        exact
        path="/login"
        element={<GoogleButton onClick={redirectToGoogleSSO} />}
      />
      <Route exact path="/loginError">
        Error logging in. Please try again later.
      </Route>

      <Route exact path="/loginSuccess" element={<LoginSuccess />} />

      <Route
        exact
        path={ROUTE_PACKING_SLIP}
        element={
          <PrivateRoute>
            <PackingQueue />
          </PrivateRoute>
        }
      />

      <Route
        exact
        path={ROUTE_SHIPMENTS}
        element={
          <PrivateRoute>
            <ShippingQueue />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default Router;
