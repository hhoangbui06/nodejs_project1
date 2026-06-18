module.exports.createAccount = (req, res, next) => {
  if (!req.body.fullName) {
    req.flash('error', 'Tên không được để trống!')
    req.flash('oldData', req.body)
    res.redirect(req.headers.referer)
    return;
  }
  if (!req.body.email) {
    req.flash('error', 'Email không được để trống!')
    req.flash('oldData', req.body)

    res.redirect(req.headers.referer)
    return;
  }
  if (!req.body.password) {
    req.flash('error', 'Mật khẩu không được để trống!')
    req.flash('oldData', req.body)

    res.redirect(req.headers.referer)
    return;
  }
  if (req.body.password.length < 6) {
    req.flash('error', 'Mật khẩu phải ít nhất 6 ký tự!')
    req.flash('oldData', req.body)
    res.redirect(req.headers.referer)
    return;
  }
  next();
}

module.exports.patchAccount = (req, res, next) => {
  if (!req.body.fullName) {
    req.flash('error', 'Tên không được để trống!')
    res.redirect(req.headers.referer)
    return;
  }
  if (!req.body.email) {
    req.flash('error', 'Email không được để trống!')
    res.redirect(req.headers.referer)
    return;
  }
  if (req.body.password && req.body.password.length < 6) {
    req.flash('error', 'Mật khẩu phải ít nhất 6 ký tự!')
    res.redirect(req.headers.referer)
    return;
  }
  next();
}