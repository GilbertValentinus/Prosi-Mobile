import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import LapakInfo from "./informasi-lapak";
import Searchbar from "./searchbar";

import DraggableLocationInfo from "./location-info";
import { mapImages } from "../assets";



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

function MapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function Map() {
  const defaultPosition = [-6.901179, 107.623272];
  const [clickedLocation, setClickedLocation] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedLapak, setSelectedLapak] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultPosition);
  const [mapZoom, setMapZoom] = useState(13);
  const mapRef = useRef(null);

  const lapakLocation = {
    lat: -6.874743208622524,
    lng: 107.60714037413038,
    name: "Teman Lama",
    address: "Jl. Bima No.60, Arjuna, Kec. Cicendo, Kota Bandung, Jawa Barat 40172"
  };
  const [lapaks, setLapaks] = useState([]);

// Map.jsx
useEffect(() => {
  if (clickedLocation) {
    fetchAddress(clickedLocation.lat, clickedLocation.lng).then((info) => {
      setLocationInfo(info);
      setIsPanelOpen(true);
      localStorage.setItem(
        'selectedLocation',
        JSON.stringify({
          address: info.fullAddress,
          latitude: clickedLocation.lat, // simpan latitude
          longitude: clickedLocation.lng // simpan longitude
        })
      );
    });
  }
}, [clickedLocation]);
  
  useEffect(() => {
    axios
      .get("/api/lapak")
      .then((response) => {
        console.log("Response:", response.data);
        if (response.data.success) {
          console.log("Lapaks data:", response.data.lapaks);
          setLapaks(response.data.lapaks);
        } else {
          console.error("Failed to fetch lapaks:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching lapak data:", error);
      });
  }, []);


  const closePanel = () => {
    setIsPanelOpen(false);
    setClickedLocation(null);
    setSelectedLapak(null);
  };

  const handleLapakClick = (lapak) => {
    setSelectedLapak(lapak);
    setIsPanelOpen(false);
  };

  const handleSelectLocation = (lat, lng, lapakInfo, lapak) => {
    setMapCenter([lat, lng]);
    setMapZoom(200);
    handleLapakClick(lapak)
    // if (lapakInfo) {
    //   setSelectedLapak(lapakInfo);
    // }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Searchbar onSelectLocation={handleSelectLocation} />
      <MapContainer
        center={defaultPosition}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: "0" }}
        ref={mapRef}
      >
        <MapView center={mapCenter} zoom={mapZoom} />
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
              Clicked Location: <br /> Latitude: {clickedLocation.lat} <br />
              Longitude: {clickedLocation.lng}
            </Popup>
          </Marker>
        )}

        {lapaks.map((lapak) => (
          <Marker
            key={`lapak-marker-${lapak.id_lapak}`}
            position={[lapak.latitude, lapak.longitude]}
            icon={LapakIcon}
            eventHandlers={{
              click: () => handleLapakClick(lapak),
            }}
          >
            <Popup>{lapak.nama_lapak}</Popup>
          </Marker>
        ))}
      </MapContainer>



      {locationInfo && isPanelOpen && (
        <DraggableLocationInfo
          key={`location-info-${clickedLocation?.lat}-${clickedLocation?.lng}`}
          locationData={{
            name: locationInfo.name,
            fullAddress: locationInfo.fullAddress,
            distance: "N/A",
            plusCode: locationInfo.plusCode,
            coordinates: clickedLocation
              ? `${clickedLocation.lat}, ${clickedLocation.lng}`
              : "N/A",
          }}
          onClose={closePanel}
        />
      )}

      {selectedLapak && (
        <LapakInfo
          key={`lapak-info-${selectedLapak.id_lapak}`}
          lapak={{
            lapakId: selectedLapak.id_lapak,
            id_lapak: selectedLapak.id_lapak,
            name: selectedLapak.nama_lapak,
            address: selectedLapak.lokasi_lapak,
            situs: selectedLapak.situs,
            foto: selectedLapak.foto_lapak,
            latitude: selectedLapak.latitude,
            longitude: selectedLapak.longitude,
            ulasan: selectedLapak.ulasan,
            jam_buka: selectedLapak.jam_buka, // Tambahkan jam_buka
            jam_tutup: selectedLapak.jam_tutup, // Tambahkan jam_tutup
          }}
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
