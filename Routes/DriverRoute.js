const express = require('express');
const driver_Controllers = require('../Controller/DriverCtrl')

const router = express();

router.post('/create', driver_Controllers.createDriver);
router.post('/sendotp', driver_Controllers.sendOtp);
router.post('/verify', driver_Controllers.accountVerificationOTP );
router.put('/update/:id', driver_Controllers.AddDeriverDetails);
router.post('/addOrder', driver_Controllers.AssignOrdertoDriver);
router.put('/accept/:id', driver_Controllers.DriverAccept);
router.put('/reject/:id', driver_Controllers.DriverReject);
router.get('/alldriver', driver_Controllers.AllDrivers);
router.get('/allorders', driver_Controllers.DriverAllOrder);
router.get('/allorders/:id', driver_Controllers.DriverSingleOrder);
router.delete('/delete/order/:id', driver_Controllers.DeleteAssignOrder);
router.get('/price/:driverId', driver_Controllers.GetPriceByDriverId);
router.put('/complete/:id',driver_Controllers.DeliveredOrder);
router.post('/logout', driver_Controllers.logout);
router.get('/delivered/:driverId', driver_Controllers.driverCompleted)
router.get('/pending/order/:id',driver_Controllers.PendingOrder )
router.get('/accept/order/:id', driver_Controllers.AcceptOrder)
router.delete('/:id', driver_Controllers.DeleteDriver);
router.put('/status/:id', driver_Controllers.ChangeStatus)



module.exports = router;