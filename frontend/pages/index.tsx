import { useState, useEffect, useCallback } from "react";
import type { NextPage, GetStaticProps } from "next";
import MainLayout from "@/layouts/main";
import ButtonGroup from "@/components/ButtonGroup";
import RegionMenu from "@/components/RegionMenu";
import SearchMenu from "@/components/SearchMenu";
import CompareTable from "@/components/CompareTable";
import { useDBInstanceContext, useSearchConfigContext } from "@/stores";
import { getPrice, getRegionCode, getRegionName } from "@/utils";
import {
  DataSource,
  DBInstance,
  SearchConfig,
  SearchConfigDefault,
  tablePaginationConfig,
} from "@/types";

interface Props {
  serverSideCompareTableData: DataSource[];
}

const generateTableData = (
  dbInstanceList: DBInstance[],
  searchConfig: SearchConfig
): DataSource[] => {
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
          leaseLength: term.payload?.leaseContractLength ?? "On Demand",
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
        // 2. Sort on expected cost in ascending order.
        if (a.leaseLength === "On Demand") {
          return -1;
        } else if (b.leaseLength === "On Demand") {
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
};

const Home: NextPage<Props> = ({ serverSideCompareTableData }) => {
  const [dataSource, setDataSource] = useState<DataSource[]>(
    serverSideCompareTableData
  );
  const { dbInstanceList, loadDBInstanceList, getAvailableRegionList } =
    useDBInstanceContext();
  const { searchConfig } = useSearchConfigContext();

  const memoizedGenerate = useCallback(
    (): DataSource[] => generateTableData(dbInstanceList, searchConfig),
    [dbInstanceList, searchConfig]
  );

  useEffect(() => {
    loadDBInstanceList();
  }, [loadDBInstanceList]);

  const availableRegionList = getAvailableRegionList();

  return (
    <MainLayout
      title="The Simple AWS RDS and Google Cloud SQL Instance Pricing Sheet"
      metaTagList={[
        {
          name: "description",
          content:
            "DB Cost is a specs sheet and pricing calculator for AWS RDS and Google Cloud SQL instances.",
        },
        {
          name: "keywords",
          content:
            "AWS RDS, Google Cloud SQL, Cloud DB Instances, rds pricing, price calculator, MySQL instance pricing, Postgres instance pricing",
        },
      ]}
    >
      <div className="mx-5 mt-4 pb-2">
        <ButtonGroup type="reset" showCompare />
        <RegionMenu availableRegionList={availableRegionList} />
        <SearchMenu />
        <CompareTable
          dataSource={dataSource}
          setDataSource={setDataSource}
          generateTableData={memoizedGenerate}
        />
      </div>
    </MainLayout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const data = (await import("@data")).default as DBInstance[];
  // For SEO, showing the first page is enough. So we only need to
  // pass the first page of data to the page. Passing the whole large
  // `data` will make this page twice as large to reduce performance.
  const firstPageData = data.slice(0, tablePaginationConfig.defaultPageSize);

  return {
    props: {
      serverSideCompareTableData: generateTableData(
        firstPageData,
        SearchConfigDefault
      ),
    },
  };
};
