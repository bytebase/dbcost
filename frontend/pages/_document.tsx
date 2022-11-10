import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html>
      <Head>
        <Script
          strategy="beforeInteractive"
          data-domain="dbcost.com"
          src="https://plausible.io/js/script.js"
        ></Script>
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
