export type ChargeType = "OnDemand" | "Reserved";
export type ContractLength = "3yr" | "1yr";
export type PurchaseOption = "All Upfront" | "Partial Upfront" | "No Upfront";

export type TermPayload = {
  leaseContractLength: ContractLength;
  purchaseOption: PurchaseOption;
} | null;

export type Term = {
  databaseEngine: string;
  type: ChargeType;
  payload: TermPayload;
  hourlyUSD: number;
  commitmentUSD: number;
};

export const isValidChargeType = (valList: string[]): boolean => {
  valList.forEach((chargeType) => {
    if (chargeType !== "OnDemand" && chargeType !== "Reserved") {
      return false;
    }
  });

  return true;
};
