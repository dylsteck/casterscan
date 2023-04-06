// next.config.js
module.exports = {
  images: {
    domains: [
      'i.seadn.io',
      'i.imgur.com',
      'res.cloudinary.com',
      'pbs.twimg.com',
      'lh3.googleusercontent.com',
      'd2qbf73089ujv4.cloudfront.net',
      'explorer.farcaster.xyz',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.seadn.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd2qbf73089ujv4.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'explorer.farcaster.xyz',
        port: '',
        pathname: '/**',
      },
    ],
  },
};