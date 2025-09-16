import "../components/dashboard/Dashboard.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Home() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">AquaNexa Dashboard</h1>
        <p className="dashboard-header__subtitle">
          Your Data Analytics Overview
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Summary Cards */}
        <div className="dashboard-grid__row">
          <div className="metric-card metric-card--primary">
            <div className="metric-card__icon">📊</div>
            <div className="metric-card__content">
              <h3 className="metric-card__title">Total Files</h3>
              <p className="metric-card__value">0</p>
            </div>
          </div>

          <div className="metric-card metric-card--success">
            <div className="metric-card__icon">✅</div>
            <div className="metric-card__content">
              <h3 className="metric-card__title">Processed</h3>
              <p className="metric-card__value">0</p>
            </div>
          </div>

          <div className="metric-card metric-card--warning">
            <div className="metric-card__icon">⏳</div>
            <div className="metric-card__content">
              <h3 className="metric-card__title">Processing</h3>
              <p className="metric-card__value">0</p>
            </div>
          </div>

          <div className="metric-card metric-card--error">
            <div className="metric-card__icon">❌</div>
            <div className="metric-card__content">
              <h3 className="metric-card__title">Failed</h3>
              <p className="metric-card__value">0</p>
            </div>
          </div>
        </div>

        {/* Main Charts Grid */}
        <div className="dashboard-grid__main">
          {/* File Type Distribution */}
          <div className="chart-card chart-card--lg">
            <div className="chart-card__header">
              <h3 className="chart-card__title">File Type Distribution</h3>
              <div className="chart-card__actions">
                <button className="chart-card__action">
                  <span className="chart-card__action-icon">⚙️</span>
                </button>
              </div>
            </div>
            <div className="chart-card__content chart-card__content--pie">
              <div className="placeholder-chart">
                <span className="placeholder-chart__icon">📊</span>
                <span className="placeholder-chart__text">
                  Pie Chart Visualization
                </span>
              </div>
            </div>
          </div>

          {/* Processing Time Trend */}
          <div className="chart-card chart-card--lg">
            <div className="chart-card__header">
              <h3 className="chart-card__title">Processing Time Trend</h3>
              <div className="chart-card__actions">
                <button className="chart-card__action">
                  <span className="chart-card__action-icon">⚙️</span>
                </button>
              </div>
            </div>
            <div className="chart-card__content chart-card__content--line">
              <div className="placeholder-chart">
                <span className="placeholder-chart__icon">📈</span>
                <span className="placeholder-chart__text">
                  Line Chart Visualization
                </span>
              </div>
            </div>
          </div>

          {/* File Size Distribution */}
          <div className="chart-card">
            <div className="chart-card__header">
              <h3 className="chart-card__title">File Size Distribution</h3>
              <div className="chart-card__actions">
                <button className="chart-card__action">
                  <span className="chart-card__action-icon">⚙️</span>
                </button>
              </div>
            </div>
            <div className="chart-card__content chart-card__content--histogram">
              <div className="placeholder-chart">
                <span className="placeholder-chart__icon">📊</span>
                <span className="placeholder-chart__text">
                  Histogram Visualization
                </span>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="chart-card">
            <div className="chart-card__header">
              <h3 className="chart-card__title">Processing Success Rate</h3>
              <div className="chart-card__actions">
                <button className="chart-card__action">
                  <span className="chart-card__action-icon">⚙️</span>
                </button>
              </div>
            </div>
            <div className="chart-card__content chart-card__content--donut">
              <div className="placeholder-chart">
                <span className="placeholder-chart__icon">🎯</span>
                <span className="placeholder-chart__text">
                  Donut Chart Visualization
                </span>
              </div>
            </div>
          </div>

          {/* Top File Categories */}
          <div className="chart-card">
            <div className="chart-card__header">
              <h3 className="chart-card__title">Top File Categories</h3>
              <div className="chart-card__actions">
                <button className="chart-card__action">
                  <span className="chart-card__action-icon">⚙️</span>
                </button>
              </div>
            </div>
            <div className="chart-card__content chart-card__content--bar">
              <div className="placeholder-chart">
                <span className="placeholder-chart__icon">📊</span>
                <span className="placeholder-chart__text">
                  Bar Chart Visualization
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="chart-card">
            <div className="chart-card__header">
              <h3 className="chart-card__title">Recent Activity</h3>
              <div className="chart-card__actions">
                <button className="chart-card__action">
                  <span className="chart-card__action-icon">⚙️</span>
                </button>
              </div>
            </div>
            <div className="chart-card__content chart-card__content--timeline">
              <div className="placeholder-chart">
                <span className="placeholder-chart__icon">⏱️</span>
                <span className="placeholder-chart__text">
                  Timeline Visualization
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}

export default Home;
