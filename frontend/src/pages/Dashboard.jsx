import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddEventModal from "../components/AddEvent.jsx";
import EditEventModal from "../components/EditEventModal.jsx";
import CalendarModal from "../components/CalendarModal.jsx";
import MapModal from "../components/MapModal.jsx";
import "./styles/Dashboard.css";

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [family, setFamily] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mapEvent, setMapEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setUsername(localStorage.getItem("username"));
    setFamily(localStorage.getItem("userfamily"));

    fetchEvents();
  }, [navigate]);

  // Filter out past events (events that have already ended)
  const filterPastEvents = (eventsToFilter) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    return eventsToFilter.filter((event) => {
      // If event date is in the future, keep it
      if (event.date > today) {
        return true;
      }
      // If event date is today, check if end time has passed
      if (event.date === today) {
        // If event has an end time, check if it's passed
        if (event.endTime) {
          return event.endTime > currentTime;
        }
        // If no end time but has start time, keep if start time hasn't passed
        if (event.startTime) {
          return event.startTime > currentTime;
        }
        // If no times at all, keep it for today
        return true;
      }
      // Event date is in the past, filter it out
      return false;
    });
  };

  // Sort events by date (earliest first), then by start time
  const sortEventsByDate = (eventsToSort) => {
    return [...eventsToSort].sort((a, b) => {
      // First compare by date
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) {
        return dateComparison;
      }
      // If same date, compare by start time
      return a.startTime.localeCompare(b.startTime);
    });
  };

  const fetchEvents = async () => {
    try {
      const familyId = localStorage.getItem("userfamily");
      const response = await axios.post(
        "http://localhost:3002/get-family-events",
        {
          familyId: familyId,
        }
      );

      // Filter out past events, then sort
      const upcomingEvents = filterPastEvents(response.data);
      const sortedEvents = sortEventsByDate(upcomingEvents);
      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(
        (event) =>
          event.event.toLowerCase().includes(term) ||
          event.location.toLowerCase().includes(term) ||
          event.requiredItems.toLowerCase().includes(term)
      );
      setFilteredEvents(filtered);
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleEventClick = (event) => {
    setMapEvent({
      name: event.event,
      location: event.location,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      requiredItems: event.requiredItems,
    });
    setIsMapModalOpen(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3002/delete-event/${eventId}`,
        {
          username: localStorage.getItem("username"),
          userfamily: localStorage.getItem("userfamily"),
        }
      );

      if (response.data["event deleted"]) {
        const updatedEvents = events.filter((event) => event._id !== eventId);
        setEvents(updatedEvents);
        setFilteredEvents(
          filteredEvents.filter((event) => event._id !== eventId)
        );
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. You can only delete events you created.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userrole");
    localStorage.removeItem("userfamily");
    navigate("/login");
  };

  // Helper function to format date nicely
  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Family Events</h2>
        <div className="user-info">
          <span>Welcome, {username}!</span>
          <span className="family-id">{family}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="actions-bar">
        <div className="actions-left">
          <button
            className="add-event-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add New Event
          </button>
          <button
            className="calendar-btn"
            onClick={() => setIsCalendarModalOpen(true)}
          >
            📅 Calendar
          </button>
        </div>
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="no-events">
          <div className="icon">📅</div>
          <p>No upcoming events found. Create your first family event!</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div
              className="event-card"
              key={event._id}
              onClick={() => handleEventClick(event)}
            >
              <h3>{event.event}</h3>
              <div className="event-detail">
                <span className="icon">📅</span>
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="event-detail">
                <span className="icon">🕐</span>
                <span>
                  {event.startTime} - {event.endTime}
                </span>
              </div>
              <div className="event-detail">
                <span className="icon">📍</span>
                <span>{event.location}</span>
              </div>
              <div className="event-detail">
                <span className="icon">🎒</span>
                <span>{event.requiredItems}</span>
              </div>
              {event.organiser === username && (
                <div
                  className="event-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(event)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(event._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onEventAdded={fetchEvents}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEvent(null);
        }}
        onEventUpdated={fetchEvents}
        event={selectedEvent}
      />

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        events={events}
      />

      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => {
          setIsMapModalOpen(false);
          setMapEvent(null);
        }}
        event={mapEvent}
      />
    </div>
  );
}

export default Dashboard;
