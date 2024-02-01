const express = require('express');
const notify = require('../Controller/notificationCtrl')


const router = express();



router.post('/api/v1/notify/', notify.AddNotification);
router.get('/api/v1/notify/', notify.GetAllNotification);
router.get('/api/v1/notify/get/:id', notify.GetBYNotifyID);
router.delete('/api/v1/notify/delete/:id', notify.deleteNotification);



module.exports = router;