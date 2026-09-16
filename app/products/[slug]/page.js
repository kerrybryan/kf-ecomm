import React from 'react';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import ProductDetailClient from '@/components/product/ProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();

  let product = await Product.findOne({ slug }).lean();
  if (!product && mongoose.Types.ObjectId.isValid(slug)) {
    product = await Product.findById(slug).lean();
  }

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested furniture piece could not be found.',
    };
  }

  const title = `${product.name} | KB Furniture`;
  const description =
    product.description?.slice(0, 155) ||
    `Buy ${product.name} at KB Furniture in Addis Ababa, Ethiopia. Solid wood craftsmanship and fast delivery.`;
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80';
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kbfurniture.et';
  const productUrl = `${siteUrl}/products/${product.slug || slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title,
      description,
      url: productUrl,
      type: 'website',
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  await connectDB();

  let product = await Product.findOne({ slug }).lean();
  if (!product && mongoose.Types.ObjectId.isValid(slug)) {
    product = await Product.findById(slug).lean();
  }

  if (!product) {
    notFound();
  }

  // Fetch reviews and related products
  const [reviews, relatedProducts] = await Promise.all([
    Review.find({ productId: product._id }).sort({ createdAt: -1 }).lean(),
    Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'published',
    })
      .limit(4)
      .lean(),
  ]);

  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedReviews = JSON.parse(JSON.stringify(reviews));
  const serializedRelated = JSON.parse(JSON.stringify(relatedProducts));

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kbfurniture.et';
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images || [],
    description: product.description || `Solid wood ${product.name} from KB Furniture Addis Ababa.`,
    sku: product.slug || product._id.toString(),
    brand: {
      '@type': 'Brand',
      name: 'KB Furniture',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.slug || slug}`,
      priceCurrency: 'ETB',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'KB Furniture',
      },
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating || 5,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />
      <ProductDetailClient
        product={serializedProduct}
        reviews={serializedReviews}
        relatedProducts={serializedRelated}
      />
    </>
  );
}
