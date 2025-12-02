import { Link } from "react-router-dom";
import "./styles/Home.css";

function Home() {
  return (
    <div className="home-container">
      <h1>Family Organiser</h1>
      <p className="tagline">
        Keep your family's schedule organised in one place
      </p>

      <div className="features">
        <div className="feature-card">
          <div className="icon">📅</div>
          <h3>Manage Events</h3>
          <p>
            Create and track family events like appointments, activities, and
            special occasions.
          </p>
        </div>

        <div className="feature-card">
          <div className="icon">👨‍👩‍👧‍👦</div>
          <h3>Family Sharing</h3>
          <p>
            Share schedules with your family members so everyone stays in the
            loop.
          </p>
        </div>

        <div className="feature-card">
          <div className="icon">📍</div>
          <h3>Location & Items</h3>
          <p>Track where events are and what items you need to bring.</p>
        </div>

        <div className="feature-card">
          <div className="icon">🔍</div>
          <h3>Search & Filter</h3>
          <p>
            Quickly find events by searching or filtering through your schedule.
          </p>
        </div>
      </div>

      <div className="cta-buttons">
        <Link to="/register" className="primary-btn">
          Get Started
        </Link>
        <Link to="/login" className="secondary-btn">
          Login
        </Link>
      </div>
    </div>
  );
}

export default Home;
