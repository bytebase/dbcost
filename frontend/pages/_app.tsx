import {
  DBInstanceContextProvider,
  SearchConfigContextProvider,
} from "@/stores";
// Import TailwindCSS here.
import "../styles/globals.css";
import "antd/dist/antd.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DBInstanceContextProvider>
      <SearchConfigContextProvider>
        <Component {...pageProps} />
      </SearchConfigContextProvider>
    </DBInstanceContextProvider>
  );
}

export default MyApp;
