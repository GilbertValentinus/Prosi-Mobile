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
        fullAddress: `${response.data.address.road || ""}, ${
          response.data.address.suburb || ""
        }, ${response.data.address.city || ""}, ${
          response.data.address.state || ""
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


  useEffect(() => {
    if (clickedLocation) {
      fetchAddress(clickedLocation.lat, clickedLocation.lng).then((info) => {
        setLocationInfo(info);
        setIsPanelOpen(true);
      });
    }
  }, [clickedLocation]);


  useEffect(() => {
    axios
      .get("/api/lapak")
      .then((response) => {
        console.log(response.data); // Tambahkan ini untuk memeriksa data
        if (response.data.success) {
          setLapaks(response.data.lapaks);
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


  const handleLapakClick = () => {
    setSelectedLapak(lapakLocation);
    setIsPanelOpen(false);
  };

  const handleSelectLocation = (lat, lng, lapakInfo) => {
    setMapCenter([lat, lng]);
    setMapZoom(17);
    if (lapakInfo) {
      setSelectedLapak(lapakInfo);
    }
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
              Clicked Location: <br /> Latitude: {clickedLocation.lat} <br />{" "}
              Longitude: {clickedLocation.lng}
            </Popup>
          </Marker>
        )}

        {/* Marker untuk lapak */}
        {lapaks.map((lapak) => {
          return (
            <Marker
              key={lapak.id_lapak}
              position={[lapak.latitude, lapak.longitude]}
              icon={LapakIcon}
              eventHandlers={{
                click: () => handleLapakClick(lapak),
              }}
            ></Marker>
          );
        })}
      </MapContainer>

      {locationInfo && isPanelOpen && (
        <DraggableLocationInfo
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
          lapak={{
            name: selectedLapak.nama_lapak,
            address: selectedLapak.lokasi_lapak,
            situs: selectedLapak.situs,
            foto: selectedLapak.foto_lapak,
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