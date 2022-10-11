import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = {
  children: React.ReactNode;
  title: string;
};

const Main: React.FC<Props> = ({ children, title }) => {
  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>DB Cost | RDS & Cloud SQL Instance Pricing Sheet</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="flex-grow">
        <h1 className="flex flex-row justify-center mx-5 mt-4 text-4xl text-center text-slate-800 space-x-2">
          {title}
        </h1>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Main;
