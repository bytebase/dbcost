import {
  TermId,
  RowStatus,
  ContributorId,
  ExternalId,
  Currency,
} from "./common";

export type ChargeType = "ONDEMAND" | "RESERVED";
export type Length = "1HR" | "1YR" | "2YR" | "3YR";

export type Term = {
  id: TermId;
  externalId: ExternalId;

  rowStatus: RowStatus;

  creatorId: ContributorId;
  createdTs: number;
  updaterId: ContributorId;
  updatedTs: number;

  chargeType: ChargeType;
  lengthTs: Length;
  currency: Currency;
  Price: number;
};
