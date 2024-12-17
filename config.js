// Default configuration values
export const DEFAULT_CONFIG = {
    minThreshold: 10,
    maxDistance: 4,
    tanakhMinScore: 2.3
};

// Chrome storage keys
const STORAGE_KEY = 'dictaRefLinkerConfig';

// Get configuration from sync storage, falling back to defaults
export async function getConfig() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(STORAGE_KEY, (result) => {
            resolve(result[STORAGE_KEY] || DEFAULT_CONFIG);
        });
    });
}

// Save configuration to sync storage
export async function saveConfig(config) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ [STORAGE_KEY]: config }, () => {
            resolve();
        });
    });
}

// Reset configuration to defaults
export async function resetConfig() {
    return saveConfig(DEFAULT_CONFIG);
}
