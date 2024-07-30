// const trackBtn = () => {
//   const trackingNumber = document.getElementById("track").value;
//   const url = `http://localhost:4000/parcels/${trackingNumber}`;
//   const parcelInfoDiv = document.getElementById("parcel-info");

//   if (!trackingNumber) {
//     parcelInfoDiv.innerHTML = "<p>Please enter a tracking number.</p>";
//     return;
//   }

//   fetch(url)
//     .then((res) => {
//       if (!res.ok) {
//         throw new Error("Network response was not ok");
//       }

//       return res.json(); // Parse the JSON from the response
//     })

//     .then((data) => {
//       console.log(data);
//       if (data.message) {
//         parcelInfoDiv.innerHTML = `<p>${data.message}</p>`;
//       } else {
//         parcelInfoDiv.innerHTML = `
//     <h3>Parcel Information:</h3>
//     <p>Tracking Number: ${data.parcel.trackingNumber}</p>
//     <p>Status: ${data.parcel.status}</p>
//     <p>Origin: ${data.parcel.origin}</p>
//     <p>Destination: ${data.parcel.destination}</p>
//     <p>Current Location: ${data.parcel.currentLocation}</p>
//     <h4>Status Updates:</h4>
//     <ul>
//     ${data.parcel.statusUpdates
//       .map((update) => `<li>${update.status} - ${update.location}</li>`)
//       .join("")}
//     </ul>
//     `;
//       }
//     })
//     .catch((error) => {
//       parcelInfoDiv.innerHTML = `<p>Error fetching parcel information: ${error.message}</p>`;
//     });
// };

// const data = null;

// const xhr = new XMLHttpRequest();
// xhr.withCredentials = true;

// xhr.addEventListener('readystatechange', function () {
// 	if (this.readyState === this.DONE) {
// 		console.log(this.responseText);
// 	}
// });

// xhr.open('GET', 'https://google-translator9.p.rapidapi.com/v2/languages');
// xhr.setRequestHeader('x-rapidapi-key', '7aec16c842msh8daf7979b3ac96dp17b4b2jsnccb0ee056374');
// xhr.setRequestHeader('x-rapidapi-host', 'google-translator9.p.rapidapi.com');

// xhr.send(data);

// document.addEventListener("DOMContentLoaded", function() {
//     const data = null;

//     const xhr = new XMLHttpRequest();
//     xhr.withCredentials = true;

//     xhr.addEventListener('readystatechange', function () {
//         if (this.readyState === this.DONE) {
//             console.log('Response received:', this.responseText); // Add this line to debug
//             const response = JSON.parse(this.responseText);
//             populateLanguageDropdown(response.data.languages);
//         }
//     });

//     xhr.open('GET', 'https://google-translator9.p.rapidapi.com/v2/languages');
//     xhr.setRequestHeader('x-rapidapi-key', '7aec16c842msh8daf7979b3ac96dp17b4b2jsnccb0ee056374');
//     xhr.setRequestHeader('x-rapidapi-host', 'google-translator9.p.rapidapi.com');

//     xhr.send(data);

//     const languageNames = {
//         'af': 'Afrikaans',
//         'ak': 'Akan',
//         'am': 'Amharic',
//         'ar': 'Arabic',
//         'as': 'Assamese',
//         'ay': 'Aymara',
//         'az': 'Azerbaijani',
//         'be': 'Belarusian',
//         'bg': 'Bulgarian',
//         'bho': 'Bhojpuri',
//         'bm': 'Bambara',
//         'bn': 'Bengali',
//         'bs': 'Bosnian',
//         'ca': 'Catalan',
//         'ceb': 'Cebuano',
//         'ckb': 'Central Kurdish',
//         'co': 'Corsican',
//         'cs': 'Czech',
//         'cy': 'Welsh',
//         'da': 'Danish',
//         'de': 'German',
//         'doi': 'Dogri',
//         'dv': 'Dhivehi',
//         'ee': 'Ewe',
//         'el': 'Greek',
//         'en': 'English',
//         'eo': 'Esperanto',
//         'es': 'Spanish',
//         'et': 'Estonian',
//         'eu': 'Basque',
//         'fa': 'Persian',
//         'fi': 'Finnish',
//         'fr': 'French',
//         'fy': 'Western Frisian',
//         'ga': 'Irish',
//         'gd': 'Scottish Gaelic',
//         'gl': 'Galician',
//         'gn': 'Guarani',
//         'gom': 'Goan Konkani',
//         'gu': 'Gujarati',
//         'ha': 'Hausa',
//         'haw': 'Hawaiian',
//         'he': 'Hebrew',
//         'hi': 'Hindi',
//         'hmn': 'Hmong',
//         'hr': 'Croatian',
//         'ht': 'Haitian Creole',
//         'hu': 'Hungarian',
//         'hy': 'Armenian',
//         'id': 'Indonesian',
//         'ig': 'Igbo',
//         'ilo': 'Ilocano',
//         'is': 'Icelandic',
//         'it': 'Italian',
//         'ja': 'Japanese',
//         'jv': 'Javanese',
//         'ka': 'Georgian',
//         'kk': 'Kazakh',
//         'km': 'Khmer',
//         'kn': 'Kannada',
//         'ko': 'Korean',
//         'kri': 'Krio',
//         'ku': 'Kurdish',
//         'ky': 'Kyrgyz',
//         'la': 'Latin',
//         'lb': 'Luxembourgish',
//         'lg': 'Ganda',
//         'ln': 'Lingala',
//         'lo': 'Lao',
//         'lt': 'Lithuanian',
//         'lus': 'Mizo',
//         'lv': 'Latvian',
//         'mai': 'Maithili',
//         'mg': 'Malagasy',
//         'mi': 'Maori',
//         'mk': 'Macedonian',
//         'ml': 'Malayalam',
//         'mn': 'Mongolian',
//         'mr': 'Marathi',
//         'ms': 'Malay',
//         'mt': 'Maltese',
//         'my': 'Burmese',
//         'ne': 'Nepali',
//         'nl': 'Dutch',
//         'no': 'Norwegian',
//         'nso': 'Northern Sotho',
//         'ny': 'Nyanja',
//         'om': 'Oromo',
//         'or': 'Odia',
//         'pa': 'Punjabi',
//         'pl': 'Polish',
//         'ps': 'Pashto',
//         'pt': 'Portuguese',
//         'qu': 'Quechua',
//         'ro': 'Romanian',
//         'ru': 'Russian',
//         'rw': 'Kinyarwanda',
//         'sa': 'Sanskrit',
//         'sd': 'Sindhi',
//         'si': 'Sinhala',
//         'sk': 'Slovak',
//         'sl': 'Slovenian',
//         'sm': 'Samoan',
//         'sn': 'Shona',
//         'so': 'Somali',
//         'sq': 'Albanian',
//         'sr': 'Serbian',
//         'st': 'Southern Sotho',
//         'su': 'Sundanese',
//         'sv': 'Swedish',
//         'sw': 'Swahili',
//         'ta': 'Tamil',
//         'te': 'Telugu',
//         'tg': 'Tajik',
//         'th': 'Thai',
//         'ti': 'Tigrinya',
//         'tk': 'Turkmen',
//         'tl': 'Tagalog',
//         'tr': 'Turkish',
//         'ts': 'Tsonga',
//         'tt': 'Tatar',
//         'ug': 'Uyghur',
//         'uk': 'Ukrainian',
//         'ur': 'Urdu',
//         'uz': 'Uzbek',
//         'vi': 'Vietnamese',
//         'xh': 'Xhosa',
//         'yi': 'Yiddish',
//         'yo': 'Yoruba',
//         'zh': 'Chinese',
//         'zh-CN': 'Chinese (Simplified)',
//         'zh-TW': 'Chinese (Traditional)',
//         'zu': 'Zulu'
//     };


//     function populateLanguageDropdown(languages) {
//         console.log('Languages:', languages);
//         const dropdown = document.getElementById('language-dropdown');
//         languages.forEach(language => {
//             const option = document.createElement('option');
//             option.value = language.language;
//             option.textContent = languageNames[language.language] || language.language; // Use full name if available, otherwise use the code
//             console.log('Adding option:', option);
//             dropdown.appendChild(option);
//         });
//         console.log('Dropdown after population:', dropdown);
//     }

//     function translatePage() {
//         const selectedLanguage = document.getElementById('language-dropdown').value;
        
//         // Collect all translatable text
//         const elementsToTranslate = document.querySelectorAll('[data-translate]');
//         const placeholdersToTranslate = document.querySelectorAll('[data-translate-placeholder]');
        
//         let textToTranslate = [];

//         elementsToTranslate.forEach(el => {
//             textToTranslate.push(el.textContent.trim());
//         });

//         placeholdersToTranslate.forEach(el => {
//             textToTranslate.push(el.getAttribute('data-translate-placeholder'));
//         });

//         // Join all text with a unique separator
//         const combinedText = textToTranslate.join(' ||| ');

//         const translationXhr = new XMLHttpRequest();
//         translationXhr.withCredentials = true;

//         translationXhr.addEventListener('readystatechange', function () {
//             if (this.readyState === this.DONE) {
//                 const translationResponse = JSON.parse(this.responseText);
//                 if (translationResponse.data && translationResponse.data.translations && translationResponse.data.translations.length > 0) {
//                     const translatedTexts = translationResponse.data.translations[0].translatedText.split(' ||| ');
//                     updatePageContent(translatedTexts);
//                 }
//             }
//         });

//         translationXhr.open('POST', 'https://google-translator9.p.rapidapi.com/v2');
//         translationXhr.setRequestHeader('content-type', 'application/json');
//         translationXhr.setRequestHeader('x-rapidapi-key', '7aec16c842msh8daf7979b3ac96dp17b4b2jsnccb0ee056374');
//         translationXhr.setRequestHeader('x-rapidapi-host', 'google-translator9.p.rapidapi.com');

//         const translationData = {
//             q: combinedText,
//             target: selectedLanguage
//         };

//         translationXhr.send(JSON.stringify(translationData));
//     }

//     function updatePageContent(translatedTexts) {
//         let textIndex = 0;
//         const elementsToTranslate = document.querySelectorAll('[data-translate]');
//         const placeholdersToTranslate = document.querySelectorAll('[data-translate-placeholder]');

//         elementsToTranslate.forEach(el => {
//             el.textContent = translatedTexts[textIndex];
//             textIndex++;
//         });

//         placeholdersToTranslate.forEach(el => {
//             el.setAttribute('placeholder', translatedTexts[textIndex]);
//             textIndex++;
//         });
//     }

//     // Add event listener to dropdown
//     document.getElementById('language-dropdown').addEventListener('change', translatePage);
// });


// 

document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript file loaded');
    fetchLanguages();
});

async function fetchLanguages() {
    console.log('Fetching languages...');
    try {
        const response = await fetch('https://shippingsite.onrender.com/languages');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch languages: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Fetched languages:', data);

        if (data.data && data.data.languages && Array.isArray(data.data.languages)) {
            populateLanguageDropdown(data.data.languages);
        } else {
            console.error('Unexpected data structure:', data);
            throw new Error('Unexpected data structure received from server');
        }
    } catch (error) {
        console.error('Error fetching languages:', error);
        alert('Failed to fetch languages: ' + error.message);
    }
}

function populateLanguageDropdown(languages) {
    const languageNames = {
        // your language mapping object here
    };

    console.log('Languages:', languages);
    const dropdown = document.getElementById('language-dropdown');
    languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language.language;
        option.textContent = languageNames[language.language] || language.language; // Use full name if available, otherwise use the code
        console.log('Adding option:', option);
        dropdown.appendChild(option);
    });
    console.log('Dropdown after population:', dropdown);
}

document.getElementById('language-dropdown').addEventListener('change', (event) => {
    const selectedLanguage = event.target.value;
    translatePage(selectedLanguage);
});



const trackBtn = () => {
    const trackingNumber = document.getElementById("track").value;
    if (trackingNumber) {
        window.location.href = `tracking.html?trackingNumber=${trackingNumber}`;
    } else {
        alert("Please enter a tracking number.");
    }
};

  