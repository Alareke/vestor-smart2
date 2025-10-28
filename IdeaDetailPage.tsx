

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, MoreHorizontal, MessageSquare, Rocket, Bookmark, CheckCircle, Smile, Clock, Send, Globe, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

export const IdeaDetailPage = ({ idea, allIdeas, onBack }) => {
    const { language, t } = useLanguage();
    const [isFollowed, setIsFollowed] = useState(false);
    const [likes, setLikes] = useState(idea?.likes || 0);
    const [isLiked, setIsLiked] = useState(false);
    const BackIcon = language === 'ar' ? ArrowRight : ArrowLeft;

    const getYoutubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
        return null;
    };
    
    const embedUrl = getYoutubeEmbedUrl(idea?.videoUrl);
    const relatedIdeas = allIdeas.filter(i => i.id !== idea?.id).slice(0, 5);
    
    const handleLike = () => {
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
        setIsLiked(prev => !prev);
    };

    if (!idea) {
        return (
            <div className="p-8 text-center">
                <p>{t('idea_not_found')}</p>
                <button
                    onClick={onBack}
                    className="mt-4 bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                >
                    {t('idea_detail_back')}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 animate-fadeIn">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold mb-6"
            >
                <BackIcon size={20} />
                {t('idea_detail_back')}
            </button>
            
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${language === 'ar' ? 'lg:grid-flow-col-dense' : ''}`}>
                
                {/* Main Content */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                        {/* Header */}
                        <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <img src={idea.authorAvatarUrl} alt={idea.author} className="w-12 h-12 rounded-full" loading="lazy" decoding="async" />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{idea.author}</p>
                                    <span className="text-sm text-gray-500">{idea.date}</span>
                                </div>
                            </div>
                            <button onClick={() => setIsFollowed(!isFollowed)} className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${isFollowed ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                {isFollowed ? t('idea_detail_following') : t('idea_detail_follow')}
                            </button>
                        </div>

                        {/* Stats Bar */}
                        <div className="flex flex-wrap gap-x-6 gap-y-3 justify-between items-center border-y border-gray-200 dark:border-gray-800 py-2 my-4 text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-1.5"><Eye size={18} /> {idea.views}</span>
                                <span className="flex items-center gap-1.5"><MessageSquare size={18} /> {idea.comments}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button title="Options" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><MoreHorizontal size={20}/></button>
                                <button title={t('idea_detail_get_chart')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><Globe size={20}/></button>
                                <button onClick={handleLike} title={t('like_tooltip')} className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${isLiked ? 'text-green-500' : ''}`}>
                                    <Rocket size={20} className={isLiked ? 'fill-current' : ''} /> {likes}
                                </button>
                                <button title={t('idea_detail_save')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><Bookmark size={20}/></button>
                            </div>
                        </div>

                        {/* Media and Content */}
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{idea.title}</h1>
                        
                        {idea.mediaType === 'video' && idea.img ? (
                            <div className="aspect-video mb-6 bg-black rounded-lg">
                                <video src={idea.img} controls className="w-full h-full rounded-lg" />
                            </div>
                        ) : embedUrl ? (
                             <div className="aspect-video mb-6">
                                <iframe src={embedUrl} title={idea.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full rounded-lg"></iframe>
                            </div>
                        ) : (
                            <img src={idea.img || DEFAULT_NEWS_IMAGE_URL} alt={idea.title} className="w-full h-auto rounded-lg mb-6" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL; }}/>
                        )}
                       
                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-8" dangerouslySetInnerHTML={{ __html: idea.description.replace(/\n/g, '<br />') }} />

                        {/* Updates Timeline */}
                        {idea.updates && idea.updates.length > 0 && (
                            <div className="mt-8">
                                {idea.updates.map((update, index) => (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div className="flex flex-col items-center">
                                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>
                                            <div className="text-xs text-gray-500">{update.date}</div>
                                        </div>
                                        <div className={`mt-5 p-3 rounded-lg text-sm font-semibold w-full ${update.status === 'target_reached' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 flex items-center gap-2' : ''}`}>
                                            {update.status === 'target_reached' && <CheckCircle size={16} />}
                                            {update.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Comments */}
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('idea_detail_comments_title', { count: idea.commentsData?.length || 0 })}</h2>
                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    <textarea placeholder={t('idea_detail_comment_placeholder')} rows={3} className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"></textarea>
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2 text-gray-500">
                                            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><Smile size={18}/></button>
                                            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><Clock size={18}/></button>
                                        </div>
                                        <button className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                            <Send size={16} />{t('idea_detail_post_comment')}
                                        </button>
                                    </div>
                                </div>
                                {idea.commentsData?.map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                        <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full" loading="lazy" decoding="async" />
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900 dark:text-white">{comment.author}</span>
                                                <span className="text-xs text-gray-500">{comment.date}</span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-8 lg:sticky top-20 self-start">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">.Markets move fast - so should you</p>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 my-2 space-y-1">
                            <li>Stay updated in real-time 📊</li>
                            <li>Follow high-probability signals 🎯</li>
                            <li>Get expert coaching as you trade 👨‍🏫</li>
                        </ul>
                        <a href="https://t.me/+uABMipHR63U0NGE1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline text-sm">
                            <ExternalLink size={14}/> Tap to join now
                        </a>
                    </div>
                    
                    {idea.tags && idea.tags.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{t('idea_detail_tags_title')}</h3>
                            <div className="flex flex-wrap gap-2">
                                {idea.tags.map(tag => (
                                    <span key={tag} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-full">{tag.startsWith('tag_') ? t(tag) : tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {relatedIdeas.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{t('idea_detail_related_posts')}</h3>
                            <div className="space-y-4">
                                {relatedIdeas.map(related => (
                                    <div key={related.id} className="cursor-pointer">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400">{related.title}</p>
                                        <p className="text-xs text-gray-500">{related.author} • {related.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

            </div>
        </div>
    );
};