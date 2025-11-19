
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { apiService } from './services/apiService';
import type { Order, MenuCategory, Addon, SalesStatistics, OptionsData, OrderStatus } from './types';
import { SearchIcon, RefreshIcon, CheckIcon, CloseIcon } from './components/icons';

// --- Icons specific to Admin ---
const HomeIcon = ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const ClipboardListIcon = ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
);
const MenuIcon = ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const ChartBarIcon = ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);
const CogIcon = ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const DownloadIcon = ({ className = "h-5 w-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
);
const UploadIcon = ({ className = "h-5 w-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
);

// --- SUB-COMPONENTS ---

const Dashboard = ({ stats, orders }: { stats: SalesStatistics | null, orders: Order[] }) => {
    const today = new Date().toLocaleDateString('zh-TW');
    const todaysOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString('zh-TW') === today);
    const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (o.status !== '錯誤' ? o.totalPrice : 0), 0);
    const pendingCount = orders.filter(o => o.status === '待店長確認' || o.status === '待處理').length;

    if (!stats) return <div className="p-8 text-center text-slate-500">載入統計數據中...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-green-500">
                    <h3 className="text-sm font-medium text-slate-500 uppercase">今日營業額</h3>
                    <p className="text-3xl font-bold text-slate-800 mt-2">${todaysRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
                    <h3 className="text-sm font-medium text-slate-500 uppercase">今日訂單數</h3>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{todaysOrders.length} <span className="text-sm text-slate-400 font-normal">筆</span></p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-red-500">
                    <h3 className="text-sm font-medium text-slate-500 uppercase">待處理訂單</h3>
                    <p className={`text-3xl font-bold mt-2 ${pendingCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>{pendingCount} <span className="text-sm text-slate-400 font-normal">筆</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 overflow-y-auto">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">熱銷商品 Top 10</h3>
                    <ul className="space-y-3">
                        {stats.popularItems.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center pb-2 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>{idx + 1}</span>
                                    <span className="text-slate-700 font-medium truncate max-w-[150px] sm:max-w-xs">{item.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-slate-800">{item.quantity} 份</span>
                                    <span className="text-xs text-slate-400">${item.revenue.toLocaleString()}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">近七日營收趨勢</h3>
                    <div className="space-y-4">
                        {stats.salesTrend.map((day, idx) => {
                             const maxRev = Math.max(...stats.salesTrend.map(d => d.revenue), 1);
                             const percent = (day.revenue / maxRev) * 100;
                             return (
                                <div key={idx} className="flex items-center gap-4">
                                    <span className="w-16 text-xs text-slate-500 font-mono">{day.date}</span>
                                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden relative">
                                        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                                    </div>
                                    <span className="w-16 text-right text-xs font-bold text-slate-700">${day.revenue}</span>
                                </div>
                             )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrderManager = ({ orders, onStatusUpdate }: { orders: Order[], onStatusUpdate: (id: string, status: OrderStatus) => void }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredOrders = useMemo(() => {
        let result = orders;
        if (filter === 'pending') result = orders.filter(o => o.status === '待店長確認' || o.status === '待處理');
        else if (filter === 'active') result = orders.filter(o => o.status === '製作中' || o.status === '可以取餐');
        else if (filter === 'completed') result = orders.filter(o => o.status === '已完成');

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(o => 
                o.id.toLowerCase().includes(lower) || 
                o.customerInfo.name.toLowerCase().includes(lower) || 
                o.customerInfo.phone.includes(lower)
            );
        }
        return result;
    }, [orders, filter, searchTerm]);

    const statusColors: Record<string, string> = {
        '待店長確認': 'bg-red-100 text-red-700 border-red-200',
        '待處理': 'bg-orange-100 text-orange-700 border-orange-200',
        '製作中': 'bg-blue-100 text-blue-700 border-blue-200',
        '可以取餐': 'bg-green-100 text-green-700 border-green-200',
        '已完成': 'bg-slate-100 text-slate-600 border-slate-200',
        '錯誤': 'bg-gray-200 text-gray-500 border-gray-300 line-through'
    };

    const downloadCSV = () => {
        const headers = ['訂單編號', '時間', '顧客姓名', '電話', '桌號', '總金額', '狀態', '內容摘要'];
        const rows = filteredOrders.map(o => [
            o.id,
            new Date(o.createdAt).toLocaleString('zh-TW'),
            o.customerInfo.name,
            o.customerInfo.phone,
            o.customerInfo.tableNumber || '外帶',
            o.totalPrice,
            o.status,
            o.items.map(i => `${i.item.name} x${i.quantity}`).join('; ')
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-white rounded-lg shadow-sm p-1 border border-slate-200">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>全部</button>
                    <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>待處理</button>
                    <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'active' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>進行中</button>
                    <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>已完成</button>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="搜尋單號/姓名/電話" 
                        className="px-3 py-2 border rounded-md text-sm w-full md:w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button onClick={downloadCSV} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 whitespace-nowrap">
                        <DownloadIcon className="h-4 w-4"/> 匯出 CSV
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-slate-200">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                            <th className="p-4 font-medium text-slate-500 text-sm">時間 / 單號</th>
                            <th className="p-4 font-medium text-slate-500 text-sm">顧客 / 桌號</th>
                            <th className="p-4 font-medium text-slate-500 text-sm">內容摘要</th>
                            <th className="p-4 font-medium text-slate-500 text-sm">總金額</th>
                            <th className="p-4 font-medium text-slate-500 text-sm">狀態</th>
                            <th className="p-4 font-medium text-slate-500 text-sm text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 align-top whitespace-nowrap">
                                    <div className="font-mono font-bold text-slate-700">{order.id.slice(-6)}</div>
                                    <div className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                </td>
                                <td className="p-4 align-top whitespace-nowrap">
                                    <div className="font-medium text-slate-800">{order.customerInfo.name}</div>
                                    <div className="text-xs text-slate-500">{order.orderType} {order.customerInfo.tableNumber ? `(${order.customerInfo.tableNumber})` : ''}</div>
                                    <div className="text-xs text-slate-400">{order.customerInfo.phone}</div>
                                </td>
                                <td className="p-4 align-top max-w-xs">
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        {order.items.map((item, i) => (
                                            <li key={i} className="truncate">
                                                {item.item.name.replace(/套餐|半全餐/g, '')} x{item.quantity}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="p-4 align-top font-bold text-slate-700">${order.totalPrice}</td>
                                <td className="p-4 align-top">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || 'bg-slate-100'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 align-top text-right">
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => onStatusUpdate(order.id, e.target.value as OrderStatus)}
                                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                    >
                                        <option value="待店長確認">待確認</option>
                                        <option value="待處理">待處理</option>
                                        <option value="製作中">製作中</option>
                                        <option value="可以取餐">可取餐</option>
                                        <option value="已完成">已完成</option>
                                        <option value="錯誤">取消/錯誤</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MenuManager = ({ menu, addons, options, onSave }: { menu: MenuCategory[], addons: Addon[], options: OptionsData, onSave: (m: MenuCategory[], a: Addon[], o: OptionsData) => void }) => {
    const [localMenu, setLocalMenu] = useState<MenuCategory[]>(menu);
    const [localAddons, setLocalAddons] = useState<Addon[]>(addons);
    const [localOptions, setLocalOptions] = useState<OptionsData>(options);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync local state if props change (e.g. initial load) but only if we haven't dirtied the state
    useEffect(() => {
        if (!hasChanges) {
            setLocalMenu(menu);
            setLocalAddons(addons);
            setLocalOptions(options);
        }
    }, [menu, addons, options, hasChanges]);

    const handleToggleItem = (id: string) => {
        setHasChanges(true);
        setLocalMenu(prev => prev.map(cat => ({
            ...cat,
            items: cat.items.map(item => item.id === id ? { ...item, isAvailable: !item.isAvailable } : item)
        })));
        setLocalAddons(prev => prev.map(a => a.id === id ? { ...a, isAvailable: !a.isAvailable } : a));
    };

    const handleUpdatePrice = (id: string, newPrice: number) => {
        setHasChanges(true);
        setLocalMenu(prev => prev.map(cat => ({
            ...cat,
            items: cat.items.map(item => item.id === id ? { ...item, price: newPrice } : item)
        })));
        setLocalAddons(prev => prev.map(a => a.id === id ? { ...a, price: newPrice } : a));
    };
    
    const handleToggleOption = (group: keyof OptionsData, name: string) => {
        setHasChanges(true);
        setLocalOptions(prev => ({
            ...prev,
            [group]: prev[group].map(opt => opt.name === name ? { ...opt, isAvailable: !opt.isAvailable } : opt)
        }));
    };

    const handleSave = () => {
        onSave(localMenu, localAddons, localOptions);
        setHasChanges(false);
        alert("菜單變更已儲存！");
    };

    const requestPriceChange = (id: string, currentPrice: number) => {
        const val = prompt("請輸入新價格:", currentPrice.toString());
        if (val !== null && !isNaN(Number(val)) && Number(val) >= 0) {
            handleUpdatePrice(id, Number(val));
        }
    };

    const optionGroups: {key: keyof OptionsData, title: string}[] = [
        { key: 'sauces', title: '醬料選擇' },
        { key: 'dessertsA', title: '甜品 A區' },
        { key: 'dessertsB', title: '甜品 B區' },
        { key: 'pastasA', title: '義麵 主食' },
        { key: 'pastasB', title: '義麵 醬料' },
        { key: 'coldNoodles', title: '涼麵口味' },
        { key: 'simpleMeals', title: '簡餐主餐' },
    ];

    return (
        <div className="space-y-8 relative">
             <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-slate-800">菜單管理</h2>
                 <button 
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`px-6 py-2 rounded-lg font-bold shadow-sm transition-all ${hasChanges ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                 >
                     {hasChanges ? '儲存變更' : '無變更'}
                 </button>
             </div>
            <p className="text-slate-500 text-sm">點擊開關以切換狀態。修改後請務必點擊右上角「儲存變更」。</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {localMenu.map(cat => (
                    <div key={cat.title} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
                            {cat.title}
                            <span className="text-xs font-normal text-slate-400">{cat.items.length} 品項</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {cat.items.map(item => (
                                <div key={item.id} className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${!item.isAvailable ? 'bg-slate-50/50' : ''}`}>
                                    <div className="flex-1">
                                        <div className={`font-medium ${item.isAvailable ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{item.name}</div>
                                        <button 
                                            onClick={() => requestPriceChange(item.id, item.price)}
                                            className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                        >
                                            ${item.price} <span className="text-xs text-slate-400">(點擊修改)</span>
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => handleToggleItem(item.id)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${item.isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-700">
                        加購項目 / 單點
                    </div>
                    <div className="divide-y divide-slate-100">
                         {localAddons.map(addon => (
                             <div key={addon.id} className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${!addon.isAvailable ? 'bg-slate-50/50' : ''}`}>
                                <div className="flex-1">
                                    <div className={`font-medium ${addon.isAvailable ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{addon.name}</div>
                                    <button 
                                        onClick={() => requestPriceChange(addon.id, addon.price)}
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                    >
                                        ${addon.price} <span className="text-xs text-slate-400">(點擊修改)</span>
                                    </button>
                                </div>
                                <button 
                                    onClick={() => handleToggleItem(addon.id)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${addon.isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${addon.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                         ))}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 pl-2 border-l-4 border-orange-400">細項選項管理</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {optionGroups.map(group => (
                        <div key={group.key} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 font-bold text-orange-800 text-sm">
                                {group.title}
                            </div>
                            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                {(localOptions[group.key] || []).map(opt => (
                                    <div key={opt.name} className="flex items-center justify-between p-3 hover:bg-slate-50">
                                        <div className={`text-sm font-medium ${opt.isAvailable ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                                            {opt.name}
                                        </div>
                                        <button 
                                            onClick={() => handleToggleOption(group.key, opt.name)}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${opt.isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${opt.isAvailable ? 'translate-x-5' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Settings = ({ isQuietHours, onToggleQuiet, onBackup, onRestore, onClear }: any) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await onRestore(file);
            alert('資料還原成功！頁面將重新整理。');
            window.location.reload();
        } catch (err) {
            alert('資料還原失敗，請確認檔案格式是否正確。');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">店家休息模式 (Quiet Hours)</h3>
                        <p className="text-sm text-slate-500 mt-1">啟用後，前台點餐頁面將顯示「休息中」並停止接受新訂單。</p>
                    </div>
                     <button 
                        onClick={() => onToggleQuiet(!isQuietHours)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isQuietHours ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isQuietHours ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 text-lg mb-4">資料備份與還原</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={onBackup} className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700">
                        <DownloadIcon className="h-5 w-5"/> 備份資料 (JSON)
                    </button>
                    <div className="relative">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            className="hidden"
                        />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700">
                            <UploadIcon className="h-5 w-5"/> 還原資料
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-100">
                <h3 className="font-bold text-red-800 text-lg mb-2">危險區域</h3>
                <p className="text-sm text-red-600 mb-4">清除所有訂單資料（包含營收統計）。建議在每月結算備份後執行。</p>
                <button onClick={onClear} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    清除所有訂單資料
                </button>
            </div>
        </div>
    );
};

const AdminApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<SalesStatistics | null>(null);
  const [isQuietHours, setIsQuietHours] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState<OptionsData>({ sauces: [], dessertsA: [], dessertsB: [], pastasA: [], pastasB: [], coldNoodles: [], simpleMeals: [] });

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const { menu: m, addons: a, isQuietHours: q, options: o } = await apiService.getMenuAndAddons();
        const allOrders = await apiService.getAllOrders();
        const statistics = await apiService.getSalesStatistics();
        
        setMenu(m);
        setAddons(a);
        setIsQuietHours(q);
        setOptions(o);
        setOrders(allOrders);
        setStats(statistics);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Simple polling for new orders
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (id: string, status: any) => {
      await apiService.updateOrderStatus(id, status);
      fetchData(); // Refresh
  };

  const handleSaveMenu = async (m: MenuCategory[], a: Addon[], o: OptionsData) => {
    await apiService.saveMenuConfig(m, a, o);
    fetchData(); // Reload to ensure sync
  };
  
  const handleToggleQuiet = async (val: boolean) => {
      await apiService.updateQuietHours(val);
      fetchData();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20 transition-all duration-300 hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white">無名牛排 <span className="text-xs text-indigo-400 block mt-1">管理後台</span></h1>
        </div>
        <nav className="flex-1 py-6 space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-800 transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-white border-r-4 border-indigo-500' : ''}`}>
                <HomeIcon /> 總覽看板
            </button>
            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-800 transition-colors ${activeTab === 'orders' ? 'bg-slate-800 text-white border-r-4 border-indigo-500' : ''}`}>
                <ClipboardListIcon /> 訂單管理
                {orders.filter(o => o.status === '待處理' || o.status === '待店長確認').length > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{orders.filter(o => o.status === '待處理' || o.status === '待店長確認').length}</span>}
            </button>
            <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-800 transition-colors ${activeTab === 'menu' ? 'bg-slate-800 text-white border-r-4 border-indigo-500' : ''}`}>
                <MenuIcon /> 菜單管理
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-800 transition-colors ${activeTab === 'settings' ? 'bg-slate-800 text-white border-r-4 border-indigo-500' : ''}`}>
                <CogIcon /> 系統設定
            </button>
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
            <a href="/" className="hover:text-white underline flex items-center justify-center w-full gap-2">
                ← 返回點餐前台
            </a>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-slate-900 text-white z-50 p-4 flex justify-between items-center">
          <span className="font-bold">管理後台</span>
          <div className="flex gap-3">
              <button onClick={() => setActiveTab('dashboard')} className={`text-sm ${activeTab === 'dashboard' ? 'text-indigo-400' : ''}`}>總覽</button>
              <button onClick={() => setActiveTab('orders')} className={`text-sm ${activeTab === 'orders' ? 'text-indigo-400' : ''}`}>訂單</button>
              <button onClick={() => setActiveTab('menu')} className={`text-sm ${activeTab === 'menu' ? 'text-indigo-400' : ''}`}>菜單</button>
              <button onClick={() => window.location.href = '/'} className="text-sm text-slate-400">離開</button>
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 mt-14 md:mt-0 overflow-x-hidden">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-xl font-semibold text-slate-700">
                {activeTab === 'dashboard' && '營運總覽'}
                {activeTab === 'orders' && '即時訂單'}
                {activeTab === 'menu' && '菜單品項'}
                {activeTab === 'settings' && '設定'}
            </h2>
            <div className="flex gap-3">
                <button onClick={() => fetchData()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700 transition-all active:scale-95">
                    <RefreshIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> <span className="hidden md:inline">重整</span>
                </button>
            </div>
        </header>

        <div className="animate-fade-in pb-10">
            {activeTab === 'dashboard' && <Dashboard stats={stats} orders={orders} />}
            {activeTab === 'orders' && <OrderManager orders={orders} onStatusUpdate={handleStatusUpdate} />}
            {activeTab === 'menu' && <MenuManager menu={menu} addons={addons} options={options} onSave={handleSaveMenu} />}
            {activeTab === 'settings' && <Settings isQuietHours={isQuietHours} onToggleQuiet={handleToggleQuiet} onBackup={apiService.backupData} onRestore={apiService.restoreData} onClear={apiService.clearAllData} />}
        </div>
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
