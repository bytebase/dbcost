import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/router";

type Props = {
  children: React.ReactNode;
  headTitle?: string;
  title: string;
  metaTagList?: {
    name: string;
    content: string;
  }[];
};

const baseURL = "https://www.dbcost.com";

const Main: React.FC<Props> = ({ children, headTitle, title, metaTagList }) => {
  // Concat a canonical URL, and remove trailing slash if any.
  const canonicalURL = (baseURL + useRouter().asPath).replace(/\/$/, "");

  return (
    <div className="flex flex-col h-screen min-w-fit">
      <Head>
        <title>
          {headTitle ?? "DB Cost | RDS & Cloud SQL Instance Pricing Sheet"}
        </title>
        <link rel="canonical" href={canonicalURL} />
        <link rel="icon" href="/favicon.ico" />
        {metaTagList?.map(({ name, content }) => (
          <meta key={name} name={name} content={content} />
        ))}
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
