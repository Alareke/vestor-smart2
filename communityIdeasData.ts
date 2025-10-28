
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export const getInitialCommunityIdeasData = (t) => [
    {
        id: 1,
        img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://www.youtube.com/watch?v=1-294t3i0aY',
        title: 'EURUSD - تحليل فني وتوقعات', // Hardcoded from image
        author: 'IvyMorgan', // Hardcoded from image
        authorAvatarUrl: 'https://i.pravatar.cc/150?u=ivy-morgan',
        date: 'أول أمس', // Hardcoded from image
        likes: 12,
        comments: 2,
        views: 343,
        description: `زوج EURUSD ما زال يتعرض لضغوط قوية نتيجة استمرار دعم الدولار الأمريكي بتوقعات بقاء أسعار الفائدة مرتفعة لفترة أطول من المتوقع، ورغم تشديد البنك المركزي الأوروبي لسياسته النقدية، إلا أن ضعف النمو ومخاطر الركود يحدان من قدرة اليورو على التعافي. البيانات الاقتصادية القادمة من الولايات المتحدة، وخصوصاً مؤشر أسعار المستهلك والتقارير المتعلقة بسوق العمل، ستكون حاسمة في تحديد ما إذا كان الدولار سيواصل تفوقه خلال الأسابيع القادمة. كما أن التوترات الجيوسياسية المستمرة تدفع المستثمرين نحو الدولار كملاذ آمن، مما يزيد الضغط على الزوج.
من الناحية الفنية، الاتجاه الهابط لا يزال مسيطراً بوضوح، مع استمرار تكون القمم والقيعان الأدنى. بعد أن لامس مستوى الدعم 1.1600، شهد السعر محاولة ارتداد بسيطة، لكنها تفتقر إلى الزخم الكافي. تعتبر مستويات محورية يجب مراقبتها؛ إغلاقها قد يؤدي إلى ارتداد مؤقت، أما الرفض المبكر فسيؤكد استمرار الاتجاه الهابط. سحابة إيشيموكو تظل سلبية، مع دعم حول 1.1600، وكسر هذا المستوى قد يدفع السعر نحو 1.1550 – وهي منطقة دعم حرجة قد تبطئ من وتيرة الهبوط مؤقتاً.
في المجمل، يبقى اليورو/الدولار في وضع دفاعي مع احتمالية أكبر لمزيد من الهبوط نحو 1.1570-1.1550 على المدى القصير.`,
        tags: ['tag_forex', 'tag_eur_usd', 'tag_chart_patterns', 'tag_buy', 'tag_trading', 'tag_signals', 'tag_sell', 'tag_technical_indicators', 'tag_trend_analysis'],
        updates: [
            { date: 'أمس', content: 'أغلقت الصفقة: تم الوصول للهدف', status: 'target_reached' }
        ],
        commentsData: [
            { id: 1, author: 'ThinkMarkets', avatar: 'https://i.pravatar.cc/150?u=thinkmarkets', text: 'تحليل دقيق وتفاصيل رائعة! يظل الاتجاه الهابط لا يزال واضحًا على زوج اليورو/دولار، وطالما ظل السعر دون 1.1650 فتبقى احتمالات الهبوط نحو 1.1550 قائمة بقوة. ما لم تظهر بيانات أمريكية سلبية تغير المشهد مؤقتًا.', date: 'منذ 15 ساعة' },
        ],
        badge: '500', badgeColor: 'bg-red-500', badgeTextColor: 'text-white', cornerBadge: 'TV'
    },
    {
        id: 2,
        img: 'https://images.unsplash.com/photo-1612198332194-42713a5ac75d?q=80&w=800&auto=format&fit=crop',
        videoUrl: '',
        title: t('idea2_title'),
        author: t('idea2_author'),
        authorAvatarUrl: 'https://i.pravatar.cc/150?u=tradingshot',
        date: t('idea2_date'),
        likes: 17,
        comments: 1,
        views: '1.2k',
        description: t('idea2_desc'),
        tags: ['tag_crypto', 'tag_bitcoin', 'Halving'],
        badge: 'B', badgeColor: 'bg-orange-500', badgeTextColor: 'text-white', cornerBadge: 'TV'
    },
    {
        id: 3,
        img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop',
        videoUrl: '',
        title: t('idea3_title'),
        author: t('idea3_author'),
        authorAvatarUrl: 'https://i.pravatar.cc/150?u=priceactiont',
        date: t('idea3_date'),
        likes: 18,
        comments: 0,
        views: 876,
        description: t('idea3_desc'),
        tags: ['tag_commodities', 'tag_gold', 'XAUUSD'],
        badgeIcon: 'Au', badgeColor: 'bg-green-500', badgeTextColor: 'text-yellow-300', cornerBadge: 'TV'
    },
    {
        id: 4,
        img: 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=800&auto=format&fit=crop',
        videoUrl: '',
        title: t('idea4_title'),
        author: t('idea4_author'),
        authorAvatarUrl: 'https://i.pravatar.cc/150?u=khaled-economici',
        date: t('idea4_date'),
        likes: 42,
        comments: 5,
        views: '2.5k',
        description: t('idea4_desc'),
        tags: ['tag_stocks', 'Tadawul', 'tag_saudi_arabia'],
        badge: 'A', badgeColor: 'bg-blue-500', badgeTextColor: 'text-white', cornerBadge: 'TV'
    },
    {
        id: 5,
        img: 'https://images.unsplash.com/photo-1631210741241-4828691a7f33?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://www.youtube.com/watch?v=1-294t3i0aY',
        title: t('idea5_title'),
        author: t('idea5_author'),
        authorAvatarUrl: 'https://i.pravatar.cc/150?u=oiloracle',
        date: t('idea5_date'),
        likes: 88,
        comments: 12,
        views: '5.1k',
        description: t('idea5_desc'),
        tags: ['tag_futures', 'Oil', 'WTI'],
        badge: 'OIL', badgeColor: 'bg-gray-600', badgeTextColor: 'text-white', cornerBadge: 'TV'
    },
    {
        id: 6,
        img: 'https://images.unsplash.com/photo-1621495484054-05553e1b8b8b?q=80&w=800&auto=format&fit=crop',
        videoUrl: '',
        title: t('idea6_title'),
        author: t('idea6_author'),
        authorAvatarUrl: 'https://i.pravatar.cc/150?u=cryptoclarity',
        date: t('idea6_date'),
        likes: 156,
        comments: 23,
        views: '10.3k',
        description: t('idea6_desc'),
        tags: ['tag_crypto', 'Ethereum', 'ETHUSD'],
        badgeIcon: 'ETH', badgeColor: 'bg-indigo-600', badgeTextColor: 'text-white', cornerBadge: 'TV'
    },
].map(idea => ({ ...idea, section: 'communityIdeas', status: 'published' }));