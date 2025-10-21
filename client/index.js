
const trackBtn = async () => {
    const trackingNumber = document.getElementById("track").value;
    if (!trackingNumber) {
        alert("Please enter a tracking number.");
        return;
    }
    
    try {
        // Send tracking number as query parameter
        // const response = await fetch(`http://localhost:3000/api/parcel/tracking?trackingNumber=${encodeURIComponent(trackingNumber)}`);
        const response = await fetch(`https://shippingsite.onrender.com/api/parcel/tracking?trackingNumber=${encodeURIComponent(trackingNumber)}`);
        // const response = await fetch(`http://localhost:3000/api/parcel/tracking?trackingNumber=${encodeURIComponent(trackingNumber)}`);
        

        if (!response.ok) {
            if (response.status === 404) {
                alert('Tracking number not found.');
                return;
            }
            throw new Error('Failed to fetch tracking information');
        }

        const data = await response.json();
        
        // If parcel found, redirect to tracking page
        if (data.parcel) {
            window.location.href = `tracking.html?trackingNumber=${encodeURIComponent(trackingNumber)}`;
        } else {
            alert('Tracking number not found.');
        }
        
    } catch (error) {
        console.error('Tracking error:', error);
        alert('Error fetching tracking information. Please try again.');
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