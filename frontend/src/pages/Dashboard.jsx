import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddEventModal from "../components/AddEvent.jsx";
import "./styles/Dashboard.css";

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [family, setFamily] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const fetchEvents = async () => {
    try {
      const familyId = localStorage.getItem("userfamily");
      const response = await axios.post(
        "http://localhost:3002/get-family-events",
        {
          familyId: familyId,
        }
      );

      setEvents(response.data);
      setFilteredEvents(response.data);
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
        setEvents(events.filter((event) => event._id !== eventId));
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
        <button className="add-event-btn" onClick={() => setIsModalOpen(true)}>
          + Add New Event
        </button>
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
          <p>No events found. Create your first family event!</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div className="event-card" key={event._id}>
              <h3>{event.event}</h3>
              <div className="event-detail">
                <span className="icon">📅</span>
                <span>{event.date}</span>
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
                <div className="event-actions">
                  <button className="edit-btn">Edit</button>
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventAdded={fetchEvents}
      />
    </div>
  );
}

export default Dashboard;
