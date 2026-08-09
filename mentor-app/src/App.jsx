import React, { useState, useEffect, useRef, memo } from 'react';
import './App.css';
import {
  Bot, LayoutDashboard, Target, Zap, TrendingUp, Cpu,
  Send, Brain, Trophy, Check, Code, Map, CheckCircle2, ChevronRight,
  Settings, UserCircle, Bell, Search, Moon, Sun, CheckCircle, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Toaster, toast } from 'sonner';

// Memoized Messages
const MessageBubble = memo(({ msg }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`message-row ${msg.role}`}
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
              const match = /language-(\w+)/.exec(className || '')
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
              )
            }
          }}
        >
          {msg.text}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
});

export default function App() {
  const [activeTab, setActiveTab] = useState('mentor');
  const [darkMode, setDarkMode] = useState(true);

  // Toggle Theme
  useEffect(() => {
    document.body.className = darkMode ? 'theme-dark' : 'theme-light';
  }, [darkMode]);

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
          <div className="user-profile">
            <div className="avatar">JS</div>
            <div style={{ fontSize: '14px', flex: 1 }}>
              <div style={{ fontWeight: '600' }}>Jay Sharma</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>JavaScript • Int.</div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} style={{ color: 'var(--text-secondary)' }}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            {activeTab === 'mentor' && "Career Mentor"}
            {activeTab === 'dashboard' && "Progress Dashboard"}
            {activeTab === 'projects' && "Active Project: Weather Dashboard"}
            {activeTab === 'profile' && "User Profile"}
            {activeTab === 'settings' && "App Settings"}
          </div>
          <div className="header-actions">
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
                <MentorTab />
              </motion.div>
            )}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <DashboardTab />
              </motion.div>
            )}
            {activeTab === 'projects' && (
              <motion.div key="projects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ height: '100%' }}>
                <ProjectBuilderTab />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <EmptyState title="User Profile" desc="Manage your personal details and goals here." />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <EmptyState title="Preferences" desc="Configure AI settings and notifications." />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
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

/* --- TABS --- */

function MentorTab() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hey Jay! Ready for today? You are on a 16-day streak! 🔥\n\n```javascript\nconsole.log("Welcome back!");\n```\nWhat does your schedule look like today?' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setIsTyping(true);

    // Simulate API request
    setTimeout(() => {
      let reply = "Great. Today we'll finish **JavaScript Objects**. It'll take about 90 minutes. Then solve these 3 LeetCode problems.";
      if (messages.length > 2) {
        reply = "I noticed you struggled a bit with Asynchronous JS yesterday. Here's a quick example:\n```javascript\nasync function fetchData() {\n  const res = await fetch('/api');\n  return res.json();\n}\n```";
      }
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      toast.success("Progress roadmap updated!");
    }, 1500);
  };

  return (
    <div className="chat-container">
      <div className="messages-list">
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
          placeholder="Ask me anything or say 'I have 2 hours today'..."
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

function DashboardTab() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      <div className="mission-card">
        <div className="mission-texts">
          <h3>Today's Mission: Master Promises</h3>
          <p>Complete the interactive module and pass the 3-question evaluation to unlock Fetch API.</p>
        </div>
        <button className="mission-action" onClick={() => toast("Starting mission...")}>Start Mission</button>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card glass-panel">
          <div className="stat-header">
            Frontend Roadmap <Map size={16} color="var(--accent-primary)" />
          </div>
          <div className="stat-value">
            82%
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: '82%' }}></div>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-header">
            Interview Readiness <Target size={16} color="var(--success)" />
          </div>
          <div className="stat-value">
            71% <span className="stat-sub">+3% this week</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: '71%', background: 'var(--success)' }}></div>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-header">
            Consistency <Zap size={16} color="var(--warning)" />
          </div>
          <div className="stat-value">
            16 <span style={{ fontSize: '16px', color: 'var(--warning)', marginLeft: '4px' }}>Days 🔥</span>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Top 10% of learners</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="stat-card glass-panel flex-row">
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '50%', color: 'var(--accent-primary)', flexShrink: 0 }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <div className="stat-header" style={{ marginBottom: '4px' }}>Current Skill Level</div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>Intermediate</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Ready for complex logic</div>
          </div>
        </div>

        <div className="stat-card glass-panel flex-row">
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '16px', borderRadius: '50%', color: '#fb7185', flexShrink: 0 }}>
            <Cpu size={32} />
          </div>
          <div>
            <div className="stat-header" style={{ marginBottom: '4px' }}>Weakest Area Focus</div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>Asynchronous JS</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Recommendation: Build a Weather App</div>
          </div>
        </div>
      </div>

    </div>
  );
}

function ProjectBuilderTab() {
  const [code, setCode] = useState('const App = () => {\n  return (\n    <nav>\n      <h1>Weather API</h1>\n    </nav>\n  )\n}');
  const [status, setStatus] = useState('idle'); // idle, reviewing, success

  const submitCode = () => {
    setStatus('reviewing');
    setTimeout(() => {
      setStatus('success');
      toast.success("Code passed review!");
    }, 1500);
  };

  return (
    <div className="project-split">
      <div className="project-steps">
        <h3 style={{ marginBottom: '8px' }}>Weather Dashboard</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
          Real-world project to master Asynchronous JavaScript and APIs.
        </p>

        <div className="step-card glass-panel completed">
          <div className="step-icon completed"><Check size={14} /></div>
          <div className="step-content">
            <h4>Step 1: Setup & Config</h4>
            <p>Initialize Vite project & install dependencies.</p>
          </div>
        </div>

        <div className="step-card glass-panel active">
          <div className="step-icon active">2</div>
          <div className="step-content">
            <h4>Step 2: Create Navbar</h4>
            <p>Build a responsive top navigation bar.</p>
            <div className="hint-box">
              <strong>Hint:</strong> Use semantic HTML5 elements!
            </div>
          </div>
        </div>

        <div className="step-card glass-panel">
          <div className="step-icon pending">3</div>
          <div className="step-content">
            <h4>Step 3: Fetch API</h4>
            <p>Integrate OpenWeather API for real-time data.</p>
          </div>
        </div>
      </div>

      <div className="code-review-panel">
        <div className="code-header">
          <span style={{ fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)' }}>Navbar.jsx</span>
          <button
            style={{ background: 'var(--accent-gradient)', color: 'white', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
            onClick={submitCode}
            disabled={status === 'reviewing'}
          >
            {status === 'reviewing' ? 'Analyzing...' : 'Submit for AI Review'}
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
              You used the <code>&lt;nav&gt;</code> element nicely. This will improve SEO. Your syntax is perfect.
            </p>
            <button style={{ marginTop: '12px', background: 'white', color: '#059669', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
              Unlock Step 3
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Helpers
const EmptyState = ({ title, desc }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
    <Target size={48} style={{ opacity: 0.2, marginBottom: '24px' }} />
    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</h3>
    <p>{desc}</p>
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
