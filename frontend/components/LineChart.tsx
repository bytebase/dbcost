import { useState, useEffect } from "react";
import { Empty } from "antd";
import { Line } from "@nivo/line";
import { useSearchConfigContext } from "@/stores";
import { getDigit } from "@/utils";
import { DataSource, monthDays, commonProperties } from "@/types";

interface Props {
  dataSource: DataSource[];
}

interface ChartData {
  id: string;
  data: {
    x: number;
    y: string;
  }[];
}

const getHourCountByMonth = (month: number): number => {
  let res = 0;
  for (let i = 0; i < month; i++) {
    res += monthDays[i % 12];
  }
  return res * 24;
};

const LineChart: React.FC<Props> = ({ dataSource }) => {
  const [data, setData] = useState<ChartData[]>([]);
  const { searchConfig } = useSearchConfigContext();

  useEffect(() => {
    let length = 12;
    if (searchConfig.leaseLength > 1) {
      length *= searchConfig.leaseLength;
    }
    const xGrid = Array.from({ length }, (_, i) => i + 1);
    const res = [];
    for (const row of dataSource) {
      // TODO: support reserved instances
      // We now only support on demand instances.
      if (row.leaseLength === "N/A") {
        const fees = [];

        for (const x of xGrid) {
          const totalCost =
            getHourCountByMonth(x) * searchConfig.utilization * row.hourly.usd;
          fees.push({
            x,
            y: getDigit(totalCost, 0),
          });
        }
        res.push({
          id: `${row.region}${
            searchConfig.engineType.length > 1 ? ` - ${row.engineType}` : ""
          }${row.leaseLength === "N/A" ? "" : "-" + row.leaseLength}`,
          data: fees,
        });
      }
    }
    setData(res);
  }, [
    dataSource,
    searchConfig.engineType.length,
    searchConfig.utilization,
    searchConfig.leaseLength,
  ]);

  // https://github.com/plouc/nivo/issues/1006#issuecomment-797091909
  useEffect(() => {
    setData(data);
  }, [data]);

  return data.length > 0 ? (
    <Line
      {...commonProperties}
      curve="linear"
      data={data}
      yScale={{
        // @ts-ignore (unexpected type issue)
        type: "linear",
        base: 10,
      }}
      yFormat={(value) => `${value} $`}
      axisLeft={{
        legend: "Cost (USD)",
        legendOffset: -66,
        legendPosition: "middle",
      }}
      axisBottom={{
        legend: "Number of Months",
        legendOffset: 40,
        legendPosition: "middle",
      }}
      useMesh={true}
      enableSlices="x"
      sliceTooltip={({ slice }) => {
        return (
          <div
            className="bg-white p-3 border"
            style={{
              fontFamily: "xkcd",
            }}
          >
            <div className="mb-1 text-yellow-500">
              Total cost of the first <b>{slice.points[0].data.xFormatted}</b>{" "}
              month(s).
            </div>
            {slice.points
              .sort((a, b) => Number(b.data.y) - Number(a.data.y))
              .map((point) => (
                <div
                  key={point.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <div
                      className="w-2 h-2 mr-2"
                      style={{
                        backgroundColor: point.color,
                      }}
                    ></div>
                    <span>{point.serieId}</span>
                  </div>
                  <b className="ml-2">{point.data.yFormatted}</b>
                </div>
              ))}
          </div>
        );
      }}
    />
  ) : (
    <div className="my-5">
      <Empty description={false} />
    </div>
  );
};

export default LineChart;
