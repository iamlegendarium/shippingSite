document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript file loaded');
    fetchLanguages();
});

async function fetchLanguages() {
    console.log('Fetching languages...');
    try {
        const response = await fetch('http://localhost:3000/api/languages');
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
    if(!trackingNumber){
        window.location.href = 'index.html'
    }
    if (trackingNumber) {
        window.location.href = `tracking.html?trackingNumber=${trackingNumber}`;
    } else {
        alert("Please enter a tracking number.");
    }
};
