const express=require('express')
const router=express.Router()
const controller=require('../../controllers/admin/setting-controller')
const multer=require('multer')
const upload=multer()
const uploadCloud=require('../../middlewares/admin/fileupload-middleware')

router.get('/general', controller.getGeneral)
router.patch('/general', upload.single('logo'), uploadCloud.upload, controller.patchGeneral)
module.exports=router