// auth middleware for role
const auth = (req, res, next) => {
    // tidak ada role = belum terdaftar
    if (!req.user || !req.user.role) {
        return res.redirect('/login');
        // return res.status(403).json({ error: 'Unauthorized' });
    }
    else {
        next();
        // return res.redirect('/');
    }
}

export default { auth }