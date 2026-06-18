const dataSetting=require('../../models/setting-models')

module.exports.getGeneral=(req,res)=>{
  res.render('admin/pages/settings/general.pug', {title:"Cài đặt chung"})
}