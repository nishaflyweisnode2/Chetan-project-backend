const express = require('express');
const CollectionBoy = require('../Controller/CollectionCtrl')
const router = express();
router.post('/api/v1/CollectionBoy/create', CollectionBoy.createCollectionBoy);
router.post('/api/v1/CollectionBoy/createCollectionBoyByAdmin', CollectionBoy.createCollectionBoyByAdmin);
router.put('/api/v1/CollectionBoy/updateCollectionBoyByAdmin/:id', CollectionBoy.updateCollectionBoyByAdmin);
router.post('/api/v1/CollectionBoy/sendotp', CollectionBoy.sendOtp);
router.post('/api/v1/CollectionBoy/verify', CollectionBoy.accountVerificationOTP);
router.get('/api/v1/CollectionBoy/get/:id', CollectionBoy.getProfile);
router.put('/api/v1/CollectionBoy/update/:id', CollectionBoy.AddCollectionBoyDetails);
router.get('/api/v1/CollectionBoy/allCollectionBoy', CollectionBoy.AllCollectionBoys);
router.put('/api/v1/CollectionBoyStatus/update/:id', CollectionBoy.UpdateCollectionBoyStatus);
router.delete('/api/v1/CollectionBoy/:id', CollectionBoy.DeleteCollectionBoy);
router.post('/api/v1/CollectionBoy/addEnquiry/:id', CollectionBoy.addEnquiry)
router.post('/api/v1/CollectionBoy/assignDriverToCollectionBoy', CollectionBoy.assignDriverToCollectionBoy);
router.get('/api/v1/CollectionBoy/allAssignUserToCollectionBoy/:collectionBoyId', CollectionBoy.allAssignUserToCollectionBoy)
router.get('/api/v1/CollectionBoy/allCollectedOrder/:collectionBoyId', CollectionBoy.allCollectedOrder)
router.get('/api/v1/CollectionBoy/allFeaturedOrder/:collectionBoyId', CollectionBoy.allFeaturedOrder)
router.get('/api/v1/CollectionBoy/allPendingCollectedOrder/:collectionBoyId', CollectionBoy.allPendingCollectedOrder);
router.post("/api/v1/CollectionBoy/attendanceMark/:id", CollectionBoy.attendanceMark);
router.get("/api/v1/CollectionBoy/driverAttendanceList/:id", CollectionBoy.driverAttendanceList);
router.post("/api/v1/CollectionBoy/startCollection/:id", CollectionBoy.startCollection);
router.post("/api/v1/CollectionBoy/endCollection/:id", CollectionBoy.endCollection);
router.put("/api/v1/CollectionBoy/ChangeStatus/:id", CollectionBoy.ChangeStatus);
router.put("/api/v1/CollectionBoy/ChangeToFeaturedOrder/:id", CollectionBoy.ChangeToFeaturedOrder);

router.get("/api/v1/CollectionBoy/CollectionBoysWithCollectedAmount", CollectionBoy.CollectionBoysWithCollectedAmount);
module.exports = router;