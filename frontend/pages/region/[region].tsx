import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { Divider } from "antd";
import slug from "slug";
import MainLayout from "@/layouts/main";
import ButtonGroup from "@/components/ButtonGroup";
import SearchMenu from "@/components/SearchMenu";
import CompareTable from "@/components/CompareTable";
import LineChart from "@/components/LineChart";
import { useDBInstanceContext, useSearchConfigContext } from "@/stores";
import {
  getPrice,
  getRegionName,
  getRegionPrefix,
  getRegionListByPrefix,
  regionCodeNameSlugMap,
} from "@/utils";
import {
  CloudProvider,
  DataSource,
  PageType,
  SearchBarType,
  DBInstance,
  SearchConfig,
  Region,
  AvailableRegion,
  SearchConfigDefault,
  tablePaginationConfig,
} from "@/types";

interface Params {
  region: string;
}

interface Props {
  serverSideCompareTableData: DataSource[];
  codeList: string[];
  name: string;
  urlPattern: string;
  providerList: CloudProvider[];
}

const generateTableData = (
  dbInstanceList: DBInstance[],
  searchConfig: SearchConfig,
  codeList: string[]
): DataSource[] => {
  let rowCount = 0;
  const dataSource: DataSource[] = [];
  const {
    cloudProvider,
    engineType,
    chargeType,
    minCPU,
    minRAM,
    utilization,
    leaseLength,
    keyword,
  } = searchConfig;

  // If any of these below is empty, display no table row.
  if (engineType.length === 0 || chargeType.length === 0) {
    return [];
  }

  const cloudProviderSet = new Set(cloudProvider);
  const selectedRegionCodeSet = new Set(codeList);
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

const Region: NextPage<Props> = ({
  serverSideCompareTableData,
  codeList,
  name,
  providerList,
}) => {
  const [dataSource, setDataSource] = useState<DataSource[]>(
    serverSideCompareTableData
  );
  const { dbInstanceList, loadDBInstanceList } = useDBInstanceContext();
  const { searchConfig, update: updateSearchConfig } = useSearchConfigContext();

  const memoizedGenerate = useCallback(
    (): DataSource[] =>
      generateTableData(dbInstanceList, searchConfig, codeList),
    [codeList, dbInstanceList, searchConfig]
  );

  useEffect(() => {
    // Set default searchConfig in instance detail page.
    updateSearchConfig("engineType", ["MYSQL", "POSTGRES"]);
    updateSearchConfig("chargeType", ["OnDemand"]);
  }, [updateSearchConfig]);

  useEffect(() => {
    loadDBInstanceList();
  }, [loadDBInstanceList]);

  return (
    <MainLayout
      title={`${name} Cloud DB Instances`}
      headTitle={`${name} Cloud DB Instances`}
    >
      <main className="flex flex-col justify-center items-center mx-5 mt-4 pb-2">
        <ButtonGroup type="back" />
        <SearchMenu
          type={SearchBarType.REGION_DETAIL}
          hideProviders={providerList.length === 1}
        />
        <CompareTable
          type={PageType.REGION_DETAIL}
          hideProviderIcon={providerList.length === 1}
          dataSource={dataSource}
          setDataSource={setDataSource}
          generateTableData={memoizedGenerate}
        />
        <div className="flex justify-center items-center w-full h-full mt-6 mb-2 border">
          <LineChart type={PageType.REGION_DETAIL} dataSource={dataSource} />
        </div>
        <div className="w-full flex flex-col mt-4">
          <h3 className="text-lg">
            Regions available in {getRegionPrefix(name)}
          </h3>
          <section>
            <span>{name}</span>
            {getRegionListByPrefix(getRegionPrefix(name))
              .filter((region) => region !== name)
              .map((region) => (
                <React.Fragment key={region}>
                  <Divider type="vertical" />
                  <Link href={`/region/${slug(region)}`} passHref>
                    <a className="whitespace-nowrap leading-6">{region}</a>
                  </Link>
                </React.Fragment>
              ))}
          </section>
        </div>
      </main>
    </MainLayout>
  );
};

export default Region;

export const getStaticPaths: GetStaticPaths = async () => {
  const data = (await import("@data")).default as DBInstance[];

  const usedRegionCodeSet = new Set<string>();
  data.forEach((instance) => {
    instance.regionList.forEach((region) => {
      // Only pre-generate regions listed in regionCodeNameSlugMap.
      if (regionCodeNameSlugMap.some(([code]) => code === region.code)) {
        usedRegionCodeSet.add(region.code);
      }
    });
  });

  return {
    paths: Array.from(usedRegionCodeSet).map((regionCode) => ({
      params: {
        region: slug(getRegionName(regionCode)),
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { region: regionSlug } = context.params as unknown as Params;
  const data = (await import("@data")).default as DBInstance[];

  // Only pass the first page of data on SSG to reduce page size.
  const firstPageData = data.slice(0, tablePaginationConfig.defaultPageSize);
  const regionList = regionCodeNameSlugMap.filter(
    ([, , slug]) => slug === regionSlug
  );
  const name = regionList[0][1];

  const regionMap = new Map<string, Map<string, string>>();
  data.forEach((db) => {
    db.regionList.forEach((region: Region) => {
      const regionName = getRegionName(region.code);
      if (!regionMap.has(regionName)) {
        const newMap = new Map<string, string>();
        regionMap.set(regionName, newMap);
      }

      regionMap.get(regionName)?.set(db.cloudProvider, region.code);
    });
  });

  const availableRegionList: AvailableRegion[] = [];
  regionMap.forEach((providerCode, regionName) => {
    availableRegionList.push({
      name: regionName,
      providerCode: providerCode,
    });
  });

  const region = availableRegionList.find((region) => region.name === name);

  return {
    props: {
      serverSideCompareTableData: generateTableData(
        firstPageData,
        SearchConfigDefault,
        Array.from(region?.providerCode.values() || [])
      ),
      codeList: Array.from(region?.providerCode.values() || []),
      name: region?.name,
      providerList: Array.from(region?.providerCode.keys() || []),
    },
  };
};
