/**
 * Build pagination params from query string.
 * @param {object} query - req.query
 * @returns {{ limit: number, offset: number, page: number }}
 */
function getPagination(query) {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Build paginated response object.
 */
function paginatedResponse(data, total, { page, limit }) {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = { getPagination, paginatedResponse };
