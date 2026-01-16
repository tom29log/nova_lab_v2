
-- Clear existing products
TRUNCATE TABLE public.products RESTART IDENTITY;

-- Insert 12 Luxury Products
INSERT INTO public.products (name, price, description, category, images, stock)
VALUES
  (
    'Lumière Pearl Necklace',
    450000,
    '최상급 담수 진주와 18K 골드로 제작된 우아한 네크리스. 당신의 목선에 은은한 빛을 더해줍니다.',
    'Necklace',
    ARRAY['https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=800&auto=format&fit=crop'],
    10
  ),
  (
    'Ethereal Gold Ring',
    320000,
    '현대적인 감각으로 재해석한 클래식 골드 링. 단독 착용만으로도 압도적인 존재감을 발산합니다.',
    'Ring',
    ARRAY['https://images.unsplash.com/photo-1605100804763-ebea4663163c?q=80&w=800&auto=format&fit=crop'],
    15
  ),
  (
    'Celestial Diamond Earrings',
    890000,
    '밤하늘의 별처럼 빛나는 다이아몬드 이어링. 어떤 각도에서도 완벽한 광채를 선사합니다.',
    'Earring',
    ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop'],
    5
  ),
  (
    'Midnight Sapphire Bracelet',
    650000,
    '깊고 푸른 사파이어가 세팅된 섬세한 브레이슬릿. 손목 위에서 신비로운 매력을 자아냅니다.',
    'Bracelet',
    ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop'],
    8
  ),
  (
    'Royal Emerald Ring',
    720000,
    '고혹적인 에메랄드 그린 컬러가 돋보이는 스테이트먼트 링.',
    'Ring',
    ARRAY['https://images.unsplash.com/photo-1603561596112-0a132b7223e8?q=80&w=800&auto=format&fit=crop'],
    7
  ),
  (
    'Aurora Crystal Pendant',
    280000,
    '오로라의 빛을 형상화한 크리스탈 펜던트. 빛의 각도에 따라 다채로운 색상을 보여줍니다.',
    'Necklace',
    ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop'],
    20
  ),
  (
    'Vintage Rose Earrings',
    350000,
    '빈티지한 무드의 로즈 골드 이어링. 로맨틱한 분위기를 연출하기에 제격입니다.',
    'Earring',
    ARRAY['https://images.unsplash.com/photo-1630019852942-e5e12f950664?q=80&w=800&auto=format&fit=crop'],
    12
  ),
  (
    'Minimalist Silver Cuff',
    180000,
    '군더더기 없는 깔끔한 라인의 실버 커프. 데일리 아이템으로 손색이 없습니다.',
    'Bracelet',
    ARRAY['https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=800&auto=format&fit=crop'],
    25
  ),
  (
    'Golden Chain Choker',
    420000,
    '볼드한 체인이 매력적인 초커 네크리스. 시크하고 도시적인 룩을 완성합니다.',
    'Necklace',
    ARRAY['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop'],
    10
  ),
  (
    'Opulence Gemstone Ring',
    550000,
    '다양한 젬스톤이 조화롭게 어우러진 화려한 링. 특별한 날, 당신을 더욱 빛내줍니다.',
    'Ring',
    ARRAY['https://images.unsplash.com/photo-1605100692518-2f1f0e4b868a?q=80&w=800&auto=format&fit=crop'],
    8
  ),
  (
    'Noir Onyx Studs',
    210000,
    '시크한 블랙 오닉스가 돋보이는 스터드 이어링. 모던하고 절제된 아름다움을 보여줍니다.',
    'Earring',
    ARRAY['https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?q=80&w=800&auto=format&fit=crop'],
    18
  ),
  (
    'Serenity Pearl Bracelet',
    380000,
    '순수한 매력의 진주 브레이슬릿. 클래식하면서도 페미닌한 무드를 자아냅니다.',
    'Bracelet',
    ARRAY['https://images.unsplash.com/photo-1549419515-998816c7ccb1?q=80&w=800&auto=format&fit=crop'],
    14
  );
