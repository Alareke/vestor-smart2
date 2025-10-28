/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { ChevronDown, Check, X, Info, Zap, AreaChart, CandlestickChart, Landmark, Bitcoin, Loader, ArrowLeft, ArrowRight, Plus, Twitter, Instagram, Linkedin } from 'lucide-react';
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { useLanguage } from '../i18n/LanguageContext';

// --- Helper Functions ---
const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href')?.substring(1);
    if (!targetId) return;

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        const headerOffset = 90; 
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
};

async function withRetry<T>(fn: () => Promise<T>, retries = 10, delay = 5000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const message = err.message || err.toString();
            // Retry on 429 (rate limit) or generic XHR errors
            if (message.includes('429') || message.includes('xhr error')) {
                if (i < retries - 1) { // Don't wait on the last attempt
                    const waitTime = delay * Math.pow(2, i) + Math.random() * 1000; // Exponential backoff with jitter
                    await new Promise(res => setTimeout(res, waitTime));
                } else {
                    throw err; // Re-throw last error after all retries
                }
            } else {
                // Don't retry on other errors
                throw err;
            }
        }
    }
    throw lastError;
}


const iconMap = {
    AreaChart,
    Bitcoin,
    CandlestickChart,
    Landmark,
    Twitter,
    Instagram,
    Linkedin,
};

// --- Main Page Component ---
export const PricesPage = () => {
    const { t: translate, language } = useLanguage();
    const t = (key, options?) => translate(`prices_page.${key}`, options);
    const dir = t('dir');

    // --- Components ---
    const MousePositionTracker = () => {
      useEffect(() => {
        const updateMousePosition = (ev) => {
          document.documentElement.style.setProperty('--mouse-x', `${ev.clientX}px`);
          document.documentElement.style.setProperty('--mouse-y', `${ev.clientY}px`);
        };
        window.addEventListener('mousemove', updateMousePosition);
        return () => {
          window.removeEventListener('mousemove', updateMousePosition);
        };
      }, []);
      return null;
    };

    const Header = ({ isScrolled }) => {
      const navItems = [
        { key: 'pricing', href: 'pricing' },
        { key: 'features', href: 'compare' },
        { key: 'community', href: 'community' },
        { key: 'support', href: 'support' },
      ];
      return (
        <header className={`prices_page_header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'header-scrolled' : ''}`}>
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-white tracking-wider">{t('header.title')}</h1>
              <nav className="hidden md:flex items-center gap-6">
                {navItems.map(item => (
                  <a href={`#${item.href}`} key={item.key} onClick={handleSmoothScroll} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">{t(`header.${item.key}`)}</a>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium hidden sm:block">{t('header.signIn')}</a>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-600/30">
                {t('header.getStarted')}
              </button>
            </div>
          </div>
        </header>
      );
    };

    const AIRecommender = ({ onRecommend }) => {
      const [selectedStyle, setSelectedStyle] = useState(null);
      const [recommendation, setRecommendation] = useState(null);
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState(null);
      
      const stylesValue = t('aiRecommender.styles');
      const styles = Array.isArray(stylesValue) ? stylesValue : [];

      const handleRecommendation = async () => {
        if (!selectedStyle) return;
        setIsLoading(true);
        setError(null);
        setRecommendation(null);
        
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
          const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  planName: {
                    type: Type.STRING,
                    description: "The name of the recommended plan (e.g., Basic, Plus, Premium, Expert, Ultimate)."
                  }
                },
                required: ["planName"]
              }
            }
          }));
          
          const jsonResponse = JSON.parse(response.text);
          const recommendedPlan = jsonResponse.planName;
    
          setTimeout(() => {
            setRecommendation(recommendedPlan);
            onRecommend(recommendedPlan);
            setIsLoading(false);
          }, 1500);

        } catch (e) {
          setError(t('aiRecommender.error'));
          setIsLoading(false);
        }
      };

      return (
        <section id="ai-recommender" className="py-16 sm:py-24">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block bg-purple-500/10 text-purple-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                <Zap size={14} className="inline-block me-2" />
                {t('aiRecommender.title')}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">{t('aiRecommender.subtitle')}</h2>
              <p className="text-md sm:text-lg text-gray-400 mb-8">{t('aiRecommender.question')}</p>
            </motion.div>
    
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8"
            >
              {styles.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 border-2 ${selectedStyle === style ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-gray-800/50 border-gray-700 hover:border-purple-500 hover:text-purple-300'}`}
                >
                  {style}
                </button>
              ))}
            </motion.div>
    
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <button
                onClick={handleRecommendation}
                disabled={!selectedStyle || isLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-600/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {t('aiRecommender.button')}
              </button>
            </motion.div>
    
            <AnimatePresence>
              {(isLoading || recommendation || error) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 overflow-hidden"
                >
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="ai-loader mb-3"><span></span><span></span><span></span></div>
                      <span>{t('aiRecommender.generating')}</span>
                    </div>
                  )}
                  {error && <p className="text-red-400">{error}</p>}
                  {recommendation && (
                    <div className="text-center">
                      <p className="text-gray-400 mb-2">{t('aiRecommender.recommendationTitle')}</p>
                      <p className="text-3xl font-bold text-purple-400">{recommendation}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      );
    };

    const PricingCard = (props: any) => {
      const { plan, billingCycle, isRecommended, isPopular, wrapperClassName = '' } = props;
      const cardRef = useRef(null);

      const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const { width, height } = rect;
        const mouseX = (e.clientX - rect.left) / width - 0.5;
        const mouseY = (e.clientY - rect.top) / height - 0.5;
        
        const rotateX = mouseY * -10; // Invert for natural feel
        const rotateY = mouseX * 20;

        cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      };
      
      const handleMouseLeave = () => {
        if (cardRef.current) {
          cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        }
      };

      return (
        <div className={`snap-center shrink-0 w-[90vw] max-w-sm md:w-96 lg:w-auto perspective-container ${wrapperClassName}`}>
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformStyle: 'preserve-3d', transition: 'transform 0.2s ease-out' }}
            className={`pricing-card relative flex flex-col h-full bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/50
            ${isRecommended ? 'recommended-card' : ''} 
            ${plan.name === t('pricing.plans')[4].name ? 'ultimate-border' : ''}`}
          >
            <div className="pricing-card-glow"></div>
            {isPopular && <div className="most-popular-badge">{t('pricing.mostPopular')}</div>}

            <div className="flex-grow">
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <p className="text-gray-400 mt-2 mb-4 sm:mb-6 min-h-[48px]">{plan.description}</p>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">${billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly}</span>
                <span className="text-gray-400 font-medium">/ {t('pricing.monthly')}</span>
              </div>
              <p className="text-sm text-gray-500 mb-6 sm:mb-8">
                {billingCycle === 'yearly' ? t('pricing.billedYearly') : t('pricing.billedMonthly')}
              </p>
              
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {plan.topFeatures.map(feature => <FeatureMeter key={feature.name} feature={feature} />)}
              </div>
              
              <ul className="space-y-3 feature-list-scrollbar pr-2 h-32 sm:h-36 overflow-y-auto">
                {plan.allFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    {feature.included ? <Check size={16} className="text-green-500 shrink-0" /> : <X size={16} className="text-red-500 shrink-0" />}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-auto pt-6 sm:pt-8">
              <button className={`w-full font-bold py-3 px-6 rounded-lg text-base sm:text-lg transition-all duration-300 transform hover:scale-105
              ${plan.name === t('pricing.plans')[2].name ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>
                {plan.cta}
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">{plan.secondaryCta}</p>
            </div>
          </div>
        </div>
      );
    };
    
    const Pricing = ({ recommendedPlan }) => {
      const [billingCycle, setBillingCycle] = useState('yearly');
      const [highlightedPlan, setHighlightedPlan] = useState(null);

      useEffect(() => {
        if (recommendedPlan) {
          setHighlightedPlan(recommendedPlan);
          const timer = setTimeout(() => setHighlightedPlan(null), 5000); 
          return () => clearTimeout(timer);
        }
      }, [recommendedPlan]);
      
      const containerRef = useRef(null);
      const { scrollXProgress } = useScroll({ container: containerRef });
      
      const plansValue = t('pricing.plans');
      const plans = Array.isArray(plansValue) ? plansValue : [];
      const mainPlans = plans.slice(0, 3);
      const proPlans = plans.slice(3);

      return (
        <section id="pricing" className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">{t('pricing.title')}</h2>
              <div className="flex justify-center items-center gap-4 mt-8">
                <span className={`font-medium transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>{t('pricing.monthly')}</span>
                <div
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className={`w-14 h-8 flex items-center bg-gray-700 rounded-full p-1 cursor-pointer transition-all duration-300 ${billingCycle === 'yearly' ? 'bg-purple-600' : ''}`}
                >
                  <motion.div
                    className="w-6 h-6 bg-white rounded-full shadow-md"
                    layout
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                    style={{
                      transform: billingCycle === 'yearly' ? 'translateX(24px)' : 'translateX(0px)',
                    }}
                  />
                </div>
                <span className={`font-medium transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>{t('pricing.yearly')}</span>
                <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">{t('pricing.save')}</span>
              </div>
            </motion.div>

            <div className="relative">
              <div
                ref={containerRef}
                className="flex gap-4 sm:gap-8 pb-8 overflow-x-auto snap-x snap-mandatory lg:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {plans.map((plan) => (
                  <PricingCard
                    key={plan.name}
                    plan={plan}
                    billingCycle={billingCycle}
                    isRecommended={highlightedPlan && plan.id.toLowerCase() === highlightedPlan.toLowerCase()}
                    isPopular={plan.isPopular}
                  />
                ))}
              </div>
              <div className="absolute bottom-0 h-1 w-full bg-gray-800 rounded-full overflow-hidden lg:hidden">
                  <motion.div className="h-full bg-purple-500" style={{ scaleX: scrollXProgress }} />
              </div>
              <div className="hidden lg:block max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
                  {mainPlans.map((plan, index) => (
                    <PricingCard
                      key={plan.name}
                      plan={plan}
                      billingCycle={billingCycle}
                      isRecommended={highlightedPlan && plan.id.toLowerCase() === highlightedPlan.toLowerCase()}
                      isPopular={plan.isPopular}
                      wrapperClassName={index === 1 ? 'scale-105 z-10' : ''}
                    />
                  ))}
                </div>
                
                <div className="mt-16 text-center">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{t('pricing.pro_title')}</h3>
                  <p className="text-gray-400 mt-2 max-w-2xl mx-auto">{t('pricing.pro_subtitle')}</p>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {proPlans.map((plan) => (
                    <PricingCard
                      key={plan.name}
                      plan={plan}
                      billingCycle={billingCycle}
                      isRecommended={highlightedPlan && plan.id.toLowerCase() === highlightedPlan.toLowerCase()}
                      isPopular={plan.isPopular}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    };

    const FeatureMeter = (props: any) => {
        const { feature } = props;
        const value = parseFloat(feature.value);
        const max = parseFloat(feature.max);
        const percentage = (value / max) * 100;

        return (
            <div>
                <div className="flex justify-between items-baseline mb-1">
                    <p className="text-sm font-medium text-gray-300">{feature.name}</p>
                    <p className="text-sm font-bold text-white">{feature.value}</p>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <motion.div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        viewport={{ once: true, amount: 'all' }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </div>
        );
    };

    const Markets = () => {
        const itemsValue = t('markets.items');
        const items = Array.isArray(itemsValue) ? itemsValue : [];
        return (
            <section id="markets" className="py-16 sm:py-24 bg-gray-900/20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5 }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">{t('markets.title')}</h2>
                        <p className="text-md sm:text-lg text-gray-400">{t('markets.subtitle')}</p>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {items.map((item, index) => {
                            const IconComponent = iconMap[item.icon];
                            return (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="market-card bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 text-center transition-all duration-300 hover:border-purple-500/50 hover:bg-gray-800/50 hover:-translate-y-2"
                                >
                                    <div className="inline-block p-4 bg-purple-600/20 rounded-xl mb-6">
                                        <IconComponent className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                    <p className="text-sm text-gray-400">{item.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        );
    }
    
    const [isScrolled, setIsScrolled] = useState(false);
    const [recommendedPlan, setRecommendedPlan] = useState(null);

    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 10);
    });

    const Hero = () => (
        <section id="hero" className="relative py-20 sm:py-28 md:py-40 text-center text-white overflow-hidden">
             <div className="absolute inset-0">
                <img src="../assets/placeholder.png" alt="Trading charts" className="w-full h-full object-cover opacity-30 hero-bg-animate"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-[#0D0D0D]"></div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mt-4 leading-tight"
              >
                {t('hero.title.line1')} <span className="gradient-text">{t('hero.title.line2')}</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-6 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto"
              >
                {t('hero.subtitle')}
              </motion.p>
            </div>
        </section>
    );

    const CompareTable = () => (
        <section id="compare" className="py-16 sm:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-center mb-12">{t('compare.title')}</h2>
                {/* Placeholder for table */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
                    <p>{t('compare.placeholder')}</p>
                </div>
            </div>
        </section>
    );

    const Community = () => (
         <section id="community" className="py-16 sm:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-center mb-12">{t('community.title')}</h2>
                 <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
                    <p>{t('community.placeholder')}</p>
                </div>
            </div>
        </section>
    );

    const Support = () => (
         <section id="support" className="py-16 sm:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-center mb-12">{t('support.title')}</h2>
                 <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
                    <p>{t('support.placeholder')}</p>
                </div>
            </div>
        </section>
    );
    
    const Footer = () => {
        const socialLinksValue = t('footer.socials');
        const socialLinks = Array.isArray(socialLinksValue) ? socialLinksValue : [];
        const footerColumnsValue = t('footer.columns');
        const footerColumns = Array.isArray(footerColumnsValue) ? footerColumnsValue : [];
        
        return (
          <footer className="bg-gray-900/40 border-t border-gray-800/50 mt-24">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-sm">
                    <div className="col-span-2">
                        <h3 className="text-lg font-bold text-white">{t('header.title')}</h3>
                        <div className="flex gap-4 mt-4">
                            {socialLinks.map(social => {
                                const Icon = iconMap[social.icon];
                                return <a href="#" key={social.name} className="text-gray-400 hover:text-white"><Icon size={20} /></a>;
                            })}
                        </div>
                    </div>
                    {footerColumns.map(column => (
                        <div key={column.title}>
                            <h4 className="font-semibold text-white mb-4">{column.title}</h4>
                            <ul className="space-y-3 text-gray-400">
                                {column.links.map(link => <li key={link}><a href="#" className="hover:text-white">{link}</a></li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
          </footer>
        );
    };
    
    return (
        <div className="prices-page-body" dir={dir}>
            <MousePositionTracker />
            <Header isScrolled={isScrolled} />
            <main>
                <Hero />
                <AIRecommender onRecommend={setRecommendedPlan} />
                <Pricing recommendedPlan={recommendedPlan} />
                <Markets />
                <CompareTable />
                <Community />
                <Support />
            </main>
            <Footer />
        </div>
    );
};