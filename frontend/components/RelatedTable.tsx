import { Table } from "antd";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import Tooltip from "@/components/primitives/Tooltip";
import TdCell from "@/components/TdCell";
import { useSearchConfigContext } from "@/stores";
import { getDigit, YearInHour, withComma } from "@/utils";
import { RelatedType } from "@/types";

interface Props {
  title: string | React.ReactNode;
  instance: string;
  dataSource: RelatedType[];
}

const RelatedTable: React.FC<Props> = ({ title, instance, dataSource }) => {
  const { searchConfig } = useSearchConfigContext();
  const columns: ColumnsType<RelatedType> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (name) =>
        name === instance ? (
          name
        ) : (
          <Link href={`/instance/${name}`} passHref>
            {name}
          </Link>
        ),
    },
    {
      title: "CPU",
      dataIndex: "CPU",
      align: "right",
      render: (cpu: number) => <span className="font-mono">{cpu}</span>,
      shouldCellUpdate: () => false,
    },
    {
      title: "Memory",
      dataIndex: "memory",
      align: "right",
      render: (memory: number) => (
        <span className="font-mono">{memory} GB</span>
      ),
      shouldCellUpdate: () => false,
    },
    {
      title: () => (
        <h3 className="flex items-center justify-end m-0">
          Cost
          <Tooltip
            delayDuration={0}
            content="Cost of MySQL instance in US East (N. Virginia)."
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
      pagination={false}
      title={() => <h3 className="text-lg">{title}</h3>}
      rowKey={(record) => record.name}
      components={{
        body: { cell: TdCell },
      }}
    />
  );
};

export default RelatedTable;
