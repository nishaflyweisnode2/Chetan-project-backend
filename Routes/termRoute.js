const express = require('express');
const terms = require('../Controller/termCtrl');


const router = express();


router.post('/api/v1/term/add', [terms.addterms]);
router.get('/api/v1/term/', [terms.getterms]);
router.put('/api/v1/term/:id', [terms.updateterms]);
router.delete('/api/v1/term/:id', [terms.DeleteTerms]);

module.exports = router;