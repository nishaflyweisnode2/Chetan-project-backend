const router = require("express").Router();
const banner = require('../Controller/bannerCtrl')


router.post('/api/v1/banner/add/:name', banner.AddBanner);
router.get('/api/v1/banner/all', banner.getBanner);
router.get('/api/v1/banner/get/:id', banner.getById);
router.delete('/api/v1/banner/delete/:id', banner.DeleteBanner);



module.exports = router;