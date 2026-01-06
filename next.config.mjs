const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.auth0.com',
      },
      {
        protocol: 'https',
        hostname: 's.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'gravatar.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'))

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgProps: {
                fill: 'currentcolor',
              },
            },
          },
        ],
      }
    )

    fileLoaderRule.exclude = /\.svg$/i

    return config
  },

  experimental: {
    typedRoutes: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig
