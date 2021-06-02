const multer = require('multer')
const path = require('path')


const bannerStorage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'public/uploads/banner')
    },
    filename: (req, file, cb)=>{
        cb(null, file.fieldname + '-' + Date.now()+ '-'+ file.originalname)
    }
})


const bannerUpload = multer({
    storage: bannerStorage, 
    limit: {
        fileSize: 1024 * 1024 *5 
    },
    fileFilter: (req, file, cb) => {
        const types = /jpeg|jpg|png|gif/
        const extName = types.test(path.extname(file.originalname).toLowerCase())
        const mimeType = types.test(file.mimetype)

        if(extName && mimeType){
            cb(null, true)
        }else{
            cb(new Error('only support images'))
        }
    }
})


module.exports = bannerUpload