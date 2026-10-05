/** @type {import('next').NextConfig} */
const API_INTERNAL_URL = process.env.API_INTERNAL_URL || 'http://api:4000';

module.exports = {
  // The browser only ever talks to this app; /api/* is forwarded to NestJS.
  // That keeps the login cookie on one origin (no CORS, no cross-site cookies).
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_INTERNAL_URL}/api/:path*` }];
  },
};
