// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Redirect to login page if not authenticated
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Fetch and display shipments
async function fetchShipments() {
    if (!checkAuth()) return;

    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("https://shippingsite.onrender.com/api/parcel/shipments", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token is invalid, redirect to login
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`Failed to fetch shipments: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.shipments && Array.isArray(data.shipments)) {
            renderShipments(data.shipments);
        } else {
            document.getElementById('shipmentTableBody').innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No shipment data available</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error("Error fetching shipments:", error);
        document.getElementById('shipmentTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Error loading shipments: ${error.message}
                </td>
            </tr>
        `;
    }
}

function renderShipments(shipments) {
    const shipmentTableBody = document.getElementById("shipmentTableBody");
    shipmentTableBody.innerHTML = "";

    if (shipments && shipments.length > 0) {
        shipments.forEach((shipment) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${shipment.trackingNumber}</td>
                <td>${shipment.origin}</td>
                <td>${shipment.destination}</td>
                <td>${shipment.status}</td>
                <td>${shipment.senderName}</td>
                <td>${shipment.receiverName}</td>
                <td>${shipment.receiverAddress}</td>
            `;
            shipmentTableBody.appendChild(row);
        });
    } else {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td colspan="7" class="text-center">No shipment data available</td>
        `;
        shipmentTableBody.appendChild(row);
    }
}

// Load shipments when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (checkAuth()) {
        fetchShipments();
    }
});