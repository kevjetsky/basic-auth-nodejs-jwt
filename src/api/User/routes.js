import { Router } from 'express';
import ctrl from './controllers';
import { checkAuth } from '../../middlewares/custom/checkAuth';

const router = Router();

// Public routes
router.post('/login', ctrl.login);
router.post('/resend-otp', ctrl.resendOtp);
router.post('/verify', ctrl.userVerification);

// Protected routes
router.get('/get', 
    checkAuth(), 
    ctrl.getUser);

router.patch('/update-username',
    checkAuth(),
    ctrl.updateUsername);

router.delete('/delete',
    checkAuth(),
    ctrl.deleteUser);

router.post('/press-heart',
    checkAuth(),
    ctrl.pressHeart);

router.get('/heart-counts',
    checkAuth(),
    ctrl.getHeartCounts);

router.post('/link-partner',
    checkAuth(),
    ctrl.linkPartner);

router.post('/unlink-partner',
    checkAuth(),
    ctrl.unlinkPartner);

export default router;