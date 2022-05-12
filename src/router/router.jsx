import React, { useContext, useEffect, useState } from "react";
import { Navigate, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import PackingQueue from "../packing_queue/PackingQueue";
import ShippingQueue from "../shipping_queue/ShippingQueue";
import { CustomThemeContext } from "../themes/customThemeProvider";
import { themes } from "../themes/base";
import GoogleButton from "react-google-button";
import axios from "axios";
import { LoginSuccess } from "../components/LoginSuccess";

export const ROUTE_PACKING_SLIP = "/packing-slips";
export const ROUTE_SHIPMENTS = "/shipments";

const Router = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { setTheme } = useContext(CustomThemeContext);
  const [, setIsAuthenticated] = useState(false);
  const [, setAuthUser] = useState(null);

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

  const fetchAuthUser = async () => {
    axios
      .get('http://localhost:3000/users/me', { withCredentials: true })
      .then(res => {
        const { user } = res.data;
        setIsAuthenticated(true);
        setAuthUser(user);
        navigate(ROUTE_PACKING_SLIP);
      })
      .catch(err => {
        console.log('Not properly authenticated.');
        console.error(err);
        setIsAuthenticated(false);
        setAuthUser(null);
      });
  };

  /**
   * Show google SSO & login window
   */
  const redirectToGoogleSSO = async () => {
    let timer = null;
    const googleLoginURL = 'http://localhost:3000/auth/google';
    const newWindow = window.open(
      googleLoginURL,
      '_blank',
      'width=500,height=600'
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

  return (
    <Routes>
      <Route exact path={ROUTE_PACKING_SLIP} element={<PackingQueue />} />
      <Route exact path={ROUTE_SHIPMENTS} element={<ShippingQueue />} />
      <Route path="" element={<Navigate to='/login' />} />

      <Route exact path='/login' element={<GoogleButton onClick={redirectToGoogleSSO} />} />
      <Route exact path='/loginSuccess' element={<LoginSuccess />} />
      <Route exact path='/loginError'>
        Error logging in. Please try again later.
      </Route>
    </Routes>
  );
};

export default Router;
