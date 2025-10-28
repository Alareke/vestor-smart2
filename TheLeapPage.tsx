/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Youtube, BarChart, Check, Globe } from 'lucide-react';

// FIX: Changed component to accept arbitrary props to fix potential TypeScript errors with the `key` prop.
const LeaderboardRow = (props: any) => {
    const { rank, avatar, name, prize, pnl, pnlPercent } = props;
    const isPositive = !pnlPercent.startsWith('-');
    return (
        <tr className="border-b border-gray-800/60 last:border-b-0">
            <td className="p-3 text-center">{rank}</td>
            <td className="p-3">
                <div className="flex items-center gap-3">
                    <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />
                    <span className="font-semibold text-white whitespace-nowrap">{name}</span>
                </div>
            </td>
            <td className="p-3 text-right font-mono whitespace-nowrap">${prize}</td>
            <td className={`p-3 text-right font-mono whitespace-nowrap ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{pnlPercent}</td>
            <td className={`p-3 text-right font-mono whitespace-nowrap ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{pnl}</td>
        </tr>
    );
};

const SymbolTag = ({ name, icon, iconType = 'flag' }) => {
    let IconComponent;
    if (iconType === 'flag') {
        IconComponent = <img src={`https://s3-symbol-logo.tradingview.com/country/${icon}.svg`} alt={`${icon} flag`} className="w-4 h-4 rounded-full" />;
    } else if (iconType === 'crypto') {
         IconComponent = <img src={`https://s3-symbol-logo.tradingview.com/crypto/XTVC${icon}.svg`} alt={`${icon} logo`} className="w-4 h-4 rounded-full" />;
    } else { // commodity
         IconComponent = <img src={`https://s3-symbol-logo.tradingview.com/commodity/${icon}.svg`} alt={`${icon} logo`} className="w-4 h-4" />;
    }
    return (
        <div className="bg-[#2A2E39] rounded-full px-3 py-1.5 flex items-center gap-2 text-sm text-gray-300">
            {IconComponent}
            <span>{name}</span>
        </div>
    );
};

const CompetitionCard = ({ sponsor, sponsorLogo, rank, total, avatar, netProfit, profitPercent, tradeProfit, progress }) => (
    <div className="bg-[#1C2331] rounded-2xl p-5 border border-gray-800 flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <img src={sponsorLogo} alt={sponsor} className="h-6" />
                <span className="text-xs text-gray-400">برعاية {sponsor}</span>
            </div>
            <div className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full">{rank}# من أصل {total}</div>
        </div>
        <div className="text-center my-4">
            <img src={avatar} alt="Participant" className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-gray-600" />
        </div>
        <div className="text-center mb-4">
            <p className="text-xs text-gray-400">صافي الأرباح</p>
            <p className="text-2xl font-bold text-white">{netProfit} <span className="text-green-400 text-lg">+{profitPercent}</span></p>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>الصفقة الأكثر ربحية</span>
            <span>التداول المربح</span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-white mb-4">
            <span>{tradeProfit}</span>
            <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <button className="mt-auto w-full text-center py-2.5 bg-transparent border border-gray-600 rounded-full text-white font-semibold hover:bg-gray-700/50 hover:border-gray-500 transition-colors text-sm">
            شاهد أبرز أحداث المسابقة
        </button>
    </div>
);

const TraderTalkCard = ({ name, handle, avatar, content, isVerified = false }) => (
     <div className="bg-[#1C2331] rounded-2xl p-5 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
            <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
            <div>
                <p className="font-semibold text-white flex items-center gap-1.5">{name} {isVerified && <Check size={14} className="text-blue-500 bg-white rounded-full p-px" />}</p>
                <p className="text-sm text-gray-500">{handle}</p>
            </div>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{content}</p>
     </div>
);

const InfoCard = ({ title, description, linkText, Icon }) => (
    <div className="bg-[#1C2331] rounded-2xl p-8 border border-gray-800 text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center mb-6">
            <Icon size={40} className="text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 text-sm mb-6 flex-grow">{description}</p>
        <a href="#" className="text-blue-400 font-semibold hover:underline text-sm">{linkText} &gt;</a>
    </div>
);


export const TheLeapPage = () => {
    const { t } = useLanguage();
    
    const leaderboardData = [
        { rank: 1, avatar: 'https://i.pravatar.cc/150?u=BitK77', name: 'BitK77', prize: '8,500', pnl: '+$111,921.50', pnlPercent: '+111.92%' },
        { rank: 2, avatar: 'https://i.pravatar.cc/150?u=JYnVN', name: 'JYnVN', prize: '7,000', pnl: '+$104,895.50', pnlPercent: '+104.90%' },
        { rank: 3, avatar: 'https://i.pravatar.cc/150?u=magot98', name: 'magot98', prize: '6,000', pnl: '+$100,936.10', pnlPercent: '+100.94%' },
        { rank: 4, avatar: 'https://i.pravatar.cc/150?u=ElMariachi333', name: 'ElMariachi333', prize: '5,000', pnl: '+$100,100.65', pnlPercent: '+100.10%' },
        { rank: 5, avatar: 'https://i.pravatar.cc/150?u=pocorabanne', name: 'pocorabanne', prize: '3,500', pnl: '+$86,911.75', pnlPercent: '+86.91%' },
        { rank: 6, avatar: 'https://i.pravatar.cc/150?u=bamboray', name: 'bamboray', prize: '500', pnl: '+$84,515.25', pnlPercent: '+84.52%' },
        { rank: 7, avatar: 'https://i.pravatar.cc/150?u=Fiftyalran', name: 'Fiftyalran', prize: '500', pnl: '+$82,259.05', pnlPercent: '+82.26%' },
        { rank: 8, avatar: 'https://i.pravatar.cc/150?u=Antsor95', name: 'Antsor95', prize: '500', pnl: '+$80,424.75', pnlPercent: '+80.42%' },
        { rank: 9, avatar: 'https://i.pravatar.cc/150?u=YangSun98', name: 'YangSun98', prize: '500', pnl: '+$79,520.50', pnlPercent: '+79.52%' },
        { rank: 10, avatar: 'https://i.pravatar.cc/150?u=Casualcactus', name: 'Casualcactus', prize: '500', pnl: '+$79,275.10', pnlPercent: '+79.28%' },
    ];

    return (
        <div className="bg-black text-white font-sans overflow-x-hidden">
            <div className="max-w-5xl mx-auto px-4 py-16">
                {/* Hero */}
                <section className="text-center mb-24">
                    <img src="https://i.ibb.co/DgTDSpjZ/3-vestor.png" alt="VESTOR SMART Logo" className="h-9 w-auto object-contain mx-auto" />
                    <h1 className="text-6xl sm:text-8xl font-extrabold my-4">The Leap</h1>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        تم إغلاق هذه المسابقة للتداول الافتراضي، ولكن لا يزال بإمكانك التحقق من النتائج على لوحة المتصدرين والأسئلة الشائعة. استعدوا، ستعود المسابقة قريبًا.
                    </p>
                </section>

                {/* Leaderboard */}
                <section className="mb-24 overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[700px] text-sm">
                        <tbody>
                            {leaderboardData.map(item => <LeaderboardRow key={item.rank} {...item} />)}
                        </tbody>
                    </table>
                </section>

                {/* Details */}
                <section className="mb-24">
                    <h2 className="text-4xl sm:text-5xl font-bold text-center mb-12">التفاصيل الدقيقة</h2>
                    <div className="space-y-10">
                        {/* Row 1 */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="md:w-1/3">
                                <h3 className="font-bold text-white text-lg mb-2">الأموال الافتراضية</h3>
                                <p className="text-gray-400">ستحصل أنت وكل مشارك آخر على 100,000$ في حساب التداول الافتراضي الخاص بك في بداية المسابقة.</p>
                            </div>
                            <div className="md:w-2/3">
                                <h3 className="font-bold text-white text-lg mb-2">رموز التداول</h3>
                                <p className="text-gray-400 mb-4">تتوفر أكثر من عشرة عقود مستقبلية للتداول الافتراضي في الوقت الفعلي في The Leap تغطي المؤشرات والنفط، والذهب، والمزيد.</p>
                                <div className="flex flex-wrap gap-2">
                                    <SymbolTag name="!MES1" icon="us" />
                                    <SymbolTag name="!M2K1" icon="us" />
                                    <SymbolTag name="!MNQ1" icon="us" />
                                    <SymbolTag name="!MCL1" icon="commodity" />
                                    <SymbolTag name="!MGC1" icon="commodity" />
                                    <SymbolTag name="!MBT1" icon="crypto" />
                                </div>
                            </div>
                        </div>
                        {/* Row 2 */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="md:w-1/3">
                                <h3 className="font-bold text-white text-lg mb-2">أبطالنا</h3>
                                <p className="text-gray-400">سيكون الفائزون أفضل 250 مشاركًا من ذوي الدخل الأعلى بنهاية المسابقة. سيحصل صاحب المركز الأول على 8,500$، والثاني – 7,000$، والثالث – 6,000$، والرابع – 5,000$، والخامس – 3,500$. ومن السادس والعشرين إلى الخامس والخمسين سيحصلون على 500$، ومن الحادي والخمسين إلى الخامس والعشرين – 200$.</p>
                            </div>
                            <div className="md:w-2/3">
                                <h3 className="font-bold text-white text-lg mb-2">قوة المجتمع</h3>
                                <p className="text-gray-400">استغل مجتمعنا العالمي للعثور على أفكار واستراتيجيات ونصوص برمجية. مع أكثر من 100 مليون عضو، تقدم شبكتنا الاجتماعية موارد لا حصر لها للمتداولين.</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-12">
                        <a href="#" className="text-blue-400 hover:underline">قراءة الأسئلة الشائعة للمسابقة</a>
                    </div>
                </section>
                
                {/* Completed Competitions */}
                <section className="mb-24">
                    <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">المسابقات المكتملة</h2>
                    <p className="text-center text-gray-400 mb-12">تعرف على أبطال The Leap.</p>
                    <div className="grid md:grid-cols-3 gap-6">
                       <CompetitionCard sponsor="CME Group" sponsorLogo="https://s3-symbol-logo.tradingview.com/provider/cme.svg" rank={1} total={59187} avatar="https://i.pravatar.cc/150?u=cme" netProfit="+$13.1M" profitPercent="+5,220.72%" tradeProfit="+$4.6M" progress={94} />
                       <CompetitionCard sponsor="pepperstone" sponsorLogo="https://s3-symbol-logo.tradingview.com/provider/pepperstone.svg" rank={1} total={36965} avatar="https://i.pravatar.cc/150?u=pepperstone" netProfit="+$770.2K" profitPercent="+308.07%" tradeProfit="+$90.8K" progress={52} />
                       <CompetitionCard sponsor="TradeStation" sponsorLogo="https://s3-symbol-logo.tradingview.com/provider/tradestation.svg" rank={1} total={54870} avatar="https://i.pravatar.cc/150?u=tradestation" netProfit="+$111.9K" profitPercent="+111.92%" tradeProfit="+$10.5K" progress={89} />
                    </div>
                </section>
                
                {/* Trader Talk */}
                <section className="mb-24">
                    <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">حديث المتداولين</h2>
                    <p className="text-center text-gray-400 mb-12">انضم إلى الحديث عن أهم موضوع في المدينة حيث يشارك المشاركون في Leap أفكارهم حول المنافسة. شارك واستمتع وتعلم كل ما يمكن معرفته.</p>
                    <div className="grid md:grid-cols-2 gap-6">
                        <TraderTalkCard name="The Blueprint" handle="@Blueprint_S09" avatar="https://i.pravatar.cc/150?u=blueprint" content="أنا متحمس لمشاركة أنني حصلت على المراكز العشرة الأولى في TradingView Leap، والتي ضمت أكثر من 70.000 متسابق وقت التقاط هذه الصورة! على الرغم من أنني لم أتمكن من إنهاء المسابقة بسبب التزامات العمل، إلا أن هذه كانت تجربة رائعة لاختبار استراتيجياتي وأدوات التداول الخاصة بي. شكرًا لك على دعمك!" isVerified />
                        <TraderTalkCard name="CRAD" handle="@TraderCRAD" avatar="https://i.pravatar.cc/150?u=crad" content="إنه هو شغفي، وأنا مهووس به بشكل مفرط. لقد بدأت التداول منذ 3 سنوات. التداول علمتني أيضًا أهمية التخطيط الاستراتيجي واتخاذ القرار في الوقت الفعلي قدمت مجموعة قواعد المسابقة الكثير من الخبرة فيه." />
                        <TraderTalkCard name="srosh_mayi" handle="@Srosh_Mayi" avatar="https://i.pravatar.cc/150?u=srosh" content="لقد علمتني المنافسة الكثير عن أسلوب التداول الذي كان لدي من قبل. الآن، سأستخدم هذا الأسلوب: التداول NICHE للتداول الافتراضي. أنا متحمس لمعرفة أين ستأخذني هذه المهارات الجديدة!" isVerified />
                        <TraderTalkCard name="Umesh_mayi" handle="@Umesh_mayi" avatar="https://i.pravatar.cc/150?u=umesh" content={'لم أؤدِ بشكل جيد في مسابقة "THE LEAP" إلى حد ما، لكنني بالتأكيد لم أفشل. لقد تعلمت الكثير من الأخطاء التي ارتكبتها. لقد ساعدني حقًا في شحذ قدراتي على التحليل الفني. شكرًا لكم!'} />
                    </div>
                    <div className="text-center mt-8">
                        <button className="px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">انشر فكرتي</button>
                    </div>
                </section>
                
                {/* Info */}
                <section>
                    <div className="grid md:grid-cols-2 gap-6">
                         <InfoCard title="كيف يعمل The Leap" description="قام فريقنا بإنشاء مقطع فيديو مفيد على YouTube يوضح كيفية عمل المسابقة من البداية إلى النهاية." linkText="شاهد الفيديو" Icon={Youtube} />
                         <InfoCard title="ما المقصود بالتداول الافتراضي؟" description="يوفر محرك التداول الافتراضي الخاص بنا بيئة محاكاة لممارسة الصفقات دون المخاطرة بأموال حقيقية. يوضح لك الفيديو كيفية عمل كل شيء." linkText="تعرف على كيفية عمله" Icon={BarChart} />
                    </div>
                </section>

            </div>
        </div>
    );
};