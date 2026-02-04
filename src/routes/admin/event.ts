import { Router } from "express";
import * as eventController from "../../controllers/admin/event.controller";
import {
  bodyValidator,
  queryValidator,
  paramsValidator,
} from "../../middleware/joi";
import { verifyAdminToken } from "../../middleware/adminAuthMiddleware";

const router = Router();
router.use(verifyAdminToken);

router.post("/", bodyValidator("createEvent"), eventController.createEvent);

router.get("/", queryValidator("getEvents"), eventController.getEvents);

router.get(
  "/timesheet",
  queryValidator("getTimesheet"),
  eventController.getTimesheet,
);

router.get("/:id", paramsValidator("idSchema"), eventController.getEventById);

router.put(
  "/:id",
  paramsValidator("idSchema"),
  bodyValidator("updateEvent"),
  eventController.updateEvent,
);

router.patch(
  "/:id/coaches",
  paramsValidator("idSchema"),
  bodyValidator("updateEventCoaches"),
  eventController.updateEventCoaches,
);

router.delete(
  "/:id",
  paramsValidator("idSchema"),
  eventController.deleteEvent,
);

export default router;
