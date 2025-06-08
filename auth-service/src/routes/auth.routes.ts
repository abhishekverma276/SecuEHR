import { changePassword, loginUser, registerUser, setupTOTP, verifyOTPForTOTP } from "../controllers/auth.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { loginValidator, passwordChangeValidator, passwordResetRequestValidator, passwordResetValidator, registerValidator, twoFASetupValidator, twoFAVarifyValidator } from "../middleware/auth.validator";
import { requestPasswordReset, resetPassword } from "../controllers/password.controller";

const router = require('express').Router();

//public routes
router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.post('/password-request', passwordResetRequestValidator, requestPasswordReset);
router.post('/reset-password', passwordResetValidator, resetPassword);

//Protected routes
router.post('/2fa/setup/:userId', [authenticateJWT, twoFASetupValidator ], setupTOTP);
router.post('/2fa/verify/:userId', [authenticateJWT, twoFAVarifyValidator ], verifyOTPForTOTP);
router.post('/password-change', [authenticateJWT, passwordChangeValidator ], changePassword);



export default router;

