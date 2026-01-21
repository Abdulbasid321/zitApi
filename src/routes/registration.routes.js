const express = require('express');
const router = express.Router();
const {
  getRegistrations,
  createRegistration
} = require('../controller/registrationController');

router.get('/', getRegistrations);
router.post('/', createRegistration);

module.exports = router;
