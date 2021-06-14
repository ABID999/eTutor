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
    changePasswordPostController,
    enrolledClassesGetController,
    cancelClassGetController,
    joinLiveClassController,
    createCoursePostController,
    createCourseGetController,
    coursesGetController,
    courseDetailsGetController
} = require('../controller/TutorController')

const {
    isAuthenticatedTutor,
    isUnAuthenticatedTutor,
} = require('../middleware/authMiddleWare')
const upload = require('../middleware/uploadMiddleware')
const bannerUpload = require('../middleware/bannerUploadMiddleware')
const courseUpload = require('../middleware/videoUploadMiddleware')


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

router.get('/', isAuthenticatedTutor, dashboardGetController)
router.get('/register', isUnAuthenticatedTutor, registerGetController)
router.post('/register', isUnAuthenticatedTutor, registerValidator, registerPostController)
router.get('/login', isUnAuthenticatedTutor, loginGetController)
router.post('/login',isUnAuthenticatedTutor, loginValidator, loginPostController)
router.get('/logout', logoutController)

router.get('/dashboard', isAuthenticatedTutor, dashboardGetController)
router.get('/profile', isAuthenticatedTutor, profileGetController)
router.get('/edit_profile', isAuthenticatedTutor, editProfileGetController)
router.post('/edit_profile', isAuthenticatedTutor, upload.single('profile-picture'), editProfilePostController)
router.post('/change_password', isAuthenticatedTutor, changePasswordPostController)

router.get('/classes', isAuthenticatedTutor, classesGetController)
router.get('/create_class', isAuthenticatedTutor, createClassGetController)
router.post('/create_class', isAuthenticatedTutor, bannerUpload.single('class-banner'), createClassPostController)
router.get('/class/:id', isAuthenticatedTutor, classDetailsGetController)
router.get('/edit_class/:id', isAuthenticatedTutor, editClassGetController)
router.post('/edit_class', isAuthenticatedTutor, bannerUpload.single('class-banner'), editClassPostController)
router.get('/delete_class/:id', isAuthenticatedTutor, deleteClassGetController)

router.get('/courses', isAuthenticatedTutor, coursesGetController)
router.get('/course/:id', isAuthenticatedTutor, courseDetailsGetController)
router.get('/create_course', isAuthenticatedTutor,  createCourseGetController)
router.post('/create_course', isAuthenticatedTutor, courseUpload.fields([{name:'course-banner', maxcount: 1}, {name:'course-videos', maxcount:50}]), createCoursePostController)

router.get('/enrolled_classes', isAuthenticatedTutor, enrolledClassesGetController)
router.get('/cancel_class/:id', isAuthenticatedTutor, cancelClassGetController)
router.get('/join_class/:id', isAuthenticatedTutor, joinLiveClassController)


module.exports = router