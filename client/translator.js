// translator.js - Complete translation system for all pages

// Configuration
const API_BASE_URL = 'http://localhost:3000'; // Change to your production URL when deploying
const CACHE_KEY = 'translationCache';
const LANG_KEY = 'selectedLanguage';

// Cache management
const TranslationCache = {
    get(lang) {
        try {
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            return cache[lang] || null;
        } catch {
            return null;
        }
    },
    
    set(lang, translations) {
        try {
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            cache[lang] = translations;
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (error) {
            console.error('Failed to cache translations:', error);
        }
    },
    
    clear() {
        localStorage.removeItem(CACHE_KEY);
    }
};

// Get all translatable content from the page
function getPageContent() {
    const elements = document.querySelectorAll('[data-translate], [data-translate-placeholder]');
    const content = [];
    
    elements.forEach((element, index) => {
        if (element.hasAttribute('data-translate')) {
            const text = element.textContent.trim();
            if (text) {
                content.push({
                    index,
                    selector: `[data-translate]:nth-of-type(${index + 1})`,
                    text,
                    type: 'text',
                    element
                });
            }
        }
        
        if (element.hasAttribute('data-translate-placeholder')) {
            const placeholder = element.getAttribute('placeholder');
            if (placeholder) {
                content.push({
                    index,
                    selector: `[data-translate-placeholder]:nth-of-type(${index + 1})`,
                    text: placeholder,
                    type: 'placeholder',
                    element
                });
            }
        }
    });
    
    return content;
}

// Apply translations to the page
function applyTranslations(translations) {
    const elements = document.querySelectorAll('[data-translate], [data-translate-placeholder]');
    
    elements.forEach(element => {
        if (element.hasAttribute('data-translate')) {
            const originalText = element.textContent.trim();
            if (translations[originalText]) {
                element.textContent = translations[originalText];
            }
        }
        
        if (element.hasAttribute('data-translate-placeholder')) {
            const originalPlaceholder = element.getAttribute('placeholder');
            if (translations[originalPlaceholder]) {
                element.setAttribute('placeholder', translations[originalPlaceholder]);
            }
        }
    });
}

// Translate the page
async function translatePage(targetLanguage) {
    if (targetLanguage === 'en') {
        TranslationCache.clear();
        localStorage.setItem(LANG_KEY, 'en');
        location.reload();
        return;
    }
    
    showLoadingIndicator();
    
    try {
        const cachedTranslations = TranslationCache.get(targetLanguage);
        if (cachedTranslations) {
            applyTranslations(cachedTranslations);
            localStorage.setItem(LANG_KEY, targetLanguage);
            hideLoadingIndicator();
            return;
        }
        
        const pageContent = getPageContent();
        
        if (pageContent.length === 0) {
            hideLoadingIndicator();
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/translate-site`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pageContent,
                targetLanguage,
                sourceLanguage: 'en'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Translation failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.translations) {
            applyTranslations(data.translations);
            TranslationCache.set(targetLanguage, data.translations);
            localStorage.setItem(LANG_KEY, targetLanguage);
        } else {
            throw new Error('Invalid response from translation API');
        }
        
    } catch (error) {
        console.error('Translation error:', error);
        alert('Translation failed. Please try again later.');
    } finally {
        hideLoadingIndicator();
    }
}

// Loading indicator functions
function showLoadingIndicator() {
    let indicator = document.getElementById('translation-loading');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'translation-loading';
        indicator.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: rgba(0,0,0,0.8); color: white; padding: 20px 40px; 
                        border-radius: 10px; z-index: 10000; text-align: center;">
                <div style="font-size: 18px; margin-bottom: 10px;">Translating...</div>
                <div class="spinner" style="border: 3px solid #f3f3f3; border-top: 3px solid #3498db; 
                            border-radius: 50%; width: 40px; height: 40px; 
                            animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(indicator);
    }
    indicator.style.display = 'block';
}

function hideLoadingIndicator() {
    const indicator = document.getElementById('translation-loading');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// Fetch available languages from the backend
async function fetchLanguages() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/languages`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch languages: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.data && data.data.languages && Array.isArray(data.data.languages)) {
            return data.data.languages;
        } else {
            throw new Error('Unexpected data structure received from server');
        }
    } catch (error) {
        console.error('Error fetching languages:', error);
        return [
            { language: 'en', name: 'English' },
            { language: 'es', name: 'Spanish' },
            { language: 'fr', name: 'French' },
            { language: 'de', name: 'German' },
            { language: 'zh', name: 'Chinese' }
        ];
    }
}

// Language names mapping
const languageNames = {
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'ru': 'Русский',
    'ja': '日本語',
    'ko': '한국어',
    'zh': '中文',
    'ar': 'العربية',
    'hi': 'हिन्दी',
    'tr': 'Türkçe',
    'nl': 'Nederlands',
    'pl': 'Polski',
    'sv': 'Svenska',
    'da': 'Dansk',
    'fi': 'Suomi',
    'no': 'Norsk',
    'cs': 'Čeština',
    'hu': 'Magyar',
    'ro': 'Română',
    'th': 'ไทย',
    'vi': 'Tiếng Việt',
    'id': 'Bahasa Indonesia',
    'uk': 'Українська',
    'el': 'Ελληνικά',
    'he': 'עברית'
};

// Populate language dropdown
function populateLanguageDropdown(languages) {
    const dropdown = document.getElementById('language-dropdown');
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    
    languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language.language;
        option.textContent = languageNames[language.language] || language.name || language.language;
        dropdown.appendChild(option);
    });
    
    const savedLanguage = localStorage.getItem(LANG_KEY);
    if (savedLanguage) {
        dropdown.value = savedLanguage;
    }
}

// Initialize translation system
async function initTranslator() {
    try {
        const languages = await fetchLanguages();
        populateLanguageDropdown(languages);
        
        const dropdown = document.getElementById('language-dropdown');
        if (dropdown) {
            dropdown.addEventListener('change', (event) => {
                const selectedLanguage = event.target.value;
                translatePage(selectedLanguage);
            });
        }
        
        const savedLanguage = localStorage.getItem(LANG_KEY);
        if (savedLanguage && savedLanguage !== 'en') {
            translatePage(savedLanguage);
        }
        
    } catch (error) {
        console.error('Failed to initialize translator:', error);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslator);
} else {
    initTranslator();
}

// Export functions for use in other scripts
window.translatePage = translatePage;
window.TranslationCache = TranslationCache;