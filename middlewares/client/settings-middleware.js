const SettingGeneral=require('../../models/setting-models');

module.exports.settingGeneral=async(req,res, next)=>{
  let settings=await SettingGeneral.findOne({})
  res.locals.settingGeneral=settings
  next();
}