import {
  useMemo,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useCallback,
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
} from "@/utils";
import Tooltip from "@/components/primitives/Tooltip";
import {
  useDBInstanceStore,
  useSearchConfigStore,
  useTableDataStore,
} from "@/stores";
import Icon from "@/components/Icon";

interface PaginationInfo {
  current: number;
  pageSize: number;
}

enum SorterColumn {
  REGION = "region",
  CPU = "cpu",
  MEMORY = "memory",
  EXPECTED_COST = "expectedCost",
}

const tablePaginationConfig = { defaultPageSize: 100 };

const CompareTable: React.FC = () => {
  const dbInstanceList = useDBInstanceStore((state) => state.dbInstanceList);
  const [searchConfig, isFiltering] = useSearchConfigStore((state) => [
    state.searchConfig,
    state.isFiltering,
  ]);
  const [dataSource, refresh, refreshExpectedCost, sort] = useTableDataStore(
    (state) => [
      state.dataSource,
      state.refresh,
      state.refreshExpectedCost,
      state.sort,
    ]
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
    refresh();
  }, [dbInstanceList.length, refresh]);

  useEffect(() => {
    if (shouldRefresh(lastConfig.current, searchConfig)) {
      // If any of the config except for utilization and leaseLength has changed,
      // refresh the entire table.
      setLoading(true);
      setTimeout(() => {
        refresh();
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
      refresh();
    }

    lastConfig.current = searchConfig;
  }, [
    handleSort,
    refresh,
    refreshExpectedCost,
    searchConfig,
    sort,
    sortedInfo.field,
    sortedInfo.order,
  ]);

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
          content={`$${getDigit(
            expectedCost,
            2
          )} is calculated based on utilization ${(
            searchConfig.utilization * 100
          ).toFixed(0)}% for ${searchConfig.leaseLength} year${
            searchConfig.leaseLength > 1 ? "s" : ""
          } lease`}
        >
          <span className="font-mono">{`
              $${getDigit(expectedCost, 0)}${
            record.leaseLength !== "N/A" &&
            searchConfig.chargeType?.length === 2
              ? " (" +
                (
                  getDiff(
                    record,
                    searchConfig.utilization,
                    searchConfig.leaseLength
                  ) * 100
                ).toFixed(0) +
                "%)"
              : ""
          }`}</span>
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
                <div className="relative !w-5 h-5 mr-2">
                  <Icon
                    name={`provider-${record.cloudProvider.toLowerCase()}`}
                  />
                </div>
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
    />
  );
};

export default CompareTable;
