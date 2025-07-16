module.exports = {
  beforeRequest: function (req, context, ee, next) {
    if (context.vars.token) {
      req.headers['Authorization'] = `Bearer ${context.vars.token}`;
    }
    return next();
  }
};
