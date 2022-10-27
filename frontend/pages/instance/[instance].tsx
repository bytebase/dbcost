import { useState, useEffect, useCallback } from "react";
import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import MainLayout from "@/layouts/main";
import ButtonGroup from "@/components/ButtonGroup";
import SearchMenu from "@/components/SearchMenu";
import CompareTable from "@/components/CompareTable";
import RelatedTable from "@/components/RelatedTable";
import LineChart from "@/components/LineChart";
import { useDBInstanceContext, useSearchConfigContext } from "@/stores";
import {
  getPrice,
  getRegionName,
  getInstanceClass,
  getInstanceFamily,
  getInstanceSize,
} from "@/utils";
import {
  CloudProvider,
  DataSource,
  PageType,
  SearchBarType,
  DBInstance,
  RelatedType,
  SearchConfig,
} from "@/types";

interface Params {
  instance: string;
}

interface Props {
  serverSideCompareTableData: DataSource[];
  name: string;
  provider: CloudProvider;
  CPU: number;
  memory: number;
  dataSource: DataSource[];
  sameClassList: RelatedType[];
  sameFamilyList: RelatedType[];
}

const generateTableData = (
  dbInstanceList: DBInstance[],
  searchConfig: SearchConfig,
  instanceName: string
): DataSource[] => {
  let rowCount = 0;
  const dataSource: DataSource[] = [];
  const { engineType, chargeType, utilization, leaseLength, keyword } =
    searchConfig;

  // If any of these below is empty, display no table row.
  if (engineType.length === 0 || chargeType.length === 0) {
    return [];
  }

  const engineSet = new Set(engineType);
  const chargeTypeSet = new Set(chargeType);

  // Find current instance.
  const instance = dbInstanceList.find(
    (instance) => instance.name === instanceName
  );

  // Not found, return empty table.
  if (!instance) {
    return [];
  }

  // No regions, return empty table.
  if (instance.regionList.length === 0) {
    return [];
  }

  const dataRowList: DataSource[] = [];
  const dataRowMap: Map<string, DataSource[]> = new Map();

  instance.regionList.forEach((region) => {
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
      const regionInstanceKey = `${instance.name}::${region.code}::${term.databaseEngine}`;
      const newRow: DataSource = {
        // set this later
        id: -1,
        // We use :: for separation because AWS use . and GCP use - as separator.
        key: `${instance.name}::${region.code}::${term.code}`,
        // set this later
        childCnt: 0,
        cloudProvider: instance.cloudProvider,
        name: instance.name,
        processor: instance.processor,
        cpu: instance.cpu,
        memory: instance.memory,
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
    return dataSource;
  }

  dataSource.push(...dataRowList);

  return dataSource;
};

const InstanceDetail: NextPage<Props> = ({
  serverSideCompareTableData,
  name,
  provider,
  CPU,
  memory,
  sameClassList,
  sameFamilyList,
}) => {
  const [dataSource, setDataSource] = useState<DataSource[]>(
    serverSideCompareTableData
  );
  const { dbInstanceList, loadDBInstanceList } = useDBInstanceContext();
  const { searchConfig, update: updateSearchConfig } = useSearchConfigContext();

  const memoizedGenerate = useCallback(
    (): DataSource[] => generateTableData(dbInstanceList, searchConfig, name),
    [dbInstanceList, name, searchConfig]
  );

  useEffect(() => {
    loadDBInstanceList();
  }, [loadDBInstanceList]);

  useEffect(() => {
    // Set default searchConfig in instance detail page.
    updateSearchConfig("chargeType", ["OnDemand"]);
  }, [updateSearchConfig]);

  return (
    <MainLayout title={`${name} Pricing`} headTitle={`${name} Pricing`}>
      <main className="flex flex-col justify-center items-center mx-5 mt-4 pb-2">
        <ButtonGroup type="back" />
        <p>
          The {provider} {name} has {CPU} CPU and {memory} GB memory.
        </p>
        <SearchMenu type={SearchBarType.INSTANCE_DETAIL} />
        <CompareTable
          type={PageType.INSTANCE_DETAIL}
          dataSource={dataSource}
          setDataSource={setDataSource}
          generateTableData={memoizedGenerate}
        />
        <div className="flex justify-center items-center w-full h-full mt-6 mb-2 border">
          <LineChart type={PageType.INSTANCE_DETAIL} dataSource={dataSource} />
        </div>
        <div className="w-full flex flex-row justify-between">
          <RelatedTable
            title="Instances in the same class"
            instance={name}
            dataSource={sameClassList}
          />
          {provider === "AWS" && (
            <RelatedTable
              title="Instances in the same family"
              instance={name}
              dataSource={sameFamilyList}
            />
          )}
        </div>
      </main>
    </MainLayout>
  );
};

export default InstanceDetail;

export const getStaticPaths: GetStaticPaths = async () => {
  const data = (await import("@data")).default as DBInstance[];

  return {
    paths: data.map((instance) => ({
      params: { instance: instance.name },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { instance: instanceName } = context.params as unknown as Params;
  const data = (await import("@data")).default as DBInstance[];
  const instanceData = data.find((instance) => instance.name === instanceName);

  const getSameClassList = (): RelatedType[] => {
    const currClass = getInstanceClass(
      instanceName,
      instanceData?.cloudProvider as CloudProvider
    );
    if (!currClass) {
      return [];
    }
    return data
      .filter((instance) => instance.name.startsWith(currClass))
      .map((instance) => ({
        name: instance.name,
        CPU: instance.cpu,
        memory: Number(instance.memory),
      }))
      .sort((a, b) => {
        // Sort ascend by CPU first, then memory.
        const difference = a.CPU - b.CPU;
        if (difference !== 0) {
          return difference;
        }
        return a.memory - b.memory;
      });
  };

  const getSameFamilyList = (): RelatedType[] => {
    const currFamily = getInstanceFamily(
      instanceName,
      instanceData?.cloudProvider as CloudProvider
    );
    const currSize = getInstanceSize(
      instanceName,
      instanceData?.cloudProvider as CloudProvider
    );
    if (!currFamily || !currSize) {
      return [];
    }
    return data
      .filter(
        (instance) =>
          instance.name.startsWith(`db.${currFamily}`) &&
          instance.name.endsWith(`.${currSize}`)
      )
      .map((instance) => ({
        name: instance.name,
        CPU: instance.cpu,
        memory: Number(instance.memory),
      }))
      .sort((a, b) => {
        // Sort ascend by CPU first, then memory.
        const difference = a.CPU - b.CPU;
        if (difference !== 0) {
          return difference;
        }
        return a.memory - b.memory;
      });
  };

  return {
    props: {
      serverSideCompareTableData: generateTableData(
        data,
        {
          engineType: ["MYSQL", "POSTGRES"],
          chargeType: ["OnDemand"],
          utilization: 1,
          leaseLength: 1,
          keyword: "",
        } as SearchConfig,
        instanceName
      ),
      name: instanceName,
      provider: instanceData?.cloudProvider,
      CPU: instanceData?.cpu,
      memory: instanceData?.memory,
      sameClassList: getSameClassList(),
      sameFamilyList: getSameFamilyList(),
    },
  };
};
