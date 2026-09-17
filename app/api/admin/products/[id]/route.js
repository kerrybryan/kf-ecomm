import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id).lean();
    if (!product || product.deletedAt) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Admin get product error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const product = await Product.findById(id);
    if (!product || product.deletedAt) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Safeguard check: If attempting to publish a product with unedited reference image
    if (body.status === 'published' && (product.isReferenceImage || body.isReferenceImage)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Publishing blocked: The primary image is flagged as an unedited external reference. Please edit and brand the image in Image Studio before publishing to the live storefront.',
          isReferenceImage: true,
        },
        { status: 400 }
      );
    }

    // Update fields
    const updatableFields = [
      'name',
      'slug',
      'category',
      'price',
      'originalPrice',
      'description',
      'images',
      'colors',
      'materials',
      'specs',
      'rating',
      'reviewCount',
      'inStock',
      'stockCount',
      'status',
      'isFeatured',
      'isBestSeller',
      'trending',
      'isReferenceImage',
    ];

    const previousStatus = product.status;

    const previousStatus = product.status;

    updatableFields.forEach((field) => {
      if (body[field] !== undefined) {
        product[field] = body[field];
      }
    });

    await product.save();

    // Trigger Social Media Launch Automation if transitioning from draft to published
    if (previousStatus === 'draft' && body.status === 'published') {
      try {
        const AutomationRule = (await import('@/models/AutomationRule')).default;
        const SocialPost = (await import('@/models/SocialPost')).default;
        const SocialAccount = (await import('@/models/SocialAccount')).default;
        const { publishPostToAllPlatforms } = await import('@/lib/socialPublisher');

        const rule = await AutomationRule.findOne({ trigger: 'product_published', enabled: true });
        if (rule) {
          const captionTemplate =
            rule.defaultCaptionTemplate ||
            'Introducing the {productName} — handcrafted in {material}. Starting at ${price}.\n\nExplore our bespoke Scandinavian collection online at KB Furniture. ✨\n\n#NordicDesign #ScandinavianLiving #BespokeFurniture #KBFurniture';

          const renderedCaption = captionTemplate
            .replace(/\{productName\}/g, product.name)
            .replace(/\{price\}/g, Number(product.price).toLocaleString())
            .replace(/\{material\}/g, product.materials?.join(', ') || 'Solid European Oak');

          const autoPost = await SocialPost.create({
            productId: product._id,
            mediaType: 'image',
            mediaUrl: product.images?.[0] || '',
            platforms: rule.defaultPlatforms?.length > 0 ? rule.defaultPlatforms : ['instagram', 'pinterest'],
            captions: {
              default: renderedCaption,
              instagram: renderedCaption,
              facebook: renderedCaption,
              pinterest: renderedCaption,
            },
            status: rule.mode === 'auto_publish' ? 'queued' : 'draft',
            createdBy: auth.user?._id || null,
          });

          if (rule.mode === 'auto_publish') {
            const connectedAccounts = await SocialAccount.find({ status: 'connected' });
            await publishPostToAllPlatforms(autoPost, connectedAccounts);
          }
        }
      } catch (autoErr) {
        console.error('Social auto-publish trigger error:', autoErr);
      }
    }

    // Part G: Automatic Queue Suggestion (Rule-based, no AI)
    if (previousStatus !== 'published' && body.status === 'published') {
      try {
        const CaptionTemplate = (await import('@/models/CaptionTemplate')).default;
        const PublishingQueueItem = (await import('@/models/PublishingQueueItem')).default;
        const { substitutePlaceholders, STARTER_TEMPLATES } = await import('@/lib/publishing');

        const primaryImg = (product.images && product.images[0]) || 'https://picsum.photos/seed/kb-sofa/800/800';
        const tpl = (await CaptionTemplate.findOne({ name: /New Arrival/i })) || STARTER_TEMPLATES[0];
        const caption = substitutePlaceholders(tpl.template, product);

        await PublishingQueueItem.create({
          productId: product._id,
          title: `New Arrival: ${product.name}`,
          mediaUrl: primaryImg,
          mediaType: 'image',
          platform: 'instagram',
          finalCaption: caption,
          plannedDate: new Date(),
          status: 'queued',
          notes: 'Auto-suggested queue draft for newly published product',
        });
      } catch (qErr) {
        console.warn('Auto queue creation notice:', qErr.message);
      }
    }

    return NextResponse.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Admin update product error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Soft delete to protect past orders referencing this product ID
    product.deletedAt = new Date();
    product.status = 'draft';
    await product.save();

    return NextResponse.json({ success: true, message: 'Product moved to trash (soft-deleted)' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
