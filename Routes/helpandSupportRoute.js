const express = require('express');
const help = require('../Controller/helpandSupportCtrl');
const auth = require('../Middleware/auth');


const router = express();

router.post('/api/v1/help/', auth.isAuthenticatedUser, help.AddQuery);
router.get('/api/v1/help/', help.getAllHelpandSupport);
router.get('/api/v1/help/user', auth.isAuthenticatedUser, help.getAllHelpandSupportgetByuserId);
router.delete('/api/v1/help/delete/:id', help.DeleteHelpandSupport);

module.exports = router;