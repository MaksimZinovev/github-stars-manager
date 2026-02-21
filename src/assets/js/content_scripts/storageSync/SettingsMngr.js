import {StoredGenericMngr} from './StoredGenericMngr';
import {SETTINGS_STORAGE_KEY, DEFAULT_CACHE_DURATION_MS} from '../../constants';

export const SettingsMngr = (() => {
  const {createOrUpdate, read} = StoredGenericMngr;

  /**
   * Default settings values
   */
  const DEFAULT_SETTINGS = {
    cacheDurationMs: DEFAULT_CACHE_DURATION_MS,
  };

  /**
   * Get settings object, returns defaults if not set
   * @return {Promise<Object>} Settings object
   */
  async function getSettings() {
    let storedSettings = await read(SETTINGS_STORAGE_KEY);
    if (storedSettings === undefined) {
      await createOrUpdate(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
      return {...DEFAULT_SETTINGS};
    }
    return {...DEFAULT_SETTINGS, ...storedSettings};
  }

  /**
   * Update settings by merging with existing settings
   * @param {Object} newSettings Settings to merge
   */
  async function updateSettings(newSettings) {
    let currentSettings = await getSettings();
    let mergedSettings = {...currentSettings, ...newSettings};
    await createOrUpdate(SETTINGS_STORAGE_KEY, mergedSettings);
  }

  /**
   * Reset settings to defaults
   */
  async function resetToDefaults() {
    await createOrUpdate(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  }

  return {getSettings, updateSettings, resetToDefaults};
})();
