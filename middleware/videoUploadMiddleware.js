const multer = require('multer')
const path = require('path')


// const videoStorage = multer.diskStorage({
//     destination: (req, file, cb)=>{
//         cb(null, 'public/uploads/course')
//     },
//     filename: (req, file, cb)=>{
//         cb(null,'Course_Video-' + Date.now()+ '-'+ file.originalname)
//     }
// })


// const videoUpload = multer({
//     storage: videoStorage, 
//     limit: {
//         fileSize: 1024 * 1024 * 1024 
//     },
//     fileFilter: (req, file, cb) => {
//         const types = /mp4|mkv|webm|avi|ogg|wmv|m4v|3gp/
//         const extName = types.test(path.extname(file.originalname).toLowerCase())
//         const mimeType = types.test(file.mimetype)

//         if(extName && mimeType){
//             cb(null, true)
//         }else{
//             cb(new Error('only support video files'))
//         }
//     }
// })



const courseStorage = multer.diskStorage({
    destination: (req, file, cb)=>{
        if(file.fieldname==="course-banner")
        {
        cb(null, 'public/uploads/banner')
        }
       else if(file.fieldname==="course-videos")
       {
           cb(null, 'public/uploads/course');
       }
    },
    filename:(req,file,cb)=>{
        if(file.fieldname==="course-banner"){
            cb(null, file.fieldname + '-' + Date.now()+ '-'+ file.originalname);
        }
      else if(file.fieldname==="course-videos"){
        cb(null, 'Course_Video-' + Date.now()+ '-'+ file.originalname);
      }
    }
});
const courseUpload = multer({
    storage: courseStorage,
    limits: {
        fileSize: 1024 * 1024 * 500
    }
})

// function checkFileType(file, cb) {
//     if(file.fieldname==="course-banner")
//     {
//         const types = /jpeg|jpg|png|gif/
//         const extName = types.test(path.extname(file.originalname).toLowerCase())
//         const mimeType = types.test(file.mimetype)

//         if(extName && mimeType){
//             cb(null, true)
//         }else{
//             cb(new Error('only support images'))
//         }
//     }
//     else if(file.fieldname==="course-videos")
//     {
//         const types = /mp4|mkv|webm|avi|ogg|wmv|m4v|3gp/
//         const extName = types.test(path.extname(file.originalname).toLowerCase())
//         const mimeType = types.test(file.mimetype)

//         if(extName && mimeType){
//             cb(null, true)
//         }else{
//             cb(new Error('only support video files'))
//         }
//     }
// }

module.exports = courseUpload