const express = require('express');
const router = express.Router();
const studentController = require('../controller/StudentController')


router.get('/signin', studentController.login)


router.post('/signin', studentController.doLogin)


router.get('/signup', studentController.register)


router.post('/signup', studentController.doRegister)


module.exports = router