import { useState, useEffect } from "react";
import "./MapModal.css";

function MapModal({ isOpen, onClose, event }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && event?.location) {
      setIsLoading(true);
      setError(null);
      setCoordinates(null);

      // Geocode the location using Nominatim (free OpenStreetMap geocoding)
      const geocodeLocation = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              event.location
            )}&limit=1`,
            {
              headers: {
                "User-Agent": "FamilyOrganiser/1.0",
              },
            }
          );

          const data = await response.json();

          if (data && data.length > 0) {
            setCoordinates({
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
              displayName: data[0].display_name,
            });
          } else {
            setError("Location not found. Try a more specific address.");
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          setError("Failed to load map. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };

      geocodeLocation();
    }
  }, [isOpen, event]);

  useEffect(() => {
    // Load Leaflet CSS and JS dynamically
    if (isOpen && !mapLoaded) {
      // Add Leaflet CSS
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      linkEl.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      linkEl.crossOrigin = "";
      document.head.appendChild(linkEl);

      // Add Leaflet JS
      const scriptEl = document.createElement("script");
      scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      scriptEl.integrity =
        "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      scriptEl.crossOrigin = "";
      scriptEl.onload = () => setMapLoaded(true);
      document.body.appendChild(scriptEl);

      return () => {
        // Cleanup not needed as Leaflet should persist
      };
    }
  }, [isOpen, mapLoaded]);

  useEffect(() => {
    // Initialize map when coordinates are available and Leaflet is loaded
    if (mapLoaded && coordinates && isOpen && window.L) {
      const mapContainer = document.getElementById("event-map");
      if (mapContainer && !mapContainer._leaflet_id) {
        const map = window.L.map("event-map").setView(
          [coordinates.lat, coordinates.lon],
          15
        );

        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        ).addTo(map);

        // Add marker
        window.L.marker([coordinates.lat, coordinates.lon])
          .addTo(map)
          .bindPopup(`<strong>${event.name}</strong><br>${event.location}`)
          .openPopup();

        // Store map reference for cleanup
        mapContainer._mapInstance = map;
      }
    }

    // Cleanup map on close
    return () => {
      const mapContainer = document.getElementById("event-map");
      if (mapContainer && mapContainer._mapInstance) {
        mapContainer._mapInstance.remove();
        mapContainer._mapInstance = null;
      }
    };
  }, [mapLoaded, coordinates, isOpen, event]);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const openInGoogleMaps = () => {
    const query = encodeURIComponent(event.location);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank"
    );
  };

  const openInAppleMaps = () => {
    const query = encodeURIComponent(event.location);
    window.open(`https://maps.apple.com/?q=${query}`, "_blank");
  };

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="map-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="map-modal-header">
          <h2>{event.name}</h2>
          <p className="map-modal-date">
            📅 {formatDate(event.date)}
            {event.startTime && (
              <span className="map-modal-time">
                {" "}
                • 🕐 {formatTime(event.startTime)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </span>
            )}
          </p>
        </div>

        <div className="map-modal-location">
          <div className="location-icon">📍</div>
          <div className="location-details">
            <span className="location-label">Location</span>
            <span className="location-address">{event.location}</span>
            {coordinates && (
              <span className="location-full">{coordinates.displayName}</span>
            )}
          </div>
        </div>

        <div className="map-container">
          {isLoading && (
            <div className="map-loading">
              <div className="map-spinner"></div>
              <p>Loading map...</p>
            </div>
          )}

          {error && (
            <div className="map-error">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <p className="error-hint">
                You can still open this location in your preferred maps app
                below.
              </p>
            </div>
          )}

          {!isLoading && !error && coordinates && (
            <div id="event-map" className="leaflet-map"></div>
          )}
        </div>

        <div className="map-modal-actions">
          <button className="map-action-btn google" onClick={openInGoogleMaps}>
            <span className="btn-icon">🗺️</span>
            Open in Google Maps
          </button>
          <button className="map-action-btn apple" onClick={openInAppleMaps}>
            <span className="btn-icon">🍎</span>
            Open in Apple Maps
          </button>
        </div>

        {event.requiredItems && (
          <div className="map-modal-items">
            <span className="items-label">🎒 Don't forget:</span>
            <span className="items-list">{event.requiredItems}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapModal;
