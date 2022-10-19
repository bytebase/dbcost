import { DataSource } from "@/types";
import { YearInHour } from "@/utils";

interface PaginationInfo {
  current: number;
  pageSize: number;
}

enum SorterColumn {
  REGION = "region",
  CPU = "cpu",
  MEMORY = "memory",
  EXPECTED_COST = "expectedCost",
}

type Comparer = {
  [key in SorterColumn]: (
    a: DataSource,
    b: DataSource,
    isAscending: boolean
  ) => number;
};

export const getCellRowSpan = (
  dataSource: DataSource[],
  index: number,
  pagination: PaginationInfo,
  isFiltering: boolean
) => {
  // Every time pageSize changes, component state `paginationInfo.pageSize` is always a correct one.
  const pageSize = pagination.pageSize;
  // But `paginationInfo.current` is not.
  let current;
  // Our calculation of the row span is based on the pagination information. But if we're filtering in the table,
  // the `paginationInfo` component state will not be updated, while the actual pagination of the table is changed.
  // e.g.
  // If we're at the 2nd page of the table before search, and then we search for a keyword
  // which only has results less than a page size, the table will be reset to the 1st page,
  // but the `paginationInfo` we read from component state is still in the 2nd page.
  // So we need to calculate the actual pagination info if we're searching.
  if (isFiltering) {
    const pageCount = Math.ceil(dataSource.length / pageSize);
    if (pageCount <= pagination.current) {
      // If the page number of results is less than the old `paginationInfo.current`,
      // the actual pagination current page will be the last page.
      current = pageCount;
    } else {
      // Otherwise, the actual pagination current page will inherit the old `paginationInfo.current`.
      current = pagination.current;
    }
  } else {
    current = pagination.current;
  }

  // Count for rows with the same id.
  let sameRowCount = 1;

  let totalIndex = pageSize * current;
  totalIndex = totalIndex > dataSource.length ? dataSource.length : totalIndex;
  const realIndex = pageSize * (current - 1) + index;
  if (
    index !== 0 &&
    dataSource[realIndex - 1]?.id === dataSource[realIndex]?.id
  ) {
    sameRowCount = 0;
  } else {
    for (let i = realIndex + 1; i < totalIndex; i++) {
      if (dataSource[i].id === dataSource[realIndex].id) {
        sameRowCount++;
      } else {
        break;
      }
    }
  }
  return { rowSpan: sameRowCount };
};

// dashboardCostComparer will sort the price col by the baseline(on demand) price
// and keep the baseline row at the top
export const dashboardCostComparer = (
  rowA: DataSource,
  rowB: DataSource,
  isAscending: boolean
): number => {
  if (rowA.id !== rowB.id) {
    return isAscending
      ? rowA.baseHourly * YearInHour - rowB.baseHourly * YearInHour
      : rowB.baseHourly * YearInHour - rowA.baseHourly * YearInHour;
  }
  if (rowA.leaseLength !== "N/A" && rowB.leaseLength !== "N/A") {
    if (rowA.expectedCost - rowB.expectedCost >= 0) {
      return isAscending ? 1 : -1;
    } else {
      return isAscending ? -1 : 1;
    }
  }
  // Make sure to put the baseline row at top.
  if (rowA.leaseLength === "N/A") {
    return -1;
  }
  return 1;
};

export const comparer: Comparer = {
  region: (rowA: DataSource, rowB: DataSource, isAscending: boolean) => {
    // sort by the case-insensitive alphabetical order
    const a = rowA.region.toLocaleLowerCase();
    const b = rowB.region.toLocaleLowerCase();
    const stringComp = a.localeCompare(b);
    if (stringComp !== 0) {
      return isAscending ? stringComp : -stringComp;
    }

    // if tow region are identical, sort them with id
    return isAscending ? rowA.id - rowB.id : rowB.id - rowA.id;
  },
  cpu: (rowA: DataSource, rowB: DataSource, isAscending: boolean) =>
    isAscending ? rowA.cpu - rowB.cpu : rowB.cpu - rowA.cpu,
  memory: (rowA: DataSource, rowB: DataSource, isAscending: boolean) => {
    return isAscending
      ? Number(rowA.memory) - Number(rowB.memory)
      : Number(rowB.memory) - Number(rowA.memory);
  },
  expectedCost: dashboardCostComparer,
};

// the order of the array will affect the order of the column of the table
// the desired order is: [engine, hourly pay, commitment, lease length]
export const getPricingContent = (
  pricingContent: any,
  showLeaseLength: boolean,
  showEngineType: boolean
) => {
  const col = [];
  if (showLeaseLength) {
    col.push(pricingContent.leaseLength);
  }
  if (showEngineType) {
    col.push(pricingContent.commitmentWithEngine);
  } else {
    col.push(pricingContent.commitmentWithoutEngine);
  }
  col.push(pricingContent.hourlyPay);

  col.push(pricingContent.expectedCost);
  return col;
};
