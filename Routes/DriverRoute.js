const express = require('express');
const driver_Controllers = require('../Controller/DriverCtrl')
const router = express();
router.post('/api/v1/driver/create', driver_Controllers.createDriver);
router.post('/api/v1/driver/sendotp', driver_Controllers.sendOtp);
router.post('/api/v1/driver/verify', driver_Controllers.accountVerificationOTP);
router.get('/api/v1/driver/get/:id', driver_Controllers.getProfile);
router.put('/api/v1/driver/update/:id', driver_Controllers.AddDeriverDetails);
router.post('/api/v1/driver/addOrder', driver_Controllers.AssignOrdertoDriver);
router.put('/api/v1/driver/accept/:id', driver_Controllers.DriverAccept);
router.put('/api/v1/driver/reject/:id', driver_Controllers.DriverReject);
router.get('/api/v1/driver/alldriver', driver_Controllers.AllDrivers);
router.get('/api/v1/driver/allorders', driver_Controllers.DriverAllOrder);
router.get('/api/v1/driver/allorders/:id', driver_Controllers.DriverSingleOrder);
router.delete('/api/v1/driver/delete/order/:id', driver_Controllers.DeleteAssignOrder);
router.get('/api/v1/driver/price/:driverId', driver_Controllers.GetPriceByDriverId);
router.put('/api/v1/driver/complete/:id', driver_Controllers.DeliveredOrder);
router.post('/api/v1/driver/logout', driver_Controllers.logout);
router.get('/api/v1/driver/delivered/:driverId', driver_Controllers.driverCompleted)
router.get('/api/v1/driver/pending/order/:id', driver_Controllers.PendingOrder)
router.get('/api/v1/driver/accept/order/:id', driver_Controllers.AcceptOrder)
router.delete('/api/v1/driver/:id', driver_Controllers.DeleteDriver);
router.put('/api/v1/driver/status/:id', driver_Controllers.ChangeStatus)
router.post('/api/v1/driver/addEnquiry/:id', driver_Controllers.addEnquiry)
router.post('/api/v1/driver/assignUserToDriver', driver_Controllers.assignUserToDriver);
router.post('/api/v1/driver/unAssignUserToDriver', driver_Controllers.unAssignUserToDriver);
router.get('/api/v1/driver/allAssignUserToDriver/:driverId', driver_Controllers.allAssignUserToDriver)
module.exports = router;