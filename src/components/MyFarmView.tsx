import React, { useState } from 'react';
import {
  Tractor,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Sprout,
  Search
} from 'lucide-react';
import { Language, FarmRecord } from '../types';
import { translations } from '../translations';
import { addFarmPlot, updateFarmStatus, deleteFarmPlot } from '../firebase';

interface MyFarmViewProps {
  userId: string;
  farms: FarmRecord[];
  loadingFarms: boolean;
  language: Language;
  defaultLocation?: string;
}

export const MyFarmView: React.FC<MyFarmViewProps> = ({
  userId,
  farms,
  loadingFarms,
  language,
  defaultLocation = 'Mandya, Karnataka'
}) => {
  const t = translations[language];

  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | FarmRecord['status']>('ALL');

  const [newFarm, setNewFarm] = useState({
    farmName: '',
    location: defaultLocation,
    landArea: 2.0,
    soilType: 'Red Loamy Soil',
    cropsPlanted: 'Finger Millet (Ragi)',
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '2026-11-20',
    status: 'Growing' as FarmRecord['status']
  });

  const handleAddFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      await addFarmPlot(userId, newFarm);
      setShowAddModal(false);
      setNewFarm({
        farmName: '',
        location: defaultLocation,
        landArea: 2.0,
        soilType: 'Red Loamy Soil',
        cropsPlanted: 'Finger Millet (Ragi)',
        plantingDate: new Date().toISOString().split('T')[0],
        expectedHarvestDate: '2026-11-20',
        status: 'Growing'
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save farm plot.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (farmId: string, status: FarmRecord['status']) => {
    try {
      await updateFarmStatus(userId, farmId, status);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteFarm = async (id: string) => {
    try {
      await deleteFarmPlot(userId, id);
    } catch (err) {
      console.error('Failed to delete farm plot:', err);
    }
  };

  const filteredFarms = farms.filter((farm) => {
    const matchesStatus = statusFilter === 'ALL' || farm.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      farm.farmName.toLowerCase().includes(q) ||
      farm.cropsPlanted.toLowerCase().includes(q) ||
      farm.location.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const totalAcres = farms.reduce((acc, f) => acc + (Number(f.landArea) || 0), 0);
  const readyCount = farms.filter((f) => f.status === 'Ready for Harvest').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.myFarm}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              All land plots, soil types, and cropping calendars below are saved to your farmer account.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-colors self-start sm:self-auto whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Farm Plot</span>
        </button>
      </div>

      {/* Farm Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-emerald-100">
          <span className="text-xs font-semibold text-gray-500 block">Total Land Managed</span>
          <div className="text-2xl font-bold text-emerald-800 mt-1 font-mono-tabular">
            {totalAcres.toFixed(1)} Acres
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-emerald-100">
          <span className="text-xs font-semibold text-gray-500 block">Saved Plots</span>
          <div className="text-2xl font-bold text-gray-900 mt-1 font-mono-tabular">
            {farms.length} Plots
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-emerald-100">
          <span className="text-xs font-semibold text-gray-500 block">Ready for Harvest</span>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono-tabular">
            {readyCount} Plots
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plots, crops, or village..."
            className="w-full bg-white border border-emerald-100 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-emerald-100 rounded-xl overflow-x-auto">
          {(['ALL', 'Growing', 'Planted', 'Ready for Harvest', 'Fallow'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-800 text-white'
                  : 'text-gray-600 hover:bg-emerald-50'
              }`}
            >
              {st === 'ALL' ? 'All Plots' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Farm Plots Grid */}
      {loadingFarms ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white border border-emerald-100 animate-pulse p-5" />
          ))}
        </div>
      ) : filteredFarms.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-emerald-100 space-y-3">
          <Sprout className="w-10 h-10 text-emerald-700 mx-auto" />
          <h3 className="font-bold text-gray-900 text-base">
            {farms.length === 0 ? 'No Farm Plots Stored Yet' : 'No Matching Farm Plots'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {farms.length === 0
              ? 'Add your first farm plot to keep track of soil types, crops planted, and expected harvest dates.'
              : 'Try clearing your search or selecting a different status filter.'}
          </p>
          {farms.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-4 py-2 rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Farm Plot</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFarms.map((farm) => (
            <div
              key={farm.id}
              className="bg-white rounded-2xl p-5 border border-emerald-100 hover:border-emerald-300 transition-colors space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-gray-900">{farm.farmName}</h3>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{farm.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular font-semibold text-emerald-800">
                      {farm.landArea} Acres
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={farm.status}
                    onChange={(e) =>
                      handleStatusChange(farm.id, e.target.value as FarmRecord['status'])
                    }
                    aria-label={`Status for ${farm.farmName}`}
                    className="text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="Planted">Planted</option>
                    <option value="Growing">Growing</option>
                    <option value="Ready for Harvest">Ready for Harvest</option>
                    <option value="Fallow">Fallow</option>
                  </select>
                  <button
                    onClick={() => handleDeleteFarm(farm.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Plot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-gray-100">
                <div>
                  <span className="text-gray-400 text-[11px] font-semibold block">Soil Type</span>
                  <span className="font-semibold text-gray-800">{farm.soilType}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] font-semibold block">Crops Planted</span>
                  <span className="font-semibold text-emerald-800">{farm.cropsPlanted}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-gray-100 font-mono-tabular">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Sown: {farm.plantingDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                  <Sprout className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Harvest: {farm.expectedHarvestDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Farm Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-emerald-100">
            <h3 className="font-bold text-gray-900 text-base mb-4 pb-2 border-b border-gray-100">
              Add Farm Plot
            </h3>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddFarm} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Farm Plot Name</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Gowda Organic Plot 3"
                  value={newFarm.farmName}
                  onChange={(e) => setNewFarm({ ...newFarm, farmName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Location</label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={newFarm.location}
                  onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Land Area (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    value={newFarm.landArea}
                    onChange={(e) => setNewFarm({ ...newFarm, landArea: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-mono-tabular focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Soil Type</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={newFarm.soilType}
                    onChange={(e) => setNewFarm({ ...newFarm, soilType: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Crops Planted</label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={newFarm.cropsPlanted}
                  onChange={(e) => setNewFarm({ ...newFarm, cropsPlanted: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Planting Date</label>
                  <input
                    type="date"
                    required
                    value={newFarm.plantingDate}
                    onChange={(e) => setNewFarm({ ...newFarm, plantingDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Expected Harvest</label>
                  <input
                    type="date"
                    required
                    value={newFarm.expectedHarvestDate}
                    onChange={(e) =>
                      setNewFarm({ ...newFarm, expectedHarvestDate: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-xl"
                >
                  {saving ? 'Saving...' : 'Save Farm Plot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
