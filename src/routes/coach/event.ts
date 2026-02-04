import { Router } from "express";
import * as eventController from "../../controllers/coach/event.controller";
import {
  bodyValidator,
  paramsValidator,
  queryValidator,
} from "../../middleware/joi";
import { verifyUserToken } from "../../middleware/coachAuthMiddleware";

const router = Router();
router.use(verifyUserToken);

router.post("/", bodyValidator("createEvent"), eventController.createEvent);

router.get("/", queryValidator("getEvents"), eventController.getEvents);

router.get(
  "/timesheet",
  verifyUserToken,
  queryValidator("getCoachTimesheet"),
  eventController.getTimesheet,
);

router.get("/:id", paramsValidator("idSchema"), eventController.getEventById);

router.patch(
  "/:id",
  paramsValidator("idSchema"),
  bodyValidator("updateEvent"),
  eventController.updateEvent,
);

router.delete("/:id", paramsValidator("idSchema"), eventController.deleteEvent);

export default router;
