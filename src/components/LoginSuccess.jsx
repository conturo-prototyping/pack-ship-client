import { useEffect } from "react";

export function LoginSuccess() {
  useEffect(() => {
    console.log('test test test');

    setTimeout(() => {
      window.close();
    }, 250);
  }, []);

  return <div></div>;
}