/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  async rewrites(){
    return [
      {
        source: '/casts/api/:path*',
        destination: 'https://api.warpcast.com/v2/:path*'
      }
    ] 
  },
}

module.exports = nextConfig
