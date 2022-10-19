import { useState, useEffect, useCallback } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import MainLayout from "@/layouts/main";
import ButtonGroup from "@/components/ButtonGroup";
import RegionMenu from "@/components/RegionMenu";
import SearchMenu from "@/components/SearchMenu";
import CompareTable from "@/components/CompareTable";
import { useDBInstanceContext, useSearchConfigContext } from "@/stores";
import { getPrice, getRegionCode, getRegionName } from "@/utils";
import type { DataSource, CloudProvider } from "@/types";

const Provider: NextPage = () => {
  const [dataSource, setDataSource] = useState<DataSource[]>([]);
  const router = useRouter();
  const { provider } = router.query;
  const { dbInstanceList, loadDBInstanceList, getAvailableRegionList } =
    useDBInstanceContext();
  const { searchConfig, update: updateSearchConfig } = useSearchConfigContext();

  const generateTableData = useCallback((): DataSource[] => {
    let rowCount = 0;
    const dataSource: DataSource[] = [];
    const {
      cloudProvider,
      region,
      engineType,
      chargeType,
      minCPU,
      minRAM,
      utilization,
      leaseLength,
      keyword,
    } = searchConfig;

    // If any of these three below is empty, display no table row.
    if (
      region.length === 0 ||
      engineType.length === 0 ||
      chargeType.length === 0
    ) {
      return [];
    }

    const cloudProviderSet = new Set(cloudProvider);
    const selectedRegionCodeSet = new Set(
      region.map((region) => getRegionCode(region)).flat()
    );
    const engineSet = new Set(engineType);
    const chargeTypeSet = new Set(chargeType);

    // Process each db instance.
    dbInstanceList.forEach((dbInstance) => {
      if (
        (minRAM !== undefined && Number(dbInstance.memory) < minRAM) ||
        (minCPU !== undefined && Number(dbInstance.cpu) < minCPU)
      ) {
        return;
      }

      if (!cloudProviderSet.has(dbInstance.cloudProvider)) {
        return;
      }

      const selectedRegionList = dbInstance.regionList.filter((region) =>
        selectedRegionCodeSet.has(region.code)
      );

      if (selectedRegionList.length === 0) {
        return;
      }

      const dataRowList: DataSource[] = [];
      const dataRowMap: Map<string, DataSource[]> = new Map();

      selectedRegionList.forEach((region) => {
        const selectedTermList = region.termList.filter(
          (term) =>
            chargeTypeSet.has(term.type) && engineSet.has(term.databaseEngine)
        );

        let basePriceMap = new Map<string, number>();
        selectedTermList.forEach((term) => {
          if (term.type === "OnDemand") {
            basePriceMap.set(term.databaseEngine, term.hourlyUSD);
          }
        });

        const regionName = getRegionName(region.code);
        selectedTermList.forEach((term) => {
          const regionInstanceKey = `${dbInstance.name}::${region.code}::${term.databaseEngine}`;
          const newRow: DataSource = {
            // set this later
            id: -1,
            // We use :: for separation because AWS use . and GCP use - as separator.
            key: `${dbInstance.name}::${region.code}::${term.code}`,
            // set this later
            childCnt: 0,
            cloudProvider: dbInstance.cloudProvider,
            name: dbInstance.name,
            processor: dbInstance.processor,
            cpu: dbInstance.cpu,
            memory: dbInstance.memory,
            engineType: term.databaseEngine,
            commitment: { usd: term.commitmentUSD },
            hourly: { usd: term.hourlyUSD },
            leaseLength: term.payload?.leaseContractLength ?? "N/A",
            // We store the region code for each provider, and show the user the actual region information.
            // e.g. AWS's us-east-1 and GCP's us-east-4 are refer to the same region (N. Virginia)
            region: regionName,
            baseHourly: basePriceMap.get(term.databaseEngine) as number,
            // set this later
            expectedCost: 0,
          };
          newRow.expectedCost = getPrice(newRow, utilization, leaseLength);

          if (dataRowMap.has(regionInstanceKey)) {
            const existedDataRowList = dataRowMap.get(
              regionInstanceKey
            ) as DataSource[];
            newRow.id = existedDataRowList[0].id;
            existedDataRowList.push(newRow);
          } else {
            rowCount++;
            newRow.id = rowCount;
            dataRowMap.set(regionInstanceKey, [newRow]);
          }
        });
      });

      dataRowMap.forEach((rows) => {
        rows.sort((a, b) => {
          // Sort rows according to the following criterion:
          // 1. On demand price goes first.
          // 2. Sort on expected cost.
          if (a.leaseLength === "N/A") {
            return -1;
          } else if (b.leaseLength === "N/A") {
            return 1;
          }

          return a.expectedCost - b.expectedCost;
        });
        rows.forEach((row) => {
          row.childCnt = rows.length;
        });
        dataRowList.push(...rows);
      });

      const searchKey = keyword?.toLowerCase();
      if (searchKey) {
        // filter by keyword
        const filteredDataRowList: DataSource[] = dataRowList.filter(
          (row) =>
            row.name.toLowerCase().includes(searchKey) ||
            row.memory.toLowerCase().includes(searchKey) ||
            row.processor.toLowerCase().includes(searchKey) ||
            row.region.toLowerCase().includes(searchKey)
        );
        dataSource.push(...filteredDataRowList);
        return;
      }

      dataSource.push(...dataRowList);
    });

    return dataSource;
  }, [dbInstanceList, searchConfig]);

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
        <ButtonGroup type="reset" />
        <RegionMenu availableRegionList={availableRegionList} />
        <SearchMenu hideProviders={true} />

        <CompareTable
          dataSource={dataSource}
          setDataSource={setDataSource}
          generateTableData={generateTableData}
          hideProviderIcon={true}
        />
      </div>
    </MainLayout>
  );
};

export default Provider;
