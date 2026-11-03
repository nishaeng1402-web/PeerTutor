    import React, { useEffect, useRef, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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

  const [showChat, setShowChat] = useState(false);
  const [chatTutor, setChatTutor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatSocketRef = useRef(null);
  const [chatConnected, setChatConnected] = useState(false);

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
    setBookingSubject(tutor.subjects.length > 0 ? tutor.subjects[0] : '');
    setBookingDate(''); setBookingTime(''); setBookingSuccess(false); setShowBooking(true);
  };

  const openChat = (tutor) => {
    if (!currentUser) {
      setError('Please login first.');
      return;
    }

    if (!tutor?.id) {
      setError('This tutor does not have a valid user ID.');
      return;
    }

    if (Number(tutor.id) === Number(currentUser.id)) {
      setError('You cannot chat with yourself.');
      return;
    }

    if (chatSocketRef.current) {
      chatSocketRef.current.close();
      chatSocketRef.current = null;
    }

    setError('');
    setChatTutor(tutor);
    setChatMessages([]);
    setChatInput('');
    setShowChat(true);
    setChatConnected(false);

    const backendUrl = new URL(API_URL);
    const protocol = backendUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${backendUrl.host}/ws/chat/${currentUser.id}/${tutor.id}`;
    console.log('Connecting to:', socketUrl);

    const socket = new WebSocket(socketUrl);
    chatSocketRef.current = socket;

    socket.onopen = () => {
      console.log('PeerTutor chat connected');
      setChatConnected(true);
    };

    socket.onmessage = (event) => {
      console.log('Chat message received:', event.data);
      try {
        const incomingMessage = JSON.parse(event.data);
        setChatMessages((previous) => [...previous, incomingMessage]);
      } catch (error) {
        console.error('Unable to read chat message:', error);
      }
    };

    socket.onerror = (event) => {
      console.error('Chat error:', event);
      setChatConnected(false);
    };

    socket.onclose = () => {
      console.log('PeerTutor chat disconnected');
      setChatConnected(false);
      if (chatSocketRef.current === socket) {
        chatSocketRef.current = null;
      }
    };
  };

  const sendChatMessage = () => {
    const text = chatInput.trim();
    const socket = chatSocketRef.current;

    if (!text) return;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('Chat is not connected. Please close and reopen the chat.');
      return;
    }

    const outgoingMessage = {
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      text,
    };

    // Show the sender's message immediately. The backend relays it to the other user.
    setChatMessages((previous) => [...previous, outgoingMessage]);
    socket.send(JSON.stringify(outgoingMessage));
    setChatInput('');
  };

  const closeChat = () => {
    if (chatSocketRef.current) {
      chatSocketRef.current.close();
      chatSocketRef.current = null;
    }

    setChatTutor(null);
    setChatMessages([]);
    setChatInput('');
    setChatConnected(false);
    setShowChat(false);
  };

  // =========================
  // BOOK SESSION
  // =========================

  const bookSession = async (e) => {
    e.preventDefault();

    if (!selectedTutor || !currentUser) {
      setError('Please select a tutor first.');
      return;
    }

    if (!bookingSubject || !bookingDate || !bookingTime) {
      setError('Please select subject, date and time.');
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
          date: bookingDate,
          time: bookingTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to book session');
      }

      setBookingSuccess(true);

      await loadSessions();

    } catch (err) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  // =========================
  // TUTOR PROFILE
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
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* ================= ALERTS ================= */}

      <main style={styles.mainContent}>

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

        {/* ================= FIND TUTORS ================= */}

        {activePage === 'find' && (
          <>
            <section style={styles.hero}>
              <div>
                <p style={styles.eyebrow}>PEER-TO-PEER LEARNING</p>
                <h1 style={styles.heroTitle}>
                  Learn better,
                  <br />
                  <span style={styles.greenText}>together.</span>
                </h1>
                <p style={styles.heroDescription}>
                  Connect with talented students, learn difficult subjects,
                  and share what you know with your campus community.
                </p>
                <button
                  style={styles.heroButton}
                  onClick={() => setShowTutorForm(true)}
                >
                  Become a Tutor →
                </button>
              </div>

              <div style={styles.heroIllustration}>
                <div style={styles.illustrationCard}>
                  <div style={styles.bigEmoji}>📚</div>
                  <div>
                    <h3>Learn. Teach. Grow.</h3>
                    <p>Knowledge is better when shared.</p>
                  </div>
                </div>
                <div style={styles.illustrationCardSmall}>
                  ✨ Campus learning community
                </div>
              </div>
            </section>

            <section style={styles.features}>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>🎯</div>
                <div>
                  <h3>Find your guide</h3>
                  <p>Discover students who can help you master a subject.</p>
                </div>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>🤝</div>
                <div>
                  <h3>Learn together</h3>
                  <p>Book a session and get support from your peers.</p>
                </div>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>🌱</div>
                <div>
                  <h3>Grow by teaching</h3>
                  <p>Share your skills and help your campus community.</p>
                </div>
              </div>
            </section>

            <section>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Find your tutor</h2>
                  <p style={styles.pageSubtitle}>
                    Explore available peer tutors and choose your learning partner.
                  </p>
                </div>

                <button
                  style={styles.refreshButton}
                  onClick={loadTutors}
                >
                  ↻ Refresh
                </button>
              </div>

              <input
                type="text"
                placeholder="Search by tutor name, subject or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />

              <div style={styles.subjectContainer}>
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setTimeout(loadTutors, 0);
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

              {loadingTutors ? (
                <div style={styles.emptyState}>
                  <div style={styles.spinner}>⏳</div>
                  <p>Loading tutors...</p>
                </div>
              ) : filteredTutors.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyEmoji}>🔎</div>
                  <h3>No tutors found</h3>
                  <p>Try another subject or search term.</p>
                  <button
                    style={styles.refreshButton}
                    onClick={loadTutors}
                  >
                    Refresh tutors
                  </button>
                </div>
              ) : (
                <div style={styles.tutorGrid}>
                  {filteredTutors.map((tutor) => (
                    <article style={styles.tutorCard} key={tutor.id}>
                      <div style={styles.tutorTop}>
                        <div style={styles.avatar}>
                          {tutor.name
                            .split(' ')
                            .map((word) => word[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div style={styles.tutorInfo}>
                          <h3 style={styles.tutorName}>{tutor.name}</h3>
                          <p style={styles.tutorYear}>
                            {tutor.year || 'Student tutor'}
                          </p>
                        </div>
                        <div style={styles.rating}>
                          ⭐ {tutor.rating || 'New'}
                        </div>
                      </div>

                      <p style={styles.tutorDescription}>
                        {tutor.description || 'Ready to help you learn.'}
                      </p>

                      <div style={styles.subjectTags}>
                        {tutor.subjects.map((subject) => (
                          <span style={styles.subjectTag} key={subject}>
                            {subject}
                          </span>
                        ))}
                      </div>

                      <div style={styles.availability}>
                        🕒 {tutor.availability || 'Contact tutor for availability'}
                      </div>

                      <div style={styles.cardBottom}>
                        <span style={styles.reviews}>
                          {tutor.reviews || 0} reviews
                        </span>

                        <div style={styles.cardActions}>
                          <button
                            style={styles.chatButton}
                            onClick={() => openChat(tutor)}
                          >
                            Chat
                          </button>
                          <button
                            style={styles.bookButton}
                            onClick={() => openBooking(tutor)}
                          >
                            Book Session
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ================= MY SESSIONS ================= */}

        {activePage === 'sessions' && (
          <section>
            <div style={styles.sectionHeader}>
              <div>
                <h1 style={styles.pageTitle}>My Sessions</h1>
                <p style={styles.pageSubtitle}>
                  Track the learning sessions you have booked and the requests you receive.
                </p>
              </div>
              <button
                style={styles.refreshButton}
                onClick={loadSessions}
              >
                ↻ Refresh
              </button>
            </div>

            {sessionsLoading ? (
              <div style={styles.emptyState}>Loading sessions...</div>
            ) : (
              <>
                <div style={styles.sessionSection}>
                  <h2 style={styles.sessionHeading}>Sessions booked by me</h2>
                  {mySessions.length === 0 ? (
                    <div style={styles.emptySession}>
                      <div style={styles.emptyEmoji}>📅</div>
                      <h3>No bookings yet</h3>
                      <p>Find a tutor and book your first learning session.</p>
                    </div>
                  ) : (
                    <div style={styles.sessionGrid}>
                      {mySessions.map((session) => (
                        <article style={styles.sessionCard} key={session.id}>
                          <div style={styles.sessionIcon}>📘</div>
                          <div style={styles.sessionContent}>
                            <h3>{session.subject}</h3>
                            <p>With: {session.tutor_name || 'Tutor'}</p>
                            <p>📅 {session.date}</p>
                            <p>🕒 {session.time}</p>
                            <span style={styles.confirmedBadge}>
                              {session.status || 'Requested'}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.sessionSection}>
                  <h2 style={styles.sessionHeading}>Tutor requests</h2>
                  {tutorSessions.length === 0 ? (
                    <div style={styles.emptySession}>
                      <div style={styles.emptyEmoji}>🤝</div>
                      <h3>No tutor requests yet</h3>
                      <p>When students book you, their requests will appear here.</p>
                    </div>
                  ) : (
                    <div style={styles.sessionGrid}>
                      {tutorSessions.map((session) => (
                        <article style={styles.sessionCard} key={session.id}>
                          <div style={styles.sessionIcon}>🎓</div>
                          <div style={styles.sessionContent}>
                            <h3>{session.subject}</h3>
                            <p>Student: {session.student_name || 'Student'}</p>
                            <p>📅 {session.date}</p>
                            <p>🕒 {session.time}</p>
                            <span style={styles.confirmedBadge}>
                              {session.status || 'Requested'}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}

      </main>

      {/* ================= TUTOR PROFILE MODAL ================= */}

      {showTutorForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Become a Tutor</h2>
                <p style={styles.modalDescription}>
                  Share your knowledge with other students.
                </p>
              </div>
              <button
                style={styles.closeButton}
                onClick={() => setShowTutorForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={createTutorProfile}>
              <label style={styles.label}>About you</label>
              <textarea
                rows="4"
                placeholder="Tell students what you can teach..."
                value={tutorBio}
                onChange={(e) => setTutorBio(e.target.value)}
                style={styles.input}
              />

              <label style={styles.label}>Subjects you can teach</label>
              <div style={styles.checkboxGrid}>
                {subjects.filter((subject) => subject !== 'All').map((subject) => (
                  <label
                    key={subject}
                    style={{
                      ...styles.checkboxLabel,
                      ...(tutorSubjects.includes(subject)
                        ? styles.selectedCheckbox
                        : {}),
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={tutorSubjects.includes(subject)}
                      onChange={() => handleTutorSubjectChange(subject)}
                    />
                    {subject}
                  </label>
                ))}
              </div>

              <label style={styles.label}>Availability</label>
              <input
                type="text"
                placeholder="e.g. Weekdays after 5 PM"
                value={tutorAvailability}
                onChange={(e) => setTutorAvailability(e.target.value)}
                style={styles.input}
              />

              <button
                type="submit"
                style={styles.primaryButton}
                disabled={tutorLoading}
              >
                {tutorLoading ? 'Creating profile...' : 'Create Tutor Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= BOOKING MODAL ================= */}

      {showBooking && selectedTutor && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            {bookingSuccess ? (
              <div style={styles.successModal}>
                <div style={styles.successCircle}>✓</div>
                <h2>Session requested!</h2>
                <p>Your booking request has been sent to {selectedTutor.name}.</p>
                <div style={styles.bookingSummary}>
                  <p><strong>Subject:</strong> {bookingSubject}</p>
                  <p><strong>Date:</strong> {bookingDate}</p>
                  <p><strong>Time:</strong> {bookingTime}</p>
                </div>
                <button
                  style={styles.primaryButton}
                  onClick={() => {
                    setShowBooking(false);
                    setSelectedTutor(null);
                    setBookingSuccess(false);
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div style={styles.modalHeader}>
                  <div>
                    <h2 style={styles.modalTitle}>Book a Session</h2>
                    <p style={styles.modalDescription}>
                      Schedule a learning session with {selectedTutor.name}.
                    </p>
                  </div>
                  <button
                    style={styles.closeButton}
                    onClick={() => setShowBooking(false)}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={bookSession}>
                  <div style={styles.selectedTutorBox}>
                    <div style={styles.avatar}>
                      {selectedTutor.name
                        .split(' ')
                        .map((word) => word[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <strong>{selectedTutor.name}</strong>
                      <p style={styles.tutorYear}>Peer Tutor</p>
                    </div>
                  </div>

                  <label style={styles.label}>Subject</label>
                  <select
                    value={bookingSubject}
                    onChange={(e) => setBookingSubject(e.target.value)}
                    style={styles.input}
                  >
                    {selectedTutor.subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>

                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={styles.input}
                  />

                  <label style={styles.label}>Time</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    style={styles.input}
                  />

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Sending request...' : 'Confirm Booking'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= CHAT MODAL ================= */}

      {showChat && chatTutor && (
        <div style={styles.modalOverlay}>
          <div style={styles.chatModal}>
            <div style={styles.chatHeader}>
              <div style={styles.chatUserInfo}>
                <div style={styles.chatAvatar}>
                  {chatTutor.name
                    .split(' ')
                    .map((word) => word[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 style={styles.chatTitle}>{chatTutor.name}</h3>
                  <div style={styles.chatStatus}>
                    {chatConnected ? '● Connected' : '○ Connecting...'}
                  </div>
                </div>
              </div>
              <button style={styles.closeButton} onClick={closeChat}>×</button>
            </div>

            <div style={styles.chatMessages}>
              {chatMessages.length === 0 ? (
                <div style={styles.chatEmpty}>
                  <div style={styles.chatEmptyIcon}>💬</div>
                  <h3>Start a conversation</h3>
                  <p>Say hello and discuss your learning goals.</p>
                </div>
              ) : (
                chatMessages.map((chatMessage, index) => {
                  const mine = Number(chatMessage.sender_id) === Number(currentUser.id);
                  return (
                    <div
                      key={`${chatMessage.sender_id}-${index}`}
                      style={{
                        display: 'flex',
                        justifyContent: mine ? 'flex-end' : 'flex-start',
                        marginBottom: '12px',
                      }}
                    >
                      <div
                        style={{
                          ...styles.chatBubble,
                          ...(mine ? styles.myChatBubble : styles.theirChatBubble),
                        }}
                      >
                        <div>{chatMessage.text}</div>
                        {!mine && (
                          <div style={styles.chatSender}>
                            {chatMessage.sender_name || chatTutor.name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              style={styles.chatInputArea}
              onSubmit={(e) => {
                e.preventDefault();
                sendChatMessage();
              }}
            >
              <input
                type="text"
                placeholder={chatConnected ? 'Type a message...' : 'Connecting to chat...'}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={styles.chatInput}
                disabled={!chatConnected}
              />
              <button
                type="submit"
                style={styles.sendButton}
                disabled={!chatConnected || !chatInput.trim()}
              >
                ➤
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
  // ================= GLOBAL =================

  page: {
    minHeight: '100vh',
    background: '#F4FBF6',
    color: '#183B2A',
    fontFamily: 'Inter, Arial, sans-serif',
  },

  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '35px 25px 70px',
  },

  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    padding: '16px 5%',
    background: '#FFFFFF',
    borderBottom: '1px solid #E4EEE7',
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
    width: '44px',
    height: '44px',
    borderRadius: '13px',
    background: '#EAF7EF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '23px',
  },

  brandName: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#183B2A',
  },

  brandTagline: {
    fontSize: '11px',
    color: '#7A8B82',
    marginTop: '2px',
  },

  greenText: {
    color: '#2F855A',
  },

  navLinks: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },

  navButton: {
    border: 'none',
    background: 'transparent',
    color: '#52665A',
    padding: '10px 14px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '600',
  },

  activeNavButton: {
    background: '#EAF7EF',
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
    background: '#DDF2E4',
    color: '#166534',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '12px',
  },

  userName: {
    fontWeight: '700',
    fontSize: '13px',
  },

  logoutButton: {
    border: '1px solid #DCE8E0',
    background: '#FFFFFF',
    color: '#52665A',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  // ================= AUTH =================

  authPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #EAF7EF, #F7FCF8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '25px',
    fontFamily: 'Inter, Arial, sans-serif',
  },

  authCard: {
    width: '100%',
    maxWidth: '430px',
    background: '#FFFFFF',
    borderRadius: '22px',
    padding: '38px',
    boxShadow: '0 20px 60px rgba(25, 75, 45, 0.1)',
    border: '1px solid #E4EEE7',
  },

  logoCircle: {
    width: '65px',
    height: '65px',
    margin: '0 auto 15px',
    borderRadius: '20px',
    background: '#EAF7EF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
  },

  authTitle: {
    textAlign: 'center',
    fontSize: '32px',
    margin: '0 0 7px',
    color: '#183B2A',
  },

  authSubtitle: {
    textAlign: 'center',
    color: '#7A8B82',
    marginBottom: '28px',
    fontSize: '14px',
  },

  authTabs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    background: '#F3F8F4',
    padding: '5px',
    borderRadius: '11px',
    marginBottom: '23px',
  },

  authTab: {
    border: 'none',
    background: 'transparent',
    color: '#64756A',
    padding: '11px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
  },

  activeAuthTab: {
    background: '#FFFFFF',
    color: '#166534',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '7px',
    marginTop: '15px',
    color: '#3F5548',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #DCE8E0',
    borderRadius: '9px',
    padding: '12px 13px',
    fontSize: '14px',
    outline: 'none',
    background: '#FFFFFF',
    color: '#183B2A',
    marginBottom: '5px',
  },

  primaryButton: {
    width: '100%',
    border: 'none',
    background: '#166534',
    color: '#FFFFFF',
    padding: '13px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    marginTop: '20px',
  },

  smallText: {
    textAlign: 'center',
    color: '#89978F',
    fontSize: '11px',
    marginTop: '16px',
  },

  successBox: {
    background: '#EAF7EF',
    border: '1px solid #B9DCC4',
    color: '#166534',
    padding: '12px 15px',
    borderRadius: '9px',
    marginBottom: '18px',
    fontSize: '13px',
  },

  errorBox: {
    background: '#FFF1F0',
    border: '1px solid #F3C3BE',
    color: '#B42318',
    padding: '12px 15px',
    borderRadius: '9px',
    marginBottom: '18px',
    fontSize: '13px',
  },

  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #DCE8E0',
    borderRadius: '11px',
    padding: '14px 16px',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '17px',
    background: '#FFFFFF',
  },

  hero: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    alignItems: 'center',
    gap: '35px',
    padding: '30px 0 45px',
  },

  eyebrow: {
    color: '#2F855A',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1.5px',
  },

  heroTitle: {
    fontSize: '52px',
    lineHeight: '1.08',
    margin: '12px 0',
    color: '#183B2A',
  },

  heroDescription: {
    color: '#64756A',
    fontSize: '15px',
    lineHeight: '1.7',
    maxWidth: '540px',
  },

  heroButton: {
    border: 'none',
    background: '#166534',
    color: '#FFFFFF',
    padding: '13px 18px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '700',
    marginTop: '12px',
  },

  heroIllustration: {
    position: 'relative',
    minHeight: '230px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  illustrationCard: {
    background: '#EAF7EF',
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
    color: '#166534',
  },

  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '18px',
    marginBottom: '45px',
  },

  featureCard: {
    background: '#FFFFFF',
    border: '1px solid #E1EAE4',
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
    background: '#EAF7EF',
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
    color: '#6B7A72',
  },

  refreshButton: {
    border: '1px solid #D6E3DB',
    background: '#FFFFFF',
    color: '#166534',
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
    border: '1px solid #DCE8E0',
    background: '#FFFFFF',
    color: '#5F7167',
    padding: '9px 15px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '600',
  },

  activeSubjectButton: {
    background: '#166534',
    color: '#FFFFFF',
    borderColor: '#166534',
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
    border: '1px solid #DFE9E2',
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
    background: '#EAF7EF',
    color: '#166534',
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
    color: '#64756A',
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
    background: '#EFF8F2',
    color: '#166534',
    padding: '5px 9px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
  },

  availability: {
    background: '#F5FAF7',
    padding: '9px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#4F665A',
    marginBottom: '15px',
  },

  cardBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #E8EEE9',
    paddingTop: '15px',
  },

  reviews: {
    color: '#7A8981',
    fontSize: '12px',
  },

  bookButton: {
    border: 'none',
    background: '#166534',
    color: '#FFFFFF',
    padding: '10px 14px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '700',
  },

  cardActions: { display:'flex', alignItems:'center', gap:'7px' },
  chatButton: { border:'1px solid #B9DCC4', background:'#F0F9F3', color:'#166534', padding:'10px 12px', borderRadius:'9px', cursor:'pointer', fontWeight:'700' },
  chatModal: { width:'100%', maxWidth:'520px', height:'min(680px,88vh)', background:'#FFFFFF', borderRadius:'22px', overflow:'hidden', boxShadow:'0 25px 80px rgba(16,42,27,.24)', display:'flex', flexDirection:'column' },
  chatHeader: { padding:'17px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #E4ECE7' },
  chatUserInfo: { display:'flex', alignItems:'center', gap:'12px' },
  chatAvatar: { width:'44px', height:'44px', borderRadius:'13px', background:'#EAF7EF', color:'#166534', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800' },
  chatTitle: { margin:0, fontSize:'17px', color:'#102A1B' },
  chatStatus: { marginTop:'3px', fontSize:'12px', color:'#64756A' },
  chatMessages: { flex:1, overflowY:'auto', padding:'20px', background:'#F7FAF8' },
  chatEmpty: { height:'100%', minHeight:'300px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', color:'#64756A' },
  chatEmptyIcon: { width:'58px', height:'58px', borderRadius:'18px', background:'#EAF7EF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'25px', marginBottom:'12px' },
  chatBubble: { maxWidth:'76%', padding:'10px 13px', borderRadius:'15px', fontSize:'14px', lineHeight:'1.45', wordBreak:'break-word' },
  myChatBubble: { background:'#166534', color:'#FFFFFF', borderBottomRightRadius:'5px' },
  theirChatBubble: { background:'#EAF2EC', color:'#102A1B', borderBottomLeftRadius:'5px' },
  chatSender: { fontSize:'10px', marginTop:'5px', opacity:.7 },
  chatInputArea: { display:'flex', alignItems:'center', gap:'9px', padding:'13px', borderTop:'1px solid #E4ECE7' },
  chatInput: { flex:1, minWidth:0, border:'1px solid #D6E3DB', borderRadius:'11px', padding:'12px 13px', fontSize:'14px', outline:'none' },
  sendButton: { width:'44px', height:'44px', border:'none', borderRadius:'11px', background:'#166534', color:'#FFFFFF', cursor:'pointer', fontSize:'18px' },

  // ================= EMPTY =================

  emptyState: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '60px 20px',
    textAlign: 'center',
    marginTop: '20px',
    border: '1px solid #E2EAE5',
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
    border: '1px solid #DFE9E2',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    gap: '15px',
  },

  sessionIcon: {
    width: '45px',
    height: '45px',
    borderRadius: '12px',
    background: '#EAF7EF',
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
    background: '#E9F7EE',
    color: '#166534',
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
    color: '#64756A',
    lineHeight: '1.6',
  },

  closeButton: {
    border: 'none',
    background: '#F1F5F2',
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    fontSize: '23px',
    cursor: 'pointer',
    color: '#53665B',
  },

  selectedTutorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#F4F8F5',
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
    border: '1px solid #DCE8E0',
    borderRadius: '8px',
    padding: '9px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    gap: '7px',
    alignItems: 'center',
  },

  selectedCheckbox: {
    background: '#EAF7EF',
    borderColor: '#86C49C',
    color: '#166534',
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
    background: '#EAF7EF',
    color: '#166534',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '35px',
    fontWeight: '800',
    margin: '0 auto 20px',
  },

  bookingSummary: {
    background: '#F4F8F5',
    borderRadius: '12px',
    padding: '10px',
    margin: '20px 0',
    color: '#4F665A',
  },
};