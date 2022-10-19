import { Table } from "antd";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import TdCell from "@/components/TdCell";
import type { RelatedType } from "@/types/table";

interface Props {
  title: string;
  instance: string;
  dataSource: RelatedType[];
}

const RelationTable: React.FC<Props> = ({ title, instance, dataSource }) => {
  const columns: ColumnsType<RelatedType> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (name) =>
        name === instance ? (
          name
        ) : (
          <Link href={`/instance/${name}`}>{name}</Link>
        ),
    },
    {
      title: "CPU",
      dataIndex: "CPU",
      align: "right",
      shouldCellUpdate: () => false,
    },
    {
      title: "Memory",
      dataIndex: "memory",
      align: "right",
      shouldCellUpdate: () => false,
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

export default RelationTable;
