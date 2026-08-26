const dataSetting=require('../../models/setting-models')

module.exports.getGeneral=async (req,res)=>{
  let settings=await dataSetting.find({})
  let currentSettings=settings[0]||{}
  res.render('admin/pages/settings/general.pug', {title:"Cài đặt chung", settings:currentSettings})
}
module.exports.patchGeneral=async (req,res)=>{
  console.log("patch general ok")
  await dataSetting.findOneAndUpdate({}, req.body, {
    upsert: true,
    new: true,
    runValidators: true
  });
  res.redirect(req.headers.referer)
}