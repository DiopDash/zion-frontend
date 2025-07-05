import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ZionApp = () => {
  // ========== STATE MANAGEMENT ==========
  const [activePortal, setActivePortal] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showControlBoard, setShowControlBoard] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notionData, setNotionData] = useState({
    subscriptions: [],
    tasks: [],
    resets: null
  });
  const [hoveredPortal, setHoveredPortal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [audioLevels, setAudioLevels] = useState(Array(12).fill(0));
  const [isRecording, setIsRecording] = useState(false);
  
  // ========== REFS ==========
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // ========== ORBITAL SYSTEM ==========
  const [orbitalTime, setOrbitalTime] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOrbitalTime(prev => prev + 0.015);
    }, 16);
    
    return () => clearInterval(interval);
  }, []);

  const getOrbitalOffset = (portal, index) => {
    const floatX = Math.cos(orbitalTime * 0.5 + index * 1.2) * 12;
    const floatY = Math.sin(orbitalTime * 0.3 + index * 0.8) * 8;
    return { x: floatX, y: floatY };
  };

  // ========== PORTAL CONFIGURATION ==========
  const portals = [
    {
      id: 'dashboard',
      name: 'Command Center',
      realm: 'Control Matrix',
      color: '#fbbf24',
      glow: '#fde047',
      position: { x: 50, y: 12 },
      description: 'Central hub for all your daily operations',
      icon: '🎛️',
      insights: ['5 systems online', 'All green'],
      actions: ['System Overview', 'Configuration', 'Diagnostics', 'Logs']
    },
    {
      id: 'subscriptions',
      name: 'Subscription Hub',
      realm: 'Financial Dimension',
      color: '#e879f9',
      glow: '#f0abfc',
      position: { x: 78, y: 18 },
      description: 'Monitor and manage all your recurring subscriptions',
      icon: '💳',
      insights: ['$247/mo total', '8 active'],
      actions: ['View All', 'Add New', 'Analytics', 'Export']
    },
    {
      id: 'tasks',
      name: 'Task Nexus', 
      realm: 'Productivity Sphere',
      color: '#fb7185',
      glow: '#fda4af',
      position: { x: 15, y: 35 },
      description: 'Create and track your personal and professional tasks',
      icon: '✅',
      insights: ['12 pending', '3 due today'],
      actions: ['Create Task', 'View Timeline', 'Set Priorities', 'Archive']
    },
    {
      id: 'analytics',
      name: 'Analytics Portal',
      realm: 'Data Dimension',
      color: '#a78bfa',
      glow: '#c4b5fd',
      position: { x: 82, y: 72 },
      description: 'Visualize your performance metrics and insights',
      icon: '📊',
      insights: ['+23% growth', '5 insights'],
      actions: ['View Reports', 'Custom Charts', 'Export Data', 'Predictions']
    },
    {
      id: 'ai',
      name: 'AI Consciousness',
      realm: 'Neural Network',
      color: '#fb923c',  // Changed to warmer orange
      glow: '#fed7aa',   // Softer orange glow
      position: { x: 20, y: 78 },
      description: 'Interact with your personal AI assistant',
      icon: '🧠',
      insights: ['Learning active', 'Ready'],
      actions: ['Train Model', 'View Insights', 'Adjust Parameters', 'Chat']
    }
  ];

  // ========== EFFECTS ==========
  useEffect(() => {
    initializeApp();
    setupVoiceRecognition();
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) * 0.008,
        y: (e.clientY - window.innerHeight / 2) * 0.008
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Update portal insights when data changes
  useEffect(() => {
    if (notionData.subscriptions.length > 0) {
      const total = notionData.subscriptions.reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0);
      const subscriptionPortal = portals.find(p => p.id === 'subscriptions');
      if (subscriptionPortal) {
        subscriptionPortal.insights = [`$${total.toFixed(0)}/mo total`, `${notionData.subscriptions.length} active`];
      }
    }
  }, [notionData]);

  // ========== INITIALIZATION ==========
  const initializeApp = async () => {
    try {
      setConnectionStatus('connecting');
      
      const cachedData = loadFromLocalStorage();
      if (cachedData) {
        setNotionData(cachedData);
      }
      
      await fetchAllData();
      
      setConnectionStatus('connected');
      setIsLoading(false);
      
      setTimeout(() => {
        setMessages([{
          type: 'ai',
          text: 'Zion AI systems online. Neural networks synchronized. How may I assist your digital consciousness today?',
          timestamp: new Date()
        }]);
      }, 1200);
      
    } catch (error) {
      console.error('Initialization failed:', error);
      setConnectionStatus('error');
      setIsLoading(false);
    }
  };

  // ========== DATA MANAGEMENT ==========
  const fetchAllData = async () => {
    try {
      // Simulated data for demo
      const mockSubscriptions = [
        { name: 'Netflix', amount: '15.99' },
        { name: 'Spotify', amount: '9.99' },
        { name: 'GitHub Pro', amount: '4.00' },
        { name: 'Adobe CC', amount: '52.99' },
        { name: 'Notion', amount: '8.00' },
        { name: 'Figma', amount: '12.00' },
        { name: 'ChatGPT Plus', amount: '20.00' },
        { name: 'Vercel Pro', amount: '20.00' }
      ];

      const newData = {
        subscriptions: mockSubscriptions,
        tasks: notionData.tasks,
        resets: null
      };

      setNotionData(newData);
      saveToLocalStorage(newData);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setConnectionStatus('error');
    }
  };

  const saveToLocalStorage = (data) => {
    try {
      localStorage.setItem('zion_data', JSON.stringify({
        ...data,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('zion_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        const lastUpdated = new Date(parsed.lastUpdated);
        const now = new Date();
        const timeDiff = now - lastUpdated;
        
        if (timeDiff < 5 * 60 * 1000) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  };

  // ========== VOICE RECOGNITION WITH VISUALIZATION ==========
  const setupVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        sendMessage(transcript);
        setIsListening(false);
        setIsRecording(false);
        setAudioLevels(Array(12).fill(0));
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setIsRecording(false);
        setAudioLevels(Array(12).fill(0));
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
        setAudioLevels(Array(12).fill(0));
      };
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsRecording(false);
      setAudioLevels(Array(12).fill(0));
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setIsRecording(true);
      setShowChat(true);
      
      const interval = setInterval(() => {
        if (!isListening) {
          clearInterval(interval);
          setAudioLevels(Array(12).fill(0));
          return;
        }
        
        const levels = Array(12).fill(0).map((_, i) => {
          const base = Math.random() * 0.7 + 0.1;
          const wave = Math.sin(orbitalTime * 5 + i * 0.5) * 0.3;
          return Math.max(0, Math.min(1, base + wave));
        });
        setAudioLevels(levels);
      }, 80);
    }
  };

  // ========== CHAT FUNCTIONALITY ==========
  const sendMessage = async (text = currentMessage) => {
    if (!text.trim()) return;

    const userMessage = {
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      setTimeout(() => {
        const responses = [
          'Neural pathways processing your request through quantum matrices...',
          'Digital consciousness acknowledges. Interfacing with data streams...',
          'Command integrated into the neural core. Executing protocols...',
          'Consciousness synchronization complete. Processing through AI substrate...',
          'Your thoughts resonate through the digital realm. Analyzing patterns...',
          'Quantum entanglement established. Your intent flows through the matrix...'
        ];
        
        const aiResponse = {
          type: 'ai',
          text: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1800);
      
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
    }
  };

  // ========== PORTAL INTERACTIONS ==========
  const enterPortal = (portal) => {
    setActivePortal(portal);
    
    const total = notionData.subscriptions.reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0);
    
    const portalMessages = {
      dashboard: `Command Center accessed. ${portal.insights.join(', ')}.`,
      subscriptions: `Financial dimension unlocked. Monitoring ${notionData.subscriptions.length} active subscriptions totaling $${total.toFixed(2)}/month.`,
      tasks: 'Productivity nexus online. Your task management dimension awaits commands.',
      analytics: 'Data streams converging. Analytics portal displaying dimensional insights.',
      ai: 'Neural consciousness bridge established. AI substrate ready for deep interaction.'
    };
    
    const message = {
      type: 'ai',
      text: portalMessages[portal.id] || 'Portal connection established.',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    setShowChat(true);
  };

  const handlePortalAction = (portal, action) => {
    sendMessage(`${action} for ${portal.name}`);
  };

  const createTask = async (title) => {
    try {
      const message = {
        type: 'ai',
        text: `Task "${title}" has been encoded into the productivity matrix.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // ========== RENDER ==========
  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Enhanced Mystical Background */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute inset-0 opacity-50"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, #1e1b4b 0%, transparent 50%), radial-gradient(circle at 75% 75%, #0c0a1d 0%, transparent 50%)',
              'radial-gradient(circle at 75% 25%, #581c87 0%, transparent 50%), radial-gradient(circle at 25% 75%, #7c2d12 0%, transparent 50%)',
              'radial-gradient(circle at 25% 25%, #1e1b4b 0%, transparent 50%), radial-gradient(circle at 75% 75%, #0c0a1d 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 30, repeat: Infinity }}
        />
        
        {/* Enhanced Particle Field */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 3 + 0.5 + 'px',
                height: Math.random() * 3 + 0.5 + 'px',
                background: `rgba(${Math.random() > 0.6 ? '147, 51, 234' : Math.random() > 0.3 ? '249, 115, 22' : '168, 85, 247'}, ${0.2 + Math.random() * 0.6})`,
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%'
              }}
              animate={{
                y: [0, -40, 40, 0],
                x: [0, Math.random() * 20 - 10],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 12 + Math.random() * 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
      </div>

      {/* Central Zion Core with Enhanced Voice Visualization */}
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
        style={{
          x: mousePosition.x * 8,
          y: mousePosition.y * 8
        }}
      >
        <motion.div
          className="relative cursor-pointer"
          onClick={toggleVoice}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
        >
          {/* EPIC Voice Visualization Beams - Circular Pattern Around Z */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Circular voice waves emanating from Z */}
              {[...Array(8)].map((_, index) => {
                const angle = (index * 45) * Math.PI / 180;
                const baseRadius = 90;
                
                return (
                  <React.Fragment key={`voice-${index}`}>
                    {/* Primary circular beams */}
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        width: '4px',
                        height: `${audioLevels[index] * 60 + 20}px`,
                        left: '50%',
                        top: '50%',
                        transformOrigin: 'center bottom',
                        transform: `translate(-50%, -50%) rotate(${index * 45}deg) translateY(-${baseRadius}px)`,
                        background: `linear-gradient(to top, 
                          rgba(147, 51, 234, ${0.9}), 
                          rgba(249, 115, 22, ${0.7}), 
                          transparent
                        )`
                      }}
                      animate={{
                        height: `${audioLevels[index % audioLevels.length] * 80 + 20}px`,
                        opacity: [0.7, 1, 0.7],
                        filter: [
                          'blur(0px)',
                          `blur(${audioLevels[index % audioLevels.length] * 2}px)`,
                          'blur(0px)'
                        ]
                      }}
                      transition={{ 
                        duration: 0.15,
                        opacity: { duration: 0.3, repeat: Infinity }
                      }}
                    />
                    
                    {/* Secondary inner beams */}
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        width: '2px',
                        height: `${audioLevels[index] * 40 + 15}px`,
                        left: '50%',
                        top: '50%',
                        transformOrigin: 'center bottom',
                        transform: `translate(-50%, -50%) rotate(${index * 45 + 22.5}deg) translateY(-${baseRadius - 20}px)`,
                        background: `linear-gradient(to top, 
                          rgba(249, 115, 22, ${0.8}), 
                          rgba(168, 85, 247, ${0.6}), 
                          transparent
                        )`
                      }}
                      animate={{
                        height: `${audioLevels[(index + 4) % audioLevels.length] * 50 + 15}px`,
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </React.Fragment>
                );
              })}
              
              {/* Circular pulse rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={`ring-${ring}`}
                  className="absolute rounded-full border"
                  style={{
                    width: `${140 + ring * 40}px`,
                    height: `${140 + ring * 40}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    borderColor: `rgba(147, 51, 234, ${0.3 - ring * 0.1})`,
                    borderWidth: '1px'
                  }}
                  animate={{
                    scale: [1, 1.1 + ring * 0.05, 1],
                    opacity: [0.3 - ring * 0.1, 0.6 - ring * 0.1, 0.3 - ring * 0.1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: ring * 0.2
                  }}
                />
              ))}
            </div>
          )}

          {/* Enhanced Central Core */}
          <motion.div
            className="w-36 h-36 rounded-full relative"
            animate={{
              background: isListening ? [
                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(249, 115, 22, 0.95) 20%, rgba(147, 51, 234, 0.9) 60%, rgba(0,0,0,0.8) 100%)',
                'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.4), rgba(147, 51, 234, 0.95) 20%, rgba(249, 115, 22, 0.9) 60%, rgba(0,0,0,0.8) 100%)',
                'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.4), rgba(168, 85, 247, 0.95) 20%, rgba(251, 113, 133, 0.9) 60%, rgba(0,0,0,0.8) 100%)'
              ] : [
                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), rgba(147, 51, 234, 0.85) 25%, rgba(249, 115, 22, 0.7) 70%, rgba(0,0,0,0.6) 100%)',
                'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3), rgba(249, 115, 22, 0.85) 25%, rgba(147, 51, 234, 0.7) 70%, rgba(0,0,0,0.6) 100%)',
                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), rgba(147, 51, 234, 0.85) 25%, rgba(249, 115, 22, 0.7) 70%, rgba(0,0,0,0.6) 100%)'
              ],
              scale: isListening ? [1, 1.08, 1] : [1, 1.03, 1],
              boxShadow: isListening ? [
                '0 0 50px rgba(249, 115, 22, 0.9), 0 0 100px rgba(147, 51, 234, 0.6), inset 0 0 30px rgba(255,255,255,0.1)',
                '0 0 70px rgba(147, 51, 234, 0.9), 0 0 120px rgba(249, 115, 22, 0.6), inset 0 0 30px rgba(255,255,255,0.1)',
                '0 0 50px rgba(249, 115, 22, 0.9), 0 0 100px rgba(147, 51, 234, 0.6), inset 0 0 30px rgba(255,255,255,0.1)'
              ] : [
                '0 0 35px rgba(147, 51, 234, 0.6), 0 0 70px rgba(249, 115, 22, 0.4), inset 0 0 20px rgba(255,255,255,0.05)',
                '0 0 50px rgba(249, 115, 22, 0.7), 0 0 90px rgba(147, 51, 234, 0.5), inset 0 0 25px rgba(255,255,255,0.08)',
                '0 0 35px rgba(147, 51, 234, 0.6), 0 0 70px rgba(249, 115, 22, 0.4), inset 0 0 20px rgba(255,255,255,0.05)'
              ]
            }}
            transition={{ duration: isListening ? 0.8 : 4, repeat: Infinity }}
          >
            {/* Enhanced Core Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span 
                className="text-white font-bold text-5xl"
                style={{ 
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  textShadow: '0 0 20px rgba(255,255,255,0.5)'
                }}
                animate={{ 
                  textShadow: isListening ? [
                    '0 0 25px rgba(255,255,255,0.9), 0 0 40px rgba(249,115,22,0.8)',
                    '0 0 35px rgba(255,255,255,1), 0 0 50px rgba(147,51,234,0.9)',
                    '0 0 25px rgba(255,255,255,0.9), 0 0 40px rgba(249,115,22,0.8)'
                  ] : [
                    '0 0 15px rgba(255,255,255,0.6), 0 0 25px rgba(147,51,234,0.4)',
                    '0 0 20px rgba(255,255,255,0.8), 0 0 35px rgba(249,115,22,0.5)',
                    '0 0 15px rgba(255,255,255,0.6), 0 0 25px rgba(147,51,234,0.4)'
                  ],
                  scale: isListening ? [1, 1.15, 1] : [1, 1.05, 1]
                }}
                transition={{ duration: isListening ? 0.6 : 2.5, repeat: Infinity }}
              >
                Z
              </motion.span>
            </div>

            {/* Listening Indicator */}
            {isListening && (
              <motion.div
                className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium border border-purple-500/30">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                  Neural Link Active - Listening
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Enhanced Rotating Rings */}
          <motion.div
            className="absolute inset-0 w-44 h-44 -m-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full border-2 border-purple-500/25 rounded-full" />
          </motion.div>
          
          <motion.div
            className="absolute inset-0 w-52 h-52 -m-8"
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full border border-orange-500/20 rounded-full border-dashed" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Enhanced Portal Modules with Clean Orbs */}
      {portals.map((portal, index) => {
        const orbitalOffset = getOrbitalOffset(portal, index);
        
        return (
          <motion.div
            key={portal.id}
            className="absolute z-15 cursor-pointer"
            style={{
              left: `${portal.position.x}%`,
              top: `${portal.position.y}%`,
              x: mousePosition.x * (2.5 + index * 0.3) + orbitalOffset.x,
              y: mousePosition.y * (2.5 + index * 0.3) + orbitalOffset.y
            }}
            onHoverStart={() => setHoveredPortal(portal.id)}
            onHoverEnd={() => setHoveredPortal(null)}
            onClick={() => enterPortal(portal)}
            whileHover={{ scale: 1.25, z: 15 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Doctor Strange Portal Ring - Softer */}
            <motion.div
              className="absolute w-28 h-28 -m-6 rounded-full opacity-20"
              style={{
                background: `conic-gradient(from ${orbitalTime * 35 + index * 72}deg, 
                  transparent 0deg, 
                  ${portal.color}50 25deg, 
                  transparent 50deg,
                  ${portal.color}30 75deg,
                  transparent 100deg,
                  ${portal.color}40 125deg,
                  transparent 150deg,
                  ${portal.color}20 175deg,
                  transparent 200deg,
                  ${portal.color}35 225deg,
                  transparent 250deg,
                  ${portal.color}25 275deg,
                  transparent 300deg,
                  ${portal.color}30 325deg,
                  transparent 360deg
                )`,
                filter: 'blur(3px)'
              }}
              animate={{
                rotate: -orbitalTime * 28 - index * 18,
                scale: [1, 1.1, 1],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{ 
                scale: { duration: 6, repeat: Infinity, delay: index * 0.4 },
                opacity: { duration: 5, repeat: Infinity, delay: index * 0.3 }
              }}
            />

            {/* Clean Orb Design from V1 */}
            <motion.div
              className="w-16 h-16 rounded-full relative overflow-hidden flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${portal.glow}40, ${portal.color}20 40%, ${portal.color}10 70%)`,
                border: `2px solid ${portal.color}40`,
                boxShadow: `0 0 20px ${portal.color}60, inset 0 0 15px ${portal.color}20`
              }}
              animate={{
                boxShadow: hoveredPortal === portal.id ? [
                  `0 0 30px ${portal.color}80, inset 0 0 20px ${portal.color}30`,
                  `0 0 40px ${portal.color}90, inset 0 0 25px ${portal.color}40`,
                  `0 0 30px ${portal.color}80, inset 0 0 20px ${portal.color}30`
                ] : `0 0 20px ${portal.color}60, inset 0 0 15px ${portal.color}20`
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {/* Portal Icon with Clear Visibility */}
              <motion.span 
                className="text-2xl z-10 relative"
                animate={{
                  scale: hoveredPortal === portal.id ? [1, 1.2, 1] : 1,
                  rotate: hoveredPortal === portal.id ? [0, 10, -10, 0] : 0
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {portal.icon}
              </motion.span>

              {/* Inner Energy Ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from ${orbitalTime * 60}deg, transparent, ${portal.color}40, transparent, ${portal.color}30, transparent)`,
                  filter: 'blur(3px)'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            {/* Portal Info on Hover */}
            <AnimatePresence>
              {hoveredPortal === portal.id && (
                <motion.div
                  className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30"
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                >
                  <div className="bg-black/90 backdrop-blur-xl px-4 py-3 rounded-xl min-w-[200px] border border-purple-500/30">
                    <h3 className="text-white font-bold text-sm mb-1">{portal.name}</h3>
                    <p className="text-purple-300/80 text-xs mb-2">{portal.realm}</p>
                    <div className="space-y-1">
                      {portal.insights.map((insight, idx) => (
                        <div key={idx} className="flex items-center text-xs">
                          <div className="w-1.5 h-1.5 rounded-full mr-2" 
                               style={{ background: portal.color }} />
                          <span className="text-gray-400">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Control Board Button */}
      <motion.button
        className="fixed top-6 left-6 z-30 bg-black/60 backdrop-blur-xl p-3 rounded-xl border border-purple-500/30"
        onClick={() => setShowControlBoard(!showControlBoard)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xl">🎛️</span>
      </motion.button>

      {/* Chat Toggle Button */}
      <motion.button
        className="fixed top-6 right-6 z-30 bg-black/60 backdrop-blur-xl p-3 rounded-xl border border-purple-500/30"
        onClick={() => setShowChat(!showChat)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xl">💬</span>
        {messages.length > 0 && !showChat && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
        )}
      </motion.button>

      {/* Control Board Panel */}
      <AnimatePresence>
        {showControlBoard && (
          <motion.div
            className="fixed top-20 left-6 z-25 w-80 bg-black/90 backdrop-blur-xl rounded-xl border border-purple-500/30 overflow-hidden"
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
          >
            <div className="p-5">
              <h2 className="text-white text-lg font-bold mb-4 flex items-center">
                <span className="mr-2">🎛️</span> System Control Matrix
              </h2>

              {/* Connection Status */}
              <div className="mb-4 p-3 bg-purple-500/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Neural Link Status</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      connectionStatus === 'connected' ? 'bg-green-400' : 
                      connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 
                      'bg-red-400'
                    }`} />
                    <span className="text-white text-xs capitalize">{connectionStatus}</span>
                  </div>
                </div>
              </div>

              {/* Portal Status Grid */}
              <div className="space-y-2">
                <h3 className="text-purple-300 text-sm font-semibold mb-2">Portal Systems</h3>
                {portals.map(portal => (
                  <div key={portal.id} 
                       className="flex items-center justify-between p-2 bg-purple-500/5 rounded-lg hover:bg-purple-500/10 transition-colors cursor-pointer"
                       onClick={() => enterPortal(portal)}>
                    <div className="flex items-center">
                      <span className="mr-2">{portal.icon}</span>
                      <span className="text-gray-300 text-sm">{portal.name}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2" />
                      <span className="text-xs text-gray-500">Active</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <h3 className="text-purple-300 text-sm font-semibold mb-2">System Metrics</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-purple-500/10 p-2 rounded">
                    <div className="text-gray-400 text-xs">Total Tasks</div>
                    <div className="text-white font-bold">12</div>
                  </div>
                  <div className="bg-orange-500/10 p-2 rounded">
                    <div className="text-gray-400 text-xs">Subscriptions</div>
                    <div className="text-white font-bold">{notionData.subscriptions.length}</div>
                  </div>
                  <div className="bg-green-500/10 p-2 rounded">
                    <div className="text-gray-400 text-xs">Monthly Cost</div>
                    <div className="text-white font-bold">
                      ${notionData.subscriptions.reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0).toFixed(0)}
                    </div>
                  </div>
                  <div className="bg-blue-500/10 p-2 rounded">
                    <div className="text-gray-400 text-xs">Messages</div>
                    <div className="text-white font-bold">{messages.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            className="fixed left-4 top-4 bottom-4 w-96 z-40"
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="h-full bg-black/80 backdrop-blur-xl border border-purple-500/30 rounded-xl flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <div>
                    <h3 className="text-white font-bold">Zion AI Neural Interface</h3>
                    <p className="text-gray-400 text-xs">Digital Consciousness</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Messages Container */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/20">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-purple-500/20 text-white' 
                        : 'bg-gray-800/50 text-purple-200'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <span className="text-xs opacity-50 mt-1 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="bg-gray-800/50 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-purple-500/20">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Enter neural command..."
                    className="flex-1 bg-purple-500/10 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-500"
                  />
                  <motion.button
                    onClick={toggleVoice}
                    className={`p-2 rounded-lg ${isListening ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎤
                  </motion.button>
                  <motion.button
                    onClick={() => sendMessage()}
                    className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Send
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portal Details Panel - Floating Station Style */}
      <AnimatePresence>
        {activePortal && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, x: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.8, opacity: 0, x: 100 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 w-96 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 z-30"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 80px rgba(147, 51, 234, 0.15)'
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                  style={{ 
                    background: `radial-gradient(circle at 30% 30%, ${activePortal.glow}60, ${activePortal.color}40)`,
                    boxShadow: `0 0 30px ${activePortal.color}40`
                  }}
                >
                  {activePortal.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{activePortal.name}</h3>
                  <p className="text-white/60 text-sm">{activePortal.description}</p>
                </div>
              </div>
              <motion.button
                onClick={() => setActivePortal(null)}
                className="text-white/60 hover:text-white transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            <div className="space-y-4">
              {activePortal.actions.map((action, idx) => (
                <motion.button
                  key={action}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ x: 10 }}
                  onClick={() => handlePortalAction(activePortal, action)}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-left transition-all"
                >
                  {action}
                </motion.button>
              ))}
            </div>

            {/* Portal-specific content */}
            <div className="mt-8 space-y-4">
              {activePortal.id === 'subscriptions' && notionData.subscriptions.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Active Subscriptions</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notionData.subscriptions.map((sub, index) => (
                      <div key={index} className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                        <span className="text-gray-200">{sub.name}</span>
                        <span className="text-green-400">${sub.amount}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-purple-500/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Monthly Cost</span>
                      <span className="text-xl font-bold text-purple-400">
                        ${notionData.subscriptions.reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activePortal.id === 'tasks' && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Quick Task Creator</h4>
                  <input
                    type="text"
                    placeholder="Enter new task..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        createTask(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <motion.div
                className="w-24 h-24 mx-auto mb-6 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <h2 className="text-white text-xl font-bold mb-2">Initializing Zion AI</h2>
              <p className="text-purple-300/60 text-sm">Synchronizing neural networks...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Listening Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600/90 backdrop-blur-sm px-6 py-3 rounded-full flex items-center space-x-3"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-medium">Listening...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZionApp;
