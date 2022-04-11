export type ChargeType = "OnDemand" | "Reserved";
export type Length = "1HR" | "1YR" | "2YR" | "3YR";

export type Term = {
  engineCode: string;
  type: ChargeType;
  unit: string;
  usd: number;
};
