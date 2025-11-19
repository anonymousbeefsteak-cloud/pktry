
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { apiService } from './services/apiService';
import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { ItemModal } from './components/ItemModal';
import { AdminPanel } from './components/AdminPanel';
import { PrintableOrder } from './components/PrintableOrder';
import { RefreshIcon, SearchIcon, CartIcon, CloseIcon, MinusIcon, PlusIcon } from './components/Icons';
import { TRANSLATIONS } from './constants';
import { MenuItem, MenuCategory, Addon, OptionsData, CartItem, Order, SearchOrderParams, OrderSummary } from './types';

// --- Small Helper Modals defined locally for simplicity ---

const OrderQueryModal = ({ isOpen, onClose, t }: { isOpen: boolean; onClose: () => void; t: any }) => {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [searchResult, setSearchResult] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchOrderParams>({ name: '', phone: '', startDate: '', endDate: '' });
  const [advancedResults, setAdvancedResults] = useState<OrderSummary[] | null>(null);
  
  useEffect(() => {
    if (!isOpen) { 
        setTimeout(() => { 
            setOrderIdInput(''); 
            setSearchResult(null); 
            setError(null); 
            setIsLoading(false); 
            setIsAdvancedSearch(false);
            setSearchParams({ name: '', phone: '', startDate: '', endDate: '' });
            setAdvancedResults(null);
        }, 300);
    }
  }, [isOpen]);

  const handleGetOrderDetails = async (id: string) => {
    if (!id) return; 
    setIsLoading(true); setError(null); setSearchResult(null);
    const result = await apiService.getOrder(id.trim());
    if (result.success && result.order) { 
        setSearchResult(result.order); 
        setOrderIdInput(id); 
    } else { 
        setError(result.message || '找不到此訂單，請確認訂單編號。'); 
    }
    setIsLoading(false);
  };

  const handleAdvancedSearch = async () => {
      setIsLoading(true); setError(null); setAdvancedResults(null);
      try {
          const result = await apiService.searchOrders(searchParams);
          if (result.success) {
              if (result.orders.length === 0) setError('找不到符合條件的訂單');
              else setAdvancedResults(result.orders);
          } else {
              setError('搜尋失敗，請稍後再試');
          }
      } catch (e) {
          setError('發生錯誤');
      }
      setIsLoading(false);
  };
  
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <header className="p-5 relative border-b"><button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><CloseIcon /></button><h2 className="text-2xl font-bold text-slate-800">{t.orderQueryTitle}</h2></header>
            <main className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
                {!isAdvancedSearch ? (
                    <>
                        <form onSubmit={(e) => { e.preventDefault(); handleGetOrderDetails(orderIdInput); }} className="flex gap-2"><input type="text" value={orderIdInput} onChange={(e) => setOrderIdInput(e.target.value)} placeholder={t.orderIdPlaceholder} className="flex-grow p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" /><button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center justify-center disabled:bg-slate-400">{isLoading ? '...' : <SearchIcon />}</button></form>
                        <div className="text-center mt-4">
                            <button onClick={() => setIsAdvancedSearch(true)} className="text-green-600 text-sm hover:underline">{t.advancedSearch} ↓</button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-slate-700">{t.advancedSearch}</h3>
                            <button onClick={() => setIsAdvancedSearch(false)} className="text-slate-500 text-xs hover:text-slate-700">{t.hideAdvancedSearch}</button>
                        </div>
                        <input type="text" placeholder={t.customerName} value={searchParams.name} onChange={e => setSearchParams({...searchParams, name: e.target.value})} className="w-full p-2 border rounded text-sm" />
                        <input type="tel" placeholder={t.customerPhone} value={searchParams.phone} onChange={e => setSearchParams({...searchParams, phone: e.target.value})} className="w-full p-2 border rounded text-sm" />
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>{t.dateRange}:</span>
                            <input type="date" value={searchParams.startDate} onChange={e => setSearchParams({...searchParams, startDate: e.target.value})} className="p-1 border rounded flex-1" />
                            <span>{t.to}</span>
                            <input type="date" value={searchParams.endDate} onChange={e => setSearchParams({...searchParams, endDate: e.target.value})} className="p-1 border rounded flex-1" />
                        </div>
                        <button onClick={handleAdvancedSearch} disabled={isLoading} className="w-full bg-slate-700 text-white py-2 rounded hover:bg-slate-800 disabled:opacity-50">{isLoading ? '...' : t.searchButton}</button>
                    </div>
                )}

                {error && <p className="text-red-500 text-center font-semibold py-2">{error}</p>}
                
                {advancedResults && (
                    <div className="border rounded-lg overflow-hidden mt-4">
                        <div className="bg-slate-100 px-3 py-2 font-bold text-sm text-slate-700">{t.searchResults} ({advancedResults.length})</div>
                        <div className="max-h-40 overflow-y-auto divide-y">
                            {advancedResults.map(order => (
                                <div key={order.id} onClick={() => handleGetOrderDetails(order.id)} className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">{order.customerName || 'Guest'}</div>
                                        <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono text-xs text-slate-400">{order.id.slice(-6)}</div>
                                        <div className="font-bold text-green-700 text-sm">${order.totalPrice}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {searchResult && (<div className="bg-slate-50 p-4 rounded-lg border space-y-2 mt-4"><h3 className="text-lg font-bold text-slate-800 text-center mb-3">{t.orderDetails}</h3><p className="font-mono font-bold text-slate-800 text-center">{searchResult.id}</p><p className="text-center text-green-700 font-bold">{searchResult.status}</p><p className="text-center text-sm">{new Date(searchResult.createdAt).toLocaleString()}</p><div className="border-t pt-2">{(searchResult.items || []).map((item, i) => (<p key={i} className="text-sm">{item.item.name} x{item.quantity}</p>))}</div></div>)}
            </main>
        </div>
    </div>
  );
};

const WelcomeModal = ({ onAgree, t }: { onAgree: () => void; t: any }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            type: 'intro',
            title: "今日菜單懶人包",
            subtitle: "點餐模擬頁面",
            bgColor: "bg-slate-900",
            textColor: "text-white"
        },
        {
            type: 'feature',
            title: "人氣推薦 (Popular)",
            items: [
                { name: "板腱牛排 (Top Blade)", desc: "鮮嫩多汁，口感豐富" },
                { name: "上蓋牛排 (Ribeye Cap)", desc: "油花均勻，入口即化" }
            ],
            bgColor: "bg-green-800",
            textColor: "text-white"
        },
        {
            type: 'guide',
            title: "點餐懶人包 (Guide)",
            steps: [
                "1. 選擇主餐 (Choose Meal)",
                "2. 選擇熟度與醬料 (Doneness & Sauce)",
                "3. 升級套餐更划算 (Upgrade to Set)"
            ],
            bgColor: "bg-orange-700",
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

    useEffect(() => {
        const timer = setInterval(() => {
            // Don't auto advance on the last slide (rules)
            if (currentSlide < slides.length - 1) {
                setCurrentSlide(prev => prev + 1);
            }
        }, 5000);
        return () => clearInterval(timer);
    }, [currentSlide, slides.length]);

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(0, prev - 1));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex justify-center items-center p-4">
            <div className="relative w-full max-w-2xl h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Carousel Content */}
                <div className="flex-1 relative overflow-hidden">
                    <div 
                        className="absolute inset-0 flex transition-transform duration-500 ease-in-out h-full"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {slides.map((slide, index) => (
                            <div key={index} className={`w-full h-full flex-shrink-0 flex flex-col justify-center items-center p-8 text-center ${slide.bgColor} ${slide.textColor}`}>
                                {slide.type === 'intro' && (
                                    <>
                                        <div className="mb-6 p-4 rounded-full bg-white/10 backdrop-blur-sm">
                                            <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-6 4a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                                        </div>
                                        <h2 className="text-4xl font-extrabold mb-4 tracking-tight">{slide.title}</h2>
                                        <p className="text-xl opacity-80">{slide.subtitle}</p>
                                        <p className="mt-8 text-sm opacity-60">點擊下方按鈕或滑動查看更多</p>
                                    </>
                                )}
                                {slide.type === 'feature' && (
                                    <>
                                        <h2 className="text-3xl font-bold mb-8">{slide.title}</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                            {slide.items?.map((item, idx) => (
                                                <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                                                    <div className="text-xl font-bold mb-2">{item.name}</div>
                                                    <div className="text-sm opacity-80">{item.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {slide.type === 'guide' && (
                                    <>
                                        <h2 className="text-3xl font-bold mb-8">{slide.title}</h2>
                                        <div className="space-y-4 text-left w-full max-w-md">
                                            {slide.steps?.map((step, idx) => (
                                                <div key={idx} className="flex items-center gap-4 bg-white/10 p-4 rounded-lg">
                                                    <span className="flex-shrink-0 w-8 h-8 bg-white text-orange-700 rounded-full flex items-center justify-center font-bold">{idx + 1}</span>
                                                    <span className="text-lg font-medium">{step.slice(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {slide.type === 'rules' && (
                                    <>
                                        <h2 className="text-3xl font-bold mb-6 text-slate-800 border-b-4 border-green-500 pb-2">{slide.title}</h2>
                                        <div className="text-slate-600 space-y-4 text-left text-lg mb-8 bg-slate-50 p-6 rounded-xl w-full">
                                            {slide.content?.map((line: string, idx: number) => (
                                                <p key={idx} className="flex items-start gap-2">
                                                    <span className="text-green-500 mt-1">✓</span>
                                                    {line.replace(/^＊/, '')}
                                                </p>
                                            ))}
                                        </div>
                                        <button onClick={onAgree} className="w-full bg-green-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-green-700 transition-all shadow-lg transform hover:scale-105 text-xl">
                                            {t.welcomeAgree}
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="h-16 bg-white border-t flex items-center justify-between px-6">
                    <div className="flex gap-2">
                        {slides.map((_, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setCurrentSlide(idx)}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${currentSlide === idx ? 'bg-slate-800' : 'bg-slate-300'}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={prevSlide} 
                            disabled={currentSlide === 0}
                            className="text-slate-400 hover:text-slate-800 disabled:opacity-30 font-bold"
                        >
                            PREV
                        </button>
                        <button 
                            onClick={nextSlide} 
                            disabled={currentSlide === slides.length - 1}
                            className="text-slate-800 hover:text-green-600 disabled:opacity-30 font-bold"
                        >
                            NEXT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GuestCountModal = ({ onConfirm, t }: { onConfirm: (count: number) => void; t: any }) => {
    const [count, setCount] = useState(1);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xs" onClick={e => e.stopPropagation()}><div className="p-6 text-center"><h2 className="text-2xl font-bold text-slate-800 mb-4">{t.guestCountTitle}</h2><div className="flex items-center justify-center gap-4 my-6"><button onClick={() => setCount(c => Math.max(1, c - 1))} className="p-3 rounded-full bg-slate-200 hover:bg-slate-300"><MinusIcon className="h-6 w-6" /></button><input type="number" value={count} onChange={e => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-24 text-center text-4xl font-bold border-b-2 border-slate-300 focus:border-green-500 outline-none" min="1" /><button onClick={() => setCount(c => c + 1)} className="p-3 rounded-full bg-slate-200 hover:bg-slate-300"><PlusIcon className="h-6 w-6" /></button></div></div><footer className="px-6 pb-6"><button onClick={() => { if(count>0) onConfirm(count); }} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-lg">{t.guestCountConfirm}</button></footer></div>
        </div>
    );
};

// --- Main App Component ---

const App = () => {
    const [language, setLanguage] = useState<'zh' | 'en'>('zh');
    const [menuData, setMenuData] = useState<MenuCategory[]>([]);
    const [addons, setAddons] = useState<Addon[]>([]);
    const [options, setOptions] = useState<OptionsData>({ sauces: [], dessertsA: [], dessertsB: [], pastasA: [], pastasB: [], coldNoodles: [], simpleMeals: [] });
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ item: MenuItem; category: string } | null>(null);
    const [editingItem, setEditingItem] = useState<CartItem | null>(null);
    const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [showGuestCountModal, setShowGuestCountModal] = useState(false);
    const [guestCount, setGuestCount] = useState(1);
    const [isQuietHours, setIsQuietHours] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    
    const printContainerRef = useRef<HTMLElement | null>(null);
    const t = TRANSLATIONS[language];

    useEffect(() => {
        printContainerRef.current = document.getElementById('print-container');
        
        // When the app loads or admin mode changes, verify if we need to clear data
        // Ideally, we only keep cart if we are NOT on the welcome screen.
        // However, for reload safety, we usually keep it.
        // BUT, per user request: "Data... not exist in temporary storage". 
        // We will clear localStorage whenever the Welcome screen is active.
        if (showWelcome) {
            localStorage.removeItem('steakhouse_cart');
            setCartItems([]);
        } else {
            const storedCart = localStorage.getItem('steakhouse_cart');
            if (storedCart) { try { setCartItems(JSON.parse(storedCart)); } catch (e) { localStorage.removeItem('steakhouse_cart'); } }
        }
        
        fetchData();
    }, [isAdminOpen, language, showWelcome]); 

    // Strict Privacy: Only save to local storage if we are past the welcome screen
    useEffect(() => { 
        if (!showWelcome) {
            localStorage.setItem('steakhouse_cart', JSON.stringify(cartItems)); 
        }
    }, [cartItems, showWelcome]);

    const fetchData = async () => {
        setIsLoading(true);
        try { 
            const { menu, addons, options, isQuietHours } = await apiService.getMenuAndAddons(language); 
            setMenuData(menu); 
            setAddons(addons); 
            setOptions(options); 
            setIsQuietHours(isQuietHours); 
        } catch (error) { 
            console.error("Failed to fetch data:", error); 
        } finally { 
            setIsLoading(false); 
        }
    };

    const handleSelectItem = (item: MenuItem, category: MenuCategory) => { setSelectedItem({ item, category: category.title }); setEditingItem(null); };
    const handleEditItem = (cartId: string) => { 
        const itemToEdit = cartItems.find(item => item.cartId === cartId); 
        if (itemToEdit) { 
            setSelectedItem({ item: itemToEdit.item, category: itemToEdit.categoryTitle }); 
            setEditingItem(itemToEdit); 
            setIsCartOpen(false); 
        } 
    };
    const handleCloseModal = () => { setSelectedItem(null); setEditingItem(null); };

    const handleConfirmSelection = (item: MenuItem, quantity: number, selections: any, categoryTitle: string) => {
        const createCartKey = (itemData: MenuItem, selectionData: any) => [
            itemData.id, 
            JSON.stringify(selectionData.donenesses), 
            JSON.stringify(selectionData.componentChoices), 
            JSON.stringify(selectionData.multiChoice), 
            JSON.stringify(selectionData.sideChoices), 
            JSON.stringify(selectionData.singleChoiceAddon), 
            JSON.stringify(selectionData.notes), 
            JSON.stringify((selectionData.sauces || []).map((s: any) => `${s.name}x${s.quantity}`).sort()), 
            JSON.stringify(Object.entries(selectionData.drinks || {}).sort()), 
            JSON.stringify((selectionData.desserts || []).map((s: any) => `${s.name}x${s.quantity}`).sort()), 
            JSON.stringify((selectionData.pastas || []).map((s: any) => `${s.name}x${s.quantity}`).sort()), 
            JSON.stringify((selectionData.addons || []).map((a: any) => `${a.id}x${a.quantity}`).sort())
        ].join('|');
        
        const cartKey = createCartKey(item, selections);
        const totalPrice = (item.price * quantity) + (selections.addons || []).reduce((sum: number, addon: any) => sum + addon.price * addon.quantity, 0);

        const newCartItem: CartItem = { 
            cartId: editingItem ? editingItem.cartId : `${Date.now()}-${Math.random()}`, 
            cartKey, 
            item, 
            quantity, 
            categoryTitle, 
            selectedDonenesses: selections.donenesses, 
            selectedDrinks: selections.drinks, 
            selectedAddons: selections.addons, 
            selectedSauces: selections.sauces, 
            selectedDesserts: selections.desserts, 
            selectedPastas: selections.pastas, 
            selectedComponent: selections.componentChoices, 
            selectedSideChoices: selections.sideChoices, 
            selectedMultiChoice: selections.multiChoice, 
            selectedSingleChoiceAddon: selections.singleChoiceAddon, 
            selectedNotes: selections.notes, 
            totalPrice 
        };
        
        if (editingItem) { 
            setCartItems(prev => prev.map(ci => ci.cartId === editingItem.cartId ? newCartItem : ci)); 
        } else { 
            setCartItems(prev => { 
                const existingItem = prev.find(ci => ci.cartKey === cartKey); 
                if (existingItem) return prev.map(ci => ci.cartKey === cartKey ? { ...ci, quantity: ci.quantity + quantity, totalPrice: ci.totalPrice + totalPrice } : ci); 
                return [...prev, newCartItem]; 
            }); 
        }
        handleCloseModal();
    };

    const handleUpdateQuantity = (cartId: string, newQuantity: number) => {
        setCartItems(prev => {
          if (newQuantity <= 0) return prev.filter(item => item.cartId !== cartId);
          return prev.map(item => {
            if (item.cartId !== cartId) return item;
            const oldQuantity = item.quantity; if (oldQuantity === newQuantity) return item;
            const scale = newQuantity / oldQuantity;
            
            const scaleAndAdjust = (obj: any, targetTotal: number) => {
              if (!obj || Object.keys(obj).length === 0) return obj;
              const scaled = Object.entries(obj).map(([key, value]) => ({ key, value: (value as number) * scale }));
              const rounded = scaled.map(pair => ({ ...pair, value: Math.round(pair.value) }));
              let currentTotal = rounded.reduce((sum, pair) => sum + pair.value, 0);
              let diff = targetTotal - currentTotal;
              while (diff !== 0) {
                const errors = scaled.map((s, i) => ({ index: i, error: s.value - rounded[i].value }));
                if (diff > 0) { errors.sort((a, b) => b.error - a.error); rounded[errors[0].index].value++; diff--; } 
                else { errors.sort((a, b) => a.error - b.error); const targetIndex = errors.findIndex(e => rounded[e.index].value > 0); if (targetIndex !== -1) rounded[errors[targetIndex].index].value--; else break; diff++; }
              }
              return Object.fromEntries(rounded.filter(pair => pair.value > 0).map(pair => [pair.key, pair.value]));
            };
            const scaleArrayQuantities = (arr: any[]) => { if (!arr || arr.length === 0) return arr; return arr.map(subItem => ({ ...subItem, quantity: Math.max(1, Math.round(subItem.quantity * scale)) })).filter(si => si.quantity > 0); };
            const custom = item.item.customizations;
            return { 
                ...item, 
                quantity: newQuantity, 
                totalPrice: (item.totalPrice / oldQuantity) * newQuantity, 
                selectedDonenesses: custom.doneness ? scaleAndAdjust(item.selectedDonenesses, newQuantity) : item.selectedDonenesses, 
                selectedDrinks: custom.drinkChoice ? scaleAndAdjust(item.selectedDrinks, newQuantity) : item.selectedDrinks, 
                selectedComponent: custom.componentChoice ? scaleAndAdjust(item.selectedComponent, newQuantity) : item.selectedComponent, 
                selectedMultiChoice: custom.multiChoice ? scaleAndAdjust(item.selectedMultiChoice, newQuantity) : item.selectedMultiChoice, 
                selectedSideChoices: custom.sideChoice ? scaleAndAdjust(item.selectedSideChoices, custom.sideChoice.choices * newQuantity) : item.selectedSideChoices, 
                selectedSauces: scaleArrayQuantities(item.selectedSauces), 
                selectedDesserts: scaleArrayQuantities(item.selectedDesserts), 
                selectedPastas: scaleArrayQuantities(item.selectedPastas), 
                selectedAddons: scaleArrayQuantities(item.selectedAddons) 
            };
          });
        });
    };

    const handleRemoveItem = (cartId: string) => setCartItems(prev => prev.filter(item => item.cartId !== cartId));
    
    const handleWelcomeAgree = () => { 
        // Ensure we start fresh when user agrees
        localStorage.removeItem('steakhouse_cart');
        setCartItems([]);
        setShowWelcome(false); 
        setShowGuestCountModal(true); 
    };
    
    const handleGuestCountConfirm = (count: number) => { setGuestCount(count); setShowGuestCountModal(false); };

    const handleSubmitAndPrint = async (orderData: Partial<Order>) => {
        if (isSubmitting) return; setIsSubmitting(true);
        try {
            const finalOrderData = { ...orderData, guestCount };
            const result = await apiService.submitOrder(finalOrderData);
            if (result.success && result.order) { 
                setOrderToPrint(result.order); 
            } else { 
                alert((!result.success && result.message) || 'Order failed.'); 
                setIsSubmitting(false); 
            }
        } catch (error: any) { 
            alert(`Error: ${error.message}`); 
            setIsSubmitting(false); 
        }
    };

    const handleNavigateToAdmin = () => { 
        const password = prompt("請輸入管理員密碼以進入後台 (Enter Admin Password):", ""); 
        if (password === "@Howardwang5172") setIsAdminOpen(true); 
        else if (password !== null) alert("密碼錯誤"); 
    };
    const toggleLanguage = () => { 
        setLanguage(prev => prev === 'zh' ? 'en' : 'zh'); 
        setCartItems([]); setIsCartOpen(false); 
    };

    useEffect(() => {
        if (orderToPrint) {
          const handleAfterPrint = () => { 
              setOrderToPrint(null); 
              // STRICT CLEARING LOGIC HERE
              setCartItems([]); 
              localStorage.removeItem('steakhouse_cart'); // Explicit delete
              setIsCartOpen(false); 
              setShowWelcome(true); // Go back to carousel
              setGuestCount(1); 
              setIsSubmitting(false); 
              window.removeEventListener('afterprint', handleAfterPrint); 
          };
          window.addEventListener('afterprint', handleAfterPrint);
          const timer = setTimeout(() => window.print(), 150);
          return () => { clearTimeout(timer); window.removeEventListener('afterprint', handleAfterPrint); };
        }
    }, [orderToPrint]);
    
    const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (isAdminOpen) return <AdminPanel onBack={() => setIsAdminOpen(false)} />;
    if (showWelcome) return <WelcomeModal onAgree={handleWelcomeAgree} t={t} />;
    if (showGuestCountModal) return <GuestCountModal onConfirm={handleGuestCountConfirm} t={t} />;

    return (
        <div className="flex min-h-screen">
          <aside className="no-print w-64 bg-white shadow-lg fixed top-0 left-0 h-full overflow-y-auto hidden lg:block">
            <div className="p-6"><h1 className="text-2xl font-bold text-green-700 cursor-pointer select-none" onDoubleClick={handleNavigateToAdmin} title="雙擊進入管理後台">{t.title}</h1></div>
            <nav className="mt-4"><ul>{menuData.map((category) => (<li key={category.title}><a href={`#${category.title}`} className="block px-6 py-3 text-slate-600 font-semibold hover:bg-slate-100 hover:text-green-700 transition-colors">{category.title}</a></li>))}</ul></nav>
          </aside>
          <main className="lg:ml-64 flex-1">
            <header className="no-print bg-white/80 backdrop-blur-sm p-4 shadow-md sticky top-0 z-20 flex justify-between items-center">
                <div className="flex items-center gap-4"><h1 className="text-xl font-bold text-green-700 lg:hidden cursor-pointer select-none" onDoubleClick={handleNavigateToAdmin}>{t.title}</h1><button onClick={toggleLanguage} className="text-sm font-bold text-slate-600 border border-slate-300 rounded px-3 py-1 hover:bg-slate-100">{language === 'zh' ? 'English' : '中文'}</button></div>
                <div className="flex items-center gap-3"><button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"><RefreshIcon className="h-5 w-5"/><span className="hidden sm:inline">{t.refresh}</span></button><button onClick={() => setIsQueryModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"><SearchIcon /><span className="hidden sm:inline">{t.searchOrder}</span></button></div>
            </header>
            {isQuietHours ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center p-4"><h2 className="text-3xl font-bold text-slate-700 mb-4">{t.shopClosed}</h2><p className="text-slate-500">{t.shopClosedDesc}</p></div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-[calc(100vh-80px)]"><p className="text-slate-500">{t.loading}</p></div>
            ) : (<div className="p-6 lg:p-10"><Menu menuData={menuData} onSelectItem={handleSelectItem} t={t} /></div>)}
          </main>
          {!isQuietHours && (<div className="fixed bottom-6 right-6 z-30 no-print"><button onClick={() => setIsCartOpen(true)} className="bg-green-600 text-white rounded-full shadow-lg p-4 hover:bg-green-700 transition-transform transform hover:scale-110"><CartIcon className="h-8 w-8" />{totalCartItems > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{totalCartItems}</span>}</button></div>)}
          {selectedItem && (<ItemModal selectedItem={selectedItem} editingItem={editingItem} addons={addons} options={options} onClose={handleCloseModal} onConfirmSelection={handleConfirmSelection} t={t} />)}
          <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} onEditItem={handleEditItem} onSubmitAndPrint={handleSubmitAndPrint} isSubmitting={isSubmitting} t={t} />
          {orderToPrint && printContainerRef.current && createPortal(<PrintableOrder order={orderToPrint} />, printContainerRef.current)}
        </div>
    );
};

export default App;
