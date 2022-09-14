import { useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Button } from "antd";
import shallow from "zustand/shallow";
import MainLayout from "@/layouts/main";
import RegionMenu from "@/components/RegionMenu";
import {
  useDBInstanceStore,
  useAvailableRegionList,
} from "@/stores/dbInstance";

const Home: NextPage = () => {
  const loadDBInstanceList = useDBInstanceStore(
    (state) => state.loadDBInstanceList,
    shallow
  );

  useEffect(() => {
    loadDBInstanceList();
  }, [loadDBInstanceList]);

  const availableRegionList = useAvailableRegionList();

  return (
    <MainLayout title="The Ultimate AWS RDS and Google Cloud SQL Instance Pricing Sheet">
      <Head>
        <title>DB Cost | RDS & Cloud SQL Instance Pricing Sheet</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-5 mt-4 border-b pb-2">
        <div className="flex flex-row justify-center my-4">
          <Button className="mr-2">Reset</Button>
          <Button>Copy URL</Button>
        </div>
        <RegionMenu availableRegionList={availableRegionList} />
      </div>
    </MainLayout>
  );
};

export default Home;
