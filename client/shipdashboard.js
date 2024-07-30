document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript file loaded');
    fetchShipments();
});

async function fetchShipments() {
    console.log('Fetching shipments...');
    try {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        
        if (!token) {
            throw new Error('No token found in localStorage');
        }

        const response = await fetch('https://shippingsite.onrender.com/shipments', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch shipments: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data);
        
        if (data.shipments && Array.isArray(data.shipments)) {
            renderShipments(data.shipments);
        } else {
            // console.error('Unexpected data structure:', data);
            // throw new Error('Unexpected data structure received from server');
        }
    } catch (error) {
        console.error('Error fetching shipments:', error);
        alert('Failed to fetch shipments: ' + error.message);
    }
}

function renderShipments(shipments) {
    const shipmentTableBody = document.getElementById('shipmentTableBody');
    shipmentTableBody.innerHTML = '';

    if (shipments && shipments.length > 0) {
        shipments.forEach(shipment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${shipment.trackingNumber}</td>
                <td>${shipment.origin}</td>
                <td>${shipment.destination}</td>
                <td>${shipment.status}</td>
                <td>${shipment.senderName}</td>
                <td>${shipment.receiverName}</td>
            `;
            shipmentTableBody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center">No shipment data available</td>
        `;
        shipmentTableBody.appendChild(row);
    }
}
