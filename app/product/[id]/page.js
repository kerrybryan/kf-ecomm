import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export default async function ProductIdRedirect({ params }) {
  const { id } = await params;
  await connectDB();

  let product = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    product = await Product.findById(id).lean();
  } else {
    product = await Product.findOne({ slug: id }).lean();
  }

  if (product?.slug) {
    redirect(`/products/${product.slug}`);
  }

  redirect('/shop');
}
