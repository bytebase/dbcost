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

// At least 2 digits of the decimal part would be display,
// it it is still 0.00, show all the digits until first 0 occur.
// e.g.
//    0.001 --> 0.001
//    0.011 --> 0.01
//    123.011 --> 123.01
export const getDigit = (val: number, leastDigitCnt: number): string => {
  let res = val.toFixed(leastDigitCnt);
  if (
    res[res.length - 1] !== "0" ||
    res[res.length - 2] !== "0" ||
    Number(res) === val
  ) {
    return res;
  }

  for (let i = leastDigitCnt + 1; ; i++) {
    res = val.toFixed(i);
    if (Number(res) === val) {
      return res;
    }
  }
};
