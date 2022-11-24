import { Table } from "antd";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import slug from "slug";
import Tooltip from "@/components/primitives/Tooltip";
import TdCell from "@/components/TdCell";
import { useSearchConfigContext } from "@/stores";
import { getDigit, YearInHour, withComma } from "@/utils";
import { RegionPricingType } from "@/types";

interface Props {
  title: string | React.ReactNode;
  currRegion: string;
  dataSource: RegionPricingType[];
}

const RegionPricingTable: React.FC<Props> = ({
  title,
  currRegion,
  dataSource,
}) => {
  const { searchConfig } = useSearchConfigContext();

  const columns: ColumnsType<RegionPricingType> = [
    {
      title: "Region",
      dataIndex: "region",
      render: (region) =>
        region === currRegion ? (
          region
        ) : (
          <Link href={`/region/${slug(region)}`} passHref>
            {region}
          </Link>
        ),
    },
    {
      title: () => (
        <h3 className="flex items-center justify-end m-0">
          Cost
          <Tooltip
            delayDuration={0}
            content="On demand cost of MySQL instance."
          >
            <QuestionMarkCircledIcon className="ml-1 cursor-pointer" />
          </Tooltip>
        </h3>
      ),
      dataIndex: "hourlyUSD",
      align: "right",
      render: (hourlyUSD: number | undefined) => {
        if (hourlyUSD) {
          const cost =
            searchConfig.utilization *
            YearInHour *
            hourlyUSD *
            searchConfig.leaseLength;
          return (
            <span className="font-mono">${withComma(getDigit(cost, 0))}</span>
          );
        } else {
          return <span className="font-mono">Unavailable</span>;
        }
      },
    },
  ];

  return (
    <Table
      className="w-5/12"
      columns={columns}
      dataSource={dataSource}
      pagination={{
        defaultPageSize: 20,
        hideOnSinglePage: true,
      }}
      title={() => <h3 className="text-lg">{title}</h3>}
      rowKey={(record) => record.region}
      components={{
        body: { cell: TdCell },
      }}
    />
  );
};

export default RegionPricingTable;
