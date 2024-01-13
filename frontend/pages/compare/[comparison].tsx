import { useState, useEffect, useCallback } from "react";
import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import MainLayout from "@/layouts/main";
import ButtonGroup from "@/components/ButtonGroup";
import CompareBadgeGroup, { BadgeRow } from "@/components/CompareBadgeGroup";
import SearchMenu from "@/components/SearchMenu";
import CompareTable from "@/components/CompareTable";
import RegionPricingTable from "@/components/RegionPricingTable";
import LineChart from "@/components/LineChart";
import { useDBInstanceContext, useSearchConfigContext } from "@/stores";
import { getPrice, getRegionName, slugToName } from "@/utils";
import {
  DataSource,
  PageType,
  SearchBarType,
  DBInstance,
  SearchConfig,
  RegionPricingType,
} from "@/types";

interface Params {
  comparison: string;
}

interface Props {
  serverSideCompareTableData: DataSource[];
  comparerA: string;
  comparerB: string;
  regionPricingDataOfA: RegionPricingType[];
  regionPricingDataOfB: RegionPricingType[];
  specsComparisonData: BadgeRow[];
}

const virginiaCodeAWS = "us-east-1";
const virginiaCodeGCP = "us-east4";

const generateTableData = (
  dbInstanceList: DBInstance[],
  searchConfig: SearchConfig,
  comparerTuple: [string, string]
): DataSource[] => {
  let rowCount = 0;
  const dataSource: DataSource[] = [];
  const { engineType, chargeType, utilization, leaseLength, keyword } =
    searchConfig;
  const [comparerA, comparerB] = comparerTuple;

  // If any of these below is empty, display no table row.
  if (engineType.length === 0 || chargeType.length === 0) {
    return [];
  }

  const engineSet = new Set(engineType);
  const chargeTypeSet = new Set(chargeType);

  // Find current two comparing instances.
  const instanceA = dbInstanceList.find(
    (instance) => instance.name === comparerA
  );
  const instanceB = dbInstanceList.find(
    (instance) => instance.name === comparerB
  );

  // Not found, return empty table.
  if (!instanceA || !instanceB) {
    return [];
  }

  // No regions, return empty table.
  if (instanceA.regionList.length === 0 && instanceB.regionList.length === 0) {
    return [];
  }

  const dataRowList: DataSource[] = [];
  const dataRowMap: Map<string, DataSource[]> = new Map();

  // Process each db instance.
  [instanceA, instanceB].forEach((dbInstance) => {
    const dataRowList: DataSource[] = [];
    const dataRowMap: Map<string, DataSource[]> = new Map();
    let region = dbInstance.regionList.find((region) => {
      if (dbInstance.cloudProvider === "AWS") {
        return region.code === virginiaCodeAWS;
      } else if (dbInstance.cloudProvider === "GCP") {
        return region.code === virginiaCodeGCP;
      }
    });
    if (!region) {
      region = dbInstance.regionList[0];
    }

    const selectedTermList = region?.termList.filter(
      (term) =>
        chargeTypeSet.has(term.type) && engineSet.has(term.databaseEngine)
    );

    let basePriceMap = new Map<string, number>();
    selectedTermList?.forEach((term) => {
      if (term.type === "OnDemand") {
        basePriceMap.set(term.databaseEngine, term.hourlyUSD);
      }
    });

    const regionName = getRegionName(region?.code);
    selectedTermList.forEach((term) => {
      const regionInstanceKey = `${dbInstance.name}::${region!.code}::${
        term.databaseEngine
      }`;
      const newRow: DataSource = {
        // set this later
        id: -1,
        // We use :: for separation because AWS use . and GCP use - as separator.
        key: `${dbInstance.name}::${region!.code}::${term.code}`,
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
    return dataSource;
  }

  dataSource.push(...dataRowList);

  return dataSource;
};

const InstanceComparison: NextPage<Props> = ({
  serverSideCompareTableData,
  comparerA,
  comparerB,
  regionPricingDataOfA,
  regionPricingDataOfB,
  specsComparisonData,
}) => {
  const [dataSource, setDataSource] = useState<DataSource[]>(
    serverSideCompareTableData
  );
  const { dbInstanceList, loadDBInstanceList } = useDBInstanceContext();
  const { searchConfig, update: updateSearchConfig } = useSearchConfigContext();

  const memoizedGenerate = useCallback(
    (): DataSource[] =>
      generateTableData(dbInstanceList, searchConfig, [comparerA, comparerB]),
    [comparerA, comparerB, dbInstanceList, searchConfig]
  );

  useEffect(() => {
    loadDBInstanceList();
  }, [loadDBInstanceList]);

  useEffect(() => {
    // Set default searchConfig in instance comparison page.
    updateSearchConfig("chargeType", ["OnDemand", "Reserved"]);
  }, [updateSearchConfig]);

  return (
    <MainLayout
      title={`${comparerA} vs ${comparerB} Pricing`}
      headTitle={`DB Cost | ${comparerA} vs ${comparerB} Pricing`}
      metaTagList={[
        {
          name: "description",
          content: `This comparison between ${comparerA} vs ${comparerB} covers their specs and prices around all regions.`,
        },
        {
          name: "keywords",
          content: `${comparerA} vs ${comparerB}, compare, specs, AWS RDS, GCP Cloud SQL, Cloud DB Instances, rds pricing, price calculator, MySQL instance pricing, Postgres instance pricing`,
        },
      ]}
    >
      <main className="flex flex-col justify-center items-center mx-5 mt-4 pb-2">
        <ButtonGroup type="back" />
        <CompareBadgeGroup dataSource={specsComparisonData} />
        <SearchMenu type={SearchBarType.INSTANCE_COMPARISON} />
        <CompareTable
          type={PageType.INSTANCE_COMPARISON}
          dataSource={dataSource}
          setDataSource={setDataSource}
          generateTableData={memoizedGenerate}
        />
        <div className="flex justify-center items-center w-full h-full mt-6 mb-2 border">
          <LineChart
            type={PageType.INSTANCE_COMPARISON}
            dataSource={dataSource}
          />
        </div>
        <div className="w-full flex flex-row justify-between">
          <RegionPricingTable
            title={
              <>
                <i>{comparerA}</i> pricing in all available regions
              </>
            }
            currRegion={
              dataSource.find((row) => row.name === comparerA)?.region as string
            }
            dataSource={regionPricingDataOfA}
          />
          <RegionPricingTable
            title={
              <>
                <i>{comparerB}</i> pricing in all available regions
              </>
            }
            currRegion={
              dataSource.find((row) => row.name === comparerB)?.region as string
            }
            dataSource={regionPricingDataOfB}
          />
        </div>
      </main>
    </MainLayout>
  );
};

export default InstanceComparison;

export const getStaticPaths: GetStaticPaths = async () => {
  const data = (await import("@data")).default as DBInstance[];
  const comparisonList = [];
  // Traverse and generate all possible comparison pairs.
  for (let i = 0; i < data.length - 1; i++) {
    for (let j = i + 1; j < data.length; j++) {
      comparisonList.push(`${data[i].name}-vs-${data[j].name}`);
    }
  }

  return {
    paths: comparisonList.map((comparison) => ({
      params: { comparison },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { comparison } = context.params as unknown as Params;
  const data = (await import("@data")).default as DBInstance[];
  const [comparerA, comparerB] = slugToName(comparison);

  const getRegionPricing = (name: string): RegionPricingType[] => {
    const dbInstance = data.find((instance) => instance.name === name);
    if (!dbInstance) {
      return [];
    }
    return (
      dbInstance.regionList
        .map((region) => {
          // List on demand MySQL instances.
          const term = region.termList.find(
            (term) =>
              term.type === "OnDemand" && term.databaseEngine === "MYSQL"
          );
          return {
            region: getRegionName(region.code),
            hourlyUSD: term?.hourlyUSD ?? null,
          };
        })
        // First sort on cost ASC, then sort on region name ASC.
        .sort((a, b) => {
          if (!a.hourlyUSD) {
            return 1;
          }
          if (!b.hourlyUSD) {
            return -1;
          }
          if (a.hourlyUSD === b.hourlyUSD) {
            return a.region.localeCompare(b.region);
          }
          return a.hourlyUSD - b.hourlyUSD;
        })
    );
  };

  const getSpecsComparison = () => {
    const dataSource: BadgeRow[] = [];
    // Find current two comparing instances.
    const instanceA = data.find((instance) => instance.name === comparerA)!;
    const instanceB = data.find((instance) => instance.name === comparerB)!;

    [instanceA, instanceB].forEach((instance) => {
      const term = (
        instance.regionList.find((region) => {
          if (instance.cloudProvider === "AWS") {
            return region.code === virginiaCodeAWS;
          } else if (instance.cloudProvider === "GCP") {
            return region.code === virginiaCodeGCP;
          }
        }) || instance.regionList[0]
      ).termList.find(
        (term) => term.type === "OnDemand" && term.databaseEngine === "MYSQL"
      );
      dataSource.push({
        instanceName: instance.name,
        cpu: instance.cpu,
        memory: Number(instance.memory),
        processor: instance.processor.split(" ")[1] ?? null,
        regionCount: instance.regionList.length,
        hourly: String(term?.hourlyUSD as number),
      });
    });

    return dataSource;
  };

  return {
    props: {
      serverSideCompareTableData: generateTableData(
        data,
        {
          engineType: ["MYSQL", "POSTGRES"],
          chargeType: ["OnDemand", "Reserved"],
          utilization: 1,
          leaseLength: 1,
          keyword: "",
        } as SearchConfig,
        [comparerA, comparerB]
      ),
      comparerA,
      comparerB,
      regionPricingDataOfA: getRegionPricing(comparerA),
      regionPricingDataOfB: getRegionPricing(comparerB),
      specsComparisonData: getSpecsComparison(),
    },
  };
};
