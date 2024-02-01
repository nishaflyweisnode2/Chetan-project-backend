const express = require('express');
const bannerControllers = require('../Controller/bottomController');

const router = express();
// const upload = require("../middleware/fileUpload");
// const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
// const authJwt = require("../middleware/authJwt");

router.post('/api/v1/bottom/:name', [bannerControllers.AddBanner]);
router.route("/api/v1/bottom/get").get(bannerControllers.getbottom);
router.put("/api/v1/bottom/update/:id", bannerControllers.updatebottom);
router.delete('/api/v1/bottom/delete/:id', bannerControllers.DeleteBanner);
router.route("/api/v1/bottom/get/:type").get(bannerControllers.getbottombyType);



module.exports = router;