import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Language, MarketPriceRecord } from '../types';
import { translations } from '../translations';

interface MarketPricesViewProps {
  language: Language;
}

export const MarketPricesView: React.FC<MarketPricesViewProps> = ({ language }) => {
  const t = translations[language];

  const [marketData, setMarketData] = useState<MarketPriceRecord[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<MarketPriceRecord | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/market-prices');
      const data: MarketPriceRecord[] = await res.json();
      setMarketData(data);
      if (data.length > 0) {
        setSelectedCrop(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch market prices:", err);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const filteredData = marketData.filter(
    (item) =>
      item.cropName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.marketLocation.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">

      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.apmcMarket}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live Mandi APMC agricultural market prices, trend analysis & optimal selling windows.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search crop or APMC..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Main Chart + Selected Crop Card */}
      {selectedCrop && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Price Trend Chart Box */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-emerald-100/80">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{selectedCrop.cropName}</h3>
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedCrop.marketLocation}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-gray-900">
                  â‚¹{selectedCrop.currentPrice.toLocaleString()} / Qtl
                </div>
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  +{selectedCrop.priceTrendPercent}% Rate Increase
                </span>
              </div>
            </div>

            {/* Recharts Area Graph */}
            <div className="h-60 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedCrop.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#1f2937',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#059669"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#priceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Selling Window Strategy Box */}
          <div className="lg:col-span-4 bg-gradient-to-br from-emerald-900 via-emerald-850 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider bg-emerald-800/80 px-2.5 py-1 rounded-full border border-emerald-700 inline-block mb-3">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Optimal Selling Period
              </span>
              <h3 className="text-xl font-bold text-white mb-2">{selectedCrop.cropName}</h3>
              <p className="text-xs text-emerald-200 leading-relaxed opacity-90">
                Market analysis indicates peak demand at {selectedCrop.marketLocation} due to reduced regional supply.
              </p>

              <div className="mt-5 p-3.5 rounded-2xl bg-emerald-800/60 border border-emerald-700">
                <div className="text-[10px] text-emerald-300 uppercase font-semibold">Forecasted Strategy</div>
                <div className="text-sm font-bold text-amber-300 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>{selectedCrop.bestSellingPeriod}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-800 text-[11px] text-emerald-300">
              ðŸ’¡ Tip: Transport produce early morning to APMC Mandya for top auction bids.
            </div>
          </div>

        </div>
      )}

      {/* APMC Prices Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100/80">
        <h3 className="font-bold text-gray-900 text-sm mb-4 pb-2 border-b border-gray-100">
          APMC Market Directory & Rates
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] tracking-wider bg-slate-50">
                <th className="p-3 rounded-l-xl">{t.cropName}</th>
                <th className="p-3">{t.locationMarket}</th>
                <th className="p-3">{t.currentPrice}</th>
                <th className="p-3">{t.priceTrend}</th>
                <th className="p-3 rounded-r-xl">{t.bestSelling}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedCrop(item)}
                  className={`cursor-pointer hover:bg-emerald-50/60 transition-colors ${
                    selectedCrop?.id === item.id ? 'bg-emerald-50/80 font-medium' : ''
                  }`}
                >
                  <td className="p-3 font-bold text-gray-900">{item.cropName}</td>
                  <td className="p-3 text-gray-600">{item.marketLocation}</td>
                  <td className="p-3 font-bold text-emerald-800">
                    â‚¹{item.currentPrice.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      +{item.priceTrendPercent}%
                    </span>
                  </td>
                  <td className="p-3 font-medium text-amber-700">{item.bestSellingPeriod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
