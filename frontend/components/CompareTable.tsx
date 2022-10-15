import {
  useMemo,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useCallback,
  startTransition,
} from "react";
import { Table } from "antd";
import { isEqual } from "lodash";
import { dataSource } from "@/types";
import {
  getDiff,
  getDigit,
  shouldRefresh,
  getCellRowSpan,
  dashboardCostComparer,
  comparer,
  getPricingContent,
  getPrice,
  getRegionCode,
  getRegionName,
} from "@/utils";
import Tooltip from "@/components/primitives/Tooltip";
import { useDBInstanceContext, useSearchConfigContext } from "@/stores";
import Icon from "@/components/Icon";

interface PaginationInfo {
  current: number;
  pageSize: number;
}

interface Props {
  hideProviderIcon?: boolean;
}

enum SorterColumn {
  REGION = "region",
  CPU = "cpu",
  MEMORY = "memory",
  EXPECTED_COST = "expectedCost",
}

const tablePaginationConfig = { defaultPageSize: 50 };

// Use a customized Cell component to avoid table's unnecessary on hover re-renders.
const TdCell = (props: any) => {
  // Ant Design tables listen to onMouseEnter and onMouseLeave events to implement row hover styles (with rowSpan).
  // But reacting to too many onMouseEnter and onMouseLeave events will cause performance issues.
  // We can sacrifice a bit of style on hover as a compromise for better performance.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onMouseEnter, onMouseLeave, ...restProps } = props;
  return <td {...restProps} />;
};

const CompareTable: React.FC<Props> = ({ hideProviderIcon = false }) => {
  const { dbInstanceList } = useDBInstanceContext();
  const { searchConfig, isFiltering } = useSearchConfigContext();

  const [dataSource, setDataSource] = useState<dataSource[]>([]);

  const refreshExpectedCost = useCallback(() => {
    startTransition(() => {
      setDataSource((state) => {
        const { utilization, leaseLength } = searchConfig;
        state.forEach((row) => {
          row.expectedCost = getPrice(row, utilization, leaseLength);
        });
        return state;
      });
    });
  }, [searchConfig]);

  const sort = useCallback(
    (sorter: (a: dataSource, b: dataSource) => number) => {
      startTransition(() => {
        setDataSource((state) => {
          return [...state].sort(sorter);
        });
      });
    },
    []
  );

  const [loading, setLoading] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({
    order: null,
    field: "",
  });
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    current: 1,
    pageSize: tablePaginationConfig.defaultPageSize,
  });
  const lastConfig = useRef(searchConfig);
  const showEngineType = useMemo(
    () => searchConfig.engineType && searchConfig.engineType.length > 1,
    [searchConfig]
  );

  const generateDataSource = useCallback((): dataSource[] => {
    let rowCount = 0;
    const dataSource: dataSource[] = [];
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

      const dataRowList: dataSource[] = [];
      const dataRowMap: Map<string, dataSource[]> = new Map();

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
          const newRow: dataSource = {
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
            ) as dataSource[];
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
        const filteredDataRowList: dataSource[] = dataRowList.filter(
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

  const handleSort = useCallback(
    (field: string, isAscending: boolean) => {
      switch (field) {
        case SorterColumn.REGION:
          sort((a, b) => comparer.region(a, b, isAscending));
          break;
        case SorterColumn.CPU:
          sort((a, b) => comparer.cpu(a, b, isAscending));
          break;
        case SorterColumn.MEMORY:
          sort((a, b) => comparer.memory(a, b, isAscending));
          break;
        case SorterColumn.EXPECTED_COST:
          sort((a, b) => dashboardCostComparer(a, b, isAscending));
        default:
          break;
      }
    },
    [sort]
  );

  useEffect(() => {
    startTransition(() => {
      setDataSource(() => generateDataSource());
    });
  }, [dbInstanceList.length, generateDataSource]);

  useEffect(() => {
    if (shouldRefresh(lastConfig.current, searchConfig)) {
      // If any of the config except for utilization and leaseLength has changed,
      // refresh the entire table.
      setLoading(true);
      setTimeout(() => {
        startTransition(() => {
          setDataSource(generateDataSource());
        });

        if (["ascend", "descend"].includes(String(sortedInfo.order))) {
          handleSort(sortedInfo.field, sortedInfo.order === "ascend");
        }
        setLoading(false);
      }, 100);
    } else {
      // Otherwise, refresh the expected cost.
      refreshExpectedCost();
      if (["ascend", "descend"].includes(String(sortedInfo.order))) {
        handleSort(sortedInfo.field, sortedInfo.order === "ascend");
      }
    }

    // When the sort state is cancelled, refresh table.
    if (sortedInfo.order === undefined) {
      startTransition(() => {
        setDataSource(generateDataSource());
      });
    }

    lastConfig.current = searchConfig;
  }, [
    generateDataSource,
    handleSort,
    refreshExpectedCost,
    searchConfig,
    sortedInfo.field,
    sortedInfo.order,
  ]);

  const expectedCostTooltipContent = useCallback(
    (expectedCost: number): string => {
      const cost = getDigit(expectedCost, 2);
      const utilization = (searchConfig.utilization * 100).toFixed(0);
      const year = searchConfig.leaseLength;
      const leaseLength = searchConfig.leaseLength > 1 ? "s" : "";
      return `$${cost} is calculated based on utilization ${utilization}% for ${year} year${leaseLength} lease`;
    },
    [searchConfig.leaseLength, searchConfig.utilization]
  );

  const expectedCostCellContent = useCallback(
    (expectedCost: number, record: dataSource): string => {
      const cost = getDigit(expectedCost, 0);
      const showPercentage =
        record.leaseLength !== "N/A" && searchConfig.chargeType?.length === 2;

      if (showPercentage) {
        const diff = getDiff(
          record,
          searchConfig.utilization,
          searchConfig.leaseLength
        );
        const percentageContent = ` (${(diff * 100).toFixed(0)}%)`;

        return `$${cost}${percentageContent}`;
      } else {
        return `$${cost}`;
      }
    },
    [
      searchConfig.chargeType?.length,
      searchConfig.leaseLength,
      searchConfig.utilization,
    ]
  );

  // pricingContent is the col of the pricing, we need to dynamic render this section.
  // e.g. when user only select single engine, the engine icon is unnecessary
  const pricingContent = useDeferredValue({
    commitmentWithEngine: {
      title: "Commitment",
      dataIndex: "commitment",
      width: "12%",
      align: "right",
      render: (commitment: { usd: number }, record: dataSource) => {
        return (
          <div className="flex justify-between">
            <div className="relative top-1 w-6 h-5">
              <Icon name={`db-${record.engineType.toLowerCase()}`} />
            </div>
            <span className="font-mono">{`$${commitment.usd}`}</span>
          </div>
        );
      },
    },
    commitmentWithoutEngine: {
      title: "Commitment",
      dataIndex: "commitment",
      width: "12%",
      align: "right",
      render: (commitment: { usd: number }) => (
        <span className="font-mono">{`$${commitment.usd}`}</span>
      ),
    },
    leaseLength: {
      title: "Lease Length",
      dataIndex: "leaseLength",
      width: "11%",
      align: "right",
      render: (leaseLength: string) => (
        <span className="font-mono">{leaseLength}</span>
      ),
    },
    hourlyPay: {
      title: "Hourly",
      dataIndex: "hourly",
      width: "11%",
      align: "right",
      render: (hourly: { usd: number }) => (
        <span className="font-mono">{`$${getDigit(hourly.usd, 2)}`}</span>
      ),
    },
    expectedCost: {
      title: "Expected Cost",
      dataIndex: "expectedCost",
      width: "15%",
      align: "right",
      // TODO: support compare page
      sorter: true,
      sortOrder: sortedInfo.field === "expectedCost" && sortedInfo.order,
      render: (expectedCost: number, record: dataSource) => (
        <Tooltip
          delayDuration={0}
          content={expectedCostTooltipContent(expectedCost)}
        >
          <span className="font-mono">
            {expectedCostCellContent(expectedCost, record)}
          </span>
        </Tooltip>
      ),
    },
  });

  const columns = useMemo<any>(
    () => [
      // TODO: add selection column
      {
        title: "Name",
        dataIndex: "name",
        width: "20%",
        onCell: (_: dataSource, index: number) =>
          getCellRowSpan(dataSource, index, paginationInfo, isFiltering()),
        render: (name: string, record: dataSource) => {
          if (
            record.cloudProvider === "AWS" ||
            record.cloudProvider === "GCP"
          ) {
            return (
              <div className="flex items-center w-full">
                {!hideProviderIcon && (
                  <div className="relative !w-5 h-5 mr-2">
                    <Icon
                      name={`provider-${record.cloudProvider.toLowerCase()}`}
                    />
                  </div>
                )}
                {name}
              </div>
            );
          }
          return name;
        },
        shouldCellUpdate: (record: dataSource, prevRecord: dataSource) =>
          !isEqual(record, prevRecord),
      },
      {
        title: "Region",
        dataIndex: "region",
        width: "14%",
        onCell: (_: dataSource, index: number) =>
          getCellRowSpan(dataSource, index, paginationInfo, isFiltering()),
        sorter: true,
        sortOrder: sortedInfo.field === "region" && sortedInfo.order,
        shouldCellUpdate: (record: dataSource, prevRecord: dataSource) =>
          !isEqual(record, prevRecord),
      },
      {
        title: "CPU",
        dataIndex: "cpu",
        width: "10%",
        align: "right",
        onCell: (_: dataSource, index: number) =>
          getCellRowSpan(dataSource, index, paginationInfo, isFiltering()),
        sorter: true,
        sortOrder: sortedInfo.field === "cpu" && sortedInfo.order,
        render: (cpu: number, record: dataSource) => (
          <Tooltip
            content={
              record.processor === "" ? "N/A" : record.processor.split(" ")[1]
            }
          >
            <span className="font-mono">{cpu}</span>
          </Tooltip>
        ),
        shouldCellUpdate: (record: dataSource, prevRecord: dataSource) =>
          !isEqual(record, prevRecord),
      },
      {
        title: "Memory",
        dataIndex: "memory",
        width: "10%",
        align: "right",
        onCell: (_: dataSource, index: number) =>
          getCellRowSpan(dataSource, index, paginationInfo, isFiltering()),
        sorter: true,
        sortOrder: sortedInfo.field === "memory" && sortedInfo.order,
        render: (memory: number) => <span className="font-mono">{memory}</span>,
        shouldCellUpdate: (record: dataSource, prevRecord: dataSource) =>
          !isEqual(record, prevRecord),
      },
      {
        title: "Pricing",
        key: "pricing",
        children: getPricingContent(
          pricingContent,
          searchConfig.chargeType.includes("Reserved"),
          showEngineType
        ),
      },
    ],
    [
      dataSource,
      hideProviderIcon,
      isFiltering,
      paginationInfo,
      pricingContent,
      searchConfig.chargeType,
      showEngineType,
      sortedInfo.field,
      sortedInfo.order,
    ]
  );

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={tablePaginationConfig}
      loading={loading}
      onChange={(pagination, _, sorter) => {
        setPaginationInfo({
          current: pagination.current as number,
          pageSize: pagination.pageSize as number,
        });
        setSortedInfo({
          field: (sorter as any).field,
          order: (sorter as any).order,
        });
        const isAscending = (sorter as any).order === "ascend";
        // sort data source when users click on the sort icon
        handleSort((sorter as any).field, isAscending);
      }}
      components={{
        body: { cell: TdCell },
      }}
    />
  );
};

export default CompareTable;
