import React, { useEffect, useState } from 'react';

const API_URL = `http://${window.location.hostname}:8000`;
export default function Dashboard() {
  // =========================
  // AUTH STATE
  // =========================

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [authMode, setAuthMode] = useState('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');

  // =========================
  // APP STATE
  // =========================

  const [activePage, setActivePage] = useState('find');

  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const [loadingTutors, setLoadingTutors] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // =========================
  // BOOKING STATE
  // =========================

  const [showBooking, setShowBooking] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const [bookingSubject, setBookingSubject] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // =========================
  // TUTOR PROFILE STATE
  // =========================

  const [showTutorForm, setShowTutorForm] = useState(false);

  const [tutorBio, setTutorBio] = useState('');
  const [tutorSubjects, setTutorSubjects] = useState([]);
  const [tutorAvailability, setTutorAvailability] = useState('');

  const [tutorLoading, setTutorLoading] = useState(false);

  // =========================
  // SESSION STATE
  // =========================

  const [mySessions, setMySessions] = useState([]);
  const [tutorSessions, setTutorSessions] = useState([]);

  const [sessionsLoading, setSessionsLoading] = useState(false);

  // =========================
  // SUBJECTS
  // =========================

  const subjects = [
    'All',
    'DBMS',
    'DSA',
    'Java',
    'AI',
    'ML',
    'Computer Networks',
    'Software Engineering',
    'Python',
    'Backend',
    'SQL',
  ];

  // =========================
  // CHECK LOGIN ON REFRESH
  // =========================

  useEffect(() => {
    const savedUser = localStorage.getItem('peertutor_user');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (error) {
        localStorage.removeItem('peertutor_user');
      }
    }
  }, []);

  // =========================
  // LOAD TUTORS
  // =========================

  useEffect(() => {
    if (isLoggedIn) {
      loadTutors();
    }
  }, [isLoggedIn]);

  // =========================
  // LOAD SESSIONS
  // =========================

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadSessions();
    }
  }, [isLoggedIn, currentUser]);

  // =========================
  // LOAD TUTORS FUNCTION
  // =========================

  const loadTutors = async () => {
    try {
      setLoadingTutors(true);
      setError('');

      let url = `${API_URL}/api/tutors`;

      if (selectedSubject !== 'All') {
        url += `?subject=${encodeURIComponent(selectedSubject)}`;
      }

      const response = await fetch(url);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to load tutors');
      }

      setTutors(data);
    } catch (err) {
      console.error(err);
      setError(
        'Unable to connect to the backend. Make sure FastAPI is running on port 8000.'
      );
    } finally {
      setLoadingTutors(false);
    }
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      setCurrentUser(data.user);
      setIsLoggedIn(true);

      localStorage.setItem(
        'peertutor_user',
        JSON.stringify(data.user)
      );

      setEmail('');
      setPassword('');

      setMessage('Login successful! Welcome to PeerTutor.');

    } catch (err) {
      setError(err.message);
    }
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!name || !email || !password) {
      setError('Please fill name, email and password.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          year,
          branch,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      setMessage(
        'Account created successfully! You can now login.'
      );

      setAuthMode('login');

      setName('');
      setEmail('');
      setPassword('');
      setYear('');
      setBranch('');

    } catch (err) {
      setError(err.message);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem('peertutor_user');

    setCurrentUser(null);
    setIsLoggedIn(false);

    setTutors([]);
    setMySessions([]);
    setTutorSessions([]);

    setActivePage('find');

    setMessage('');
    setError('');
  };

  // =========================
  // FILTER TUTORS
  // =========================

  const filteredTutors = tutors.filter((tutor) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      tutor.name.toLowerCase().includes(searchText) ||
      tutor.subjects.some((subject) =>
        subject.toLowerCase().includes(searchText)
      ) ||
      tutor.description.toLowerCase().includes(searchText);

    return matchesSearch;
  });

  // =========================
  // OPEN BOOKING
  // =========================

  const openBooking = (tutor) => {
    setSelectedTutor(tutor);

    setBookingSubject(
      tutor.subjects.length > 0
        ? tutor.subjects[0]
        : ''
    );

    setBookingDate('');
    setBookingTime('');

    setBookingSuccess(false);

    setShowBooking(true);
  };

  // =========================
  // CONFIRM BOOKING
  // =========================

  const confirmBooking = async () => {
    if (!currentUser) {
      setError('Please login first.');
      return;
    }

    if (!bookingDate || !bookingTime || !bookingSubject) {
      setError('Please select subject, date and time.');
      return;
    }

    if (!selectedTutor) {
      return;
    }

    try {
      setBookingLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: currentUser.id,
          tutor_id: selectedTutor.id,
          subject: bookingSubject,
          session_date: bookingDate,
          session_time: bookingTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to book session'
        );
      }

      setBookingSuccess(true);

      loadSessions();

    } catch (err) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  // =========================
  // BECOME A TUTOR
  // =========================

  const handleTutorSubjectChange = (subject) => {
    if (tutorSubjects.includes(subject)) {
      setTutorSubjects(
        tutorSubjects.filter((item) => item !== subject)
      );
    } else {
      setTutorSubjects([
        ...tutorSubjects,
        subject,
      ]);
    }
  };

  const createTutorProfile = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('Please login first.');
      return;
    }

    if (!tutorBio || tutorSubjects.length === 0 || !tutorAvailability) {
      setError(
        'Please fill bio, select at least one subject and availability.'
      );
      return;
    }

    try {
      setTutorLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/api/tutors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          bio: tutorBio,
          subjects: tutorSubjects,
          availability: tutorAvailability,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to create tutor profile'
        );
      }

      setMessage(
        'Your tutor profile has been created successfully!'
      );

      setShowTutorForm(false);

      setTutorBio('');
      setTutorSubjects([]);
      setTutorAvailability('');

      await loadTutors();

      setActivePage('find');

    } catch (err) {
      setError(err.message);
    } finally {
      setTutorLoading(false);
    }
  };

  // =========================
  // LOAD SESSIONS
  // =========================

  const loadSessions = async () => {
    if (!currentUser) {
      return;
    }

    try {
      setSessionsLoading(true);

      // Student sessions
      const studentResponse = await fetch(
        `${API_URL}/api/bookings/student/${currentUser.id}`
      );

      const studentData = await studentResponse.json();

      if (studentResponse.ok) {
        setMySessions(studentData);
      }

      // Tutor sessions
      const tutorResponse = await fetch(
        `${API_URL}/api/bookings/tutor/${currentUser.id}`
      );

      const tutorData = await tutorResponse.json();

      if (tutorResponse.ok) {
        setTutorSessions(tutorData);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setSessionsLoading(false);
    }
  };

  // =========================
  // CLEAR MESSAGES
  // =========================

  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  // =========================================================
  // LOGIN / REGISTER SCREEN
  // =========================================================

  if (!isLoggedIn) {
    return (
      <div style={styles.authPage}>
        <div style={styles.authCard}>

          <div style={styles.logoCircle}>
            🎓
          </div>

          <h1 style={styles.authTitle}>
            Peer<span style={styles.greenText}>Tutor</span>
          </h1>

          <p style={styles.authSubtitle}>
            Learn from your peers. Grow together.
          </p>

          {/* AUTH TABS */}

          <div style={styles.authTabs}>
            <button
              style={{
                ...styles.authTab,
                ...(authMode === 'login'
                  ? styles.activeAuthTab
                  : {}),
              }}
              onClick={() => {
                setAuthMode('login');
                clearMessages();
              }}
            >
              Login
            </button>

            <button
              style={{
                ...styles.authTab,
                ...(authMode === 'register'
                  ? styles.activeAuthTab
                  : {}),
              }}
              onClick={() => {
                setAuthMode('register');
                clearMessages();
              }}
            >
              Create Account
            </button>
          </div>

          {message && (
            <div style={styles.successBox}>
              ✓ {message}
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              ⚠ {error}
            </div>
          )}

          {/* LOGIN */}

          {authMode === 'login' && (
            <form onSubmit={handleLogin}>

              <label style={styles.label}>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />

              <label style={styles.label}>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />

              <button
                type="submit"
                style={styles.primaryButton}
              >
                Login →
              </button>

              <p style={styles.smallText}>
                For now, login works using email and password.
              </p>

            </form>
          )}

          {/* REGISTER */}

          {authMode === 'register' && (
            <form onSubmit={handleRegister}>

              <label style={styles.label}>
                Full Name
              </label>

              <input
                type="text"
                placeholder="e.g. Nisha Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />

              <label style={styles.label}>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />

              <label style={styles.label}>
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />

              <label style={styles.label}>
                Year
              </label>

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={styles.input}
              >
                <option value="">
                  Select year
                </option>

                <option value="1st Year">
                  1st Year
                </option>

                <option value="2nd Year">
                  2nd Year
                </option>

                <option value="3rd Year">
                  3rd Year
                </option>

                <option value="4th Year">
                  4th Year
                </option>
              </select>

              <label style={styles.label}>
                Branch
              </label>

              <input
                type="text"
                placeholder="e.g. CSE"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={styles.input}
              />

              <button
                type="submit"
                style={styles.primaryButton}
              >
                Create Account →
              </button>

            </form>
          )}

        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN DASHBOARD
  // =========================================================

  return (
    <div style={styles.page}>

      {/* ================= NAVBAR ================= */}

      <nav style={styles.navbar}>

        <div
          style={styles.brand}
          onClick={() => setActivePage('find')}
        >
          <div style={styles.brandIcon}>
            🎓
          </div>

          <div>
            <div style={styles.brandName}>
              Peer<span style={styles.greenText}>Tutor</span>
            </div>

            <div style={styles.brandTagline}>
              Learn. Teach. Grow.
            </div>
          </div>
        </div>

        <div style={styles.navLinks}>

          <button
            onClick={() => {
              setActivePage('find');
              clearMessages();
            }}
            style={{
              ...styles.navButton,
              ...(activePage === 'find'
                ? styles.activeNavButton
                : {}),
            }}
          >
            Find Tutors
          </button>

          <button
            onClick={() => {
              setShowTutorForm(true);
              clearMessages();
            }}
            style={styles.navButton}
          >
            Become a Tutor
          </button>

          <button
            onClick={() => {
              setActivePage('sessions');
              clearMessages();
            }}
            style={{
              ...styles.navButton,
              ...(activePage === 'sessions'
                ? styles.activeNavButton
                : {}),
            }}
          >
            My Sessions
          </button>

        </div>

        <div style={styles.profileArea}>

          <div style={styles.userAvatar}>
            {currentUser?.name
              ? currentUser.name
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'U'}
          </div>

          <div style={styles.userName}>
            {currentUser?.name}
          </div>

          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* ================= MAIN CONTENT ================= */}

      <main style={styles.main}>

        {message && (
          <div style={styles.topSuccess}>
            ✓ {message}
          </div>
        )}

        {error && (
          <div style={styles.topError}>
            ⚠ {error}
          </div>
        )}

        {/* =================================================
            FIND TUTORS
        ================================================= */}

        {activePage === 'find' && (
          <>

            <section style={styles.hero}>

              <div>

                <p style={styles.eyebrow}>
                  PEER-TO-PEER LEARNING
                </p>

                <h1 style={styles.heroTitle}>
                  Learn from your peers.
                  <br />
                  <span style={styles.greenText}>
                    Grow together.
                  </span>
                </h1>

                <p style={styles.heroText}>
                  Find students who understand your subjects
                  and can help you learn through real examples,
                  practice and collaboration.
                </p>

                <div style={styles.searchBox}>

                  <span style={styles.searchIcon}>
                    🔍
                  </span>

                  <input
                    type="text"
                    placeholder="Search tutors or subjects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                  />

                </div>

              </div>

              <div style={styles.heroIllustration}>
                <div style={styles.illustrationCard}>
                  <div style={styles.bigEmoji}>
                    👩‍💻
                  </div>

                  <div>
                    <strong>
                      Learn together
                    </strong>

                    <p>
                      Knowledge grows when shared.
                    </p>
                  </div>
                </div>

                <div style={styles.illustrationCardSmall}>
                  ⭐ 4.9
                  <br />
                  <span>
                    Average tutor rating
                  </span>
                </div>

              </div>

            </section>

            {/* FEATURES */}

            <section style={styles.features}>

              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  🔎
                </div>

                <div>
                  <h3>
                    Find the right tutor
                  </h3>

                  <p>
                    Search by subject and discover
                    students who can help.
                  </p>
                </div>
              </div>

              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  📅
                </div>

                <div>
                  <h3>
                    Book a session
                  </h3>

                  <p>
                    Choose a convenient date and time
                    for your learning session.
                  </p>
                </div>
              </div>

              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  🌱
                </div>

                <div>
                  <h3>
                    Share your knowledge
                  </h3>

                  <p>
                    Become a tutor and help another
                    student grow.
                  </p>
                </div>
              </div>

            </section>

            {/* SUBJECT FILTER */}

            <section>

              <div style={styles.sectionHeader}>

                <div>
                  <p style={styles.eyebrow}>
                    EXPLORE
                  </p>

                  <h2 style={styles.sectionTitle}>
                    Find a Tutor
                  </h2>
                </div>

                <button
                  onClick={loadTutors}
                  style={styles.refreshButton}
                >
                  ↻ Refresh
                </button>

              </div>

              <div style={styles.subjectContainer}>

                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => {
                      setSelectedSubject(subject);
                    }}
                    style={{
                      ...styles.subjectButton,
                      ...(selectedSubject === subject
                        ? styles.activeSubjectButton
                        : {}),
                    }}
                  >
                    {subject}
                  </button>
                ))}

              </div>

            </section>

            {/* TUTOR CARDS */}

            {loadingTutors ? (
              <div style={styles.emptyState}>
                <div style={styles.spinner}>
                  ⏳
                </div>

                <h3>
                  Finding tutors...
                </h3>

                <p>
                  Loading real tutor profiles from your backend.
                </p>
              </div>
            ) : filteredTutors.length === 0 ? (

              <div style={styles.emptyState}>

                <div style={styles.emptyEmoji}>
                  🔍
                </div>

                <h3>
                  No tutors found
                </h3>

                <p>
                  Try another subject or search term.
                </p>

              </div>

            ) : (

              <div style={styles.tutorGrid}>

                {filteredTutors.map((tutor) => (

                  <div
                    key={tutor.id}
                    style={styles.tutorCard}
                  >

                    <div style={styles.tutorTop}>

                      <div style={styles.avatar}>
                        {tutor.initials}
                      </div>

                      <div style={styles.tutorInfo}>

                        <h3 style={styles.tutorName}>
                          {tutor.name}
                        </h3>

                        <p style={styles.tutorYear}>
                          {tutor.year}
                        </p>

                      </div>

                      <div style={styles.rating}>
                        ⭐ {tutor.rating || 'New'}
                      </div>

                    </div>

                    <p style={styles.tutorDescription}>
                      {tutor.description}
                    </p>

                    <div style={styles.subjectTags}>

                      {tutor.subjects.map((subject) => (
                        <span
                          key={subject}
                          style={styles.subjectTag}
                        >
                          {subject}
                        </span>
                      ))}

                    </div>

                    <div style={styles.availability}>
                      <span>
                        🟢
                      </span>

                      {tutor.availability}
                    </div>

                    <div style={styles.cardBottom}>

                      <span style={styles.reviews}>
                        {tutor.reviews > 0
                          ? `${tutor.reviews} reviews`
                          : 'New tutor'}
                      </span>

                      <button
                        onClick={() =>
                          openBooking(tutor)
                        }
                        style={styles.bookButton}
                      >
                        Book Session
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </>
        )}

        {/* =================================================
            MY SESSIONS
        ================================================= */}

        {activePage === 'sessions' && (
          <section>

            <div style={styles.sectionHeader}>

              <div>

                <p style={styles.eyebrow}>
                  YOUR LEARNING
                </p>

                <h1 style={styles.pageTitle}>
                  My Sessions
                </h1>

                <p style={styles.pageSubtitle}>
                  Manage your upcoming and past tutoring sessions.
                </p>

              </div>

              <button
                onClick={loadSessions}
                style={styles.refreshButton}
              >
                ↻ Refresh
              </button>

            </div>

            {sessionsLoading ? (
              <div style={styles.emptyState}>
                ⏳ Loading sessions...
              </div>
            ) : (

              <>

                <div style={styles.sessionSection}>

                  <h2 style={styles.sessionHeading}>
                    📚 Sessions I Booked
                  </h2>

                  {mySessions.length === 0 ? (

                    <div style={styles.emptySession}>
                      <div style={styles.emptyEmoji}>
                        📅
                      </div>

                      <h3>
                        No sessions yet
                      </h3>

                      <p>
                        Find a tutor and book your first
                        learning session.
                      </p>

                      <button
                        style={styles.primaryButtonSmall}
                        onClick={() => setActivePage('find')}
                      >
                        Find Tutors
                      </button>
                    </div>

                  ) : (

                    <div style={styles.sessionGrid}>

                      {mySessions.map((session) => (

                        <div
                          key={session.id}
                          style={styles.sessionCard}
                        >

                          <div style={styles.sessionIcon}>
                            📖
                          </div>

                          <div style={styles.sessionContent}>

                            <h3>
                              {session.subject}
                            </h3>

                            <p>
                              Tutor: <strong>
                                {session.tutor}
                              </strong>
                            </p>

                            <p>
                              📅 {session.date}
                            </p>

                            <p>
                              ⏰ {session.time}
                            </p>

                            <span style={styles.confirmedBadge}>
                              ✓ {session.status}
                            </span>

                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

                {/* TUTOR REQUESTS */}

                <div style={styles.sessionSection}>

                  <h2 style={styles.sessionHeading}>
                    👨‍🏫 Sessions Others Booked With Me
                  </h2>

                  {tutorSessions.length === 0 ? (

                    <div style={styles.emptySession}>

                      <div style={styles.emptyEmoji}>
                        👥
                      </div>

                      <h3>
                        No tutor sessions yet
                      </h3>

                      <p>
                        Become a tutor to start helping
                        other students.
                      </p>

                    </div>

                  ) : (

                    <div style={styles.sessionGrid}>

                      {tutorSessions.map((session) => (

                        <div
                          key={session.id}
                          style={styles.sessionCard}
                        >

                          <div style={styles.sessionIcon}>
                            👨‍🎓
                          </div>

                          <div style={styles.sessionContent}>

                            <h3>
                              {session.subject}
                            </h3>

                            <p>
                              Student: <strong>
                                {session.student}
                              </strong>
                            </p>

                            <p>
                              📅 {session.date}
                            </p>

                            <p>
                              ⏰ {session.time}
                            </p>

                            <span style={styles.confirmedBadge}>
                              ✓ {session.status}
                            </span>

                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              </>

            )}

          </section>
        )}

      </main>

      {/* =================================================
          BOOKING MODAL
      ================================================= */}

      {showBooking && selectedTutor && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            {!bookingSuccess ? (

              <>

                <div style={styles.modalHeader}>

                  <div>

                    <p style={styles.eyebrow}>
                      BOOK A SESSION
                    </p>

                    <h2 style={styles.modalTitle}>
                      Learn with {selectedTutor.name}
                    </h2>

                  </div>

                  <button
                    onClick={() => setShowBooking(false)}
                    style={styles.closeButton}
                  >
                    ×
                  </button>

                </div>

                <div style={styles.selectedTutorBox}>

                  <div style={styles.avatar}>
                    {selectedTutor.initials}
                  </div>

                  <div>

                    <strong>
                      {selectedTutor.name}
                    </strong>

                    <p>
                      {selectedTutor.year}
                    </p>

                  </div>

                </div>

                <label style={styles.label}>
                  Subject
                </label>

                <select
                  value={bookingSubject}
                  onChange={(e) =>
                    setBookingSubject(e.target.value)
                  }
                  style={styles.input}
                >
                  {selectedTutor.subjects.map(
                    (subject) => (
                      <option
                        key={subject}
                        value={subject}
                      >
                        {subject}
                      </option>
                    )
                  )}
                </select>

                <label style={styles.label}>
                  Date
                </label>

                <input
                  type="date"
                  value={bookingDate}
                  min={
                    new Date()
                      .toISOString()
                      .split('T')[0]
                  }
                  onChange={(e) =>
                    setBookingDate(e.target.value)
                  }
                  style={styles.input}
                />

                <label style={styles.label}>
                  Time
                </label>

                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) =>
                    setBookingTime(e.target.value)
                  }
                  style={styles.input}
                />

                {error && (
                  <div style={styles.errorBox}>
                    ⚠ {error}
                  </div>
                )}

                <button
                  onClick={confirmBooking}
                  disabled={bookingLoading}
                  style={{
                    ...styles.primaryButton,
                    opacity: bookingLoading ? 0.6 : 1,
                  }}
                >
                  {bookingLoading
                    ? 'Booking...'
                    : 'Confirm Booking'}
                </button>

              </>

            ) : (

              <div style={styles.successModal}>

                <div style={styles.successCircle}>
                  ✓
                </div>

                <h2>
                  Session Booked!
                </h2>

                <p>
                  Your {bookingSubject} session with{' '}
                  <strong>
                    {selectedTutor.name}
                  </strong>{' '}
                  has been confirmed.
                </p>

                <div style={styles.bookingSummary}>

                  <p>
                    📅 {bookingDate}
                  </p>

                  <p>
                    ⏰ {bookingTime}
                  </p>

                  <p>
                    📚 {bookingSubject}
                  </p>

                </div>

                <button
                  onClick={() => {
                    setShowBooking(false);
                    setActivePage('sessions');
                    clearMessages();
                  }}
                  style={styles.primaryButton}
                >
                  View My Sessions
                </button>

              </div>

            )}

          </div>

        </div>

      )}

      {/* =================================================
          BECOME A TUTOR MODAL
      ================================================= */}

      {showTutorForm && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>

                <p style={styles.eyebrow}>
                  SHARE YOUR KNOWLEDGE
                </p>

                <h2 style={styles.modalTitle}>
                  Become a Tutor
                </h2>

              </div>

              <button
                onClick={() => setShowTutorForm(false)}
                style={styles.closeButton}
              >
                ×
              </button>

            </div>

            <p style={styles.modalDescription}>
              Help another student understand a subject
              you're good at.
            </p>

            <form onSubmit={createTutorProfile}>

              <label style={styles.label}>
                Your Bio
              </label>

              <textarea
                placeholder="Example: I explain DBMS using simple examples and help students prepare for exams."
                value={tutorBio}
                onChange={(e) =>
                  setTutorBio(e.target.value)
                }
                style={styles.textarea}
                rows="4"
              />

              <label style={styles.label}>
                Subjects you can teach
              </label>

              <div style={styles.checkboxGrid}>

                {subjects
                  .filter(
                    (subject) => subject !== 'All'
                  )
                  .map((subject) => (

                    <label
                      key={subject}
                      style={{
                        ...styles.checkboxLabel,
                        ...(tutorSubjects.includes(
                          subject
                        )
                          ? styles.selectedCheckbox
                          : {}),
                      }}
                    >

                      <input
                        type="checkbox"
                        checked={tutorSubjects.includes(
                          subject
                        )}
                        onChange={() =>
                          handleTutorSubjectChange(
                            subject
                          )
                        }
                      />

                      {subject}

                    </label>

                  ))}

              </div>

              <label style={styles.label}>
                Availability
              </label>

              <input
                type="text"
                placeholder="Example: Available today after 6 PM"
                value={tutorAvailability}
                onChange={(e) =>
                  setTutorAvailability(e.target.value)
                }
                style={styles.input}
              />

              <button
                type="submit"
                disabled={tutorLoading}
                style={{
                  ...styles.primaryButton,
                  opacity: tutorLoading ? 0.6 : 1,
                }}
              >
                {tutorLoading
                  ? 'Creating Profile...'
                  : 'Create Tutor Profile'}
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F4FBF6',
    color: '#183B2A',
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  // ================= AUTH =================

  authPage: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg, #F4FBF6 0%, #E3F4E8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
  },

  authCard: {
    width: '100%',
    maxWidth: '460px',
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(24, 59, 42, 0.12)',
  },

  logoCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    background: '#E3F4E8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    margin: '0 auto 18px',
  },

  authTitle: {
    textAlign: 'center',
    margin: '0',
    fontSize: '32px',
    fontWeight: '800',
  },

  greenText: {
    color: '#2F855A',
  },

  authSubtitle: {
    textAlign: 'center',
    color: '#6B7F73',
    marginBottom: '30px',
  },

  authTabs: {
    display: 'flex',
    background: '#F1F7F3',
    padding: '5px',
    borderRadius: '12px',
    marginBottom: '25px',
  },

  authTab: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    padding: '12px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#61756A',
  },

  activeAuthTab: {
    background: '#FFFFFF',
    color: '#2F855A',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },

  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '7px',
    marginTop: '16px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #D8E7DD',
    borderRadius: '10px',
    padding: '13px 14px',
    fontSize: '14px',
    outline: 'none',
    background: '#FFFFFF',
    color: '#183B2A',
  },

  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #D8E7DD',
    borderRadius: '10px',
    padding: '13px 14px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },

  primaryButton: {
    width: '100%',
    border: 'none',
    borderRadius: '11px',
    padding: '14px',
    marginTop: '20px',
    background: '#2F855A',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  primaryButtonSmall: {
    border: 'none',
    borderRadius: '10px',
    padding: '11px 18px',
    background: '#2F855A',
    color: '#FFFFFF',
    fontWeight: '700',
    cursor: 'pointer',
  },

  smallText: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#84958C',
    marginTop: '15px',
  },

  successBox: {
    background: '#E7F7EC',
    color: '#247044',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '15px',
    fontSize: '14px',
  },

  errorBox: {
    background: '#FFF0F0',
    color: '#B42318',
    padding: '12px',
    borderRadius: '10px',
    marginTop: '15px',
    marginBottom: '15px',
    fontSize: '14px',
  },

  // ================= NAVBAR =================

  navbar: {
    height: '76px',
    background: '#FFFFFF',
    borderBottom: '1px solid #E3EEE7',
    display: 'flex',
    alignItems: 'center',
    padding: '0 5%',
    gap: '30px',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },

  brandIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: '#E3F4E8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '21px',
  },

  brandName: {
    fontSize: '20px',
    fontWeight: '800',
  },

  brandTagline: {
    fontSize: '10px',
    color: '#7A8C82',
  },

  navLinks: {
    display: 'flex',
    gap: '5px',
    marginLeft: 'auto',
  },

  navButton: {
    border: 'none',
    background: 'transparent',
    padding: '10px 14px',
    borderRadius: '9px',
    color: '#60736A',
    fontWeight: '600',
    cursor: 'pointer',
  },

  activeNavButton: {
    background: '#E3F4E8',
    color: '#2F855A',
  },

  profileArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
  },

  userAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#2F855A',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '12px',
  },

  userName: {
    fontWeight: '600',
    fontSize: '14px',
  },

  logoutButton: {
    border: '1px solid #D7E6DC',
    background: '#FFFFFF',
    color: '#496257',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  // ================= MAIN =================

  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '45px 5%',
  },

  topSuccess: {
    background: '#E7F7EC',
    color: '#247044',
    padding: '13px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
  },

  topError: {
    background: '#FFF0F0',
    color: '#B42318',
    padding: '13px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
  },

  hero: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '40px',
    alignItems: 'center',
    background: '#FFFFFF',
    borderRadius: '25px',
    padding: '45px',
    boxShadow: '0 10px 35px rgba(24, 59, 42, 0.06)',
    marginBottom: '30px',
  },

  eyebrow: {
    color: '#2F855A',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '1.5px',
    margin: '0 0 10px',
  },

  heroTitle: {
    fontSize: '45px',
    lineHeight: '1.12',
    margin: '0 0 18px',
    fontWeight: '850',
  },

  heroText: {
    color: '#65786E',
    lineHeight: '1.7',
    maxWidth: '650px',
    marginBottom: '25px',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #D8E7DD',
    borderRadius: '13px',
    padding: '4px 15px',
    maxWidth: '600px',
    background: '#FAFDFC',
  },

  searchIcon: {
    fontSize: '18px',
  },

  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '13px 5px',
    fontSize: '15px',
    background: 'transparent',
  },

  heroIllustration: {
    position: 'relative',
    minHeight: '230px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  illustrationCard: {
    background: '#E3F4E8',
    borderRadius: '22px',
    padding: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 12px 30px rgba(47, 133, 90, 0.1)',
  },

  bigEmoji: {
    fontSize: '50px',
  },

  illustrationCardSmall: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    background: '#FFFFFF',
    padding: '15px 20px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    fontWeight: '800',
    color: '#2F855A',
  },

  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '18px',
    marginBottom: '45px',
  },

  featureCard: {
    background: '#FFFFFF',
    border: '1px solid #E3EEE7',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    gap: '15px',
  },

  featureIcon: {
    width: '45px',
    height: '45px',
    minWidth: '45px',
    borderRadius: '12px',
    background: '#E3F4E8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '21px',
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },

  sectionTitle: {
    fontSize: '30px',
    margin: 0,
  },

  pageTitle: {
    fontSize: '36px',
    margin: 0,
  },

  pageSubtitle: {
    color: '#718278',
  },

  refreshButton: {
    border: '1px solid #D6E5DB',
    background: '#FFFFFF',
    color: '#2F855A',
    padding: '10px 15px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '700',
  },

  subjectContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '25px',
  },

  subjectButton: {
    border: '1px solid #D9E7DE',
    background: '#FFFFFF',
    color: '#61756A',
    padding: '9px 15px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '600',
  },

  activeSubjectButton: {
    background: '#2F855A',
    color: '#FFFFFF',
    borderColor: '#2F855A',
  },

  // ================= TUTORS =================

  tutorGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },

  tutorCard: {
    background: '#FFFFFF',
    border: '1px solid #E2ECE6',
    borderRadius: '18px',
    padding: '22px',
    transition: '0.2s',
  },

  tutorTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  avatar: {
    width: '50px',
    height: '50px',
    minWidth: '50px',
    borderRadius: '14px',
    background: '#E3F4E8',
    color: '#2F855A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
  },

  tutorInfo: {
    flex: 1,
  },

  tutorName: {
    margin: 0,
    fontSize: '17px',
  },

  tutorYear: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#7A8B82',
  },

  rating: {
    background: '#FFF8DD',
    color: '#8A6B00',
    padding: '6px 9px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
  },

  tutorDescription: {
    color: '#65776D',
    lineHeight: '1.6',
    fontSize: '13px',
    minHeight: '62px',
  },

  subjectTags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '15px',
  },

  subjectTag: {
    background: '#F0F7F2',
    color: '#2F855A',
    padding: '5px 9px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
  },

  availability: {
    background: '#F5FAF6',
    padding: '9px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#416150',
    marginBottom: '15px',
  },

  cardBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #EDF2EE',
    paddingTop: '15px',
  },

  reviews: {
    color: '#87958E',
    fontSize: '12px',
  },

  bookButton: {
    border: 'none',
    background: '#2F855A',
    color: '#FFFFFF',
    padding: '10px 14px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '700',
  },

  // ================= EMPTY =================

  emptyState: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '60px 20px',
    textAlign: 'center',
    marginTop: '20px',
    border: '1px solid #E4EDE7',
  },

  spinner: {
    fontSize: '35px',
  },

  emptyEmoji: {
    fontSize: '40px',
    marginBottom: '10px',
  },

  // ================= SESSIONS =================

  sessionSection: {
    marginTop: '30px',
  },

  sessionHeading: {
    fontSize: '21px',
    marginBottom: '15px',
  },

  sessionGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '18px',
  },

  sessionCard: {
    background: '#FFFFFF',
    border: '1px solid #E0EAE3',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    gap: '15px',
  },

  sessionIcon: {
    width: '45px',
    height: '45px',
    borderRadius: '12px',
    background: '#E3F4E8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },

  sessionContent: {
    flex: 1,
  },

  confirmedBadge: {
    display: 'inline-block',
    background: '#E7F7EC',
    color: '#267447',
    padding: '5px 8px',
    borderRadius: '7px',
    fontSize: '11px',
    fontWeight: '700',
    marginTop: '5px',
  },

  emptySession: {
    background: '#FFFFFF',
    border: '1px solid #E3ECE6',
    borderRadius: '18px',
    padding: '40px',
    textAlign: 'center',
  },

  // ================= MODAL =================

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(17, 45, 31, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 100,
  },

  modal: {
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: '#FFFFFF',
    borderRadius: '22px',
    padding: '30px',
    boxShadow: '0 25px 80px rgba(0,0,0,0.2)',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },

  modalTitle: {
    margin: 0,
    fontSize: '25px',
  },

  modalDescription: {
    color: '#6B7D73',
    lineHeight: '1.6',
  },

  closeButton: {
    border: 'none',
    background: '#F1F6F2',
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    fontSize: '23px',
    cursor: 'pointer',
    color: '#557064',
  },

  selectedTutorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#F4FAF5',
    padding: '14px',
    borderRadius: '12px',
    marginBottom: '20px',
  },

  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '8px',
    marginBottom: '10px',
  },

  checkboxLabel: {
    border: '1px solid #DCE9E0',
    borderRadius: '8px',
    padding: '9px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    gap: '7px',
    alignItems: 'center',
  },

  selectedCheckbox: {
    background: '#E3F4E8',
    borderColor: '#8DC6A3',
    color: '#2F855A',
    fontWeight: '700',
  },

  successModal: {
    textAlign: 'center',
    padding: '20px 5px',
  },

  successCircle: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: '#E3F4E8',
    color: '#2F855A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '35px',
    fontWeight: '800',
    margin: '0 auto 20px',
  },

  bookingSummary: {
    background: '#F4FAF5',
    borderRadius: '12px',
    padding: '10px',
    margin: '20px 0',
    color: '#416150',
  },
};