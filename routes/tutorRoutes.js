const router = require('express').Router()
const {body, check, validationResult} = require('express-validator')

const Tutor = require('../models/Tutor')

const {
    registerGetController, 
    registerPostController, 
    loginGetController, 
    loginPostController,
    dashboardGetController, 
    logoutController
} = require('../controller/TutorController')

const {isAuthenticated, isUnAuthenticated} = require('../middleware/authMiddleWare')

const registerValidator = [
    body('name')
    .trim()
    .isLength({min: 4, max: 50}).withMessage('name can not be bellow 4 characters')
    ,
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .custom( async (email) => {
            let tutor = await Tutor.findOne({email})
            if(tutor){
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


router.get('/register', isUnAuthenticated, registerGetController)


router.post('/register', isUnAuthenticated, registerValidator, registerPostController)

// router.post('/register',
//     [
//         check('email')
//             .isEmail()
//             .withMessage('Please provide a valid email')
//     ], 
//     registerPostController)


router.get('/login', isUnAuthenticated, loginGetController)


router.post('/login',isUnAuthenticated, loginValidator, loginPostController)

router.get('/dashboard', isAuthenticated, dashboardGetController)

router.get('/logout', logoutController)


module.exports = router