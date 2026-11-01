// テスターフィードバック対応（2026-10-23）：「スポット制覇一覧の文字を大きく・枠に色をつけて見やすく」に対応。
// Tailwind JIT対策のため、動的テンプレート文字列ではなくこのオブジェクト内に完全なクラス名を列挙する。
export type CategoryColorClasses = { border: string; icon: string; text: string }

const CATEGORY_COLORS: Record<string, CategoryColorClasses> = {
  'world-heritage': { border: 'border-blue-500/50', icon: 'bg-blue-500/15', text: 'text-blue-400' },
  'national-park': { border: 'border-green-500/50', icon: 'bg-green-500/15', text: 'text-green-400' },
  'theme-park': { border: 'border-pink-500/50', icon: 'bg-pink-500/15', text: 'text-pink-400' },
  'amusement': { border: 'border-purple-500/50', icon: 'bg-purple-500/15', text: 'text-purple-400' },
  'zoo': { border: 'border-orange-500/50', icon: 'bg-orange-500/15', text: 'text-orange-400' },
  'aquarium': { border: 'border-cyan-500/50', icon: 'bg-cyan-500/15', text: 'text-cyan-400' },
  'castle': { border: 'border-red-500/50', icon: 'bg-red-500/15', text: 'text-red-400' },
  'shrine': { border: 'border-indigo-500/50', icon: 'bg-indigo-500/15', text: 'text-indigo-400' },
  'japan-heritage': { border: 'border-amber-500/50', icon: 'bg-amber-500/15', text: 'text-amber-400' },
  'onsen': { border: 'border-rose-500/50', icon: 'bg-rose-500/15', text: 'text-rose-400' },
  'michi-no-eki': { border: 'border-lime-500/50', icon: 'bg-lime-500/15', text: 'text-lime-400' },
  'service-area': { border: 'border-sky-500/50', icon: 'bg-sky-500/15', text: 'text-sky-400' },
  'dam': { border: 'border-teal-500/50', icon: 'bg-teal-500/15', text: 'text-teal-400' },
  'super-sento': { border: 'border-fuchsia-500/50', icon: 'bg-fuchsia-500/15', text: 'text-fuchsia-400' },
  'festival': { border: 'border-yellow-500/50', icon: 'bg-yellow-500/15', text: 'text-yellow-400' },
  'fireworks': { border: 'border-violet-500/50', icon: 'bg-violet-500/15', text: 'text-violet-400' },
  'game-center': { border: 'border-emerald-500/50', icon: 'bg-emerald-500/15', text: 'text-emerald-400' },
}

const DEFAULT_COLOR: CategoryColorClasses = { border: 'border-emerald-500/50', icon: 'bg-emerald-500/15', text: 'text-emerald-400' }

export function getCategoryColorClasses(id: string): CategoryColorClasses {
  return CATEGORY_COLORS[id] ?? DEFAULT_COLOR
}
