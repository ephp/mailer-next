import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    compress: false, // Compression will be performed by Nginx.
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard',
                permanent: true,
            },
        ];
    },
    experimental: {
        optimizePackageImports: [
            // Everything breaks if I don't explicitly optimize this.
            // Why do I have to do it explicitly instead of having
            // Next.js, which is clearly capable, do it on its own?
            // Who knows! Life sure is full of mysteries, isn't it?
            '@Oimmei-Digital-Boutique/crema-components',
        ],
    },
};

export default withNextIntl(nextConfig);
