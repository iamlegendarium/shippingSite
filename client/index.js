// Track button functionality
const trackBtn = () => {
    const trackingNumber = document.getElementById("track").value;
    if (!trackingNumber) {
        alert("Please enter a tracking number.");
        return;
    }
    if (trackingNumber) {
        window.location.href = `tracking.html?trackingNumber=${encodeURIComponent(trackingNumber)}`;
    }
};

// Make trackBtn globally available
window.trackBtn = trackBtn;

// Add enter key support for tracking input
document.addEventListener('DOMContentLoaded', () => {
    const trackInput = document.getElementById('track');
    if (trackInput) {
        trackInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                trackBtn();
            }
        });
    }
});

// const trackBtn = () => {
//     const trackingNumber = document.getElementById("track").value;
//     if(!trackingNumber){
//         window.location.href = 'index.html'
//     }
//     if (trackingNumber) {
//         window.location.href = `tracking.html?trackingNumber=${trackingNumber}`;
//     } else {
//         alert("Please enter a tracking number.");
//     }
// };
