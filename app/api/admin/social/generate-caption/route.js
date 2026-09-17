import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { generateSocialCaptions } from '@/lib/captionGenerator';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'sales_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { productName, category, materials, price, tone = 'modern', customPrompt = '' } = body;

    const captions = await generateSocialCaptions({
<<<<<<< HEAD
      productName: productName || 'KB Furniture Scandinavian Piece',
=======
      productName: productName || 'Nordika Scandinavian Piece',
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
      category: category || 'living-room',
      materials: materials || ['Solid Oak', 'Bouclé'],
      price: price || 950,
      tone,
      customPrompt,
    });

    return NextResponse.json({
      success: true,
      data: captions,
      message: 'Generated 3 AI caption variations',
    });
  } catch (err) {
    console.error('Caption generation error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate captions' },
      { status: 500 }
    );
  }
}
