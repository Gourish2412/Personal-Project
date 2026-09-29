import React, { useState, useEffect, useRef, memo } from 'react';
import './App.css';
import {
  Bot, LayoutDashboard, Target, Zap, TrendingUp, Cpu,
  Send, Brain, Trophy, Check, Code, Map, CheckCircle2, ChevronRight,
  Settings, UserCircle, Bell, Search, Moon, Sun, CheckCircle, Copy,
  LogOut, LogIn, UserPlus, X, Save, Lock, RefreshCw, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Toaster, toast } from 'sonner';
import { authAPI, chatAPI, roadmapAPI, progressAPI } from './api';

// Memoized Messages
const MessageBubble = memo(({ msg }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const content = msg.content || msg.text || '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`message-row ${msg.role === 'ai' ? 'ai' : 'user'}`}
    >
      {msg.role === 'ai' && (
        <div className="avatar" style={{ width: 36, height: 36, background: 'var(--accent-gradient)', color: 'white', flexShrink: 0 }}>
          <Bot size={18} />
        </div>
      )}
      <div className={`message-bubble ${msg.role === 'ai' ? 'ai-bubble' : 'user-bubble'}`}>
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div style={{ position: 'relative', marginTop: 8, marginBottom: 8 }}>
                  <button
                    onClick={() => handleCopy(String(children).replace(/\n$/, ''))}
                    style={{ position: 'absolute', right: 8, top: 8, background: 'rgba(255,255,255,0.1)', padding: 4, borderRadius: 4, color: 'white', zIndex: 10 }}
                  >
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  </button>
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{ margin: 0, borderRadius: '8px', fontSize: '13px' }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className={className} {...props} style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '4px' }}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
});

export default function App() {
  const [activeTab, setActiveTab] = useState('mentor');
  const [darkMode, setDarkMode] = useState(true);

  // Authentication State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Persistent Session Restoration
  useEffect(() => {
    const token = localStorage.getItem('mentorToken');
    if (token) {
      authAPI.getMe()
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.warn('Session restoration failed:', err);
          localStorage.removeItem('mentorToken');
          setUser(null);
        })
        .finally(() => {
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Theme Sync
  useEffect(() => {
    document.body.className = darkMode ? 'theme-dark' : 'theme-light';
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Ignored
    } finally {
      localStorage.removeItem('mentorToken');
      setUser(null);
      toast.info('Logged out successfully');
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const requireAuthAction = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <Toaster theme={darkMode ? 'dark' : 'light'} position="top-right" />

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon-wrapper">
            <Brain size={20} />
          </div>
          Lumina AI
        </div>

        <div className="search-bar">
          <Search size={16} color="var(--text-secondary)" />
          <input type="text" placeholder="Search..." />
        </div>

        <nav className="nav-menu">
          <NavItem icon={<Bot size={20} />} label="AI Mentor" isActive={activeTab === 'mentor'} onClick={() => setActiveTab('mentor')} />
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Code size={20} />} label="Project Builder" isActive={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />

          <div style={{ marginTop: '32px', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Settings</div>
          <NavItem icon={<UserCircle size={20} />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <NavItem icon={<Settings size={20} />} label="Preferences" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="sidebar-bottom">
          {authLoading ? (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '12px 0' }}>
              Checking session...
            </div>
          ) : user ? (
            <div className="user-profile">
              <div className="avatar" style={{ background: 'var(--accent-gradient)' }}>
                {getInitials(user.name)}
              </div>
              <div style={{ fontSize: '14px', flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'capitalize' }}>
                  {user.preferredLanguage || 'JS'} • {user.skillLevel || 'Beginner'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                style={{ color: 'var(--text-secondary)', padding: '6px', borderRadius: '6px' }}
              >
                <LogOut size={16} />
              </button>
              <button onClick={() => setDarkMode(!darkMode)} style={{ color: 'var(--text-secondary)', padding: '6px' }}>
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          ) : (
            <div className="user-profile" style={{ justifyContent: 'space-between' }}>
              <button
                onClick={() => requireAuthAction('login')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  flex: 1,
                  justifyContent: 'center'
                }}
              >
                <LogIn size={15} /> Sign In
              </button>
              <button onClick={() => setDarkMode(!darkMode)} style={{ color: 'var(--text-secondary)', padding: '6px', marginLeft: '8px' }}>
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            {activeTab === 'mentor' && "Career Mentor"}
            {activeTab === 'dashboard' && "Progress Dashboard"}
            {activeTab === 'projects' && "Project Builder"}
            {activeTab === 'profile' && "User Profile"}
            {activeTab === 'settings' && "App Settings"}
          </div>
          <div className="header-actions">
            {!user && !authLoading && (
              <button
                onClick={() => requireAuthAction('register')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid var(--border-light)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: 'var(--text-primary)'
                }}
              >
                <UserPlus size={15} /> Register
              </button>
            )}
            <button className="icon-badge">
              <Bell size={20} />
              <span className="badge-dot"></span>
            </button>
          </div>
        </header>

        <div className="scrollable-area">
          <AnimatePresence mode="wait">
            {activeTab === 'mentor' && (
              <motion.div key="mentor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ height: '100%' }}>
                <MentorTab user={user} onRequireAuth={() => requireAuthAction('login')} />
              </motion.div>
            )}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <DashboardTab user={user} onRequireAuth={() => requireAuthAction('login')} />
              </motion.div>
            )}
            {activeTab === 'projects' && (
              <motion.div key="projects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ height: '100%' }}>
                <ProjectBuilderTab user={user} onRequireAuth={() => requireAuthAction('login')} />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <ProfileTab user={user} setUser={setUser} onRequireAuth={() => requireAuthAction('login')} />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <SettingsTab darkMode={darkMode} setDarkMode={setDarkMode} user={user} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            mode={authMode}
            setMode={setAuthMode}
            onClose={() => setShowAuthModal(false)}
            onSuccess={(authenticatedUser) => {
              setUser(authenticatedUser);
              setShowAuthModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <div className={`nav-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

/* --- AUTH MODAL --- */

function AuthModal({ mode, setMode, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'login') {
        const res = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('mentorToken', res.data.token);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        onSuccess(res.data.user);
      } else {
        const res = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        localStorage.setItem('mentorToken', res.data.token);
        toast.success(`Account created! Welcome to Lumina AI, ${res.data.user.name}.`);
        onSuccess(res.data.user);
      }
    } catch (err) {
      console.error('Auth error:', err);
      const msg = err.response?.data?.msg || 'Authentication failed. Please check your credentials.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="auth-modal glass-panel"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-header">
          <div className="auth-modal-title">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="auth-error-banner">
            {errorMsg}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Alex Developer"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">I am a</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student / Aspiring Developer</option>
                <option value="mentor">Peer Mentor</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle-link">
          {mode === 'login' ? (
            <>
              Don't have an account yet?
              <button onClick={() => { setMode('register'); setErrorMsg(''); }}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?
              <button onClick={() => { setMode('login'); setErrorMsg(''); }}>
                Sign In
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --- TAB 1: AI CAREER MENTOR --- */

function MentorTab({ user, onRequireAuth }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const bottomRef = useRef(null);

  // Fetch real conversation history from MongoDB
  useEffect(() => {
    if (user) {
      setLoadingHistory(true);
      chatAPI.getHistory()
        .then(res => {
          if (res.data && res.data.length > 0) {
            setMessages(res.data);
          } else {
            setMessages([
              {
                role: 'ai',
                content: `Hey ${user.name.split(' ')[0]}! Ready for today? Your learning plan is active. 🔥\n\n\`\`\`javascript\nconsole.log("Welcome to Lumina AI!");\n\`\`\`\nWhat are you working on today?`
              }
            ]);
          }
        })
        .catch(err => {
          console.error('Failed to load chat history:', err);
          toast.error('Failed to load previous messages.');
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    } else {
      setMessages([
        {
          role: 'ai',
          content: '👋 Welcome to **Lumina AI**! I am your personalized Career Mentor. Please **Sign In** or **Register** to sync your progress and track real roadmaps.'
        }
      ]);
    }
  }, [user]);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!user) {
      toast.info('Please sign in to chat with your AI mentor.');
      onRequireAuth();
      return;
    }

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await chatAPI.sendMessage(userText);
      if (res.data && res.data.message) {
        setMessages(prev => [...prev, { role: 'ai', content: res.data.message }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to get response from AI mentor.');
      setMessages(prev => [...prev, { role: 'ai', content: "⚠️ Sorry, I encountered an error connecting to the server. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-list">
        {loadingHistory && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
            Loading conversation history...
          </div>
        )}
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} />
        ))}
        {isTyping && (
          <div className="message-row ai">
            <div className="avatar" style={{ width: 36, height: 36, background: 'var(--accent-gradient)', color: 'white', flexShrink: 0 }}>
              <Bot size={18} />
            </div>
            <div className="typing-indicator">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder={user ? "Ask me anything or say 'I have 2 hours today'..." : "Sign in to start chatting with your mentor..."}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button className="send-btn" onClick={handleSend} disabled={isTyping} style={{ opacity: isTyping ? 0.5 : 1 }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

/* --- TAB 2: PROGRESS DASHBOARD --- */

function DashboardTab({ user, onRequireAuth }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [updatingStreak, setUpdatingStreak] = useState(false);

  const fetchDashboardData = () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      progressAPI.getProgress(),
      roadmapAPI.getRoadmap()
    ])
      .then(([progRes, roadRes]) => {
        setProgress(progRes.data);
        setRoadmap(roadRes.data);
      })
      .catch(err => {
        console.error('Failed to fetch dashboard data:', err);
        toast.error('Could not sync progress data.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleStartMission = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setUpdatingStreak(true);
    try {
      const res = await progressAPI.updateProgress({ incStreak: true, lessonsCompleted: 1 });
      setProgress(res.data);
      toast.success("Mission started! Learning streak incremented 🔥");
    } catch (err) {
      console.error('Update streak error:', err);
      toast.error('Failed to update streak.');
    } finally {
      setUpdatingStreak(false);
    }
  };

  if (!user) {
    return (
      <AccessDeniedState
        title="Sign In to View Dashboard"
        desc="Authenticate to track your real-time completion streak, interview readiness, and personalized curriculum."
        onAction={onRequireAuth}
      />
    );
  }

  if (loading) {
    return <SkeletonDashboard />;
  }

  const streak = progress?.learningStreak || 1;
  const completionPct = progress?.overallCompletionPercentage || 35;
  const skillLevel = user?.skillLevel || 'Intermediate';
  const weakArea = roadmap?.weakAreas?.[0] || 'Asynchronous JS';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      <div className="mission-card">
        <div className="mission-texts">
          <h3>Today's Mission: Master Promises & Async APIs</h3>
          <p>Complete the interactive module and pass the AI review to unlock full-stack deployment.</p>
        </div>
        <button
          className="mission-action"
          onClick={handleStartMission}
          disabled={updatingStreak}
        >
          {updatingStreak ? 'Updating...' : 'Log Study Session 🔥'}
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card glass-panel">
          <div className="stat-header">
            Frontend Roadmap <Map size={16} color="var(--accent-primary)" />
          </div>
          <div className="stat-value">
            {completionPct}%
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${completionPct}%` }}></div>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-header">
            Completed Projects <Target size={16} color="var(--success)" />
          </div>
          <div className="stat-value">
            {progress?.completedProjectsCount || 1} <span className="stat-sub">+1 this week</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: '60%', background: 'var(--success)' }}></div>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-header">
            Consistency Streak <Zap size={16} color="var(--warning)" />
          </div>
          <div className="stat-value">
            {streak} <span style={{ fontSize: '16px', color: 'var(--warning)', marginLeft: '4px' }}>Days 🔥</span>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Top 10% of active learners</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="stat-card glass-panel flex-row">
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '50%', color: 'var(--accent-primary)', flexShrink: 0 }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <div className="stat-header" style={{ marginBottom: '4px' }}>Current Skill Level</div>
            <div style={{ fontSize: '20px', fontWeight: '600', textTransform: 'capitalize' }}>{skillLevel}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Goal: {user?.careerGoal || 'Full-Stack Developer'}</div>
          </div>
        </div>

        <div className="stat-card glass-panel flex-row">
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '16px', borderRadius: '50%', color: '#fb7185', flexShrink: 0 }}>
            <Cpu size={32} />
          </div>
          <div>
            <div className="stat-header" style={{ marginBottom: '4px' }}>Weakest Area Focus</div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>{weakArea}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Recommendation: Build a Weather Dashboard</div>
          </div>
        </div>
      </div>

    </div>
  );
}

/* --- TAB 3: PROJECT BUILDER --- */

function ProjectBuilderTab({ user, onRequireAuth }) {
  const [project, setProject] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(1);
  const [code, setCode] = useState('const App = () => {\n  return (\n    <nav>\n      <h1>Weather API</h1>\n    </nav>\n  )\n}');
  const [status, setStatus] = useState('idle'); // 'idle' | 'reviewing' | 'success'
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      roadmapAPI.getRoadmap()
        .then(res => {
          if (res.data && res.data.modules && res.data.modules.length > 0 && res.data.modules[0].projects && res.data.modules[0].projects.length > 0) {
            const currentProj = res.data.modules[0].projects[0];
            setProject(currentProj);
            if (currentProj.milestones && currentProj.milestones[1]?.codeSnippet) {
              setCode(currentProj.milestones[1].codeSnippet);
            }
          }
        })
        .catch(err => {
          console.error('Failed to load project:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const submitCode = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setStatus('reviewing');
    try {
      const res = await roadmapAPI.reviewCode({
        projectId: project?._id,
        milestoneIndex: activeStepIndex,
        code
      });

      if (res.data && res.data.success) {
        setStatus('success');
        setFeedback(res.data.feedback);
        if (res.data.project) {
          setProject(res.data.project);
        }
        toast.success("Code passed AI review and saved to database!");
      }
    } catch (err) {
      console.error('Code review error:', err);
      toast.error('Failed to submit code for review.');
      setStatus('idle');
    }
  };

  if (!user) {
    return (
      <AccessDeniedState
        title="Sign In to Access Project Builder"
        desc="Submit code snippets, receive real-time AI code reviews, and save milestone completions to your account."
        onAction={onRequireAuth}
      />
    );
  }

  const milestones = project?.milestones || [
    { title: 'Step 1: Setup & Config', description: 'Initialize Vite project & install dependencies.', status: 'completed' },
    { title: 'Step 2: Create Navbar', description: 'Build a responsive top navigation bar.', status: 'in-progress' },
    { title: 'Step 3: Fetch API', description: 'Integrate OpenWeather API for real-time data.', status: 'pending' }
  ];

  return (
    <div className="project-split">
      <div className="project-steps">
        <h3 style={{ marginBottom: '8px' }}>{project?.title || 'Weather Dashboard'}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
          {project?.description || 'Real-world project to master Asynchronous JavaScript and APIs.'}
        </p>

        {milestones.map((m, idx) => {
          const isCompleted = m.status === 'completed';
          const isActive = idx === activeStepIndex || m.status === 'in-progress';
          return (
            <div
              key={idx}
              className={`step-card glass-panel ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => { setActiveStepIndex(idx); setStatus('idle'); }}
              style={{ cursor: 'pointer' }}
            >
              <div className={`step-icon ${isCompleted ? 'completed' : isActive ? 'active' : 'pending'}`}>
                {isCompleted ? <Check size={14} /> : idx + 1}
              </div>
              <div className="step-content">
                <h4>{m.title}</h4>
                <p>{m.description}</p>
                {isActive && (
                  <div className="hint-box">
                    <strong>Hint:</strong> Use semantic HTML5 elements!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="code-review-panel">
        <div className="code-header">
          <span style={{ fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)' }}>
            {milestones[activeStepIndex]?.title || 'Component.jsx'}
          </span>
          <button
            style={{ background: 'var(--accent-gradient)', color: 'white', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
            onClick={submitCode}
            disabled={status === 'reviewing'}
          >
            {status === 'reviewing' ? 'Analyzing Code...' : 'Submit for AI Review'}
          </button>
        </div>
        <textarea
          className="code-editor"
          value={code}
          onChange={e => { setCode(e.target.value); setStatus('idle'); }}
          spellCheck={false}
        />

        {status === 'success' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="feedback-box">
            <div className="feedback-title">
              <CheckCircle2 size={18} /> Great work!
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
              {feedback || "You used semantic markup nicely. This will improve SEO. Your syntax is verified."}
            </p>
            <button
              onClick={() => {
                if (activeStepIndex < milestones.length - 1) {
                  setActiveStepIndex(activeStepIndex + 1);
                  setStatus('idle');
                }
              }}
              style={{ marginTop: '12px', background: 'white', color: '#059669', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
            >
              {activeStepIndex < milestones.length - 1 ? `Unlock Step ${activeStepIndex + 2}` : 'Project Completed! 🎉'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* --- TAB 4: PROFILE TAB --- */

function ProfileTab({ user, setUser, onRequireAuth }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    skillLevel: user?.skillLevel || 'beginner',
    careerGoal: user?.careerGoal || 'Full-Stack Developer',
    availableHours: user?.availableHours || 2,
    preferredLanguage: user?.preferredLanguage || 'JavaScript',
    targetCompany: user?.targetCompany || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        skillLevel: user.skillLevel || 'beginner',
        careerGoal: user.careerGoal || 'Full-Stack Developer',
        availableHours: user.availableHours || 2,
        preferredLanguage: user.preferredLanguage || 'JavaScript',
        targetCompany: user.targetCompany || ''
      });
    }
  }, [user]);

  if (!user) {
    return (
      <AccessDeniedState
        title="Sign In to View Profile"
        desc="Manage your career goals, target companies, and personalized study preferences in MongoDB."
        onAction={onRequireAuth}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateOnboarding(formData);
      setUser(res.data);
      toast.success('Profile and learning preferences updated in database!');
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-card glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
        <div className="avatar" style={{ width: 56, height: 56, fontSize: '20px', background: 'var(--accent-gradient)' }}>
          {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'JS'}
        </div>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700' }}>{user.name}</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{user.email} • <span style={{ textTransform: 'capitalize' }}>{user.role}</span></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="profile-grid">
          <div className="form-group">
            <label className="form-label">Primary Career Goal</label>
            <input
              type="text"
              className="form-input"
              value={formData.careerGoal}
              onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Current Skill Level</label>
            <select
              className="form-select"
              value={formData.skillLevel}
              onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Available Study Hours (Daily)</label>
            <input
              type="number"
              min={1}
              max={16}
              className="form-input"
              value={formData.availableHours}
              onChange={(e) => setFormData({ ...formData, availableHours: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Language / Stack</label>
            <input
              type="text"
              className="form-input"
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
              placeholder="e.g. JavaScript, Python, Go"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Target Dream Company</label>
            <input
              type="text"
              className="form-input"
              value={formData.targetCompany}
              onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
              placeholder="e.g. Google, Meta, Stripe"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--accent-gradient)',
            color: 'white',
            padding: '10px 24px',
            borderRadius: '10px',
            fontWeight: '600',
            marginTop: '8px'
          }}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

/* --- TAB 5: SETTINGS / PREFERENCES TAB --- */

function SettingsTab({ darkMode, setDarkMode, user }) {
  const [notifications, setNotifications] = useState(true);
  const [aiModel, setAiModel] = useState('gpt-4o-mini');

  const handleResetRoadmap = async () => {
    if (!user) {
      toast.info('Sign in to manage roadmaps.');
      return;
    }
    try {
      await roadmapAPI.generateRoadmap();
      toast.success('Curriculum roadmap refreshed!');
    } catch (err) {
      toast.error('Failed to reset roadmap.');
    }
  };

  return (
    <div className="profile-card glass-panel" style={{ maxWidth: 680, margin: '0 auto' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Preferences</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
        Customize your AI mentor responses, visual themes, and study workflow.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-panel-hover)', borderRadius: '12px' }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>Interface Theme</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Current: {darkMode ? 'Dark Mode' : 'Light Mode'}</div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-light)',
              padding: '8px 16px',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />} Toggle Theme
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-panel-hover)', borderRadius: '12px' }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>Toast Notifications</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Show real-time updates for streak and code reviews</div>
          </div>
          <button
            onClick={() => { setNotifications(!notifications); toast.info(`Toasts ${!notifications ? 'enabled' : 'disabled'}`); }}
            style={{
              background: notifications ? 'var(--accent-gradient)' : 'var(--glass-bg)',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            {notifications ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {user && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-panel-hover)', borderRadius: '12px' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px' }}>Regenerate Curriculum Roadmap</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Re-evaluate goals and rebuild study modules</div>
            </div>
            <button
              onClick={handleResetRoadmap}
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={15} /> Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- HELPERS --- */

const AccessDeniedState = ({ title, desc, onAction }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', padding: '20px' }}>
    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '20px', borderRadius: '50%', color: 'var(--accent-primary)', marginBottom: '20px' }}>
      <Lock size={36} />
    </div>
    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '20px' }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '380px', fontSize: '14px', lineHeight: '1.6' }}>{desc}</p>
    <button
      onClick={onAction}
      style={{
        background: 'var(--accent-gradient)',
        color: 'white',
        padding: '10px 24px',
        borderRadius: '10px',
        fontWeight: '600',
        fontSize: '14px',
        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
      }}
    >
      Sign In / Register
    </button>
  </div>
);

const SkeletonDashboard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <div className="skeleton-card" style={{ height: '120px' }}></div>
    <div className="dashboard-grid">
      <div className="skeleton-card" style={{ height: '140px' }}></div>
      <div className="skeleton-card" style={{ height: '140px' }}></div>
      <div className="skeleton-card" style={{ height: '140px' }}></div>
    </div>
  </div>
);
