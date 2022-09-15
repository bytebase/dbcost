// Import TailwindCSS here.
import "../styles/globals.css";
import "antd/lib/button/style/index.css";
import "antd/lib/checkbox/style/index.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
