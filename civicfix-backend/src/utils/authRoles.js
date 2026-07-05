const normalizeRole = (role) => (role || 'citizen').toLowerCase();

const isAllowedRole = (userRole, expectedRole) => normalizeRole(userRole) === normalizeRole(expectedRole);

const getRoleMismatchMessage = (expectedRole) => `This login is only for ${expectedRole} accounts.`;

module.exports = {
  normalizeRole,
  isAllowedRole,
  getRoleMismatchMessage,
};
