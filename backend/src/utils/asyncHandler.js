// Express 4 doesn't catch rejected promises thrown by async route handlers —
// an unhandled rejection there crashes the whole Node process. This wraps a
// handler so any rejection is forwarded to next(err) and hits the error
// middleware in server.js instead of taking the server down.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
