import {CACHE_STORAGE_KEY} from '../../constants';

export const StarredReposCacheMngr = (() => {
  // Use chrome.storage.local instead of sync for large cache data
  // storage.sync has 100KB limit, storage.local has 10MB+ limit

  /**
   * Get the cached starred repositories
   * @return {Promise<{repos: Array, timestamp: number}|null>} Cache object or null if not exists
   */
  async function getCache() {
    return new Promise((resolve) => {
      chrome.storage.local.get(CACHE_STORAGE_KEY, (response) => {
        resolve(response[CACHE_STORAGE_KEY]);
      });
    });
  }

  /**
   * Save repositories to cache with current timestamp
   * @param {Array} repos Array of repository objects to cache
   * @return {Promise}
   */
  async function setCache(repos) {
    const cacheData = {
      repos: repos,
      timestamp: Date.now(),
    };
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({[CACHE_STORAGE_KEY]: cacheData}, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to cache repos:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Check if the cache exists and is still fresh
   * @param {number} cacheDurationMs Duration in milliseconds that cache is considered fresh
   * @return {Promise<boolean>} True if cache exists and is fresh, false otherwise
   */
  async function isCacheFresh(cacheDurationMs) {
    const cache = await getCache();
    if (!cache || !cache.timestamp) {
      return false;
    }
    const now = Date.now();
    return (cache.timestamp + cacheDurationMs) > now;
  }

  /**
   * Remove the cached starred repositories from storage
   * @return {Promise}
   */
  async function clearCache() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(CACHE_STORAGE_KEY, () => {
        resolve();
      });
    });
  }

  return {getCache, setCache, isCacheFresh, clearCache};
})();
