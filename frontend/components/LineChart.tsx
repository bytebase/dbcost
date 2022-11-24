import { useState, useEffect } from "react";
import { Empty } from "antd";
import { Line } from "@nivo/line";
import { useSearchConfigContext } from "@/stores";
import { getDigit, withComma, filterNaN, getPrice } from "@/utils";
import {
  DataSource,
  monthDays,
  commonProperties,
  EngineType,
  PageType,
} from "@/types";

interface Props {
  type: PageType;
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

const generateChartData = (
  type: PageType,
  xLength: number,
  dataSource: DataSource[],
  utilization: number,
  engineType: EngineType[]
) => {
  // Will generate [1, 2, 3, ..., xLength].
  const xGrid = Array.from({ length: xLength }, (_, i) => i + 1);
  const res = [];

  for (const row of dataSource) {
    const fees = [];

    // Deal with on demand instances.
    if (row.leaseLength === "On Demand") {
      for (const x of xGrid) {
        const totalCost = getHourCountByMonth(x) * utilization * row.hourly.usd;
        fees.push({
          x,
          y: getDigit(totalCost, 0),
        });
      }
      switch (type) {
        case PageType.INSTANCE_DETAIL:
          res.push({
            id: `${row.region}${
              engineType.length > 1 ? ` - ${row.engineType}` : ""
            }${row.leaseLength === "On Demand" ? "" : "-" + row.leaseLength}`,
            data: fees,
          });
          break;
        case PageType.REGION_DETAIL:
          res.push({
            id: `${row.name}${
              engineType.length > 1 ? ` - ${row.engineType}` : ""
            }${row.leaseLength === "On Demand" ? "" : "-" + row.leaseLength}`,
            data: fees,
          });
          break;
        case PageType.INSTANCE_COMPARISON:
          res.push({
            id: `${row.name}${
              engineType.length > 1 ? ` - ${row.engineType}` : ""
            }-${row.leaseLength}`,
            data: fees,
          });
          break;

        default:
          break;
      }
    } else {
      // Deal with reserved instances.
      // Reserved plans' line starts from (1, 0).
      fees.push({
        x: 1,
        y: "0",
      });
      switch (row.leaseLength) {
        case "1yr":
          for (let i = 1; i <= 3; i++) {
            const totalCost = getPrice(row, 1, i);
            fees.push({
              x: i * 12,
              y: getDigit(totalCost, 0),
            });
          }
          break;
        case "3yr":
          const totalCost = getPrice(row, 1, 3);
          fees.push({
            x: 3 * 12,
            y: getDigit(totalCost, 0),
          });
          break;

        default:
          break;
      }
      res.push({
        id: `${row.name}${
          engineType.length > 1 ? ` - ${row.engineType}` : ""
        }-${row.leaseLength}-commitment-$${row.commitment.usd}`,
        data: fees,
      });
    }
  }
  return res;
};

const getNearbyPoints = (data: ChartData[], x: number, serieId: string) => {
  // Display at most five different values.
  const range = 5;
  // For each different value, display at most two same values.
  const sameValueLimit = 2;
  const higherPoints = [];
  const lowerPoints = [];
  let hasMoreHigherPoints: boolean = false,
    hasMoreLowerPoints: boolean = false;

  const pointSlice = data
    .map(({ id, data }) => {
      const point = data.find((d) => d.x === x);
      return {
        id,
        x,
        y: Number(point?.y),
      };
    })
    .sort((a, b) => b.y - a.y);
  const currPointIndex = pointSlice.findIndex((d) => d.id === serieId);

  // At most five different y values higher than current point.
  for (
    let i = currPointIndex - 1, r = range, l = sameValueLimit;
    i >= 0 && r > 0;
    i--
  ) {
    if (pointSlice[i].y !== pointSlice[i + 1].y) {
      r--;
      if (r === 0) {
        hasMoreHigherPoints = true;
      }
      l = sameValueLimit - 1;
      higherPoints.unshift(pointSlice[i]);
    } else {
      if (l > 0) {
        higherPoints.unshift(pointSlice[i]);
        l--;
      }
    }
  }
  // At most five different y values lower than current point.
  for (
    let i = currPointIndex + 1, r = range, l = sameValueLimit;
    i < pointSlice.length && r > 0;
    i++
  ) {
    if (pointSlice[i].y !== pointSlice[i - 1].y) {
      r--;
      if (r === 0) {
        hasMoreLowerPoints = true;
      }
      l = sameValueLimit - 1;
      lowerPoints.push(pointSlice[i]);
    } else {
      if (l > 0) {
        lowerPoints.push(pointSlice[i]);
        l--;
      }
    }
  }

  return {
    higherPoints,
    lowerPoints,
    hasMoreHigherPoints,
    hasMoreLowerPoints,
  };
};

const LineChart: React.FC<Props> = ({ type, dataSource }) => {
  const [data, setData] = useState<ChartData[]>([]);
  const { searchConfig } = useSearchConfigContext();

  useEffect(() => {
    let length = 12;
    if (searchConfig.leaseLength > 1) {
      length *= searchConfig.leaseLength;
    }
    // In comparison pages, we compare between 3-year-plans.
    if (type === PageType.INSTANCE_COMPARISON) {
      length = 36;
    }
    const res = generateChartData(
      type,
      length,
      dataSource,
      searchConfig.utilization,
      searchConfig.engineType
    );
    setData(res);
  }, [
    dataSource,
    searchConfig.engineType.length,
    searchConfig.utilization,
    searchConfig.leaseLength,
    searchConfig.engineType,
    type,
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
        legendOffset: -76,
        legendPosition: "middle",
        format: withComma,
      }}
      axisBottom={{
        legend: "Number of Months",
        legendOffset: 40,
        legendPosition: "middle",
      }}
      useMesh={true}
      enableSlices={false}
      tooltip={({ point }) => {
        const {
          higherPoints,
          lowerPoints,
          hasMoreHigherPoints,
          hasMoreLowerPoints,
        } = getNearbyPoints(data, Number(point.data.x), String(point.serieId));
        return (
          <div
            className="bg-white p-3 border"
            style={{
              fontFamily: "xkcd",
            }}
          >
            <div className="mb-1 text-yellow-500">
              Total cost of the first <b>{point.data.xFormatted}</b> month(s).
            </div>
            {hasMoreHigherPoints && <div>...</div>}
            {higherPoints.map((point) => (
              <div key={point.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span>{point.id}</span>
                </div>
                <b className="ml-2">{filterNaN(withComma(point.y))} $</b>
              </div>
            ))}
            <div
              key={point.id}
              className="flex justify-between items-center my-1"
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
              <b className="ml-2">
                {filterNaN(withComma(point.data.yFormatted))}
              </b>
            </div>
            {lowerPoints.map((point) => (
              <div key={point.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span>{point.id}</span>
                </div>
                <b className="ml-2">{filterNaN(withComma(point.y))} $</b>
              </div>
            ))}
            {hasMoreLowerPoints && <div>...</div>}
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
