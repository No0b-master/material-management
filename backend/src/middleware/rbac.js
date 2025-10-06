function canAccessUser(req, targetUserId) {
  const isAdmin = req.user.role === 'admin';
  const isSelf = Number(targetUserId) === Number(req.user.id);
  return isAdmin || isSelf;
}

function isApprover(role) {
  return ['hod', 'pm', 'store', 'admin'].includes(role);
}

module.exports = { canAccessUser, isApprover };
