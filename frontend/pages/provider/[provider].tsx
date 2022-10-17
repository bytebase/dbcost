import { useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import MainLayout from "@/layouts/main";
import ButtonGroup from "@/components/ButtonGroup";
import RegionMenu from "@/components/RegionMenu";
import SearchMenu from "@/components/SearchMenu";
import CompareTable from "@/components/CompareTable";
import { useDBInstanceContext, useSearchConfigContext } from "@/stores";
import type { CloudProvider } from "@/types";

const Provider: NextPage = () => {
  const router = useRouter();
  const { provider } = router.query;
  const { loadDBInstanceList, getAvailableRegionList } = useDBInstanceContext();
  const { update: updateSearchConfig } = useSearchConfigContext();

  useEffect(() => {
    loadDBInstanceList();
  }, [loadDBInstanceList]);

  const availableRegionList = getAvailableRegionList();

  useEffect(() => {
    if (typeof provider === "string") {
      // Remove provider selector since the provider is determined.
      updateSearchConfig("cloudProvider", [
        provider.toUpperCase() as CloudProvider,
      ]);
    }
  }, [provider, updateSearchConfig]);

  return (
    <MainLayout title="The Ultimate AWS RDS and Google Cloud SQL Instance Pricing Sheet">
      <div className="mx-5 mt-4 pb-2">
        <ButtonGroup />
        <RegionMenu availableRegionList={availableRegionList} />
        <SearchMenu hideProviders={true} />
        <CompareTable hideProviderIcon={true} />
      </div>
    </MainLayout>
  );
};

export default Provider;
