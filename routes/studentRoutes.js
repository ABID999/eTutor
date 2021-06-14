const router = require('express').Router()
const {body, check, validationResult} = require('express-validator')
const Student = require('../models/Student')
const {
    registerGetController, 
    registerPostController, 
    loginGetController, 
    loginPostController,
    dashboardGetController, 
    logoutController,
    classesGetController,
    classDetailsGetController,
    searchClassesGetController,
    enrollGetController,
    enrolledClassesGetController,
    tutorDetailsGetController,
    unenrollGetController,
    paymentSuccessController,
    paymentCancelController, 
    joinLiveClass
} = require('../controller/StudentController')
const {
    isAuthenticatedStudent,
    isUnAuthenticatedStudent,
} = require('../middleware/authMiddleWare')
const stripeController = require('../stripe/stripe')
const upload = require('../middleware/uploadMiddleware')
const bannerUpload = require('../middleware/bannerUploadMiddleware')


const registerValidator = [
    body('name')
    .trim()
    .isLength({min: 4, max: 50}).withMessage('name can not be bellow 4 characters')
    ,
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .custom( async (email) => {
            let student = await Student.findOne({email})
            if(student){
                return Promise.reject('Email already in use')
            }
        })
    ,
    body('password')
        .isLength({min: 4, max: 20}).withMessage('password must be between 4 to 20 character')
]

const loginValidator = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
]

router.get('/', isAuthenticatedStudent, dashboardGetController)
router.get('/register', isUnAuthenticatedStudent, registerGetController)
router.post('/register', isUnAuthenticatedStudent, registerValidator, registerPostController)
router.get('/login', isUnAuthenticatedStudent, loginGetController)
router.post('/login',isUnAuthenticatedStudent, loginValidator, loginPostController)
router.get('/logout', logoutController)

router.get('/dashboard', isAuthenticatedStudent, dashboardGetController)
router.get('/classes', isAuthenticatedStudent, classesGetController)
router.get('/class/:id', isAuthenticatedStudent, classDetailsGetController)
router.get('/search_classes', isAuthenticatedStudent, searchClassesGetController)
router.get('/tutor_details/:id', isAuthenticatedStudent, tutorDetailsGetController)

router.get('/enrolled_classes', isAuthenticatedStudent, enrolledClassesGetController)
router.get('/unenroll/:id', isAuthenticatedStudent, unenrollGetController)

router.get('/payment/cancel/:id', isAuthenticatedStudent, paymentCancelController)
router.get('/payment/success/:id', isAuthenticatedStudent, enrollGetController)
router.post('/create-checkout-session', isAuthenticatedStudent, stripeController)

router.get('/join_class/:id', isAuthenticatedStudent, joinLiveClass)

module.exports = router