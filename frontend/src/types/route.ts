export type RouteQuery = RouteQueryDashBoard | RouteQueryCompare;

// RouteQueryDashBoard is the query param used in the URL for dashboard
// to make the URL as simple as possible,
// we do the following mapping between the attribute in SearchConfig and the attribute in Query Param:
//    cloudProvider -> provider
//    engineType -> engine
//    chargeType -> charge
export type RouteQueryDashBoard = {
  provider?: string;
  engine?: string;
  charge?: string;
  region?: string;
  minCPU?: number;
  minRAM?: number;
  keyword?: string;
};

// RouteQueryCompare is the query param used in the URL for compare page
// to make the URL as simple as possible,
//    checkedRowKey -> key
export type RouteQueryCompare = {
  key?: string;
};
