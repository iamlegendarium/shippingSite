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


const trackBtn = () => {
    const trackingNumber = document.getElementById("track").value;
    if (trackingNumber) {
        window.location.href = `tracking.html?trackingNumber=${trackingNumber}`;
    } else {
        alert("Please enter a tracking number.");
    }
};

  