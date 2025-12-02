import { useState } from "react";
import axios from "axios";
import "./AddEventModal.css";

function AddEventModal({ isOpen, onClose, onEventAdded }) {
  const [formData, setFormData] = useState({
    event: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    requiredItems: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const eventData = {
        ...formData,
        username: localStorage.getItem("username"),
        userrole: localStorage.getItem("userrole"),
        userfamily: localStorage.getItem("userfamily"),
      };

      const response = await axios.post(
        "http://localhost:3002/new-event-entry",
        eventData
      );

      if (response.data.success) {
        setMessage("Event created successfully!");

        // Reset form
        setFormData({
          event: "",
          date: "",
          startTime: "",
          endTime: "",
          location: "",
          requiredItems: "",
        });

        // Notify parent to refresh events
        setTimeout(() => {
          setMessage("");
          onEventAdded();
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setIsError(true);
      setMessage("Failed to create event. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Event</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="event">Event Name</label>
            <input
              type="text"
              id="event"
              name="event"
              value={formData.event}
              onChange={handleChange}
              placeholder="e.g. Swimming Lesson"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Sports Centre"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="requiredItems">Required Items</label>
            <textarea
              id="requiredItems"
              name="requiredItems"
              value={formData.requiredItems}
              onChange={handleChange}
              placeholder="e.g. Swimming costume, towel, goggles"
              rows="3"
            />
          </div>

          <button type="submit" className="submit-btn">
            Create Event
          </button>
        </form>

        {message && (
          <p className={`message ${isError ? "error" : ""}`}>{message}</p>
        )}
      </div>
    </div>
  );
}

export default AddEventModal;
