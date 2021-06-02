const router = require('express').Router()
const {body, check, validationResult} = require('express-validator')
const Tutor = require('../models/Tutor')
const {
    registerGetController, 
    registerPostController, 
    loginGetController, 
    loginPostController,
    dashboardGetController, 
    logoutController, 
    profileGetController,
    editProfileGetController,
    editProfilePostController,
    classesGetController,
    createClassGetController,
    createClassPostController,
    classDetailsGetController,
    editClassGetController,
    editClassPostController,
    deleteClassGetController,
    changePasswordPostController
} = require('../controller/TutorController')
const {
    isAuthenticated,
    isUnAuthenticated,
} = require('../middleware/authMiddleWare')
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

router.get('/', isUnAuthenticated, dashboardGetController)
router.get('/register', isUnAuthenticated, registerGetController)
router.post('/register', isUnAuthenticated, registerValidator, registerPostController)
router.get('/login', isUnAuthenticated, loginGetController)
router.post('/login',isUnAuthenticated, loginValidator, loginPostController)
router.get('/logout', logoutController)

router.get('/dashboard', isAuthenticated, dashboardGetController)
router.get('/profile', isAuthenticated, profileGetController)
router.get('/edit_profile', isAuthenticated, editProfileGetController)
router.post('/edit_profile', isAuthenticated, upload.single('profile-picture'), editProfilePostController)
router.get('/classes', isAuthenticated, classesGetController)
router.get('/create_class', isAuthenticated, createClassGetController)
router.post('/create_class', isAuthenticated, bannerUpload.single('class-banner'), createClassPostController)
router.get('/class/:id', isAuthenticated, classDetailsGetController)
router.get('/edit_class/:id', isAuthenticated, editClassGetController)
router.post('/edit_class', isAuthenticated, bannerUpload.single('class-banner'), editClassPostController)
router.get('/delete_class/:id', isAuthenticated, deleteClassGetController)
router.post('/change_password', isAuthenticated, changePasswordPostController)

module.exports = router