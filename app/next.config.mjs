/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    async redirects() {
        return [
          {
            source: '/',
            destination: '/Ptask/home',
            permanent: true,
          },
        ]
      },
};

export default nextConfig;
