import { DBInstanceContextProvider } from "@/stores";
// Import TailwindCSS here.
import "../styles/globals.css";
import "antd/dist/antd.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DBInstanceContextProvider>
      <Component {...pageProps} />
    </DBInstanceContextProvider>
  );
}

export default MyApp;
