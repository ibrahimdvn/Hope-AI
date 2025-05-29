// Bu kod script.js dosyanızda yer alabilir.

// Global değişkenler
let currentTranslations = {};
const defaultLang = 'en';
let currentLang = localStorage.getItem('selectedLang') || defaultLang;

// Belirli bir dil için çeviri dosyasını yükler
async function loadTranslations(lang) {
    try {
        const response = await fetch(`langs/${lang}.json`); // JSON dosyalarının 'langs' klasöründe olduğunu varsayıyoruz
        if (!response.ok) {
            console.error(`Çeviri dosyası yüklenemedi: ${lang}.json. Varsayılan dil denenecek.`);
            // Ana dil yüklenemezse veya varsayılan dil de yüklenemezse diye bir fallback eklenebilir
            if (lang !== defaultLang) return await loadTranslations(defaultLang); // Varsayılanı dene
            return null; // Varsayılan da başarısız olursa null dön
        }
        return await response.json();
    } catch (error) {
        console.error(`${lang}.json dosyası yüklenirken hata:`, error);
        if (lang !== defaultLang) return await loadTranslations(defaultLang); // Varsayılanı dene
        return null;
    }
}

// Çevirileri sayfaya uygular
function applyTranslationsToPage() {
    if (!currentTranslations) {
        console.error("Çeviriler yüklenemedi, metinler güncellenemiyor.");
        return;
    }
    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-key');
        if (currentTranslations[key] !== undefined) { // Anahtarın varlığını kontrol et
            element.textContent = currentTranslations[key];
        } else {
            // console.warn(`Anahtar için çeviri bulunamadı: ${key} - Dil: ${currentLang}`);
        }
    });

    // Sayfa başlığını güncelle
    const pageTitleKey = document.querySelector('title[data-i18n-key]')?.getAttribute('data-i18n-key');
    if (pageTitleKey && currentTranslations[pageTitleKey] !== undefined) {
        document.title = currentTranslations[pageTitleKey];
    } else if (currentTranslations["site_title_index"] && window.location.pathname.endsWith('index.html')) { // Anasayfa için genel başlık
         document.title = currentTranslations["site_title_index"];
    } // Diğer sayfalar için de benzer başlık anahtarları eklenebilir

    // Dil seçici butonundaki metni de güncelle
    const currentLangTextElement = document.getElementById('current-lang-text');
    if (currentLangTextElement && currentTranslations["current_lang_display"] !== undefined) {
        currentLangTextElement.textContent = currentTranslations["current_lang_display"];
    }
}

// Dili değiştirir ve uygular
async function changeLanguage(lang) {
    if (!lang) return;
    const newTranslations = await loadTranslations(lang);
    if (newTranslations) {
        currentTranslations = newTranslations;
        currentLang = lang;
        localStorage.setItem('selectedLang', lang);
        applyTranslationsToPage();
    } else {
        console.error(`${lang} dili için çeviriler yüklenemedi. Değişiklik yapılmadı.`);
    }
}

// Sayfa yüklendiğinde başla
document.addEventListener('DOMContentLoaded', async () => {
    // İlk dil yüklemesini yap
    await changeLanguage(currentLang); // Bu currentTranslations'ı ve sayfa metinlerini ayarlar

    // Dil değiştirme linklerine olay dinleyicileri ekle
    const languageDropdownLinks = document.querySelectorAll('.language-dropdown a');
    languageDropdownLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const selectedLang = link.getAttribute('data-lang');
            if (selectedLang) {
                await changeLanguage(selectedLang);
            }
        });
    });
});