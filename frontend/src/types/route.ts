export type RouteQuery = RouteQueryDashBoard | RouteQueryCompare;

// RouteQueryDashBoard is the query param used in the URL for dashboard
// to make the URL as simple as possible,
// we do the following mapping between the attribute in SearchConfig and the attribute in Query Param:
//    cloudProvider -> provider
//    engineType -> engine
//    chargeType -> charge
//    leaseLength -> lease
export type RouteQueryDashBoard = {
  provider?: string;
  engine?: string;
  charge?: string;
  region?: string;
  minCPU?: number;
  minRAM?: number;
  keyword?: string;
  lease?: number;
  utilization?: number;
};

// RouteQueryCompare is the query param used in the URL for compare page
export type RouteQueryCompare = {
  instance?: string;
};
