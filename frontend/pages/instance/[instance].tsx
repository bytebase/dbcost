import { useState, useEffect, useCallback } from "react";
import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import MainLayout from "@/layouts/main";
import ButtonGroup from "@/components/ButtonGroup";
import SearchMenu from "@/components/SearchMenu";
import CompareTable from "@/components/CompareTable";
import RelatedTable from "@/components/RelatedTable";
import LineChart from "@/components/LineChart";
import { useDBInstanceContext, useSearchConfigContext } from "@/stores";
import { getPrice, getRegionName } from "@/utils";
import {
  CloudProvider,
  DataSource,
  TableType,
  SearchBarType,
  DBInstance,
  RelatedType,
} from "@/types";

interface Params {
  instance: string;
}

interface RelatedInstance {
  name: string;
  CPU: number;
  memory: number;
}

interface Props {
  name: string;
  provider: CloudProvider;
  CPU: number;
  memory: number;
  dataSource: DataSource[];
  related: {
    sameClass: RelatedInstance[];
    sameFamily: RelatedInstance[];
  };
}

const getClass = (name: string, provider: CloudProvider): string => {
  switch (provider) {
    case "AWS":
      return `${name.split(".").slice(0, 2).join(".")}.`;
    case "GCP":
      return `${name.split("-").slice(0, 2).join("-")}-`;
    default:
      return "";
  }
};

const getFamily = (name: string, provider: CloudProvider): string => {
  switch (provider) {
    case "AWS":
      return name.split(".")[1].charAt(0);
    default:
      return "";
  }
};

const getSize = (name: string, provider: CloudProvider): string => {
  switch (provider) {
    case "AWS":
      return name.split(".")[2];
    default:
      return "";
  }
};

const InstanceDetail: NextPage<Props> = ({ name, provider, CPU, memory }) => {
  const [dataSource, setDataSource] = useState<DataSource[]>([]);
  const { dbInstanceList, loadDBInstanceList } = useDBInstanceContext();
  const { searchConfig, update: updateSearchConfig } = useSearchConfigContext();

  const generateTableData = useCallback((): DataSource[] => {
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
    const instance = dbInstanceList.find((instance) => instance.name === name);

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
        // 2. Sort on expected cost in ascending order.
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
      return dataSource;
    }

    dataSource.push(...dataRowList);

    return dataSource;
  }, [dbInstanceList, name, searchConfig]);

  const getSameClassList = useCallback((): RelatedType[] => {
    const currClass = getClass(name, provider);
    if (!currClass) {
      return [];
    }
    return dbInstanceList
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
  }, [dbInstanceList, name, provider]);

  const getSameFamilyList = useCallback((): RelatedType[] => {
    const currFamily = getFamily(name, provider);
    const currSize = getSize(name, provider);
    if (!currFamily || !currSize) {
      return [];
    }
    return dbInstanceList
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
  }, [dbInstanceList, name, provider]);

  useEffect(() => {
    loadDBInstanceList();
  }, [loadDBInstanceList]);

  useEffect(() => {
    // Set default searchConfig in instance detail page.
    updateSearchConfig("engineType", ["MYSQL", "POSTGRES"]);
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
          type={TableType.INSTANCE_DETAIL}
          dataSource={dataSource}
          setDataSource={setDataSource}
          generateTableData={generateTableData}
        />
        <div className="flex justify-center items-center w-full h-full mt-6 mb-2 border">
          <LineChart dataSource={dataSource} />
        </div>
        <div className="w-full flex flex-row justify-between">
          <RelatedTable
            title="Instances in the same class"
            instance={name}
            dataSource={getSameClassList()}
          />
          {provider === "AWS" && (
            <RelatedTable
              title="Instances in the same family"
              instance={name}
              dataSource={getSameFamilyList()}
            />
          )}
        </div>
      </main>
    </MainLayout>
  );
};

export default InstanceDetail;

export const getStaticPaths: GetStaticPaths = async () => {
  const sourceFileName = "dbInstance.json";
  const data = (await import(`../../../data/${sourceFileName}`))
    .default as DBInstance[];

  return {
    paths: data.map((instance) => ({
      params: { instance: instance.name },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { instance: instanceName } = context.params as unknown as Params;
  const sourceFileName = "dbInstance.json";
  const data = (await import(`../../../data/${sourceFileName}`))
    .default as DBInstance[];
  const instanceData = data.find((instance) => instance.name === instanceName);

  return {
    props: {
      name: instanceName,
      provider: instanceData?.cloudProvider,
      CPU: instanceData?.cpu,
      memory: instanceData?.memory,
    },
  };
};
