/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { 
    ChevronDown, Search, Download, Globe, Apple, Menu, X,
    CandlestickChart, Newspaper, MessageSquareQuote, BarChart4, Component, BellDot, SearchCode, Beaker, CodeXml,
    Facebook, Twitter, Instagram, Youtube, Linkedin, Send, MessageCircle
} from 'lucide-react';

const BybitLogo = () => (
    <img 
        src="https://s3-symbol-logo.tradingview.com/crypto/BYBIT.svg" 
        alt="Bybit Logo" 
        className="h-[25px] w-auto" 
        loading="lazy" decoding="async"
    />
);

const WindowsIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 4H3v16h18V4z" fill="#00A4EF"/>
        <path d="M3 4l9 1.5v6.5H3V4z" fill="#50E6FF"/>
        <path d="M12 5.5l9-1.5v7.5h-9V5.5z" fill="#50E6FF"/>
        <path d="M3 12h9v6.5L3 20v-8z" fill="#00A4EF"/>
        <path d="M12 12h9v6l-9 2v-8z" fill="#00A4EF"/>
    </svg>
);

const LinuxIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M6.01.32a.5.5 0 00-.53.11L4.1 1.8A.5.5 0 004 2.22v4.42c0 .28.22.5.5.5h2.8s.22.04.34-.1c.12-.13.03-.45.03-.45V2.21a.5.5 0 00-.5-.5H5.03l.61-1.06a.5.5 0 00-.13-.63zm11.94.11a.5.5 0 00-.53-.11.5.5 0 00-.13.63l.61 1.06H16.7a.5.5 0 00-.5.5v4.42s-.09.32.03.45c.12.14.34.1.34.1h2.8a.5.5 0 00.5-.5V2.22a.5.5 0 00-.14-.42l-1.38-1.37zM8.3 4.5a.5.5 0 00-.5.5v1c0 .28.22.5.5.5h7.4a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5H8.3zM6.63 7.84a.5.5 0 00-.4.2l-2.5 4.33c-.14.24.04.54.33.54h1.9a.5.5 0 00.4-.2l.65-1.12a.5.5 0 01.86 0l.65 1.12a.5.5 0 00.4.2h1.9c.28 0 .47-.3.33-.54l-2.5-4.33a.5.5 0 00-.86 0l-.36.62-.36-.62a.5.5 0 00-.86 0l-.36.62-.36-.62a.5.5 0 00-.46-.2zm10.74 0a.5.5 0 00-.4.2L14.47 12.37c-.14.24.04.54.33.54h1.9a.5.5 0 00.4-.2l.65-1.12a.5.5 0 01.86 0l.65 1.12a.5.5 0 00.4.2h1.9c.28 0 .47-.3.33-.54l-2.5-4.33a.5.5 0 00-.43-.2zM5.5 15a.5.5 0 00-.5.5v1c0 .28.22.5.5.5h13a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5H5.5zM12 18a4 4 0 00-4 4v2h8v-2a4 4 0 00-4-4z"/>
    </svg>
);

const Header = ({ setMainView }) => {
  const navItems = ["Buy Crypto", "Markets", "Trade", "Tools", "Finance", "Learn", "Rewards Hub", "More"];
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);


  return (
    <>
      <header className={`sticky top-0 z-30 transition-colors duration-300 ${scrolled ? 'bg-[#141414]/95 backdrop-blur-lg' : 'bg-[#141414]/80 backdrop-blur-md'}`}>
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-10">
            <button onClick={() => setMainView('default')}><BybitLogo /></button>
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map(item => (
                <a href="#" key={item} className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                  {item}
                  {["Buy Crypto", "Trade", "Tools", "Finance", "Learn", "More"].includes(item) && <ChevronDown size={14} />}
                </a>
              ))}
            </nav>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Search size={16} className="text-gray-400" />
              <span>XRP/USDT</span>
            </div>
            <a href="#" className="text-sm font-medium text-white hover:text-gray-300">Log In</a>
            <button className="bg-[#F7A600] text-black text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors">
              Sign Up
            </button>
            <button className="text-gray-400 hover:text-white"><Download size={20} /></button>
            <button className="text-gray-400 hover:text-white"><Globe size={20} /></button>
          </div>
          <button className="lg:hidden text-white" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      {isMenuOpen && (
            <>
              <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setIsMenuOpen(false)}
              />
              <div
                  className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-[#141414] border-l border-white/10 z-50 p-6 flex flex-col lg:hidden"
              >
                  <div className="flex justify-between items-center mb-10">
                      <button onClick={() => setMainView('default')}><BybitLogo /></button>
                      <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white">
                          <X size={24} />
                      </button>
                  </div>
                  <nav className="flex flex-col gap-5">
                      {navItems.map(item => (
                          <a href="#" key={item} className="text-gray-200 hover:text-white transition-colors text-lg flex justify-between items-center py-1">
                              <span>{item}</span>
                              {["Buy Crypto", "Trade", "Tools", "Finance", "Learn", "More"].includes(item) && <ChevronDown size={18} />}
                          </a>
                      ))}
                  </nav>
                  <div className="mt-auto pt-8 border-t border-white/10 flex flex-col gap-4">
                      <a href="#" className="text-base font-medium text-center text-white bg-white/5 border border-white/10 py-3 rounded-lg hover:bg-white/10 transition-colors">Log In</a>
                      <button className="bg-[#F7A600] text-black text-base font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors">
                          Sign Up
                      </button>
                  </div>
              </div>
            </>
        )}
    </>
  );
};

const Hero = () => (
  <section className="relative py-20 sm:py-28 md:py-40 text-center text-white overflow-hidden">
     <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1641551913193-85817d337a15?q=80&w=1920&auto=format&fit=crop" alt="Trading charts" className="w-full h-full object-cover opacity-30 hero-bg-animate" loading="lazy" decoding="async"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-[#0D0D0D]"></div>
    </div>
    <div className="container mx-auto px-4 sm:px-6 relative z-10">
      <h2 className="text-lg font-medium tracking-wide">BYBIT <span className="text-gray-500">x</span> VESTOR SMART</h2>
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mt-4 leading-tight">Trade Better With <span className="gradient-text">VESTOR SMART</span></h1>
      <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
        Level up your crypto trading experience with the best-in-class charting and analytical tools.
      </p>
      <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button className="bg-[#F7A600] text-black text-base font-bold px-8 py-4 rounded-lg hover:bg-yellow-400 transition-colors w-full sm:w-auto">
          Create Bybit Account
        </button>
        <button className="bg-black bg-opacity-50 border border-white text-white text-base font-bold px-8 py-4 rounded-lg hover:bg-opacity-70 transition-colors w-full sm:w-auto">
          Start Trading
        </button>
      </div>
    </div>
  </section>
);

const SectionBringNextLevel = () => {
    const items = [
        { icon: CandlestickChart, title: 'Trade Directly From TradingView', description: 'Buy and sell crypto directly from TradingView charts with Bybit\'s top-notch liquidity and multilingual customer support.'},
        { icon: Newspaper, title: 'All Things Trading', description: 'Leverage watchlists, alerts, and live news that are seamlessly integrated into your charting and trading dashboard.'},
        { icon: MessageSquareQuote, title: 'Chart and Learn', description: 'Research or generate ideas and scripts within the TradingView community to ensure you never trade alone.'},
    ];

    return (
        <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white">Bring Your Trading to the Next Level</h2>
                <div className="mt-16 grid md:grid-cols-3 gap-y-12 md:gap-y-16 gap-x-8 md:gap-x-0">
                    {items.map((item, index) => (
                        <div key={item.title} className={`text-center px-4 md:px-8 ${index < 2 ? 'md:border-r border-gray-800' : ''}`}>
                             <div className="flex justify-center items-center h-24 mb-6">
                                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-800">
                                    <item.icon className="text-yellow-400" size={36} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white">{item.title}</h3>
                            <p className="mt-4 text-gray-400 leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const SectionHowToConnect = () => {
    const steps = [
        { title: 'Create Accounts', description: 'Sign up on Bybit and create a free TradingView user profile.' },
        { title: 'Bybit on TradingView', description: 'Find the Bybit profile on TradingView and click "Trade".' },
        { title: 'Connect Your Accounts', description: 'Enter your Bybit account credentials in the login panel to connect with your TradingView account.' },
        { title: 'Add Bybit to Favorites', description: 'In the Trading Panel, save Bybit as your favorite broker to speed up future connections.' },
    ];
    return (
        <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white">How to connect to Vestor Smart</h2>
                <div className="mt-16 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div className="flex flex-col gap-8">
                        {steps.map((step, index) => (
                            <div key={step.title} className="flex items-start gap-6">
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-white font-bold">{index + 1}</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                                    <p className="mt-2 text-gray-400">{step.description}</p>
                                    {index === 0 && <button className="mt-4 text-sm bg-[#F7A600] text-black font-bold px-4 py-2 rounded-md">Sign Up Now</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="bg-gray-800 p-2 rounded-xl aspect-[4/3] sm:aspect-square w-full max-w-lg mx-auto flex items-center justify-center">
                        <img src="https://assets.static-bybit.com/art/9c244c3a2f84093845b46950275037d4.png" alt="Connect to Vestor Smart" className="rounded-lg object-cover" loading="lazy" decoding="async" />
                    </div>
                </div>
            </div>
        </section>
    );
};

const SectionFeatures = () => {
    const features = [
        { icon: BarChart4, title: 'Industry-Leading Charts', description: 'Explore TradingView\'s interactive and responsive interface, featuring over 20 chart types, 110+ drawing tools, and extensive customization options.' },
        { icon: Component, title: 'Advanced Technical Analysis', description: 'Access 400+ pre-built indicators for popular strategies and thousands more custom-built indicators through TradingView\'s robust community.' },
        { icon: BellDot, title: 'Unmissable Alerts', description: 'Receive alerts based on 13 notification conditions on price movements, indicators, and strategies.' },
        { icon: SearchCode, title: 'Powerful Analytical Suite', description: 'Advanced crypto screener featuring descriptive and technical criteria for powerful analysis.' },
        { icon: Beaker, title: 'Strategy Tester', description: 'Simulate trades using historical data to assess the risk and profitability and optimize the effectiveness of your strategy.' },
        { icon: CodeXml, title: 'Pine Script™ Language', description: 'A lightweight yet powerful programming language, enabling traders to create and backtest their own trading indicators and strategies.' },
    ];
    return(
        <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white">Vestor Smart Features</h2>
                <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map(feature => (
                        <div key={feature.title} className="bg-gray-900 bg-opacity-50 border border-gray-800 p-6 md:p-8 rounded-2xl relative overflow-hidden feature-card">
                             <div className="flex items-center h-16 mb-6">
                                <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center">
                                    <feature.icon size={28} className="text-yellow-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                            <p className="mt-4 text-gray-400 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
};

const SectionDesktopApp = () => (
    <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
                <div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">Vestor Smart Desktop App</h2>
                    <p className="mt-6 text-gray-400 leading-relaxed">Enhance your experience with additional features of the powerful desktop application.</p>
                    <ul className="mt-8 space-y-3 text-gray-400 list-disc list-inside">
                        <li>100% synchronization with your browser version.</li>
                        <li>Configure your charts across multiple displays.</li>
                        <li>Expanded workspace for better analysis.</li>
                        <li>Link several tabs with the same symbols.</li>
                    </ul>
                    <div className="mt-10">
                        <p className="text-sm font-medium text-white mb-4">Download for</p>
                        <div className="flex flex-wrap gap-4">
                            <button className="flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"><Apple className="text-white" size={20} /> macOS</button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"><WindowsIcon className="text-white" size={20}/> Windows</button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"><LinuxIcon className="text-white" size={20}/> Linux</button>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800 p-2 rounded-xl">
                    <img src="https://assets.static-bybit.com/art/00b215a31a4773c2242171549d324b11.png" alt="Desktop App" className="rounded-lg" loading="lazy" decoding="async" />
                </div>
            </div>
        </div>
    </section>
);

const FaqItem = (props: any) => {
    const { q, a } = props;
    const [isOpen, setIsOpen] = useState(false);
    return (
        <details className="border-b border-gray-800 py-2 group faq-item" open={isOpen} onToggle={(e) => setIsOpen(e.currentTarget.open)}>
            <summary
                className="flex justify-between items-center cursor-pointer list-none py-4"
            >
                <span className="text-base sm:text-lg font-medium text-white group-hover:text-yellow-400 transition-colors pr-4">{q}</span>
                <div
                    className="relative w-6 h-6 flex-shrink-0"
                >
                    <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </summary>
            <div className="overflow-hidden">
                <div className="pb-4 text-gray-400 leading-relaxed pr-8">
                    {a}
                </div>
            </div>
        </details>
    );
};

const SectionFaq = () => {
    const faqs = [
        { q: 'How to create a Vestor Smart account?', a: 'Go to tradingview.com, click the member icon in the top right-hand corner, and then hit the "Sign In" button. Choose your preferred verification method. Don\'t forget to explore the community, news, and market screeners.' },
        { q: 'Which browsers are supported by Vestor Smart', a: 'Vestor Smart is supported on most modern browsers, including Google Chrome, Mozilla Firefox, Safari, and Microsoft Edge. For the best experience, we recommend using the latest version of your browser.' },
        { q: 'How to make deposits and withdrawals?', a: 'Deposits and withdrawals are handled directly through your connected Bybit account. You can manage your funds in your Bybit wallet and they will be reflected in your TradingView interface.' },
        { q: 'Which symbols can I trade via Vestor Smart', a: 'You can trade any crypto symbol that is available on Bybit. The integration provides access to Bybit\'s full range of spot and derivatives markets.'},
    ];
    return(
        <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
                 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white">Frequently Asked Questions (FAQ)</h2>
                 <div className="mt-12">
                     {faqs.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a}/>)}
                 </div>
            </div>
        </section>
    );
};

const Footer = () => {
    const links = {
        About: ["About Bybit", "Press Room", "Bybit Communities", "Announcements", "Risk Disclosure"],
        Services: ["One-Click Buy", "P2P Trading", "VIP Program", "Referral Program", "Institutional Services"],
        Support: ["Submit a Request", "Help Center", "User Feedback", "Bybit Learn", "Trading Fee"],
        Products: ["Trade", "Derivatives", "Earn", "Launchpad", "Bybit Card", "TradingView"]
    };
     const socialLinks = [
        { icon: Facebook, href: '#', name: 'Facebook' },
        { icon: Twitter, href: '#', name: 'Twitter' },
        { icon: Instagram, href: '#', name: 'Instagram' },
        { icon: Youtube, href: '#', name: 'Youtube' },
        { icon: Linkedin, href: '#', name: 'LinkedIn' },
        { icon: Send, href: '#', name: 'Telegram' },
        { icon: MessageCircle, href: '#', name: 'Discord' },
    ];
    return (
        <footer className="bg-[#0A0A0A] border-t border-gray-800">
            <div className="container mx-auto px-4 sm:px-6 py-16">
                <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
                    <div className="lg:col-span-2">
                        <BybitLogo />
                        <div className="flex flex-wrap gap-4 mt-6">
                           {socialLinks.map((link) => (
                               <a 
                                 key={link.name} 
                                 href={link.href}
                                 aria-label={link.name}
                                 className="text-gray-500 transition-colors"
                                >
                                   <link.icon size={22} />
                               </a>
                           ))}
                        </div>
                    </div>
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {Object.entries(links).map(([title, items]) => (
                            <div key={title}>
                                <h4 className="font-bold text-white mb-4">{title}</h4>
                                <ul className="space-y-3">
                                    {items.map(link => <li key={link}><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{link}</a></li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="bg-black py-4">
                 <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
                    <p>© 2018-2025 Bybit.com. All rights reserved.</p>
                    <div className="flex gap-4 mt-2 sm:mt-0">
                        <a href="#" className="hover:text-gray-300">Terms of Service</a>
                        <a href="#" className="hover:text-gray-300">Privacy Terms</a>
                    </div>
                 </div>
            </div>
        </footer>
    )
};

export function BybitPage({ setMainView }) {
  return (
    <div className="bg-[#0D0D0D] text-gray-300 font-sans antialiased">
      <Header setMainView={setMainView} />
      <main>
        <Hero />
        <SectionBringNextLevel />
        <SectionHowToConnect />
        <SectionFeatures />
        <SectionDesktopApp />
        <SectionFaq />
      </main>
      <Footer />
    </div>
  );
}