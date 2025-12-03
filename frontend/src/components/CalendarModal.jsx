import { useState } from "react";
import "./CalenderModal.css";

function CalendarModal({ isOpen, onClose, events }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay(); // 0 = Sunday

  // Month names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigate months
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Format date to match event date format (YYYY-MM-DD)
  const formatDateString = (y, m, d) => {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(
      2,
      "0"
    )}`;
  };

  // Check if a date has events
  const getEventsForDate = (day) => {
    const dateString = formatDateString(year, month, day);
    return events.filter((event) => event.date === dateString);
  };

  // Handle date click
  const handleDateClick = (day) => {
    const dateString = formatDateString(year, month, day);
    setSelectedDate(dateString);
  };

  // Get events for selected date
  const selectedDateEvents = selectedDate
    ? events.filter((event) => event.date === selectedDate)
    : [];

  // Format selected date for display
  const formatSelectedDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateEvents = getEventsForDate(day);
      const hasEvents = dateEvents.length > 0;
      const dateString = formatDateString(year, month, day);
      const isSelected = selectedDate === dateString;

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasEvents ? "has-events" : ""} ${
            isToday(day) ? "today" : ""
          } ${isSelected ? "selected" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {hasEvents && <span className="event-dot">{dateEvents.length}</span>}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="calendar-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📅 Calendar</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="calendar-container">
          {/* Calendar Navigation */}
          <div className="calendar-nav">
            <button className="nav-btn" onClick={goToPrevMonth}>
              ‹
            </button>
            <div className="current-month">
              <span>
                {monthNames[month]} {year}
              </span>
              <button className="today-btn" onClick={goToToday}>
                Today
              </button>
            </div>
            <button className="nav-btn" onClick={goToNextMonth}>
              ›
            </button>
          </div>

          {/* Day Headers */}
          <div className="calendar-grid day-headers">
            {dayNames.map((day) => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="calendar-grid">{generateCalendarDays()}</div>
        </div>

        {/* Events List for Selected Date */}
        <div className="selected-date-events">
          {selectedDate ? (
            <>
              <h3>{formatSelectedDate(selectedDate)}</h3>
              {selectedDateEvents.length > 0 ? (
                <div className="events-list">
                  {selectedDateEvents
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((event) => (
                      <div key={event._id} className="event-item">
                        <div className="event-time">
                          {event.startTime} - {event.endTime}
                        </div>
                        <div className="event-info">
                          <div className="event-name">{event.event}</div>
                          <div className="event-location">
                            📍 {event.location}
                          </div>
                          {event.requiredItems && (
                            <div className="event-items">
                              🎒 {event.requiredItems}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="no-events-message">
                  No events scheduled for this day.
                </p>
              )}
            </>
          ) : (
            <p className="select-date-message">Select a date to view events</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarModal;
