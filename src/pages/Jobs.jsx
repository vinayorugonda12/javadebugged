import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function Jobs() {
  const { user, profile, logout } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hero slide
  const [heroSlide, setHeroSlide] = useState(0);

  const heroSlides = [
    {
      badge: "WELCOME TO JAVADEBUGGED",
      title: "Learn Java.",
      highlight: "Build Your Future.",
      description:
        "Your place to learn Java, explore development opportunities, build projects and grow your software career.",
    },
    // {
    //   badge: "LEARN • BUILD • GROW",
    //   title: "Master Java &",
    //   highlight: "Full Stack Development.",
    //   description:
    //     "Explore practical Java, Spring Boot, Full Stack, GenAI and software development content from JavaDebugged.",
    // },
    {
      badge: "CAREER OPPORTUNITIES",
      title: "Find Your Next",
      highlight: "Opportunity.",
      description:
        "Discover fresher and entry-level software jobs carefully collected for aspiring developers.",
    },
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  // Auto change hero slide
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  async function fetchJobs() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Job fetch error:", error);
      setError("Unable to load jobs. Please try again.");
      setLoading(false);
      return;
    }

    setJobs(data || []);
    setLoading(false);
  }

  async function handleLogout() {
    await logout();
  }

  // Unique locations
  const locations = useMemo(() => {
    return [
      ...new Set(
        jobs
          .map((job) => job.location)
          .filter((location) => location && location.trim() !== "")
      ),
    ].sort();
  }, [jobs]);

  // Unique job types
  const jobTypes = useMemo(() => {
    return [
      ...new Set(
        jobs
          .map((job) => job.job_type)
          .filter((jobType) => jobType && jobType.trim() !== "")
      ),
    ].sort();
  }, [jobs]);

  // Search + filter + sort
  const filteredJobs = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const result = jobs.filter((job) => {
      const matchesSearch =
        !searchText ||
        job.title?.toLowerCase().includes(searchText) ||
        job.company?.toLowerCase().includes(searchText) ||
        job.description?.toLowerCase().includes(searchText) ||
        job.requirements?.toLowerCase().includes(searchText);

      const matchesLocation =
        !locationFilter || job.location === locationFilter;

      const matchesJobType =
        !jobTypeFilter || job.job_type === jobTypeFilter;

      return matchesSearch && matchesLocation && matchesJobType;
    });

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      if (sortBy === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      if (sortBy === "title-asc") {
        return (a.title || "").localeCompare(b.title || "");
      }

      if (sortBy === "title-desc") {
        return (b.title || "").localeCompare(a.title || "");
      }

      return 0;
    });

    return result;
  }, [
    jobs,
    search,
    locationFilter,
    jobTypeFilter,
    sortBy,
  ]);

  function clearFilters() {
    setSearch("");
    setLocationFilter("");
    setJobTypeFilter("");
    setSortBy("newest");
  }

  const hasFilters =
    search ||
    locationFilter ||
    jobTypeFilter ||
    sortBy !== "newest";

  function nextHeroSlide() {
    setHeroSlide(
      (current) => (current + 1) % heroSlides.length
    );
  }

  function previousHeroSlide() {
    setHeroSlide(
      (current) =>
        (current - 1 + heroSlides.length) %
        heroSlides.length
    );
  }

  function scrollToJobs() {
    document
      .getElementById("latest-jobs")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  const currentHero = heroSlides[heroSlide];

  return (
    <div className="jobs-page">
      <div className="jobs-container">

      {/* =====================================================
    NAVIGATION
====================================================== */}

<div className="jobs-nav">

  <div className="nav-brand">
    <Link to="/jobs">
      <span className="brand-title">
        Job Portal
      </span>

      <span className="brand-separator">
        •
      </span>

      <span className="brand-company">
        JavaDebugged
      </span>
    </Link>
  </div>


  {/* Hamburger */}

  <button
    type="button"
    className={`hamburger-button ${
      menuOpen ? "menu-open" : ""
    }`}
    onClick={() => setMenuOpen((current) => !current)}
    aria-label="Open menu"
    aria-expanded={menuOpen}
  >
    <span></span>
    <span></span>
    <span></span>
  </button>


  {/* Menu */}

  {menuOpen && (
    <>
      <div
        className="menu-backdrop"
        onClick={() => setMenuOpen(false)}
      />

      <div className="hamburger-menu">

        <div className="hamburger-menu-header">

          <div>
            <span className="menu-label">
              MENU
            </span>

            <strong>
              JavaDebugged
            </strong>
          </div>

          {/* <button
            type="button"
            className="menu-close-button"
            onClick={() => setMenuOpen(false)}
          >
            
          </button> */}

        </div>


        <div className="hamburger-menu-items">

          {!user ? (
            <>
              <button
                type="button"
                className="hamburger-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setShowComingSoon(true);
                }}
              >
                <span className="menu-item-icon">
                  🔐
                </span>

                <span>
                  <strong>Login</strong>
                  <small>
                    Access your account
                  </small>
                </span>
              </button>


              <button
                type="button"
                className="hamburger-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setShowComingSoon(true);
                }}
              >
                <span className="menu-item-icon">
                  📝
                </span>

                <span>
                  <strong>Register</strong>
                  <small>
                    Create your account
                  </small>
                </span>
              </button>
            </>
          ) : (
            <>
              <div className="menu-user">

                <div className="menu-user-avatar">
                  {(profile?.full_name ||
                    user.email ||
                    "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {profile?.full_name ||
                      "Welcome"}
                  </strong>

                  <small>
                    {user.email}
                  </small>
                </div>

              </div>


              <Link
                to="/my-applications"
                className="hamburger-menu-item"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                <span className="menu-item-icon">
                  📋
                </span>

                <span>
                  <strong>
                    My Applications
                  </strong>

                  <small>
                    View your applications
                  </small>
                </span>
              </Link>


              {profile?.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className="hamburger-menu-item"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  <span className="menu-item-icon">
                    ⚙️
                  </span>

                  <span>
                    <strong>
                      Admin Dashboard
                    </strong>

                    <small>
                      Manage the job portal
                    </small>
                  </span>
                </Link>
              )}


              <button
                type="button"
                className="hamburger-menu-item menu-logout"
                onClick={async () => {
                  setMenuOpen(false);
                  await handleLogout();
                }}
              >
                <span className="menu-item-icon">
                  🚪
                </span>

                <span>
                  <strong>
                    Logout
                  </strong>

                  <small>
                    Sign out of your account
                  </small>
                </span>
              </button>
            </>
          )}


          <div className="menu-divider" />


          <a
            href="https://www.instagram.com/javadebugged/"
            target="_blank"
            rel="noopener noreferrer"
            className="hamburger-menu-item"
            onClick={() => setMenuOpen(false)}
          >
            <span className="menu-item-icon">
              📸
            </span>

            <span>
              <strong>
                Follow JavaDebugged
              </strong>

              <small>
                Follow us on Instagram
              </small>
            </span>
          </a>


          <button
            type="button"
            className="hamburger-menu-item"
            onClick={() => {
              setMenuOpen(false);
              scrollToJobs();
            }}
          >
            <span className="menu-item-icon">
              💼
            </span>

            <span>
              <strong>
                Latest Jobs
              </strong>

              <small>
                Explore available opportunities
              </small>
            </span>
          </button>

        </div>


        <div className="hamburger-menu-footer">
          <span>
            Learn • Build • Get Hired
          </span>
        </div>

      </div>
    </>
  )}

</div>

        


        {/* =====================================================
            JAVADEBUGGED HERO
        ====================================================== */}

        <section className="jd-hero">

          <div className="jd-hero-glow jd-glow-one"></div>
          <div className="jd-hero-glow jd-glow-two"></div>

          <div className="jd-code-decoration">
            <span>{"<JavaDeveloper />"}</span>
            <span>{"{ Build. Learn. Grow. }"}</span>
          </div>

          <div className="jd-hero-content">

            <div className="jd-hero-left">

              <div className="jd-hero-badge">
                ✦ {currentHero.badge}
              </div>

              <h1>
                {currentHero.title}
                <br />
                <span>{currentHero.highlight}</span>
              </h1>

              <p>
                {currentHero.description}
              </p>

              <div className="jd-hero-buttons">

                <button
                  type="button"
                  className="jd-primary-button"
                  onClick={scrollToJobs}
                >
                  Explore Jobs
                  <span>→</span>
                </button>

                <a
                  href="https://www.instagram.com/javadebugged/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="jd-secondary-button"
                >
                  Follow JavaDebugged
                  <span>↗</span>
                </a>

              </div>

              <div className="jd-hero-trust">

                <div>
                  <strong>Java</strong>
                  <span>Development</span>
                </div>

                <div>
                  <strong>Full Stack</strong>
                  <span>Learning</span>
                </div>

                <div>
                  <strong>Career</strong>
                  <span>Opportunities</span>
                </div>

              </div>

            </div>


            <div className="jd-hero-right">

              <div className="jd-terminal">

                <div className="jd-terminal-header">

                  <div className="jd-terminal-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <span>
                    JavaDebugged.java
                  </span>

                </div>

                <div className="jd-terminal-body">

                  <p>
                    <span className="code-purple">
                      public class
                    </span>{" "}
                    <span className="code-blue">
                      Career
                    </span>{" "}
                    {"{"}
                  </p>

                  <p className="code-indent">
                    <span className="code-purple">
                      public static void
                    </span>{" "}
                    <span className="code-yellow">
                      main
                    </span>
                    {"() {"}
                  </p>

                  <p className="code-double-indent">
                    System.out.println(
                  </p>

                  <p className="code-triple-indent code-green">
                    "Learn. Build. Get Hired."
                  </p>

                  <p className="code-double-indent">
                    );
                  </p>

                  <p className="code-indent">
                    {"}"}
                  </p>

                  <p>
                    {"}"}
                  </p>

                </div>

                <div className="jd-terminal-status">
                  <span className="status-dot"></span>
                  Ready to build your career
                </div>

              </div>

            </div>

          </div>


          {/* Hero controls */}

          <button
            type="button"
            className="jd-hero-arrow jd-arrow-left"
            onClick={previousHeroSlide}
            aria-label="Previous slide"
          >
            ‹
          </button>

          <button
            type="button"
            className="jd-hero-arrow jd-arrow-right"
            onClick={nextHeroSlide}
            aria-label="Next slide"
          >
            ›
          </button>


          <div className="jd-hero-dots">

            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={
                  index === heroSlide
                    ? "jd-dot active"
                    : "jd-dot"
                }
                onClick={() =>
                  setHeroSlide(index)
                }
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}

          </div>

        </section>


        {/* =====================================================
            WHY JAVADEBUGGED
        ====================================================== */}

        <section className="jd-features">

          <div className="jd-section-heading">

            <span>
              WHY JAVADEBUGGED?
            </span>

            <h2>
              Everything you need to
              <br />
              <strong>move forward.</strong>
            </h2>

            <p>
              Learn new skills, discover opportunities
              and take the next step in your software
              development career.
            </p>

          </div>


          <div className="jd-feature-grid">

            <div className="jd-feature-card">

              <div className="jd-feature-icon">
                {"</>"}
              </div>

              <h3>
                Learn
              </h3>

              <p>
                Learn Java, Spring Boot, Full Stack
                Development, GenAI and practical
                software development concepts.
              </p>

              <span className="jd-feature-number">
                01
              </span>

            </div>


            <div className="jd-feature-card">

              <div className="jd-feature-icon">
                ✦
              </div>

              <h3>
                Discover
              </h3>

              <p>
                Find fresher and entry-level
                opportunities collected for aspiring
                software developers.
              </p>

              <span className="jd-feature-number">
                02
              </span>

            </div>


            <div className="jd-feature-card">

              <div className="jd-feature-icon">
                ↗
              </div>

              <h3>
                Grow
              </h3>

              <p>
                Build projects, improve your coding
                skills and prepare yourself for your
                next software engineering opportunity.
              </p>

              <span className="jd-feature-number">
                03
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            LATEST JOBS
        ====================================================== */}

        <section
          id="latest-jobs"
          className="jd-jobs-section"
        >

          <div className="jobs-header">

            <div>
              <div className="jd-jobs-label">
                CAREER OPPORTUNITIES
              </div>

              <h1>
                Latest Jobs
              </h1>

              <p>
                Find the latest job opportunities
                and start your career.
              </p>
            </div>

          </div>


          {/* Search and Filters */}

          {!loading &&
            !error &&
            jobs.length > 0 && (
              <div className="jobs-filters">

                <div className="search-box">

                  <span className="search-icon">
                    🔍
                  </span>

                  <input
                    type="text"
                    placeholder="Search jobs, companies, skills..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />

                </div>


                <select
                  value={locationFilter}
                  onChange={(e) =>
                    setLocationFilter(e.target.value)
                  }
                >
                  <option value="">
                    All Locations
                  </option>

                  {locations.map((location) => (
                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>
                  ))}

                </select>


                <select
                  value={jobTypeFilter}
                  onChange={(e) =>
                    setJobTypeFilter(e.target.value)
                  }
                >
                  <option value="">
                    All Job Types
                  </option>

                  {jobTypes.map((jobType) => (
                    <option
                      key={jobType}
                      value={jobType}
                    >
                      {jobType}
                    </option>
                  ))}
                </select>


                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                >
                  <option value="newest">
                    Newest First
                  </option>

                  <option value="oldest">
                    Oldest First
                  </option>

                  <option value="title-asc">
                    Title A–Z
                  </option>

                  <option value="title-desc">
                    Title Z–A
                  </option>
                </select>


                {hasFilters && (
                  <button
                    className="clear-filters-button"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}

              </div>
            )}


          {/* Result Count */}

          {!loading &&
            !error &&
            jobs.length > 0 && (
              <div className="jobs-result-info">
                <p>
                  Showing{" "}
                  <strong>
                    {filteredJobs.length}
                  </strong>{" "}
                  {filteredJobs.length === 1
                    ? "job"
                    : "jobs"}
                </p>
              </div>
            )}


          {/* Loading */}

          {loading && (
            <div className="no-jobs">
              <h2>
                Loading jobs...
              </h2>

              <p>
                Please wait while we load the latest
                opportunities.
              </p>
            </div>
          )}


          {/* Error */}

          {!loading && error && (
            <div className="error-message">

              <h2>
                Something went wrong
              </h2>

              <p>
                {error}
              </p>

              <br />

              <button
                onClick={fetchJobs}
                className="view-job-button"
              >
                Try Again
              </button>

            </div>
          )}


          {/* No jobs */}

          {!loading &&
            !error &&
            jobs.length === 0 && (
              <div className="no-jobs">

                <h2>
                  No jobs available
                </h2>

                <p>
                  There are currently no active jobs.
                  Please check again later.
                </p>

              </div>
            )}


          {/* No matching jobs */}

          {!loading &&
            !error &&
            jobs.length > 0 &&
            filteredJobs.length === 0 && (
              <div className="no-jobs">

                <h2>
                  No matching jobs
                </h2>

                <p>
                  Try changing your search or filters.
                </p>

                <br />

                <button
                  onClick={clearFilters}
                  className="view-job-button"
                >
                  Clear Filters
                </button>

              </div>
            )}


          {/* Jobs List */}

          {!loading &&
            !error &&
            filteredJobs.length > 0 && (
              <div className="jobs-grid">

                {filteredJobs.map((job) => (
                  <div
                    className="job-card"
                    key={job.id}
                  >

                    {job.job_type && (
                      <span className="job-type">
                        {job.job_type}
                      </span>
                    )}

                    <h2>
                      {job.title}
                    </h2>

                    <h3>
                      {job.company}
                    </h3>

                    <div className="job-meta">

                      {job.location && (
                        <p>
                          📍 {job.location}
                        </p>
                      )}

                      {job.salary && (
                        <p>
                          💰 {job.salary}
                        </p>
                      )}

                    </div>

                    <p className="job-description">

                      {job.description
                        ? job.description.length > 180
                          ? `${job.description.substring(
                              0,
                              180
                            )}...`
                          : job.description
                        : "No description available."}

                    </p>

                    <p className="job-date">
                      Posted on{" "}
                      {job.created_at
                        ? new Date(
                            job.created_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="view-job-button"
                    >
                      View Job
                    </Link>

                  </div>
                ))}

              </div>
            )}

        </section>

      </div>


      {/* =====================================================
          COMING SOON MODAL
      ====================================================== */}

      {showComingSoon && (
        <div className="coming-soon-overlay">

          <div className="coming-soon-modal">

            <button
              type="button"
              className="coming-soon-close"
              onClick={() =>
                setShowComingSoon(false)
              }
            >
              ×
            </button>

            <div className="coming-soon-icon">
              🚀
            </div>

            <h2>
              Coming Soon
            </h2>

            <p>
              Login and registration will be
              available soon. For now, you can
              browse jobs and apply directly.
            </p>

            <button
              type="button"
              className="coming-soon-button"
              onClick={() =>
                setShowComingSoon(false)
              }
            >
              Continue Browsing Jobs
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Jobs;