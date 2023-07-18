import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
let { REACT_APP_API_URL } = process.env;

export const SocketIoFactory = (function () {
  var instance;
  return {
    getInstance: (auth) => {
      if (instance === undefined && !auth) {
        instance = io(REACT_APP_API_URL, {
          withCredentials: true,
          autoConnect: false,
        });
      } else if (instance === undefined && auth) {
        instance = io(REACT_APP_API_URL, {
          autoConnect: false,
          extraHeaders: {
            Authorization: auth,
          },
          auth: {
            Authorization: auth,
          },
        });
      }
      return instance;
    },
  };
})();

export const socket = io(REACT_APP_API_URL, {
  autoConnect: false,
});
