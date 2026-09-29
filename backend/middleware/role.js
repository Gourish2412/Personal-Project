// Role-based authorization middleware
module.exports = function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: 'Authentication required' });
        }

        if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                msg: `Access forbidden: Requires one of roles [${allowedRoles.join(', ')}]` 
            });
        }

        next();
    };
};
