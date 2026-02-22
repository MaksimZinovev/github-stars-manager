/**
 * Debug API for direct tag operations via Chrome DevTools Console.
 * Exposes window.debugAPI for programmatic tag management without UI.
 *
 * Enable debug logs: localStorage.setItem('DEBUG', '1') in console
 */
import { StoredGenericMngr } from './storageSync/StoredGenericMngr';
import { StoredTagsMngr } from './storageSync/StoredTagsMngr';
import { StoredReposMngr } from './storageSync/StoredReposMngr';

const DEBUG = localStorage.getItem('DEBUG') === '1';
const log = (...args) => DEBUG && console.log('[debugAPI]', ...args);
const error = (...args) => DEBUG && console.error('[debugAPI]', ...args);

log('Module loading...');

const debugAPI = {
  /**
   * Add a tag to a repository
   * @param {Number} repoID - GitHub repository ID
   * @param {String} tagName - Tag name (will be normalized to lowercase)
   * @return {Promise<Object>} Result with success status and message
   */
  async addTag(repoID, tagName) {
    try {
      const normalizedTag = StoredTagsMngr.normalizeTagName(tagName);
      await StoredTagsMngr.createTag(repoID, normalizedTag);
      return { success: true, message: `Tag "${normalizedTag}" added to repo ${repoID}` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  /**
   * Add a tag to multiple repositories
   * @param {Array<Number>} repoIDs - Array of GitHub repository IDs
   * @param {String} tagName - Tag name (will be normalized to lowercase)
   * @return {Promise<Object>} Result with success count and any failures
   */
  async bulkTag(repoIDs, tagName) {
    const results = { success: 0, failed: 0, errors: [] };
    const normalizedTag = StoredTagsMngr.normalizeTagName(tagName);

    for (const repoID of repoIDs) {
      try {
        await StoredTagsMngr.createTag(repoID, normalizedTag);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ repoID, error: error.message });
      }
    }

    return {
      success: true,
      tag: normalizedTag,
      total: repoIDs.length,
      tagged: results.success,
      failed: results.failed,
      errors: results.errors,
    };
  },

  /**
   * Get all tags for a specific repository
   * @param {Number} repoID - GitHub repository ID
   * @return {Promise<Object>} Result with tags array
   */
  async getTags(repoID) {
    try {
      const storedRepos = await StoredGenericMngr.read('r');
      const storedTags = await StoredGenericMngr.read('t');

      if (!storedRepos || !storedRepos[repoID]) {
        return { success: true, repoID, tags: [] };
      }

      const tagIDs = storedRepos[repoID];
      const tags = tagIDs.map((tagID) => ({
        tagID,
        tagName: StoredTagsMngr.getTagNameByID(storedTags, tagID),
      }));

      return { success: true, repoID, tags };
    } catch (error) {
      return { success: false, repoID, message: error.message };
    }
  },

  /**
   * Remove a tag from a repository
   * @param {Number} repoID - GitHub repository ID
   * @param {String} tagName - Tag name to remove
   * @return {Promise<Object>} Result with success status
   */
  async removeTag(repoID, tagName) {
    try {
      const normalizedTag = StoredTagsMngr.normalizeTagName(tagName);
      await StoredReposMngr.deleteTagFromRepo(repoID, normalizedTag);
      return { success: true, message: `Tag "${normalizedTag}" removed from repo ${repoID}` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  /**
   * List all tags in storage
   * @return {Promise<Object>} Result with tags array
   */
  async listAllTags() {
    try {
      const tags = await StoredTagsMngr.getAllTagsInArray();
      return { success: true, count: tags.length, tags };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  /**
   * Get all repositories that have a specific tag
   * @param {String} tagName - Tag name to search for
   * @return {Promise<Object>} Result with repo IDs array
   */
  async getReposByTag(tagName) {
    try {
      const normalizedTag = StoredTagsMngr.normalizeTagName(tagName);
      const storedRepos = await StoredGenericMngr.read('r');
      const storedTags = await StoredGenericMngr.read('t');

      const tagID = StoredTagsMngr.getTagIDByName(storedTags, normalizedTag);

      if (typeof tagID === 'string') {
        return { success: false, message: `Tag "${normalizedTag}" not found` };
      }

      const repoIDs = [];
      for (const repoID in storedRepos) {
        if (storedRepos[repoID].includes(tagID)) {
          repoIDs.push(Number(repoID));
        }
      }

      return { success: true, tag: normalizedTag, count: repoIDs.length, repoIDs };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  /**
   * Fetch a URL with GitHub PAT authentication
   * @param {String} url - URL to fetch (e.g., GitHub API endpoint)
   * @param {Object} options - Optional fetch options (will merge with auth header)
   * @return {Promise<Object>} Result with success status and data
   */
  async fetchWithAuth(url, options = {}) {
    try {
      const { token } = await chrome.storage.sync.get('token');

      if (!token) {
        return { success: false, error: 'No PAT configured. Enter token in extension.' };
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };

      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { success: true, status: response.status, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// Expose to window for console access (both isolated world and main world)
log('Attempting to set window.debugAPI...');
try {
  if (typeof window === 'undefined') {
    error('window is undefined - not in browser context');
  } else {
    // Set in isolated world (for content script access)
    window.debugAPI = debugAPI;
    log('window.debugAPI set in isolated world:', typeof window.debugAPI);

    // Request background script to inject into main world (bypasses CSP)
    chrome.runtime.sendMessage({injectDebugAPI: true}, (response) => {
      if (response && response.success) {
        log('Main world injection requested successfully');
      } else {
        error('Main world injection failed:', response && response.error);
      }
    });

    log('Available methods in isolated world:', Object.keys(debugAPI));
  }
} catch (e) {
  error('Failed to set window.debugAPI:', e);
}

// Listen for messages from main world and bridge to isolated world
window.addEventListener('message', async (event) => {
  if (event.source !== window || event.data.type !== 'DEBUG_API_CALL') return;

  const { method, args, requestId } = event.data;
  try {
    const result = await debugAPI[method](...args);
    window.postMessage({ type: 'DEBUG_API_RESPONSE', method, requestId, result }, '*');
  } catch (error) {
    window.postMessage({
      type: 'DEBUG_API_RESPONSE',
      method,
      requestId,
      result: { success: false, error: error.message },
    }, '*');
  }
});

export { debugAPI };
