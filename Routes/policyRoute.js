const express = require('express');
const policyControllers = require('../Controller/privacyCtrl');

const router = express();



router.post('/api/v1/privacy&policy/add', [policyControllers.addPrivacy]);
router.get('/api/v1/privacy&policy/', [policyControllers.getPrivacy]);
router.put('/api/v1/privacy&policy/:id', [policyControllers.updatePolicy]);
router.delete('/api/v1/privacy&policy/:id', [policyControllers.DeletePolicy])


module.exports = router;