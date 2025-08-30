const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.originalUrl} not found`,
    message: 'The requested resource could not be found on this server'
  });
};

module.exports = notFound;