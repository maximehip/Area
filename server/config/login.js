module.exports = {
	ensureLogin: function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.clearCookie("spotify");
			res.redirect('/');
		}
	}
}