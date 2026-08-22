/**
 * Claude AI Social Media Caption Generator
 * Generates tailored luxury social captions with hashtags based on tone and product details.
 */

function generateHeuristicCaptions({ productName, category, materials, price, tone }) {
  const mats = Array.isArray(materials) ? materials.join(' and ') : materials || 'solid European timber';
  const priceStr = price ? `$${Number(price).toLocaleString()}` : '';

  if (tone === 'poetic' || tone === 'elegant') {
    return [
      {
        id: 'opt-1',
        title: 'Architectural Serenity',
        caption: `Quiet luxury sculpted for intentional spaces. The ${productName} balances clean Nordic proportions with tactile ${mats}.\n\nHandcrafted for those who find beauty in restraint.\n\nDiscover the studio collection at nordika.com ✨\n\n#NordicDesign #ScandinavianModern #ArchitecturalFurniture #QuietLuxury #NordikaStudio #MinimalistLiving`,
      },
      {
        id: 'opt-2',
        title: 'Craft & Materiality',
        caption: `Every joint tells a story of honest craftsmanship. Featuring bespoke ${mats}, the ${productName} brings natural warmth into the modern sanctuary.\n\n${priceStr ? `Offered from ${priceStr}.` : ''} Made to order.\n\n#BespokeJoinery #ScandinavianInterior #ModernWoodwork #NordicAesthetics #ArtisanalLiving`,
      },
      {
        id: 'opt-3',
        title: 'Sanctuary Living',
        caption: `Form meets comfort. The ${productName} transforms everyday spaces into elevated moments of calm.\n\nExplore our bespoke catalog through the link in bio.\n\n#InteriorDesignInspo #LuxuryFurniture #ScandinavianHome #NeutralAesthetics #WabiSabiDesign`,
      },
    ];
  }

  if (tone === 'sales' || tone === 'promotional') {
    return [
      {
        id: 'opt-1',
        title: 'Direct Product Spotlight',
        caption: `NOW LIVE: The ${productName} is officially available at Nordika Studio! 🛋️✨\n\nCrafted with premium ${mats} and engineered for lasting durability. ${priceStr ? `Starting at ${priceStr}.` : ''}\n\n📦 Enjoy complimentary white-glove delivery on orders over $2,000.\n\nShop the link in bio before this batch sells out!\n\n#FurnitureDrop #NordicLiving #HomeDecor #ModernFurniture #LuxuryHome #ShopNordika`,
      },
      {
        id: 'opt-2',
        title: 'Limited Workshop Allocation',
        caption: `Limited workshop availability for the ${productName}. Handcrafted in small artisanal batches from authentic ${mats}.\n\nElevate your living space today — order directly online.\n\n#ExclusiveDesign #NordicCraft #ScandinavianStyle #InteriorInspo #ModernLiving`,
      },
      {
        id: 'opt-3',
        title: 'Trade & Residential Commission',
        caption: `Architectural perfection for residential and hospitality projects: The ${productName}.\n\nDirect trade pricing available for interior designers and architects.\n\n#DesignTrade #HospitalityDesign #NordicInteriors #CommercialDesign #NordikaStudio`,
      },
    ];
  }

  // Modern / Casual (Default)
  return [
    {
      id: 'opt-1',
      title: 'Modern Organic Aesthetic',
      caption: `Meet our latest studio favorite: the ${productName}. Loving the tactile combination of ${mats}.\n\nWhich corner of your home would you place this in? Let us know below 👇\n\n#ScandinavianDesign #HomeInspo #ModernInteriors #NordicHome #FurnitureGoals #Nordika`,
    },
    {
      id: 'opt-2',
      title: 'Studio Showcase',
      caption: `Fresh off the workshop workbench. The ${productName} is all about sculptural simplicity and everyday comfort.\n\nTap the photo to explore full dimensions and specs.\n\n#StudioCraft #MinimalistFurniture #NeutralHome #NordicVibes #InteriorStyling`,
    },
    {
      id: 'opt-3',
      title: 'Everyday Luxury',
      caption: `Clean lines, honest materials, zero compromises. The ${productName} in ${mats}.\n\nAvailable now on our online showroom.\n\n#NordicLiving #SlowLiving #OrganicModern #HomeDecorInspo #DesignerFurniture`,
    },
  ];
}

/**
 * Generates 3 social media caption variations using Claude API or fallback
 * @param {object} params - { productName, category, materials, price, tone, customPrompt }
 * @returns {Promise<Array<{ id: string, title: string, caption: string }>>}
 */
export async function generateSocialCaptions(params) {
  const { productName = 'Nordika Furniture Item', category = 'living-room', materials = [], price, tone = 'modern', customPrompt = '' } = params;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    return generateHeuristicCaptions({ productName, category, materials, price, tone });
  }

  try {
    const promptText = `Generate 3 distinct social media caption options for a luxury Scandinavian furniture brand named "Nordika Scandinavian Studio".
Product: ${productName}
Category: ${category}
Materials: ${Array.isArray(materials) ? materials.join(', ') : materials}
Price: ${price ? `$${price}` : 'Upon inquiry'}
Tone: ${tone} (e.g. elegant/poetic, modern/casual, sales/promotional)
${customPrompt ? `Special instructions: ${customPrompt}` : ''}

Respond ONLY in valid JSON array of 3 objects with keys:
- id (e.g. "opt-1", "opt-2", "opt-3")
- title (short 2-3 word theme name)
- caption (the complete engaging caption with linebreaks and 5-8 relevant hashtags)`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: promptText }],
      }),
    });

    if (!response.ok) {
      console.warn('Anthropic API returned non-200 for captions, using fallback');
      return generateHeuristicCaptions({ productName, category, materials, price, tone });
    }

    const data = await response.json();
    let raw = data?.content?.[0]?.text || '';
    if (raw.startsWith('```json')) {
      raw = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (raw.startsWith('```')) {
      raw = raw.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(raw.trim());
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return generateHeuristicCaptions({ productName, category, materials, price, tone });
  } catch (err) {
    console.error('AI Caption generator error, using fallback:', err);
    return generateHeuristicCaptions({ productName, category, materials, price, tone });
  }
}
