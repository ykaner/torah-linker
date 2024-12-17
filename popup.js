import { getConfig, saveConfig, DEFAULT_CONFIG } from './config.js';

// Initialize sliders with current values
async function initializeSliders() {
    const config = await getConfig();
    
    // Set initial values for each slider
    document.getElementById('minThreshold').value = config.minThreshold;
    document.getElementById('minThresholdValue').textContent = config.minThreshold;
    
    document.getElementById('tanakhMinScore').value = config.tanakhMinScore;
    document.getElementById('tanakhMinScoreValue').textContent = config.tanakhMinScore;
}

// Update display values when sliders change
function setupSliderListeners() {
    const sliders = ['minThreshold', 'tanakhMinScore'];
    
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        const display = document.getElementById(`${id}Value`);
        
        slider.addEventListener('input', () => {
            display.textContent = slider.value;
        });
    });
}

// Save settings
async function saveSettings() {
    const config = {
        minThreshold: Number(document.getElementById('minThreshold').value),
        maxDistance: DEFAULT_CONFIG.maxDistance, // Keep the default value
        tanakhMinScore: Number(document.getElementById('tanakhMinScore').value)
    };
    
    await saveConfig(config);
    
    // Show success message
    const saveButton = document.getElementById('saveButton');
    const originalText = saveButton.textContent;
    saveButton.textContent = 'נשמר בהצלחה!';
    saveButton.disabled = true;
    
    setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.disabled = false;
    }, 1500);
}

// Reset to defaults
async function resetSettings() {
    await saveConfig(DEFAULT_CONFIG);
    await initializeSliders();
}

// Initialize everything when popup opens
document.addEventListener('DOMContentLoaded', () => {
    initializeSliders();
    setupSliderListeners();
    
    // Add button click handlers
    document.getElementById('saveButton').addEventListener('click', saveSettings);
    document.getElementById('resetButton').addEventListener('click', resetSettings);
});
