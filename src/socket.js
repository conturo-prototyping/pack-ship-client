import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
let { REACT_APP_API_URL } = process.env;

export const SocketIoFactory = (auth) => {
  var instance;
  return {
    getInstance: () => {
      if (instance == null) {
        instance = io(REACT_APP_API_URL, {
          withCredentials: true,
          autoConnect: false,
        });
      }
      return instance;
    },
  };
};

export const socket = io(REACT_APP_API_URL, {
  autoConnect: false,
});
