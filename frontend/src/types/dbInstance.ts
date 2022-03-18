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
  storage: string;
};
