import { Router } from "express";
import * as fosterRequestsController from "../controllers/foster-requests.controller.ts";
import { authenticate, checkRole } from "../middlewares/auth.middleware.ts";

export const router = Router();

router.use(authenticate);

router.post("/", checkRole("foster"), fosterRequestsController.createFosterRequest);
router.get("/", fosterRequestsController.listFosterRequests);
router.get("/:id", fosterRequestsController.getFosterRequestDetail);
router.patch(
    "/:id/status",
    checkRole("association"),
    fosterRequestsController.updateFosterRequestStatus,
);
router.delete(
    "/:id",
    checkRole("foster"),
    fosterRequestsController.cancelFosterRequest,
);