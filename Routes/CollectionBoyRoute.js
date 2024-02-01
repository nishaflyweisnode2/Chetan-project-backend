const express = require('express');
const CollectionBoy = require('../Controller/CollectionCtrl')

const router = express();

router.post('/api/v1/CollectionBoy/create', CollectionBoy.createCollectionBoy);
router.post('/api/v1/CollectionBoy/sendotp', CollectionBoy.sendOtp);
router.post('/api/v1/CollectionBoy/verify', CollectionBoy.accountVerificationOTP);
router.get('/api/v1/CollectionBoy/get/:id', CollectionBoy.getProfile);
router.put('/api/v1/CollectionBoy/update/:id', CollectionBoy.AddCollectionBoyDetails);
router.get('/api/v1/CollectionBoy/allCollectionBoy', CollectionBoy.AllCollectionBoys);
router.delete('/api/v1/CollectionBoy/:id', CollectionBoy.DeleteCollectionBoy);
router.post('/api/v1/CollectionBoy/addEnquiry/:id', CollectionBoy.addEnquiry)
router.post('/api/v1/CollectionBoy/assignDriverToCollectionBoy', CollectionBoy.assignDriverToCollectionBoy);
router.get('/api/v1/CollectionBoy/allAssignUserToCollectionBoy/:collectionBoyId', CollectionBoy.allAssignUserToCollectionBoy)
router.get('/api/v1/CollectionBoy/allCollectedOrder/:collectionBoyId', CollectionBoy.allCollectedOrder)
router.get('/api/v1/CollectionBoy/allPendingCollectedOrder/:collectionBoyId', CollectionBoy.allPendingCollectedOrder)
module.exports = router;