# حزمة الترقيات الشاملة — 2025-08-12T14:15:57.495224Z

هذه الحزمة تضيف وحدات وواجهات **MVP** لتغطية متطلباتك:
- تعدد الإطارات الزمنية في نفس اللوحة
- تحليل متعدد الرموز (Overlay)
- مؤشرات مخصصة (Pine Runner مبسط)
- Order Flow (Footprint/Volume Profile) — تمهيد
- Quick Order Panel / Trading Journal
- Backtest متعدد الأطر — تمهيد
- وحدات ذكاء اصطناعي (كشف نماذج / اقتراح مؤشرات / ملخص سوق) — تمهيد
- IndexedDB Cache وProviders Switcher وExport وSocial stubs

> ⚠️ ملاحظات: تم إنشاء الملفات والإطارات الأساسية مع **تكاملات بسيطة** لتفادي كسر النسخة الحالية. يلزم ربط بعض الوحدات داخل المكونات الرئيسية (`Home.tsx`, `Toolbar.jsx`, `BottomDock.jsx`, `CodePreview.jsx`) وفق هيكلة مشروعك إن اختلفت.

## نقاط الربط السريعة
- أدرج `<MultiTimeframePanel symbol={currentSymbol} tfs={['5m','1h','1d']} />` حيث تريد.
- لتفعيل Overlay: أضف `<MultiSymbolOverlay symbols={['BTCUSD','ETHUSD','AAPL']} base="BTCUSD" />` أعلى الشارت.
- اربط `QuickOrderPanel` في الهيدر أو اللوحة السفلية.
- Trading Journal أضفه كتبوبيب جديد في اللوحة السفلية.
- لاستدعاء Pine Runner:
  ```ts
  import { runPine } from './lib/pine_runner'
  const out = runPine('return sma(close,14)', { close: data.map(d=>d.close) })
  ```
- لتفعيل المزود الحقيقي، استخدم `ProvidersSwitcher` وأصغِ للحدث `provider:change` لاختيار مزوّد البيانات.

## بيئة (.env)
- أضفت `.env.example` إلى الجذر: BINANCE/YAHOO/KRAKEN proxies + webhooks لEmail/Telegram.