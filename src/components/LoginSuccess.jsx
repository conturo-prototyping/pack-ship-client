import { nextTick } from "q";
import { useEffect } from "react";

export function LoginSuccess() {
  useEffect(() => nextTick(() => window.close()), []);
  
  return <div></div>;
}