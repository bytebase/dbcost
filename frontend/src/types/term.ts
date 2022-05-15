import { EngineType } from "./common";

export type ChargeType = "OnDemand" | "Reserved";
export type ContractLength = "3yr" | "1yr";
export type PurchaseOption = "All Upfront" | "Partial Upfront" | "No Upfront";

export type TermPayload = {
  leaseContractLength: ContractLength;
  purchaseOption: PurchaseOption;
} | null;

export type Term = {
  code: string;
  databaseEngine: EngineType;
  type: ChargeType;
  payload: TermPayload;
  hourlyUSD: number;
  commitmentUSD: number;
};

export const isValidChargeType = (chargeTypeList: string[]): boolean => {
  for (const chargeType of chargeTypeList) {
    if (chargeType !== "OnDemand" && chargeType !== "Reserved") {
      return false;
    }
  }

  return true;
};
