// this middleware assumed that jwtMiddleware has been run beforehand,
// so req.auth contains:
// - id: user.id
// - utorid: user.utorid
// - role: user.role
// - iat
// - exp: expiry time

// to use this middleware, write at the top of your router file
// (p.s. this assumes you're writing in a router file that's within a router directory, so i used ../)
// const clearanceRequired = require('../middleware/clearance');

// then, define your router route handlers like this:
// router.get('/users', clearanceRequired('regular'), (req, res) => {
//      ...
// }

function clearanceRequired(minimumRole) {
    const clearanceLevelsByIndex = ['regular', 'cashier', 'manager', 'superuser']
    return (req, res, next) => {
        const role = req.auth.role

        if (!role) {
            return res.status(401).json({error: 'Unauthorized'})
        }

        const curRoleLevel = clearanceLevelsByIndex.indexOf(role)
        const requiredLevel = clearanceLevelsByIndex.indexOf(minimumRole)
        
        if (curRoleLevel < requiredLevel) {
            return res.status(403).json({error: 'Forbidden'})
        }

        console.log(`Clearance check passed: user role ${role} >= required role ${minimumRole}`)

        next();
    }
}

module.exports = clearanceRequired;