import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/actions/product-actions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://zadfitt.com';

    // Get all active products
    const products = await getProducts();
    const activeProducts = products.filter((p) => p.active !== false);

    const productUrls = activeProducts.map((product) => ({
        url: `${baseUrl}/shop/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        ...productUrls,
    ];
}
