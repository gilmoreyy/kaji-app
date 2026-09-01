// Must be the very first import in server.js. ES module imports are evaluated
// before the importing file's own top-level code runs, so calling dotenv.config()
// from inside server.js (after other imports like the route files, which pull in
// db.js/jwt.js and read process.env at their own module top level) is too late —
// this file exists purely so import order guarantees env vars are loaded first.
import dotenv from 'dotenv'

dotenv.config()
