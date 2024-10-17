import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import LapakInfo from "./informasi-lapak";

import DraggableLocationInfo from "./location-info";
import { mapImages } from "../assets";
import { useNavigate } from "react-router-dom";
import { lapakImages } from "../assets"; // Import gambar
const { profile } = lapakImages; // Ambil ikon profile

const { clickLocationIcon, currentLocationIcon, shopIcon } = mapImages;

const CurrentLocationIcon = L.icon({
  iconUrl: currentLocationIcon,
  iconSize: [25, 25],
});

const ClickLocationIcon = L.icon({
  iconUrl: clickLocationIcon,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const LapakIcon = L.icon({
  iconUrl: shopIcon,
  iconSize: [20, 20],
});

const fetchAddress = async (lat, lng) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat: lat,
          lon: lng,
          format: "json",
          addressdetails: 1,
        },
      }
    );

    if (response.data) {
      return {
        name: response.data.address.road || "Unknown Road",
        fullAddress: `${response.data.address.road || ""}, ${response.data.address.suburb || ""
          }, ${response.data.address.city || ""}, ${response.data.address.state || ""
          }, ${response.data.address.country || ""}`,
        plusCode: "N/A",
      };
    }
  } catch (error) {
    console.error("Error fetching address:", error);
    return {
      name: "Unknown Road",
      fullAddress: "Unknown Address",
      plusCode: "N/A",
    };
  }
};

function CurrentLocationMarker() {
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentPosition([latitude, longitude]);
        },
        (err) => {
          console.error(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  }, []);

  return currentPosition ? (
    <Marker position={currentPosition} icon={CurrentLocationIcon}>
      <Popup>
        You are here: <br /> Latitude: {currentPosition[0]} <br /> Longitude:{" "}
        {currentPosition[1]}
      </Popup>
    </Marker>
  ) : null;
}

function ClickLocationMarker({ setClickedLocation }) {
  useMapEvent("click", (event) => {
    setClickedLocation({
      lat: event.latlng.lat,
      lng: event.latlng.lng,
    });
  });

  return null;
}

function Map() {
  const defaultPosition = [-6.901179, 107.623272];
  const [clickedLocation, setClickedLocation] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedLapak, setSelectedLapak] = useState(null);

  const lapakLocation = {
    lat: -6.874743208622524,
    lng: 107.60714037413038,
    name: "Teman Lama",
    address: "Jl. Bima No.60, Arjuna, Kec. Cicendo, Kota Bandung, Jawa Barat 40172"
  };

  useEffect(() => {
    if (clickedLocation) {
      fetchAddress(clickedLocation.lat, clickedLocation.lng).then((info) => {
        setLocationInfo(info);
        setIsPanelOpen(true);
      });
    }
  }, [clickedLocation]);

  // Handler untuk menutup panel
  const closePanel = () => {
    setIsPanelOpen(false);
    setClickedLocation(null);
    setSelectedLapak(null);
  };

  const handleLapakClick = () => {
    setSelectedLapak(lapakLocation);
    setIsPanelOpen(false); // Close the location info panel if open
  };

  const navigate = useNavigate();

  // Fungsi untuk handle ketika tombol profile diklik
  const goToProfile = () => {
    navigate("/profileUser");
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapContainer
        center={defaultPosition}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: "0" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <CurrentLocationMarker />
        <ClickLocationMarker setClickedLocation={setClickedLocation} />
        {clickedLocation && (
          <Marker
            position={[clickedLocation.lat, clickedLocation.lng]}
            icon={ClickLocationIcon}
          >
            <Popup>
              Clicked Location: <br /> Latitude: {clickedLocation.lat} <br />{" "}
              Longitude: {clickedLocation.lng}
            </Popup>
          </Marker>
        )}

        <Marker
          position={[lapakLocation.lat, lapakLocation.lng]}
          icon={LapakIcon}
          eventHandlers={{
            click: handleLapakClick,
          }}
        >
        </Marker>
      </MapContainer>
      {/* Ikon Profile di pojok kanan atas */}
      <div
        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg cursor-pointer"
        onClick={goToProfile}
      >
        <img src={profile} className="w-7 h-7 rounded-full" alt="Profile" />
      </div>


      {locationInfo && isPanelOpen && (
        <DraggableLocationInfo
          locationData={{
            name: locationInfo.name,
            fullAddress: locationInfo.fullAddress,
            distance: "N/A",
            plusCode: locationInfo.plusCode,
            coordinates: `${clickedLocation
              ? `${clickedLocation.lat}, ${clickedLocation.lng}`
              : "N/A"
              }`,
          }}
          onClose={closePanel}
        />
      )}

      {selectedLapak && (
        <LapakInfo
          lapak={selectedLapak}
          onClose={() => setSelectedLapak(null)}
        />
      )}
    </div>
  );
}

export default Map;

//map default
// url = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
// attribution = '&copy; <a href="https://carto.com/attributions">CartoDB</a>';

// const [position, setPosition] = useState(null);

// useEffect(() => {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const { latitude, longitude } = pos.coords;
//         setPosition([latitude, longitude]);
//       },
//       () => {
//         console.error("Geolocation is not supported or permission denied");
//       }
//     );
//   }
// }, []);

// if (!position) {
//   return <p>Loading your location...</p>;
// }

// return (
//   <MapContainer center={position} zoom={13} style={{ height: "80vh", width: "100%" }}>
//     <TileLayer
//       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     />
//     <Marker position={position}>
//       <Popup>
//         You are here.
//       </Popup>
//     </Marker>
//   </MapContainer>
// );
