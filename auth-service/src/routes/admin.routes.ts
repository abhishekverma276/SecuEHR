import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import { deleteUser, getAllUsers, updateUserRole } from "../controllers/admin.controller";
import { isAdmin } from "../middleware/admin.middleware";
import { deleteUserValidator, updateRoleValidator } from "../middleware/admin.validator";

const router = Router();

router.use([authenticateJWT, isAdmin]);

router.get('/users', getAllUsers);

router.put('/users/:userId', updateRoleValidator, updateUserRole);

router.delete('/users/:userId',deleteUserValidator, deleteUser);    


export default router;