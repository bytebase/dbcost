import { RowStatus, Currency, EngineType } from "./common/common";
import {
  DBInstanceId,
  ExternalId,
  ContributorId,
  CloudProviderId,
  RegionId,
} from "./common";

export type InstanceFamily = "GENERAL" | "MEMORY";

export type DBInstance = {
  id: DBInstanceId;
  externalId: ExternalId;

  rowStatus: RowStatus;

  creatorId: ContributorId;
  createTs: ContributorId;
  updaterId: ContributorId;
  updateTs: ContributorId;

  cloudProviderId: CloudProviderId;
  regionId: RegionId;
  family: InstanceFamily;
  name: string;

  currency: Currency;
  price: number;
  engine: EngineType;
  vCPU: number;
  memory: number;
  processor: string;
  // storage: string;
};

export type Adaptor = {
  name: string;
  engine: string;
  memory: string;
  processor: string;
  vCPU: string;
};

export const AWSDBInstanceAttributeAdaptor: Adaptor = {
  name: "instanceType",
  engine: "databaseEngine",
  memory: "memory",
  processor: "physicalProcessor",
  vCPU: "vcpu",
};

export const AWSConvertor = (raw: any, adaptor: Adaptor): DBInstance => {
  return {
    name: raw[adaptor.name],
    vCPU: raw[adaptor.vCPU],
    memory: raw[adaptor.memory],
    processor: raw[adaptor.processor],
  } as DBInstance;
};
