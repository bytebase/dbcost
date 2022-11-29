import React from "react";
import { Divider } from "antd";
import { getDigit } from "@/utils";

enum BadgeTypes {
  TEXT = "TEXT",
}

interface BadgeProps {
  type: BadgeTypes;
  text: string | number | null;
  description: string;
}

export interface BadgeRow {
  instanceName: string;
  cpu: number;
  memory: number;
  processor: string | null;
  regionCount: number;
  hourly: string;
}

interface BadgeGroupProps {
  dataSource: BadgeRow[];
}

const CompareBadge: React.FC<BadgeProps> = ({ type, text, description }) => {
  switch (type) {
    case BadgeTypes.TEXT:
      return (
        <figure className="w-fit flex flex-col justify-center items-center">
          <span className="flex justify-center items-center h-10 text-3xl font-semibold whitespace-nowrap">
            {text ?? "-"}
          </span>
          <div className="text-sm whitespace-nowrap">{description}</div>
        </figure>
      );

    default:
      return null;
  }
};

const CompareBadgeGroup: React.FC<BadgeGroupProps> = ({ dataSource }) => {
  return (
    <div className="w-3/5 my-2">
      <div className="grid grid-cols-7-auto justify-items-center items-center">
        {dataSource.map(
          ({ instanceName, cpu, memory, processor, regionCount, hourly }) => (
            <React.Fragment key={instanceName}>
              <div className="whitespace-nowrap font-semibold justify-self-start">
                {instanceName}
              </div>
              <Divider type="vertical" />
              <CompareBadge
                type={BadgeTypes.TEXT}
                text={cpu}
                description="vCPUs"
              />
              <CompareBadge
                type={BadgeTypes.TEXT}
                text={`${memory} GB`}
                description="Memory"
              />
              <CompareBadge
                type={BadgeTypes.TEXT}
                text={processor}
                description="Processor"
              />
              <CompareBadge
                type={BadgeTypes.TEXT}
                text={regionCount}
                description="Regions"
              />
              <CompareBadge
                type={BadgeTypes.TEXT}
                text={`$${getDigit(Number(hourly), 3)}`}
                description="On Demand Hourly Price"
              />
            </React.Fragment>
          )
        )}
      </div>
    </div>
  );
};

export default CompareBadgeGroup;
