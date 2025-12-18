// import React, { useEffect, useState } from 'react';

// function MachineTrack() {
//   const [user, setUser] = useState(null);
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Example login credentials
//     const email = "user@tusuka.com";
//     const password = "password";

//     async function loginUser() {
//       try {
//         const response = await fetch('http://192.168.136.52:5000/api/v1/login', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ email, password }),
//           credentials: 'include' // only if backend uses cookies/session
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json();
//         console.log('Login successful:', result);

//         // Assuming backend returns user info
//         setUser(result.user || { first_name: "User" });

//         // Optional: fetch machine dashboard data
//         fetchMachineData();

//       } catch (error) {
//         console.error('Login failed:', error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     async function fetchMachineData() {
//       try {
//         const response = await fetch('http://192.168.136.52:5000/api/v1/machine-data', {
//           headers: { 'Content-Type': 'application/json' },
//           credentials: 'include'
//         });

//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//         const machineData = await response.json();
//         setData(machineData);
//       } catch (err) {
//         console.error('Failed to fetch machine data:', err);
//       }
//     }

//     loginUser();
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (!user) return <div>Login failed or user not found.</div>;

//   return (
//     <div>
//       <h1>Welcome, {user.first_name}</h1>
//       <h2>Machine Dashboard</h2>
//       <ul>
//         {data.length === 0 && <li>No machine data available.</li>}
//         {data.map((item, index) => (
//           <li key={index}>
//             {item.name} - {item.status}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default MachineTrack;




import React from 'react';

function MachineTrack() {
  // Create a URL with authentication token as query parameter
  const iframeUrl = `http://192.168.136.52:5000/Machine/Transfer/Dashboard?bypass_csrf=true`;

  return (
    <div>
      <iframe
        src={iframeUrl}
        className="w-full h-screen border-0"
        // Remove CORS restrictions for same-network resources
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default MachineTrack;