export type ChargeType = "OnDemand" | "Reserved";
export type ContractLength = "3yr" | "1yr";
export type PurchaseOption = "All Upfront" | "Partial Upfront" | "No Upfront";

export type TermPayload = {
  leaseContractLength: ContractLength;
  purchaseOption: PurchaseOption;
};

export type Term = {
  databaseEngine: string;
  type: ChargeType;
  payload: TermPayload;
  unit: string;
  usd: number;
};
