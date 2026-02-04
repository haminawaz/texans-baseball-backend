import { playerSchemas } from "./player/auth";
import { coachSchemas } from "./coach";
import { commonSchemas } from "./common";
import { adminCoachSchemas } from "./admin/coach";
import { adminTeamSchemas } from "./admin/team";
import { tryoutSchemas } from "./admin/tryout";
import { adminEventSchemas } from "./admin/event";
import { adminPlayerSchemas } from "./admin/player";

export default {
  ...playerSchemas,
  ...coachSchemas,
  ...adminCoachSchemas,
  ...adminTeamSchemas,
  ...tryoutSchemas,
  ...adminEventSchemas,
  ...adminPlayerSchemas,
  ...commonSchemas,
};
