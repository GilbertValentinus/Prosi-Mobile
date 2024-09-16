import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

function Map() {
    const position = [-6.901179, 107.623272];

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100vh", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/attributions">CartoDB</a>'
      />
      <Marker position={position}>
        <Popup>You are here.</Popup>
      </Marker>
    </MapContainer>
  );
}

export default Map;


//map default
// url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

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
