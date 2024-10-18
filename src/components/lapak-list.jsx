import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function LapakList() {
  const [lapaks, setLapaks] = useState([]);
  const [error, setError] = useState(null);

  // Fetch lapak summary (name and address) for the logged-in user
  useEffect(() => {
    const fetchLapakSummary = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/lapak-summary', {
          credentials: 'include', // Include session cookies
        });
        const data = await response.json();
        if (data.success) {
          setLapaks(data.lapaks); // Update state with lapak data
        } else {
          setError(data.message);
        }
      } catch (error) {
        console.error('Error fetching lapak summary:', error);
        setError('Failed to fetch lapaks');
      }
    };

    fetchLapakSummary();
  }, []);

  return (
    <div className="min-h-screen bg-[#161A32] text-white p-6">
      <div className="flex items-center mb-8">
        <Link to="/" className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[18px] font-semibold">Lapak</h1>
      </div>
      
      <div className="space-y-4">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          lapaks.map((lapak, index) => (
            <div key={index} className="border-b border-gray-700 pb-4">
              <h2 className="text-[15px] font-semibold mb-1">{lapak.name}</h2>
              <p className="text-[13px] text-gray-400">{lapak.address}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LapakList;
