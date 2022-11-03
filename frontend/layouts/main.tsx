import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = {
  children: React.ReactNode;
  headTitle?: string;
  title: string;
};

const Main: React.FC<Props> = ({ children, headTitle, title }) => {
  return (
    <div className="flex flex-col h-screen min-w-fit">
      <Head>
        <title>
          {headTitle ?? "DB Cost | RDS & Cloud SQL Instance Pricing Sheet"}
        </title>
        <link rel="icon" href="/favicon.ico" />
        <script
          defer
          data-domain="dbcost.com"
          src="https://plausible.io/js/script.js"
        ></script>
      </Head>
      <Header />
      <main className="flex flex-grow justify-center">
        <div className="w-full 2xl:w-5/6 2xl:max-w-7xl">
          <h1 className="flex flex-row justify-center mx-5 mt-4 text-4xl text-center text-slate-800 space-x-2">
            {title}
          </h1>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Main;
