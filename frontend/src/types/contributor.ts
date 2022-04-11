import { ContributorId, RowStatus } from "./common";

export type Contributor = {
  id: ContributorId;
  rowStatus: RowStatus;
  createdTs: number;
  updatedTs: number;

  name: string;
};
