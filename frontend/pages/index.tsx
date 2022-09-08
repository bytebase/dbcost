import type { NextPage } from "next";
import Head from "next/head";
import MainLayout from "@/layouts/main";

const Home: NextPage = () => {
  return (
    <MainLayout title="The Ultimate AWS RDS and Google Cloud SQL Instance Pricing Sheet">
      <Head>
        <title>DB Cost | RDS & Cloud SQL Instance Pricing Sheet</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </MainLayout>
  );
};

export default Home;
