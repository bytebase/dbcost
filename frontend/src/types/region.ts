import { RegionId, RowStatus, ContributorId } from "./common";

export type Region = {
  id: RegionId;

  rowStatus: RowStatus;

  creatorId: ContributorId;
  createdTs: number;
  updaterId: ContributorId;
  updatedTs: number;

  location: string;
};
