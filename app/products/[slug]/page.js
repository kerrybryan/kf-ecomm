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
    return { title: 'Product Not Found | NÖRDIKA' };
  }

  return {
    title: `${product.name} | NÖRDIKA Scandinavian Furniture`,
    description: product.description?.slice(0, 160) || 'Handcrafted luxury Scandinavian furniture.',
    openGraph: {
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
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

  return (
    <ProductDetailClient
      product={serializedProduct}
      reviews={serializedReviews}
      relatedProducts={serializedRelated}
    />
  );
}
