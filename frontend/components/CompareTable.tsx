import {
  useMemo,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useCallback,
  useTransition,
} from "react";
import Link from "next/link";
import { Table } from "antd";
import { isEqual } from "lodash";
import slug from "slug";
import { DataSource, PageType, tablePaginationConfig } from "@/types";
import {
  getDiff,
  getDigit,
  shouldRefresh,
  getCellRowSpan,
  dashboardCostComparer,
  comparer,
  getPricingContent,
  getPrice,
  withComma,
} from "@/utils";
import Tooltip from "@/components/primitives/Tooltip";
import { useSearchConfigContext } from "@/stores";
import Icon from "@/components/Icon";
import TdCell from "@/components/TdCell";

interface PaginationInfo {
  current: number;
  pageSize: number;
}

interface Props {
  type?: PageType;
  hideProviderIcon?: boolean;
  dataSource: DataSource[];
  setDataSource: React.Dispatch<React.SetStateAction<DataSource[]>>;
  generateTableData: () => DataSource[];
}

enum SorterColumn {
  REGION = "region",
  CPU = "cpu",
  MEMORY = "memory",
  EXPECTED_COST = "expectedCost",
}

const CompareTable: React.FC<Props> = ({
  type = PageType.DASHBOARD,
  hideProviderIcon = false,
  dataSource,
  setDataSource,
  generateTableData,
}) => {
  const [isPending, startTransition] = useTransition();
  const { searchConfig, isFiltering } = useSearchConfigContext();

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
  }, [searchConfig, setDataSource]);

  const sort = useCallback(
    (sorter: (a: DataSource, b: DataSource) => number) => {
      startTransition(() => {
        setDataSource((state) => {
          return [...state].sort(sorter);
        });
      });
    },
    [setDataSource]
  );

  const [sortedInfo, setSortedInfo] = useState({
    order: "ascend",
    field: SorterColumn.EXPECTED_COST,
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
    startTransition(() => {
      setDataSource(generateTableData());
    });
  }, [generateTableData, setDataSource]);

  useEffect(() => {
    if (shouldRefresh(lastConfig.current, searchConfig)) {
      // If any of the config except for utilization and leaseLength has changed,
      // refresh the entire table.
      startTransition(() => {
        setDataSource(generateTableData());
      });

      if (["ascend", "descend"].includes(String(sortedInfo.order))) {
        handleSort(sortedInfo.field, sortedInfo.order === "ascend");
      }
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
        setDataSource(generateTableData());
      });
    }

    lastConfig.current = searchConfig;
  }, [
    generateTableData,
    handleSort,
    refreshExpectedCost,
    searchConfig,
    setDataSource,
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
    (expectedCost: number, record: DataSource): string => {
      const cost = getDigit(expectedCost, 0);
      const showPercentage =
        record.leaseLength !== "On Demand" &&
        searchConfig.chargeType?.length === 2;

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
      render: (commitment: { usd: number }, record: DataSource) => {
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
        <span className="font-mono">{`$${getDigit(hourly.usd, 3)}`}</span>
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
      render: (expectedCost: number, record: DataSource) => (
        <Tooltip
          delayDuration={0}
          content={expectedCostTooltipContent(expectedCost)}
        >
          <span className="font-mono">
            {withComma(expectedCostCellContent(expectedCost, record))}
          </span>
        </Tooltip>
      ),
    },
  });

  const columns = useMemo<any>(
    () => [
      // TODO: add selection column
      ...(type === PageType.INSTANCE_DETAIL
        ? []
        : [
            {
              title: "Name",
              dataIndex: "name",
              width: "20%",
              onCell: (_: DataSource, index: number) =>
                getCellRowSpan(
                  dataSource,
                  index,
                  paginationInfo,
                  isFiltering()
                ),
              render: (name: string, record: DataSource) => {
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
                      <Link href={`/instance/${name}`} passHref>
                        {name}
                      </Link>
                    </div>
                  );
                }
                return name;
              },
              shouldCellUpdate: (record: DataSource, prevRecord: DataSource) =>
                !isEqual(record, prevRecord),
            },
          ]),
      ...(type === PageType.REGION_DETAIL
        ? []
        : [
            {
              title: "Region",
              dataIndex: "region",
              width: "14%",
              className: "whitespace-nowrap",
              onCell: (_: DataSource, index: number) =>
                getCellRowSpan(
                  dataSource,
                  index,
                  paginationInfo,
                  isFiltering()
                ),
              sorter: true,
              sortOrder: sortedInfo.field === "region" && sortedInfo.order,
              render: (region: string) =>
                // TODO: find a better way to handle other regions
                region.startsWith("Other") ? (
                  <span>{region}</span>
                ) : (
                  <Link href={`/region/${slug(region)}`} passHref>
                    {region}
                  </Link>
                ),
              shouldCellUpdate: (record: DataSource, prevRecord: DataSource) =>
                !isEqual(record, prevRecord),
            },
          ]),
      ...(type === PageType.INSTANCE_COMPARISON
        ? []
        : [
            {
              title: "CPU",
              dataIndex: "cpu",
              width: "10%",
              align: "right",
              onCell: (_: DataSource, index: number) =>
                getCellRowSpan(
                  dataSource,
                  index,
                  paginationInfo,
                  isFiltering()
                ),
              sorter: true,
              sortOrder: sortedInfo.field === "cpu" && sortedInfo.order,
              render: (cpu: number, record: DataSource) => (
                <Tooltip
                  content={
                    record.processor === ""
                      ? "N/A"
                      : record.processor.split(" ")[1]
                  }
                >
                  <span className="font-mono">{cpu}</span>
                </Tooltip>
              ),
              shouldCellUpdate: (record: DataSource, prevRecord: DataSource) =>
                !isEqual(record, prevRecord),
            },
          ]),
      ...(type === PageType.INSTANCE_COMPARISON
        ? []
        : [
            {
              title: "Memory",
              dataIndex: "memory",
              width: "10%",
              align: "right",
              onCell: (_: DataSource, index: number) =>
                getCellRowSpan(
                  dataSource,
                  index,
                  paginationInfo,
                  isFiltering()
                ),
              sorter: true,
              sortOrder: sortedInfo.field === "memory" && sortedInfo.order,
              render: (memory: number) => (
                <span className="font-mono">{memory} GB</span>
              ),
              shouldCellUpdate: (record: DataSource, prevRecord: DataSource) =>
                !isEqual(record, prevRecord),
            },
          ]),
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
      type,
    ]
  );

  return (
    <Table
      style={{ width: "100%" }}
      columns={columns}
      dataSource={dataSource}
      pagination={tablePaginationConfig}
      loading={isPending}
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
