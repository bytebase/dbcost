import { DataRow } from "@/types";

const YearInHour = 365 * 24;
export const getPrice = (
  dataRow: DataRow,
  utilization: number,
  leaseLength: number
): number => {
  // charged on demand.
  if (dataRow.leaseLength === "N/A") {
    return leaseLength * YearInHour * dataRow.hourly.usd * utilization;
  }

  // Charged reserved
  // Reserved means you will be charged anytime, even you do not use it, so the utilization factor is left here.
  let reservedCharge = leaseLength * YearInHour * dataRow.hourly.usd;
  // The commitment should be charged immediately.
  if (dataRow.leaseLength === "1yr") {
    reservedCharge += dataRow.commitment.usd * leaseLength;
  }
  if (dataRow.leaseLength === "3yr" && leaseLength) {
    reservedCharge += dataRow.commitment.usd * Math.ceil(leaseLength / 3);
  }
  return reservedCharge;
};

export const getDiff = (
  dataRow: DataRow,
  utilization: number,
  leaseLength: number
): number => {
  const baseCharge =
    leaseLength * YearInHour * dataRow.baseHourly * utilization;
  return (dataRow.expectedCost - baseCharge) / baseCharge;
};

// At least N digits of the decimal part would be display.
// If it is still 0.00, show all the digits until first 0 occur.
// e.g.
//    N = 2
//    0.001 --> 0.00 --> 0.001
//    0.011 --> 0.01
//    123.011 --> 123.01
export const getDigit = (val: number, N: number): string => {
  let res = val.toFixed(N);
  // If val = 0, then it should always be 0.
  if (Number(res) === val || N === 0) {
    return res;
  }

  for (let i = 0; i < N; i++) {
    if (res[res.length - i - 1] != "0") {
      return res;
    }
  }

  for (let i = N + 1; ; i++) {
    res = val.toFixed(i);
    if (Number(res) === val) {
      return res;
    }
  }
};
