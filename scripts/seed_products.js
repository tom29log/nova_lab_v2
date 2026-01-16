
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
    {
        name: "Lumière Pearl Necklace",
        price: 450000,
        description: "최상급 담수 진주와 18K 골드로 제작된 우아한 네크리스. 당신의 목선에 은은한 빛을 더해줍니다.",
        category: "Necklace",
        images: ["https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=800&auto=format&fit=crop"],
        stock: 10
    },
    {
        name: "Ethereal Gold Ring",
        price: 320000,
        description: "현대적인 감각으로 재해석한 클래식 골드 링. 단독 착용만으로도 압도적인 존재감을 발산합니다.",
        category: "Ring",
        images: ["https://images.unsplash.com/photo-1605100804763-ebea4663163c?q=80&w=800&auto=format&fit=crop"],
        stock: 15
    },
    {
        name: "Celestial Diamond Earrings",
        price: 890000,
        description: "밤하늘의 별처럼 빛나는 다이아몬드 이어링. 어떤 각도에서도 완벽한 광채를 선사합니다.",
        category: "Earring",
        images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop"],
        stock: 5
    },
    {
        name: "Midnight Sapphire Bracelet",
        price: 650000,
        description: "깊고 푸른 사파이어가 세팅된 섬세한 브레이슬릿. 손목 위에서 신비로운 매력을 자아냅니다.",
        category: "Bracelet",
        images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop"],
        stock: 8
    },
    {
        name: "Royal Emerald Ring",
        price: 720000,
        description: "고혹적인 에메랄드 그린 컬러가 돋보이는 스테이트먼트 링.",
        category: "Ring",
        images: ["https://images.unsplash.com/photo-1603561596112-0a132b7223e8?q=80&w=800&auto=format&fit=crop"],
        stock: 7
    },
    {
        name: "Aurora Crystal Pendant",
        price: 280000,
        description: "오로라의 빛을 형상화한 크리스탈 펜던트. 빛의 각도에 따라 다채로운 색상을 보여줍니다.",
        category: "Necklace",
        images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop"],
        stock: 20
    },
    {
        name: "Vintage Rose Earrings",
        price: 350000,
        description: "빈티지한 무드의 로즈 골드 이어링. 로맨틱한 분위기를 연출하기에 제격입니다.",
        category: "Earring",
        images: ["https://images.unsplash.com/photo-1630019852942-e5e12f950664?q=80&w=800&auto=format&fit=crop"],
        stock: 12
    },
    {
        name: "Minimalist Silver Cuff",
        price: 180000,
        description: "군더더기 없는 깔끔한 라인의 실버 커프. 데일리 아이템으로 손색이 없습니다.",
        category: "Bracelet",
        images: ["https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=800&auto=format&fit=crop"],
        stock: 25
    },
    {
        name: "Golden Chain Choker",
        price: 420000,
        description: "볼드한 체인이 매력적인 초커 네크리스. 시크하고 도시적인 룩을 완성합니다.",
        category: "Necklace",
        images: ["https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop"],
        stock: 10
    },
    {
        name: "Opulence Gemstone Ring",
        price: 550000,
        description: "다양한 젬스톤이 조화롭게 어우러진 화려한 링. 특별한 날, 당신을 더욱 빛내줍니다.",
        category: "Ring",
        images: ["https://images.unsplash.com/photo-1605100692518-2f1f0e4b868a?q=80&w=800&auto=format&fit=crop"],
        stock: 8
    },
    {
        name: "Noir Onyx Studs",
        price: 210000,
        description: "시크한 블랙 오닉스가 돋보이는 스터드 이어링. 모던하고 절제된 아름다움을 보여줍니다.",
        category: "Earring",
        images: ["https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?q=80&w=800&auto=format&fit=crop"],
        stock: 18
    },
    {
        name: "Serenity Pearl Bracelet",
        price: 380000,
        description: "순수한 매력의 진주 브레이슬릿. 클래식하면서도 페미닌한 무드를 자아냅니다.",
        category: "Bracelet",
        images: ["https://images.unsplash.com/photo-1549419515-998816c7ccb1?q=80&w=800&auto=format&fit=crop"],
        stock: 14
    }
];

async function seed() {
    console.log('Seeding products...');

    // Clear existing products (optionally)
    // Note: RLS might prevent deletion if not admin, but service_role is not available in .env.local usually.
    // We'll try. If basic insert works, great.

    const { data, error } = await supabase.from('products').insert(products).select();

    if (error) {
        console.error('Error seeding products:', error);
    } else {
        console.log(`Successfully seeded ${data.length} products.`);
    }
}

seed();
