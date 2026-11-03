import React, { useEffect, useState } from 'react';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  // =========================================================
  // AUTH
  // =========================================================

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [authMode, setAuthMode] = useState('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');

  // =========================================================
  // APP
  // =========================================================

  const [activePage, setActivePage] = useState('find');

  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const [loadingTutors, setLoadingTutors] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // =========================================================
  // BOOKING
  // =========================================================

  const [showBooking, setShowBooking] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const [bookingSubject, setBookingSubject] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // =========================================================
  // TUTOR PROFILE
  // =========================================================

  const [showTutorForm, setShowTutorForm] = useState(false);

  const [tutorBio, setTutorBio] = useState('');
  const [tutorSubjects, setTutorSubjects] = useState([]);
  const [tutorAvailability, setTutorAvailability] = useState('');

  const [tutorLoading, setTutorLoading] = useState(false);

  // =========================================================
  // SESSIONS
  // =========================================================

  const [mySessions, setMySessions] = useState([]);
  const [tutorSessions, setTutorSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // =========================================================
  // REAL-TIME CHAT
  // =========================================================

  const [showChat, setShowChat] = useState(false);
  const [chatTutor, setChatTutor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSocket, setChatSocket] = useState(null);
  const [chatConnected, setChatConnected] = useState(false);

  // =========================================================
  // SUBJECTS
  // =========================================================

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

  // =========================================================
  // CHECK LOGIN
  // =========================================================

  useEffect(() => {
    const savedUser = localStorage.getItem('peertutor_user');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('peertutor_user');
      }
    }
  }, []);

  // =========================================================
  // LOAD TUTORS
  // =========================================================

  useEffect(() => {
    if (isLoggedIn) {
      loadTutors();
    }
  }, [isLoggedIn, selectedSubject]);

  // =========================================================
  // LOAD SESSIONS
  // =========================================================

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadSessions();
    }
  }, [isLoggedIn, currentUser]);

  // =========================================================
  // LOAD TUTORS
  // =========================================================

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
        throw new Error(
          data.detail || 'Unable to load tutors'
        );
      }

      setTutors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);

      setError(
        'Unable to connect to the backend. Make sure FastAPI is running on port 8000.'
      );
    } finally {
      setLoadingTutors(false);
    }
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Login failed'
        );
      }

      setCurrentUser(data.user);
      setIsLoggedIn(true);

      localStorage.setItem(
        'peertutor_user',
        JSON.stringify(data.user)
      );

      setEmail('');
      setPassword('');

      setMessage(
        'Login successful! Welcome to PeerTutor.'
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!name || !email || !password) {
      setError(
        'Please fill name, email and password.'
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/register`,
        {
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Registration failed'
        );
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

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    closeChat();

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

  // =========================================================
  // FILTER
  // =========================================================

  const filteredTutors = tutors.filter((tutor) => {
    const searchText = search.toLowerCase();

    const tutorName =
      tutor.name?.toLowerCase() || '';

    const tutorDescription =
      tutor.description?.toLowerCase() ||
      tutor.bio?.toLowerCase() ||
      '';

    const tutorSubjects = Array.isArray(
      tutor.subjects
    )
      ? tutor.subjects
      : [];

    const matchesSearch =
      tutorName.includes(searchText) ||
      tutorDescription.includes(searchText) ||
      tutorSubjects.some((subject) =>
        subject.toLowerCase().includes(searchText)
      );

    return matchesSearch;
  });

  // =========================================================
  // BOOKING
  // =========================================================

  const openBooking = (tutor) => {
    setSelectedTutor(tutor);

    setBookingSubject(
      tutor.subjects?.length
        ? tutor.subjects[0]
        : ''
    );

    setBookingDate('');
    setBookingTime('');

    setBookingSuccess(false);
    setShowBooking(true);
  };

  const confirmBooking = async () => {
    if (!currentUser) {
      setError('Please login first.');
      return;
    }

    if (
      !bookingDate ||
      !bookingTime ||
      !bookingSubject
    ) {
      setError(
        'Please select subject, date and time.'
      );
      return;
    }

    if (!selectedTutor) {
      return;
    }

    try {
      setBookingLoading(true);
      setError('');

      const response = await fetch(
        `${API_URL}/api/bookings`,
        {
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'Unable to book session'
        );
      }

      setBookingSuccess(true);

      await loadSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  // =========================================================
  // BECOME A TUTOR
  // =========================================================

  const handleTutorSubjectChange = (subject) => {
    if (tutorSubjects.includes(subject)) {
      setTutorSubjects(
        tutorSubjects.filter(
          (item) => item !== subject
        )
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

    if (
      !tutorBio ||
      tutorSubjects.length === 0 ||
      !tutorAvailability
    ) {
      setError(
        'Please fill bio, select at least one subject and availability.'
      );
      return;
    }

    try {
      setTutorLoading(true);
      setError('');

      const response = await fetch(
        `${API_URL}/api/tutors`,
        {
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'Unable to create tutor profile'
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

  // =========================================================
  // SESSIONS
  // =========================================================

  const loadSessions = async () => {
    if (!currentUser) return;

    try {
      setSessionsLoading(true);

      const studentResponse = await fetch(
        `${API_URL}/api/bookings/student/${currentUser.id}`
      );

      const studentData =
        await studentResponse.json();

      if (studentResponse.ok) {
        setMySessions(
          Array.isArray(studentData)
            ? studentData
            : []
        );
      }

      const tutorResponse = await fetch(
        `${API_URL}/api/bookings/tutor/${currentUser.id}`
      );

      const tutorData =
        await tutorResponse.json();

      if (tutorResponse.ok) {
        setTutorSessions(
          Array.isArray(tutorData)
            ? tutorData
            : []
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSessionsLoading(false);
    }
  };

  // =========================================================
  // REAL-TIME CHAT
  // =========================================================

  const openChat = (tutor) => {
    if (!currentUser) {
      setError('Please login first.');
      return;
    }

    if (!tutor?.id) {
      setError(
        'This tutor does not have a valid user ID.'
      );
      return;
    }

    // Close previous connection
    if (chatSocket) {
      chatSocket.close();
    }

    setChatTutor(tutor);
    setChatMessages([]);
    setChatInput('');
    setShowChat(true);
    setChatConnected(false);

    const backendUrl = new URL(API_URL);

    const protocol =
      backendUrl.protocol === 'https:'
        ? 'wss:'
        : 'ws:';

    const socketUrl =
      `${protocol}//${backendUrl.host}` +
      `/ws/chat/${currentUser.id}/${tutor.id}`;

    console.log(
      'Connecting to:',
      socketUrl
    );

    const socket =
      new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log('Chat connected');

      setChatConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const incomingMessage =
          JSON.parse(event.data);

        setChatMessages((previous) => [
          ...previous,
          incomingMessage,
        ]);
      } catch {
        setChatMessages((previous) => [
          ...previous,
          {
            sender_id: 0,
            sender_name: 'User',
            text: event.data,
          },
        ]);
      }
    };

    socket.onerror = (event) => {
      console.error(
        'WebSocket error:',
        event
      );

      setChatConnected(false);
    };

    socket.onclose = () => {
      console.log(
        'Chat disconnected'
      );

      setChatConnected(false);
    };

    setChatSocket(socket);
  };

  const sendChatMessage = () => {
    const text = chatInput.trim();

    if (!text) return;

    if (!chatSocket) {
      alert(
        'Chat is not connected yet.'
      );
      return;
    }

    if (
      chatSocket.readyState !==
      WebSocket.OPEN
    ) {
      alert(
        'Chat is not connected. Please reopen the chat.'
      );
      return;
    }

    const message = {
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      text,
    };

    chatSocket.send(
      JSON.stringify(message)
    );

    setChatInput('');
  };

  const closeChat = () => {
    if (chatSocket) {
      chatSocket.close();
    }

    setChatSocket(null);
    setChatTutor(null);
    setChatMessages([]);
    setChatInput('');
    setShowChat(false);
    setChatConnected(false);
  };

  // =========================================================
  // CLEAR
  // =========================================================

  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  // =========================================================
  // AUTH SCREEN
  // =========================================================

  if (!isLoggedIn) {
    return (
      <div style={styles.authPage}>
        <div style={styles.authGlow}></div>

        <div style={styles.authCard}>
          <div style={styles.logoCircle}>
            🎓
          </div>

          <h1 style={styles.authTitle}>
            Peer
            <span style={styles.greenText}>
              Tutor
            </span>
          </h1>

          <p style={styles.authSubtitle}>
            Learn from your peers. Grow together.
          </p>

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

          {authMode === 'login' && (
            <form onSubmit={handleLogin}>
              <label style={styles.label}>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                style={styles.input}
              />

              <label style={styles.label}>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                style={styles.input}
              />

              <button
                type="submit"
                style={styles.primaryButton}
              >
                Login →
              </button>

              <p style={styles.smallText}>
                Login using your registered email
                and password.
              </p>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegister}>
              <label style={styles.label}>
                Full Name
              </label>

              <input
                type="text"
                placeholder="e.g. Nisha Singh"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                style={styles.input}
              />

              <label style={styles.label}>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                style={styles.input}
              />

              <label style={styles.label}>
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                style={styles.input}
              />

              <label style={styles.label}>
                Year
              </label>

              <select
                value={year}
                onChange={(e) =>
                  setYear(e.target.value)
                }
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
                onChange={(e) =>
                  setBranch(e.target.value)
                }
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
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav style={styles.navbar}>
        <div
          style={styles.brand}
          onClick={() => {
            setActivePage('find');
            clearMessages();
          }}
        >
          <div style={styles.brandIcon}>
            🎓
          </div>

          <div>
            <div style={styles.brandName}>
              Peer
              <span style={styles.greenText}>
                Tutor
              </span>
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
                  .map(
                    (word) =>
                      word[0]
                  )
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

      {/* =====================================================
          MAIN
      ===================================================== */}

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

        {/* ===================================================
            FIND TUTORS
        =================================================== */}

        {activePage === 'find' && (
          <>
            <section style={styles.hero}>
              <div style={styles.heroContent}>
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
                  Find students who understand
                  your subjects and can help you
                  learn through real examples,
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
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
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

                <div style={styles.floatingCard}>
                  💬
                  <div>
                    <strong>
                      Live Chat
                    </strong>
                    <small>
                      Connect instantly
                    </small>
                  </div>
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
                    Search by subject and
                    discover students who can help.
                  </p>
                </div>
              </div>

              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  💬
                </div>

                <div>
                  <h3>
                    Chat in real time
                  </h3>

                  <p>
                    Connect directly with another
                    student through live chat.
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
                    Choose a convenient date and
                    time for your learning session.
                  </p>
                </div>
              </div>
            </section>

            {/* TUTOR SECTION */}

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
                    onClick={() =>
                      setSelectedSubject(
                        subject
                      )
                    }
                    style={{
                      ...styles.subjectButton,
                      ...(selectedSubject ===
                      subject
                        ? styles.activeSubjectButton
                        : {}),
                    }}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              {loadingTutors ? (
                <div style={styles.emptyState}>
                  <div style={styles.spinner}>
                    ⟳
                  </div>

                  <p>
                    Finding tutors...
                  </p>
                </div>
              ) : filteredTutors.length ===
                0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    🔍
                  </div>

                  <h3>
                    No tutors found
                  </h3>

                  <p>
                    Try another subject or
                    search term.
                  </p>
                </div>
              ) : (
                <div style={styles.tutorGrid}>
                  {filteredTutors.map(
                    (tutor) => (
                      <div
                        key={tutor.id}
                        style={styles.tutorCard}
                      >
                        <div
                          style={
                            styles.tutorTop
                          }
                        >
                          <div
                            style={
                              styles.tutorAvatar
                            }
                          >
                            {tutor.name
                              ?.split(' ')
                              .map(
                                (word) =>
                                  word[0]
                              )
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div
                            style={
                              styles.onlineDot
                            }
                          >
                            <span></span>
                            Available
                          </div>
                        </div>

                        <h3
                          style={
                            styles.tutorName
                          }
                        >
                          {tutor.name}
                        </h3>

                        <p
                          style={
                            styles.tutorDescription
                          }
                        >
                          {tutor.description ||
                            tutor.bio ||
                            'Peer tutor ready to help you learn.'}
                        </p>

                        <div
                          style={
                            styles.tagContainer
                          }
                        >
                          {(
                            tutor.subjects ||
                            []
                          )
                            .slice(0, 4)
                            .map(
                              (subject) => (
                                <span
                                  key={
                                    subject
                                  }
                                  style={
                                    styles.tag
                                  }
                                >
                                  {subject}
                                </span>
                              )
                            )}
                        </div>

                        <div
                          style={
                            styles.ratingRow
                          }
                        >
                          <span>
                            ⭐{' '}
                            {tutor.rating ||
                              '4.8'}
                          </span>

                          <span>
                            {tutor.reviews ||
                              tutor.review_count ||
                              'New'}{' '}
                            reviews
                          </span>
                        </div>

                        <div
                          style={
                            styles.cardBottom
                          }
                        >
                          <button
                            onClick={() =>
                              openChat(
                                tutor
                              )
                            }
                            style={
                              styles.chatButton
                            }
                          >
                            💬 Chat
                          </button>

                          <button
                            onClick={() =>
                              openBooking(
                                tutor
                              )
                            }
                            style={
                              styles.bookButton
                            }
                          >
                            📅 Book
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </>
        )}

        {/* ===================================================
            SESSIONS
        =================================================== */}

        {activePage === 'sessions' && (
          <section>
            <div style={styles.pageHeading}>
              <p style={styles.eyebrow}>
                YOUR ACTIVITY
              </p>

              <h1 style={styles.sectionTitle}>
                My Sessions
              </h1>

              <p style={styles.pageSubtitle}>
                Keep track of sessions you've
                booked and tutoring requests
                you've received.
              </p>
            </div>

            {sessionsLoading ? (
              <div style={styles.emptyState}>
                Loading sessions...
              </div>
            ) : (
              <>
                <h2 style={styles.sessionHeading}>
                  📚 Sessions I've Booked
                </h2>

                {mySessions.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>
                      📅
                    </div>

                    <h3>
                      No booked sessions
                    </h3>

                    <p>
                      Find a tutor and book
                      your first learning session.
                    </p>
                  </div>
                ) : (
                  <div
                    style={
                      styles.sessionGrid
                    }
                  >
                    {mySessions.map(
                      (session, index) => (
                        <div
                          key={
                            session.id ||
                            index
                          }
                          style={
                            styles.sessionCard
                          }
                        >
                          <div
                            style={
                              styles.sessionIcon
                            }
                          >
                            📚
                          </div>

                          <div
                            style={
                              styles.sessionInfo
                            }
                          >
                            <h3>
                              {session.subject ||
                                'Learning Session'}
                            </h3>

                            <p>
                              Tutor:{' '}
                              {session.tutor_name ||
                                session.tutor ||
                                'Tutor'}
                            </p>

                            <p>
                              📅{' '}
                              {session.session_date ||
                                session.date}
                            </p>

                            <p>
                              🕐{' '}
                              {session.session_time ||
                                session.time}
                            </p>
                          </div>

                          <span
                            style={
                              styles.statusBadge
                            }
                          >
                            Booked
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}

                <h2
                  style={{
                    ...styles.sessionHeading,
                    marginTop: '45px',
                  }}
                >
                  🎓 Students I've Tutored
                </h2>

                {tutorSessions.length ===
                0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>
                      🌱
                    </div>

                    <h3>
                      No tutoring sessions yet
                    </h3>

                    <p>
                      Become a tutor to start
                      helping other students.
                    </p>
                  </div>
                ) : (
                  <div
                    style={
                      styles.sessionGrid
                    }
                  >
                    {tutorSessions.map(
                      (session, index) => (
                        <div
                          key={
                            session.id ||
                            index
                          }
                          style={
                            styles.sessionCard
                          }
                        >
                          <div
                            style={
                              styles.sessionIcon
                            }
                          >
                            🎓
                          </div>

                          <div
                            style={
                              styles.sessionInfo
                            }
                          >
                            <h3>
                              {session.subject ||
                                'Tutoring Session'}
                            </h3>

                            <p>
                              Student:{' '}
                              {session.student_name ||
                                session.student ||
                                'Student'}
                            </p>

                            <p>
                              📅{' '}
                              {session.session_date ||
                                session.date}
                            </p>

                            <p>
                              🕐{' '}
                              {session.session_time ||
                                session.time}
                            </p>
                          </div>

                          <span
                            style={
                              styles.statusBadge
                            }
                          >
                            Booked
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>

      {/* =====================================================
          BOOKING MODAL
      ===================================================== */}

      {showBooking &&
        selectedTutor && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div
                style={
                  styles.modalHeader
                }
              >
                <div>
                  <p style={styles.eyebrow}>
                    BOOK SESSION
                  </p>

                  <h2
                    style={
                      styles.modalTitle
                    }
                  >
                    Learn with{' '}
                    {selectedTutor.name}
                  </h2>
                </div>

                <button
                  onClick={() =>
                    setShowBooking(false)
                  }
                  style={
                    styles.closeButton
                  }
                >
                  ×
                </button>
              </div>

              {bookingSuccess ? (
                <div
                  style={
                    styles.bookingSuccess
                  }
                >
                  <div
                    style={
                      styles.successCircle
                    }
                  >
                    ✓
                  </div>

                  <h2>
                    Session Booked!
                  </h2>

                  <p>
                    Your session with{' '}
                    <strong>
                      {selectedTutor.name}
                    </strong>{' '}
                    has been successfully
                    booked.
                  </p>

                  <button
                    onClick={() => {
                      setShowBooking(false);
                      setActivePage(
                        'sessions'
                      );
                      setBookingSuccess(false);
                    }}
                    style={
                      styles.primaryButton
                    }
                  >
                    View My Sessions
                  </button>
                </div>
              ) : (
                <>
                  <div
                    style={
                      styles.bookingTutor
                    }
                  >
                    <div
                      style={
                        styles.bookingAvatar
                      }
                    >
                      {selectedTutor.name
                        ?.split(' ')
                        .map(
                          (word) =>
                            word[0]
                        )
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {selectedTutor.name}
                      </strong>

                      <p>
                        {(
                          selectedTutor.subjects ||
                          []
                        ).join(' • ')}
                      </p>
                    </div>
                  </div>

                  <label
                    style={styles.label}
                  >
                    Subject
                  </label>

                  <select
                    value={bookingSubject}
                    onChange={(e) =>
                      setBookingSubject(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  >
                    {(
                      selectedTutor.subjects ||
                      []
                    ).map((subject) => (
                      <option
                        key={subject}
                        value={subject}
                      >
                        {subject}
                      </option>
                    ))}
                  </select>

                  <label
                    style={styles.label}
                  >
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
                      setBookingDate(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />

                  <label
                    style={styles.label}
                  >
                    Time
                  </label>

                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) =>
                      setBookingTime(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />

                  <button
                    onClick={confirmBooking}
                    disabled={bookingLoading}
                    style={{
                      ...styles.primaryButton,
                      opacity:
                        bookingLoading
                          ? 0.6
                          : 1,
                    }}
                  >
                    {bookingLoading
                      ? 'Booking...'
                      : 'Confirm Booking →'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      {/* =====================================================
          BECOME A TUTOR MODAL
      ===================================================== */}

      {showTutorForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div
              style={
                styles.modalHeader
              }
            >
              <div>
                <p style={styles.eyebrow}>
                  SHARE KNOWLEDGE
                </p>

                <h2
                  style={
                    styles.modalTitle
                  }
                >
                  Become a Tutor
                </h2>
              </div>

              <button
                onClick={() =>
                  setShowTutorForm(false)
                }
                style={
                  styles.closeButton
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                createTutorProfile
              }
            >
              <label style={styles.label}>
                About You
              </label>

              <textarea
                value={tutorBio}
                onChange={(e) =>
                  setTutorBio(
                    e.target.value
                  )
                }
                placeholder="Tell students what you can help them with..."
                style={
                  styles.textarea
                }
                rows={4}
              />

              <label style={styles.label}>
                Subjects You Can Teach
              </label>

              <div
                style={
                  styles.subjectSelectGrid
                }
              >
                {subjects
                  .filter(
                    (subject) =>
                      subject !== 'All'
                  )
                  .map((subject) => (
                    <button
                      type="button"
                      key={subject}
                      onClick={() =>
                        handleTutorSubjectChange(
                          subject
                        )
                      }
                      style={{
                        ...styles.subjectButton,
                        ...(tutorSubjects.includes(
                          subject
                        )
                          ? styles.activeSubjectButton
                          : {}),
                      }}
                    >
                      {subject}
                    </button>
                  ))}
              </div>

              <label style={styles.label}>
                Availability
              </label>

              <input
                value={tutorAvailability}
                onChange={(e) =>
                  setTutorAvailability(
                    e.target.value
                  )
                }
                placeholder="e.g. Weekdays 5 PM - 8 PM"
                style={styles.input}
              />

              <button
                type="submit"
                disabled={tutorLoading}
                style={styles.primaryButton}
              >
                {tutorLoading
                  ? 'Creating...'
                  : 'Create Tutor Profile →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          REAL-TIME CHAT MODAL
      ===================================================== */}

      {showChat && chatTutor && (
        <div style={styles.modalOverlay}>
          <div style={styles.chatModal}>
            <div style={styles.chatHeader}>
              <div
                style={
                  styles.chatUserInfo
                }
              >
                <div
                  style={
                    styles.chatAvatar
                  }
                >
                  {chatTutor.name
                    ?.split(' ')
                    .map(
                      (word) =>
                        word[0]
                    )
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '18px',
                    }}
                  >
                    {chatTutor.name}
                  </h2>

                  <div
                    style={
                      styles.connectionStatus
                    }
                  >
                    <span
                      style={{
                        ...styles.connectionDot,
                        background:
                          chatConnected
                            ? '#22C55E'
                            : '#F59E0B',
                      }}
                    ></span>

                    {chatConnected
                      ? 'Live Chat'
                      : 'Connecting...'}
                  </div>
                </div>
              </div>

              <button
                onClick={closeChat}
                style={
                  styles.closeButton
                }
              >
                ×
              </button>
            </div>

            <div
              style={
                styles.chatMessages
              }
            >
              {chatMessages.length ===
                0 && (
                <div
                  style={
                    styles.chatEmpty
                  }
                >
                  <div
                    style={
                      styles.chatEmptyIcon
                    }
                  >
                    💬
                  </div>

                  <strong>
                    Start a conversation
                  </strong>

                  <p>
                    Send a message to{' '}
                    {chatTutor.name}.
                  </p>
                </div>
              )}

              {chatMessages.map(
                (msg, index) => {
                  const isMine =
                    Number(
                      msg.sender_id
                    ) ===
                    Number(
                      currentUser.id
                    );

                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent:
                          isMine
                            ? 'flex-end'
                            : 'flex-start',
                        marginBottom:
                          '12px',
                      }}
                    >
                      <div
                        style={{
                          ...styles.messageBubble,
                          ...(isMine
                            ? styles.myMessage
                            : styles.otherMessage),
                        }}
                      >
                        {!isMine && (
                          <div
                            style={
                              styles.messageSender
                            }
                          >
                            {msg.sender_name ||
                              chatTutor.name}
                          </div>
                        )}

                        <div>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div
              style={
                styles.chatInputArea
              }
            >
              <input
                value={chatInput}
                onChange={(e) =>
                  setChatInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter'
                  ) {
                    sendChatMessage();
                  }
                }}
                placeholder={
                  chatConnected
                    ? 'Type a message...'
                    : 'Connecting...'
                }
                disabled={!chatConnected}
                style={
                  styles.chatInput
                }
              />

              <button
                onClick={
                  sendChatMessage
                }
                disabled={
                  !chatConnected ||
                  !chatInput.trim()
                }
                style={{
                  ...styles.sendButton,
                  opacity:
                    !chatConnected ||
                    !chatInput.trim()
                      ? 0.5
                      : 1,
                }}
              >
                ➤
              </button>
            </div>
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
    background: '#F8FAF9',
    color: '#102A1B',
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  // =======================================================
  // AUTH
  // =======================================================

  authPage: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg, #F0FDF4 0%, #F8FAF9 45%, #ECFDF5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
    position: 'relative',
    overflow: 'hidden',
  },

  authGlow: {
    position: 'absolute',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: '#BBF7D0',
    opacity: 0.35,
    filter: 'blur(90px)',
    top: '-150px',
    right: '-100px',
  },

  authCard: {
    width: '100%',
    maxWidth: '460px',
    background: '#FFFFFF',
    border: '1px solid #DCE8E0',
    borderRadius: '28px',
    padding: '42px',
    boxShadow:
      '0 25px 70px rgba(16, 42, 27, 0.12)',
    position: 'relative',
    zIndex: 2,
  },

  logoCircle: {
    width: '68px',
    height: '68px',
    borderRadius: '20px',
    background:
      'linear-gradient(135deg, #166534, #22C55E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    margin: '0 auto 20px',
    boxShadow:
      '0 12px 25px rgba(22, 101, 52, 0.25)',
  },

  authTitle: {
    textAlign: 'center',
    margin: 0,
    fontSize: '34px',
    letterSpacing: '-1px',
  },

  authSubtitle: {
    textAlign: 'center',
    color: '#64756A',
    margin:
      '10px 0 30px',
  },

  authTabs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    background: '#F1F5F2',
    padding: '5px',
    borderRadius: '12px',
    marginBottom: '25px',
  },

  authTab: {
    border: 'none',
    background: 'transparent',
    padding: '12px',
    borderRadius: '9px',
    fontWeight: '700',
    color: '#64756A',
    cursor: 'pointer',
  },

  activeAuthTab: {
    background: '#FFFFFF',
    color: '#166534',
    boxShadow:
      '0 2px 8px rgba(16,42,27,0.08)',
  },

  greenText: {
    color: '#166534',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: '#34483B',
    marginBottom: '7px',
    marginTop: '17px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 14px',
    borderRadius: '11px',
    border: '1px solid #CCDCD2',
    background: '#FFFFFF',
    color: '#102A1B',
    fontSize: '14px',
    outline: 'none',
  },

  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 14px',
    borderRadius: '11px',
    border: '1px solid #CCDCD2',
    background: '#FFFFFF',
    color: '#102A1B',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },

  primaryButton: {
    width: '100%',
    marginTop: '22px',
    border: 'none',
    borderRadius: '11px',
    padding: '14px 18px',
    background:
      'linear-gradient(135deg, #166534, #15803D)',
    color: '#FFFFFF',
    fontWeight: '800',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow:
      '0 8px 18px rgba(22,101,52,0.18)',
  },

  smallText: {
    textAlign: 'center',
    color: '#7A897F',
    fontSize: '12px',
    marginTop: '15px',
  },

  successBox: {
    background: '#ECFDF3',
    border: '1px solid #BBF7D0',
    color: '#166534',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '15px',
  },

  errorBox: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#B91C1C',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '15px',
  },

  // =======================================================
  // NAVBAR
  // =======================================================

  navbar: {
    minHeight: '74px',
    background: '#FFFFFF',
    borderBottom:
      '1px solid #E2EBE5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 5%',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    cursor: 'pointer',
  },

  brandIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: '#ECFDF3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '21px',
  },

  brandName: {
    fontSize: '19px',
    fontWeight: '900',
    letterSpacing: '-0.5px',
  },

  brandTagline: {
    fontSize: '10px',
    color: '#7A897F',
    marginTop: '1px',
  },

  navLinks: {
    display: 'flex',
    gap: '5px',
  },

  navButton: {
    border: 'none',
    background: 'transparent',
    color: '#64756A',
    padding: '10px 14px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px',
  },

  activeNavButton: {
    background: '#ECFDF3',
    color: '#166534',
  },

  profileArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background:
      'linear-gradient(135deg, #166534, #22C55E)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '12px',
  },

  userName: {
    fontSize: '13px',
    fontWeight: '700',
  },

  logoutButton: {
    border: '1px solid #DCE8E0',
    background: '#FFFFFF',
    color: '#64756A',
    borderRadius: '9px',
    padding: '8px 11px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },

  // =======================================================
  // MAIN
  // =======================================================

  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '45px 5% 80px',
  },

  topSuccess: {
    background: '#ECFDF3',
    color: '#166534',
    border:
      '1px solid #BBF7D0',
    borderRadius: '11px',
    padding: '13px 16px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },

  topError: {
    background: '#FEF2F2',
    color: '#B91C1C',
    border:
      '1px solid #FECACA',
    borderRadius: '11px',
    padding: '13px 16px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },

  // =======================================================
  // HERO
  // =======================================================

  hero: {
    display: 'grid',
    gridTemplateColumns:
      '1.2fr 0.8fr',
    gap: '50px',
    alignItems: 'center',
    marginBottom: '45px',
  },

  heroContent: {
    maxWidth: '680px',
  },

  eyebrow: {
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '1.7px',
    color: '#22A05A',
    margin: '0 0 10px',
  },

  heroTitle: {
    fontSize: '48px',
    lineHeight: '1.08',
    letterSpacing: '-2px',
    margin: '0 0 18px',
  },

  heroText: {
    color: '#64756A',
    lineHeight: '1.7',
    fontSize: '15px',
    maxWidth: '600px',
    marginBottom: '25px',
  },

  searchBox: {
    maxWidth: '570px',
    background: '#FFFFFF',
    border:
      '1px solid #DCE8E0',
    borderRadius: '14px',
    padding: '4px 15px',
    display: 'flex',
    alignItems: 'center',
    boxShadow:
      '0 8px 25px rgba(16,42,27,0.05)',
  },

  searchIcon: {
    fontSize: '17px',
    marginRight: '9px',
  },

  searchInput: {
    border: 'none',
    outline: 'none',
    flex: 1,
    padding: '13px 0',
    fontSize: '14px',
    background: 'transparent',
  },

  heroIllustration: {
    minHeight: '310px',
    background:
      'linear-gradient(145deg, #DCFCE7, #F0FDF4)',
    borderRadius: '30px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border:
      '1px solid #CDEBD6',
  },

  illustrationCard: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow:
      '0 15px 40px rgba(16,42,27,0.12)',
  },

  bigEmoji: {
    fontSize: '46px',
  },

  illustrationCardSmall: {
    position: 'absolute',
    bottom: '25px',
    left: '25px',
    background: '#FFFFFF',
    borderRadius: '14px',
    padding: '12px 15px',
    fontWeight: '900',
    color: '#166534',
    boxShadow:
      '0 10px 25px rgba(16,42,27,0.1)',
  },

  floatingCard: {
    position: 'absolute',
    top: '22px',
    right: '20px',
    background: '#166534',
    color: '#FFFFFF',
    borderRadius: '14px',
    padding: '12px 15px',
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    boxShadow:
      '0 10px 25px rgba(22,101,52,0.25)',
  },

  // =======================================================
  // FEATURES
  // =======================================================

  features: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '55px',
  },

  featureCard: {
    background: '#FFFFFF',
    border:
      '1px solid #E0EAE4',
    borderRadius: '17px',
    padding: '22px',
    display: 'flex',
    gap: '15px',
  },

  featureIcon: {
    width: '45px',
    height: '45px',
    flexShrink: 0,
    background: '#ECFDF3',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },

  // =======================================================
  // SECTIONS
  // =======================================================

  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '18px',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '30px',
    letterSpacing: '-1px',
  },

  refreshButton: {
    border:
      '1px solid #DCE8E0',
    background: '#FFFFFF',
    padding: '9px 13px',
    borderRadius: '9px',
    cursor: 'pointer',
    color: '#166534',
    fontWeight: '700',
  },

  subjectContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '25px',
  },

  subjectButton: {
    border:
      '1px solid #DCE8E0',
    background: '#FFFFFF',
    color: '#52635A',
    borderRadius: '20px',
    padding: '8px 13px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '700',
  },

  activeSubjectButton: {
    background: '#166534',
    color: '#FFFFFF',
    borderColor: '#166534',
  },

  // =======================================================
  // TUTORS
  // =======================================================

  tutorGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, 1fr)',
    gap: '18px',
  },

  tutorCard: {
    background: '#FFFFFF',
    border:
      '1px solid #E0EAE4',
    borderRadius: '19px',
    padding: '21px',
    transition: 'transform 0.2s',
  },

  tutorTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tutorAvatar: {
    width: '52px',
    height: '52px',
    borderRadius: '15px',
    background:
      'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
    color: '#166534',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
  },

  onlineDot: {
    color: '#16803D',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontWeight: '700',
  },

  tutorName: {
    margin:
      '16px 0 7px',
    fontSize: '18px',
  },

  tutorDescription: {
    color: '#6B7B71',
    fontSize: '13px',
    lineHeight: '1.6',
    minHeight: '42px',
  },

  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    margin:
      '15px 0',
  },

  tag: {
    background: '#F0FDF4',
    color: '#166534',
    borderRadius: '7px',
    padding: '5px 8px',
    fontSize: '10px',
    fontWeight: '800',
  },

  ratingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#64756A',
    fontSize: '12px',
    padding:
      '12px 0',
    borderTop:
      '1px solid #EEF3EF',
  },

  cardBottom: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr',
    gap: '8px',
    marginTop: '4px',
  },

  chatButton: {
    border:
      '1px solid #B7DCC2',
    background: '#F0FAF3',
    color: '#166534',
    padding: '11px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '800',
  },

  bookButton: {
    border: 'none',
    background: '#166534',
    color: '#FFFFFF',
    padding: '11px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '800',
  },

  // =======================================================
  // EMPTY
  // =======================================================

  emptyState: {
    background: '#FFFFFF',
    border:
      '1px dashed #C8D9CE',
    borderRadius: '18px',
    padding: '50px 20px',
    textAlign: 'center',
    color: '#6B7B71',
  },

  emptyIcon: {
    fontSize: '40px',
    marginBottom: '10px',
  },

  spinner: {
    fontSize: '30px',
    color: '#166534',
  },

  // =======================================================
  // SESSIONS
  // =======================================================

  pageHeading: {
    marginBottom: '35px',
  },

  pageSubtitle: {
    color: '#64756A',
    maxWidth: '650px',
  },

  sessionHeading: {
    fontSize: '20px',
    marginBottom: '18px',
  },

  sessionGrid: {
    display: 'grid',
    gap: '13px',
  },

  sessionCard: {
    background: '#FFFFFF',
    border:
      '1px solid #E0EAE4',
    borderRadius: '15px',
    padding: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  sessionIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '13px',
    background: '#ECFDF3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
  },

  sessionInfo: {
    flex: 1,
  },

  statusBadge: {
    background: '#ECFDF3',
    color: '#166534',
    padding: '6px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
  },

  // =======================================================
  // MODAL
  // =======================================================

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background:
      'rgba(8, 25, 15, 0.48)',
    backdropFilter: 'blur(5px)',
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
    padding: '28px',
    boxShadow:
      '0 25px 70px rgba(0,0,0,0.22)',
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },

  modalTitle: {
    margin: 0,
    fontSize: '24px',
    letterSpacing: '-0.7px',
  },

  closeButton: {
    width: '35px',
    height: '35px',
    border: 'none',
    borderRadius: '9px',
    background: '#F1F5F2',
    color: '#52635A',
    cursor: 'pointer',
    fontSize: '23px',
    lineHeight: '1',
  },

  bookingTutor: {
    background: '#F4FBF6',
    borderRadius: '13px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '5px',
  },

  bookingAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '12px',
    background: '#DCFCE7',
    color: '#166534',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
  },

  bookingSuccess: {
    textAlign: 'center',
    padding: '25px 10px',
  },

  successCircle: {
    width: '65px',
    height: '65px',
    margin: '0 auto 15px',
    borderRadius: '50%',
    background: '#DCFCE7',
    color: '#166534',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '900',
  },

  subjectSelectGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '7px',
    marginTop: '5px',
  },

  // =======================================================
  // CHAT
  // =======================================================

  chatModal: {
    width: '100%',
    maxWidth: '500px',
    background: '#FFFFFF',
    borderRadius: '22px',
    overflow: 'hidden',
    boxShadow:
      '0 25px 70px rgba(0,0,0,0.25)',
  },

  chatHeader: {
    padding: '17px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom:
      '1px solid #E3ECE6',
  },

  chatUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
  },

  chatAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background:
      'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
    color: '#166534',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '12px',
  },

  connectionStatus: {
    fontSize: '11px',
    color: '#718078',
    marginTop: '3px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },

  connectionDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    display: 'inline-block',
  },

  chatMessages: {
    height: '370px',
    overflowY: 'auto',
    padding: '20px',
    background: '#F7FAF8',
  },

  chatEmpty: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64756A',
    textAlign: 'center',
  },

  chatEmptyIcon: {
    fontSize: '40px',
    marginBottom: '10px',
  },

  messageBubble: {
    padding: '10px 14px',
    borderRadius: '15px',
    maxWidth: '75%',
    fontSize: '13px',
    lineHeight: '1.5',
  },

  myMessage: {
    background: '#166534',
    color: '#FFFFFF',
    borderBottomRightRadius:
      '4px',
  },

  otherMessage: {
    background: '#E8F5EC',
    color: '#102A1B',
    borderBottomLeftRadius:
      '4px',
  },

  messageSender: {
    fontSize: '10px',
    fontWeight: '800',
    marginBottom: '3px',
    opacity: 0.7,
  },

  chatInputArea: {
    display: 'flex',
    gap: '9px',
    padding: '14px',
    borderTop:
      '1px solid #E3ECE6',
    background: '#FFFFFF',
  },

  chatInput: {
    flex: 1,
    minWidth: 0,
    padding: '12px 13px',
    borderRadius: '10px',
    border:
      '1px solid #CCDCD2',
    outline: 'none',
    fontSize: '13px',
  },

  sendButton: {
    width: '45px',
    border: 'none',
    borderRadius: '10px',
    background: '#166534',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: '18px',
  },
};