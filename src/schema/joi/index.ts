import { playerSchemas } from "./player/auth";
import { playerUniformSizingSchemas } from "./player/uniform-sizing";
import { coachSchemas } from "./coach";
import { coachUniformSizingSchemas } from "./coach/uniform-sizing";
import { commonSchemas } from "./common";
import { adminCoachSchemas } from "./admin/coach";
import { adminTeamSchemas } from "./admin/team";
import { tryoutSchemas } from "./admin/tryout";
import { adminEventSchemas } from "./admin/event";
import { adminPlayerSchemas } from "./admin/player";

export default {
  ...playerSchemas,
  ...playerUniformSizingSchemas,
  ...coachSchemas,
  ...coachUniformSizingSchemas,
  ...adminCoachSchemas,
  ...adminTeamSchemas,
  ...tryoutSchemas,
  ...adminEventSchemas,
  ...adminPlayerSchemas,
  ...commonSchemas,
};
