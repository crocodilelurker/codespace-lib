import { Router } from 'express';
import response from "../utils/response.js";
import { validate } from "../middleware/validate.js";
import { signupSchema } from "../schemas/signup.js";
import { login, signup, refresh } from '../controllers/auth.controller.js';
import { loginSchema } from '../schemas/login.js';
import { refreshSchema } from '../schemas/refresh.js';

const router = Router();

router.get("/health", (req, res) => {
    return response(res, 200, "ok", null);
});

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);

export default router;