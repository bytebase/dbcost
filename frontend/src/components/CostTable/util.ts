import { DataRow } from "../../types";

// dashboardCostComparer will sort the price col by the baseline(on demand) price
// and keep the baseline row at the top
export const dashboardCostComparer = (row1: DataRow, row2: DataRow) => {
  if (row1.baseHourly === row2.baseHourly) {
    if (row1.id === row2.id) {
      if (row1.childCnt === row2.childCnt) {
        if (row1.leaseLength !== "N/A" && row2.leaseLength !== "N/A") {
          return row1.expectedCost - row2.expectedCost;
        }
        // put the on demand type at the top
        if (row1.leaseLength === "N/A") {
          return -1;
        }
        return 1;
      }
      // make sure that the on demand type is always at the top
      return row2.childCnt - row1.childCnt;
    }
    return row1.id - row2.id;
  }
  return row1.baseHourly - row2.baseHourly;
};

// compareTableCostComparer just return the expected cost
export const compareTableCostComparer = (row1: DataRow, row2: DataRow) => {
  return row1.expectedCost - row2.expectedCost;
};
