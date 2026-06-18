const dataAccounts = require('../../models/account-models')
const dataRole = require('../../models/role-models')
const md5 = require('md5')
const setDetail=require('../../helpers/set-detail-helper');
module.exports.index = async (req, res) => {
  let findRole = {
    deleted: false
  }
  let findAccount = {
    deleted: false
  }
  let records = await dataAccounts.find(findAccount)
  records=setDetail.setStatus(records)
  for (let record of records) {
    let role_id = record.role_id || ""
    if (role_id) {
      let role = await dataRole.findOne({
        deleted: false,
        _id: role_id
      })
      if (role) record.role = role.title
      else record.role= "<b><i>Chưa phân quyền</i></b>"
    }
    else {
      record.role = "<b><i>Chưa phân quyền</i></b>"
    }
  }
  res.render('admin/pages/accounts/index.pug', { title: "Danh sách tài khoản", records: records })
}
module.exports.create = async (req, res) => {
  let findRole = {
    deleted: false
  }
  let roles = await dataRole.find(findRole)
  res.render('admin/pages/accounts/create.pug', { title: "Tạo mới tài khoản", roles: roles, oldData: req.flash('oldData')[0] || {} })
}
module.exports.createAccount = async (req, res) => {
  let find = {
    deleted: false,
    email: req.body.email
  }
  let checkExists = await dataAccounts.findOne(find);
  if (checkExists) {
    req.flash('error', 'Tài khoản đã tồn tại. Vui lòng chọn tài khoản khác!')
    req.flash('oldData', req.body);
    res.redirect(req.headers.referer);
  }
  else {
    req.body.password = md5(req.body.password);
    
    // Xóa avatar nếu rỗng để dùng default từ schema
    if (!req.body.avatar) {
      delete req.body.avatar;
    }
    
    let newAccount = new dataAccounts(req.body)
    await newAccount.save()
    req.flash('success', "Đã thêm mới tài khoản!")
    res.redirect(req.headers.referer)
  }
}
module.exports.edit = async (req, res) => {
  let findRole = {
    deleted: false
  }
  let roles = await dataRole.find(findRole)
  let id = req.params.id;
  let account = await dataAccounts.findOne({ _id: id })
  res.render('admin/pages/accounts/edit.pug', { title: "Chỉnh sửa tài khoản", account: account, roles: roles })
}
module.exports.patchAccount = async (req, res) => {
  let id = req.params.id;

  let checkExistsAccount = await dataAccounts.findOne({
    deleted: false,
    email: req.body.email,
    _id: { $ne: id }
  })
  if (checkExistsAccount) {
    req.flash('error', 'Tài khoản đã tồn tại!')
  }
  else {
    if (req.body.password) {
      req.body.password = md5(req.body.password)
    }
    else {
      delete req.body.password
    }
    await dataAccounts.updateOne({ _id: id }, req.body);
    req.flash('success', "Đã cập nhật tài khoản!")
  }
  res.redirect(req.headers.referer)

}

module.exports.detailAccount=async (req,res)=>{
  let id=req.params.id;
  let account=await dataAccounts.findOne({
    _id:id,
    deleted:false
  })
  res.render('admin/pages/accounts/detail.pug', {title:"Chi tiết tài khoản", account:account})
}
module.exports.deleteAccount=async(req,res)=>{
  let id=req.params.id;
  await dataAccounts.updateOne({_id:id}, {deleted:true});
  res.redirect(req.headers.referer)
}
module.exports.changeAccountStatus=async(req,res)=>{
  let id=req.params.id, status=req.params.status;
  await dataAccounts.updateOne({_id:id}, {status:status})
  res.redirect(req.headers.referer)
}
module.exports.recoveryAccount=async(req,res)=>{
  let id=req.params.id;
  let account=await dataAccounts.findOne({_id:id})
  if(account){
    let email=account.email;
    await dataAccounts.updateOne({_id:id}, {password:md5(email)})
    req.flash("success", "Đã reset mật khẩu mặc định!")
    res.redirect(req.headers.referer)
  }
  else{
    req.flash('error', "Không tìm thấy tài khoản")
    res.redirect(req.headers.referer)
  }
}