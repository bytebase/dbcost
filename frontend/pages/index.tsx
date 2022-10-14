import { useEffect } from "react";
import type { NextPage } from "next";
import MainLayout from "@/layouts/main";
import ButtonGroup from "@/components/ButtonGroup";
import RegionMenu from "@/components/RegionMenu";
import SearchMenu from "@/components/SearchMenu";
import CompareTable from "@/components/CompareTable";
import { useDBInstanceContext } from "@/stores";

const Home: NextPage = () => {
  const { loadDBInstanceList, getAvailableRegionList } = useDBInstanceContext();

  useEffect(() => {
    loadDBInstanceList();
  }, [loadDBInstanceList]);

  const availableRegionList = getAvailableRegionList();

  return (
    <MainLayout title="The Ultimate AWS RDS and Google Cloud SQL Instance Pricing Sheet">
      <div className="mx-5 mt-4 pb-2">
        <ButtonGroup />
        <RegionMenu availableRegionList={availableRegionList} />
        <SearchMenu />
        <CompareTable />
      </div>
    </MainLayout>
  );
};

export default Home;
