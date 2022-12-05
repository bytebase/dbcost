import slug from "slug";

export const regionCodeNameSlugMap: [string, string, string][] = [
  // AWS
  ["us-gov-east-1", "AWS GovCloud (US-East)", "aws-govcloud-us-east"],
  ["us-gov-west-1", "AWS GovCloud (US-West)", "aws-govcloud-us-west"],
  ["af-south-1", "Africa (Cape Town)", "africa-cape-town"],
  ["ap-east-1", "Asia Pacific (Hong Kong)", "asia-pacific-hong-kong"],
  ["ap-northeast-1", "Asia Pacific (Tokyo)", "asia-pacific-tokyo"],
  ["ap-northeast-2", "Asia Pacific (Seoul)", "asia-pacific-seoul"],
  ["ap-northeast-3", "Asia Pacific (Osaka)", "asia-pacific-osaka"],
  ["ap-south-1", "Asia Pacific (Mumbai)", "asia-pacific-mumbai"],
  ["ap-southeast-1", "Asia Pacific (Singapore)", "asia-pacific-singapore"],
  ["ap-southeast-2", "Asia Pacific (Sydney)", "asia-pacific-sydney"],
  ["ap-southeast-3", "Asia Pacific (Jakarta)", "asia-pacific-jakarta"],
  ["ca-central-1", "Canada (Central)", "canada-central"],
  ["eu-central-1", "Europe (Frankfurt)", "europe-frankfurt"],
  ["eu-north-1", "Europe (Stockholm)", "europe-stockholm"],
  ["eu-south-1", "Europe (Milan)", "europe-milan"],
  ["eu-west-1", "Europe (Ireland)", "europe-ireland"],
  ["eu-west-2", "Europe (London)", "europe-london"],
  ["eu-west-3", "Europe (Paris)", "europe-paris"],
  ["me-south-1", "Middle East (Bahrain)", "middle-east-bahrain"],
  ["sa-east-1", "South America (Sao Paulo)", "south-america-sao-paulo"],
  ["us-east-1", "US East (N. Virginia)", "us-east-n-virginia"],
  ["us-east-2", "US East (Ohio)", "us-east-ohio"],
  ["us-west-1", "US West (N. California)", "us-west-n-california"],
  ["us-west-2", "US West (Oregon)", "us-west-oregon"],
  ["us-west-2-lax-1", "US West (Los Angeles)", "us-west-los-angeles"],
  ["ap-south-2", "Asia Pacific (Hyderabad)", "asia-pacific-hyderabad"],
  ["eu-central-2", "Europe (Zurich)", "europe-zurich"],
  ["eu-south-2", "Europe (Spain)", "europe-spain"],
  ["me-central-1", "Middle East (UAE)", "middle-east-uae"],

  // GCP
  ["asia-east1", "Asia Pacific (Taiwan)", "asia-pacific-taiwan"],
  ["asia-east2", "Asia Pacific (Hong Kong)", "asia-pacific-hong-kong"],
  ["asia-northeast1", "Asia Pacific (Tokyo)", "asia-pacific-tokyo"],
  ["asia-northeast2", "Asia Pacific (Osaka)", "asia-pacific-osaka"],
  ["asia-northeast3", "Asia Pacific (Seoul)", "asia-pacific-seoul"],
  ["asia-south1", "Asia Pacific (Mumbai)", "asia-pacific-mumbai"],
  ["asia-south2", "Asia Pacific (Delhi)", "asia-pacific-delhi"],
  ["asia-southeast1", "Asia Pacific (Singapore)", "asia-pacific-singapore"],
  ["asia-southeast2", "Asia Pacific (Jakarta)", "asia-pacific-jakarta"],
  ["australia-southeast1", "Asia Pacific (Sydney)", "asia-pacific-sydney"],
  [
    "australia-southeast2",
    "Asia Pacific (Melbourne)",
    "asia-pacific-melbourne",
  ],
  ["europe-central2", "Europe (Warsaw)", "europe-warsaw"],
  ["europe-north1", "Europe (Finland)", "europe-finland"],
  ["europe-west1", "Europe (Belgium)", "europe-belgium"],
  ["europe-west2", "Europe (London)", "europe-london"],
  ["europe-west3", "Europe (Frankfurt)", "europe-frankfurt"],
  ["europe-west4", "Europe (Netherlands)", "europe-netherlands"],
  ["europe-west6", "Europe (Zurich)", "europe-zurich"],
  ["europe-west8", "Europe (Milan)", "europe-milan"],
  ["europe-west9", "Europe (Paris)", "europe-paris"],
  ["northamerica-northeast1", "Canada (Montréal)", "canada-montreal"],
  ["northamerica-northeast2", "Canada (Toronto)", "canada-toronto"],
  ["southamerica-east1", "South America (Osasco)", "south-america-osasco"],
  ["southamerica-west1", "South America (Santiago)", "south-america-santiago"],
  ["us-central1", "US Central (Iowa)", "us-central-iowa"],
  ["us-east1", "US East (South Carolina)", "us-east-south-carolina"],
  ["us-east4", "US East (N. Virginia)", "us-east-n-virginia"],
  ["us-west1", "US West (Oregon)", "us-west-oregon"],
  ["us-west2", "US West (Los Angeles)", "us-west-los-angeles"],
  ["us-west3", "US West (Salt Lake City)", "us-west-salt-lake-city"],
  ["us-west4", "US West (Las Vegas)", "us-west-las-vegas"],
  ["us-south1", "US South (Dallas)", "us-south-dallas"],
  ["me-west1", "Middle East (Tel Aviv)", "middle-east-tel-aviv"],
  ["us-east5", "North America (Columbus)", "north-america-columbus"],
  ["europe-southwest1", "Europe (Madrid)", "europe-madrid"],
  ["us-east7", "US East (Alabama)", "us-east-alabama"],
];

export const getRegionName = (regionCode: string): string => {
  if (!regionCodeNameSlugMap.some(([code]) => code === regionCode)) {
    // If the code is not included in the map, we just show user the code.
    // Also, we need to update the map manually.
    regionCodeNameSlugMap.push([
      regionCode,
      `Other (${regionCode})`,
      slug(`Other (${regionCode})`),
    ]);
  }
  return regionCodeNameSlugMap.find(([code]) => code === regionCode)![1];
};

export const getRegionCode = (regionName: string): string[] => {
  const regionCode: string[] = [];
  regionCodeNameSlugMap.forEach(([code, name]) => {
    if (name === regionName) {
      regionCode.push(code);
    }
  });

  return regionCode;
};

// "Asia Pacific (Hong Kong)" -> "Asia Pacific"
export const getRegionPrefix = (regionName: string): string =>
  regionName.substring(0, regionName.indexOf("(")).trimEnd();

export const getRegionListByPrefix = (prefix: string): string[] =>
  Array.from(
    new Set(
      regionCodeNameSlugMap
        .filter((pair) => pair[1].startsWith(prefix))
        .map((pair) => pair[1])
    )
  );
