const WelcomeModal = ({ onAgree, t }: { onAgree: () => void; t: any }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            type: 'intro',
            title: "今日菜單懶人包",
            subtitle: "點餐模擬系統",
            description: "歡迎使用我們的線上點餐模擬系統，輕鬆瀏覽今日特色餐點",
            bgColor: "bg-gradient-to-br from-blue-600 to-purple-700",
            textColor: "text-white"
        },
        {
            type: 'todaySpecial',
            title: "今日主廚推薦",
            items: [
                { name: "板腱牛排 (Top Blade)", price: "NT$ 380", desc: "鮮嫩多汁，口感豐富", tag: "本日特選" },
                { name: "上蓋牛排 (Ribeye Cap)", price: "NT$ 450", desc: "油花均勻，入口即化", tag: "人氣首選" },
                { name: "經典義大利麵", price: "NT$ 220", desc: "濃郁醬汁，道地風味", tag: "超值推薦" }
            ],
            bgColor: "bg-gradient-to-br from-amber-500 to-orange-600",
            textColor: "text-white"
        },
        {
            type: 'quickGuide',
            title: "快速點餐指南",
            steps: [
                { icon: "🍽️", text: "瀏覽今日菜單分類" },
                { icon: "📝", text: "選擇喜愛的餐點與客製化選項" },
                { icon: "🛒", text: "加入購物車並確認訂單" },
                { icon: "🖨️", text: "列印訂單完成點餐" }
            ],
            bgColor: "bg-gradient-to-br from-green-500 to-emerald-600",
            textColor: "text-white"
        },
        {
            type: 'features',
            title: "系統特色",
            features: [
                "即時菜單更新",
                "多語言支援 (中/英文)",
                "客製化餐點選項", 
                "訂單查詢功能",
                "一鍵重新整理"
            ],
            bgColor: "bg-gradient-to-br from-slate-800 to-slate-900",
            textColor: "text-white"
        },
        {
            type: 'rules',
            title: t.welcomeTitle,
            content: t.welcomeContent,
            bgColor: "bg-white",
            textColor: "text-slate-800"
        }
    ];

    // 自動輪播效果
    useEffect(() => {
        const timer = setInterval(() => {
            if (currentSlide < slides.length - 1) {
                setCurrentSlide(prev => prev + 1);
            }
        }, 4000); // 每4秒切換
        return () => clearInterval(timer);
    }, [currentSlide, slides.length]);

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(0, prev - 1));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex justify-center items-center p-4">
            <div className="relative w-full max-w-4xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* 進度指示器 */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
                    {slides.map((_, idx) => (
                        <div 
                            key={idx}
                            className={`h-1 rounded-full transition-all duration-300 ${
                                currentSlide === idx ? 'bg-white w-8' : 'bg-white/50 w-4'
                            }`}
                        />
                    ))}
                </div>

                {/* 輪播內容 */}
                <div className="flex-1 relative overflow-hidden">
                    <div 
                        className="absolute inset-0 flex transition-transform duration-500 ease-in-out h-full"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {slides.map((slide, index) => (
                            <div key={index} className={`w-full h-full flex-shrink-0 flex flex-col justify-center items-center p-8 text-center ${slide.bgColor} ${slide.textColor}`}>
                                
                                {/* 介紹頁 */}
                                {slide.type === 'intro' && (
                                    <>
                                        <div className="mb-6 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                                            <div className="text-6xl mb-4">🍽️</div>
                                            <h2 className="text-5xl font-extrabold mb-4 tracking-tight">{slide.title}</h2>
                                            <p className="text-2xl opacity-90 mb-2">{slide.subtitle}</p>
                                            <p className="text-lg opacity-80">{slide.description}</p>
                                        </div>
                                        <p className="mt-8 text-sm opacity-70 animate-pulse">滑動或點擊按鈕繼續探索</p>
                                    </>
                                )}

                                {/* 今日推薦 */}
                                {slide.type === 'todaySpecial' && (
                                    <>
                                        <h2 className="text-4xl font-bold mb-8">{slide.title}</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                                            {slide.items?.map((item, idx) => (
                                                <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:scale-105 transition-transform">
                                                    <div className="inline-block bg-yellow-500 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-3">
                                                        {item.tag}
                                                    </div>
                                                    <div className="text-2xl font-bold mb-2">{item.name}</div>
                                                    <div className="text-lg font-semibold mb-2">{item.price}</div>
                                                    <div className="text-sm opacity-90">{item.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* 快速指南 */}
                                {slide.type === 'quickGuide' && (
                                    <>
                                        <h2 className="text-4xl font-bold mb-8">{slide.title}</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                                            {slide.steps?.map((step, idx) => (
                                                <div key={idx} className="flex items-center gap-4 bg-white/10 p-6 rounded-xl hover:bg-white/20 transition-colors">
                                                    <span className="text-3xl">{step.icon}</span>
                                                    <div className="text-left">
                                                        <div className="font-bold text-lg">步驟 {idx + 1}</div>
                                                        <div className="text-sm opacity-90">{step.text}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* 系統特色 */}
                                {slide.type === 'features' && (
                                    <>
                                        <h2 className="text-4xl font-bold mb-8">{slide.title}</h2>
                                        <div className="space-y-4 text-left w-full max-w-md">
                                            {slide.features?.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-4 bg-white/10 p-4 rounded-lg">
                                                    <span className="text-green-400 text-xl">✓</span>
                                                    <span className="text-lg font-medium">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* 規則頁 */}
                                {slide.type === 'rules' && (
                                    <>
                                        <div className="w-full max-w-2xl">
                                            <h2 className="text-4xl font-bold mb-6 text-slate-800 border-b-4 border-green-500 pb-2">{slide.title}</h2>
                                            <div className="text-slate-600 space-y-4 text-left text-lg mb-8 bg-slate-50 p-8 rounded-2xl border border-slate-200">
                                                {slide.content?.map((line: string, idx: number) => (
                                                    <p key={idx} className="flex items-start gap-3">
                                                        <span className="text-green-500 mt-1 text-xl">•</span>
                                                        <span className="leading-relaxed">{line.replace(/^＊/, '')}</span>
                                                    </p>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={onAgree} 
                                                className="w-full bg-green-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-green-700 transition-all shadow-lg transform hover:scale-105 text-xl"
                                            >
                                                {t.welcomeAgree}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 導航控制 */}
                <div className="h-20 bg-white/10 backdrop-blur-sm border-t border-white/20 flex items-center justify-between px-8">
                    <button 
                        onClick={prevSlide} 
                        disabled={currentSlide === 0}
                        className="flex items-center gap-2 text-white/80 hover:text-white disabled:opacity-30 font-semibold text-lg transition-colors"
                    >
                        ← 上一頁
                    </button>
                    
                    <div className="flex gap-3">
                        {slides.map((_, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setCurrentSlide(idx)}
                                className={`w-3 h-3 rounded-full transition-all ${
                                    currentSlide === idx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
                                }`}
                            />
                        ))}
                    </div>
                    
                    <button 
                        onClick={nextSlide} 
                        disabled={currentSlide === slides.length - 1}
                        className="flex items-center gap-2 text-white/80 hover:text-white disabled:opacity-30 font-semibold text-lg transition-colors"
                    >
                        {currentSlide === slides.length - 1 ? '開始點餐 →' : '下一頁 →'}
                    </button>
                </div>
            </div>
        </div>
    );
};
