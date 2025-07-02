import { computed, ComputedRef } from 'vue'

// 高コストな計算をメモ化するためのコンポーザブル
export function useMemoizedComputed<T>(
  getter: () => T,
  deps: () => any[] = () => []
): ComputedRef<T> {
  let cache: T
  let cachedDeps: any[] = []
  let hasCache = false

  return computed(() => {
    const currentDeps = deps()
    
    // 依存関係が変更されていない場合はキャッシュを返す
    if (hasCache && depsEqual(cachedDeps, currentDeps)) {
      return cache
    }

    // 新しい値を計算してキャッシュ
    cache = getter()
    cachedDeps = [...currentDeps]
    hasCache = true
    
    return cache
  })
}

// 依存関係の深い比較
function depsEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false
  
  for (let i = 0; i < a.length; i++) {
    if (!deepEqual(a[i], b[i])) return false
  }
  
  return true
}

// 深い等価性チェック
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return a === b
  
  if (typeof a !== typeof b) return false
  
  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false
      return a.every((item, index) => deepEqual(item, b[index]))
    }
    
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    
    if (aKeys.length !== bKeys.length) return false
    
    return aKeys.every(key => deepEqual(a[key], b[key]))
  }
  
  return false
}

// リスト項目の効率的な比較
export function useListMemoization<T extends { id: string }>(
  list: ComputedRef<T[]>
) {
  const itemsMap = computed(() => {
    const map = new Map<string, T>()
    list.value.forEach(item => map.set(item.id, item))
    return map
  })
  
  const getItem = (id: string) => itemsMap.value.get(id)
  
  const hasChanged = (id: string, newItem: T) => {
    const existing = itemsMap.value.get(id)
    return !existing || !deepEqual(existing, newItem)
  }
  
  return {
    itemsMap,
    getItem,
    hasChanged
  }
}