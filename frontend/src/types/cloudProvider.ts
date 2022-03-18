import { RowStatus } from "./common/common";
import { CloudProviderId, ContributorId } from "./common";

export type CloudProvider = {
  id: CloudProviderId;

  rowStatus: RowStatus;

  creatorId: ContributorId;
  createdTs: number;
  updaterId: ContributorId;
  updatedTs: number;

  name: string;
};
