import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ZionApp = () => {
  const [activeOrbit, setActiveOrbit] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'Hello! I am Zion, your living AI companion. I\'m connected to your business systems and ready to assist you.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [zionPulse, setZionPulse] = useState(0);
  const [isZionActive, setIsZionActive] = useState(false);
  const [connectionStrength, setConnectionStrength] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const chatRef = useRef(null);
  const recognitionRef = useRef(null);

  // Enhanced orbital modules with your business data
  const orbits = [
    {
      id: 'subscriptions',
      name: 'Subscriptions',
      icon: '💳',
      color: 'from-blue-400 to-cyan-600',
      angle: 0,
      description: 'Manage recurring payments and subscriptions',
      notionDb: 'NOTION_SUBSCRIPTIONS_DB_ID',
      radius: 200,
      pulse: true
    },
    {
      id: 'tasks',
      name: 'Tasks',
      icon: '✅',
      color: 'from-green-400 to-emerald-600',
      angle: 72,
      description: 'Create, track and manage your tasks',
      notionDb: 'NOTION_TASKS_DB_ID',
      radius: 200,
      pulse: false
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: '📊',
      color: 'from-purple-400 to-violet-600',
      angle: 144,
      description: 'Business insights and performance metrics',
      notionDb: 'NOTION_DASH_RESET_DB_ID',
      radius: 200,
      pulse: true
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: '📅',
      color: 'from-orange-400 to-red-500',
      angle: 216,
      description: 'Schedule and manage events',
      radius: 200,
      pulse: false
    },
    {
      id: 'notes',
      name: 'Brain',
      icon: '🧠',
      color: 'from-pink-400 to-rose-600',
      angle: 288,
      description: 'AI memory and knowledge base',
      radius: 200,
      pulse: true
    }
  ];

  // Enhanced Zion pulse animation - more dynamic
  useEffect(() => {
    const interval = setInterval(() => {
      setZionPulse(prev => (prev + 1) % 360);
      setConnectionStrength(prev => 
        Math.sin(Date.now() * 0.001) * 0.3 + 0.7
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Auto-send voice messages
        setTimeout(() => sendMessage(transcript), 500);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Enhanced message sending with proper error handling
  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMessage = { type: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setIsZionActive(true);

    try {
      // Try your N8N webhook first
      const response = await fetch('http://localhost:5678/webhook/zion-brain-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          user_id: 'primary_user',
          platform: 'orbital_interface',
          timestamp: new Date().toISOString(),
          context: activeOrbit ? { activeModule: activeOrbit.id } : {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            type: 'ai', 
            text: data.responseText || data.message || 'Task completed successfully!' 
          }]);
          setIsTyping(false);
          setIsZionActive(false);
        }, 1000);
      } else {
        throw new Error('N8N webhook failed');
      }
    } catch (error) {
      // Fallback to your Express backend
      try {
        const backupResponse = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            context: activeOrbit?.id || 'general'
          })
        });
        
        const backupData = await backupResponse.json();
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            type: 'ai', 
            text: backupData.response || 'I\'m processing your request through my backup systems...' 
          }]);
          setIsTyping(false);
          setIsZionActive(false);
        }, 1000);
      } catch (backupError) {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            type: 'ai', 
            text: 'I\'m currently establishing deeper neural connections. Let me process that for you...' 
          }]);
          setIsTyping(false);
          setIsZionActive(false);
        }, 1000);
      }
    }
  };

  // Enhanced voice input with real speech recognition
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Enhanced orbit click with smooth transitions
  const handleOrbitClick = (orbit) => {
    setActiveOrbit(orbit);
    setIsZionActive(true);
    
    // Contextual messages based on orbit
    const contextMessages = {
      subscriptions: 'Accessing your subscription database...',
      tasks: 'Loading your task management system...',
      analytics: 'Analyzing your business metrics...',
      calendar: 'Checking your schedule...',
      notes: 'Accessing your AI knowledge base...'
    };
    
    sendMessage(contextMessages[orbit.id] || `Show me ${orbit.name.toLowerCase()}`);
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Neural network connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        {orbits.map((orbit, index) => {
          const nextOrbit = orbits[(index + 1) % orbits.length];
          const radius = orbit.radius;
          const nextRadius = nextOrbit.radius;
          
          const x1 = 50 + (Math.cos((orbit.angle * Math.PI) / 180) * radius) / 15;
          const y1 = 50 + (Math.sin((orbit.angle * Math.PI) / 180) * radius) / 15;
          const x2 = 50 + (Math.cos((nextOrbit.angle * Math.PI) / 180) * nextRadius) / 15;
          const y2 = 50 + (Math.sin((nextOrbit.angle * Math.PI) / 180) * nextRadius) / 15;

          return (
            <motion.line
              key={`connection-${orbit.id}`}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="rgba(147, 51, 234, 0.4)"
              strokeWidth="1"
              strokeDasharray="3,3"
              initial={{ pathLength: 0 }}
              animate={{ 
                pathLength: [0, 1, 0],
                stroke: [`rgba(147, 51, 234, 0.4)`, `rgba(59, 130, 246, 0.6)`, `rgba(147, 51, 234, 0.4)`]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                delay: index * 0.5
              }}
            />
          );
        })}
      </svg>

      {/* Main container */}
      <div className="relative z-10 flex h-screen">
        {/* Enhanced left sidebar - now toggleable */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-96 bg-black/30 backdrop-blur-xl border-r border-white/20 flex flex-col shadow-2xl"
            >
              {/* Enhanced chat header */}
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(147, 51, 234, 0.5)',
                          '0 0 30px rgba(59, 130, 246, 0.7)',
                          '0 0 20px rgba(147, 51, 234, 0.5)'
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      Z
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Zion AI</h2>
                      <p className="text-purple-300 text-sm">Living AI Companion</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Connection status */}
                <div className="mt-4 flex items-center space-x-2">
                  <motion.div
                    className={`w-3 h-3 rounded-full ${
                      connectionStrength > 0.5 ? 'bg-green-400' : 'bg-yellow-400'
                    }`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-sm text-gray-300">
                    Neural Network: {Math.round(connectionStrength * 100)}% Active
                  </span>
                </div>
              </div>

              {/* Enhanced chat messages */}
              <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-white/10 text-white border border-white/20 backdrop-blur-sm shadow-lg'
                      }`}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/10 text-white border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-sm">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-purple-400 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Enhanced chat input */}
              <div className="p-4 border-t border-white/20">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                    placeholder="Speak to Zion..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendMessage(inputText)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-full shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleVoiceInput}
                    className={`p-3 rounded-full shadow-lg ${
                      isListening 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 animate-pulse' 
                        : 'bg-gradient-to-r from-green-600 to-green-700'
                    } text-white`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat toggle button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowChat(!showChat)}
          className="fixed left-6 bottom-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl z-50"
          style={{
            boxShadow: '0 8px 32px rgba(147, 51, 234, 0.5)'
          }}
        >
          Z
        </motion.button>

        {/* Enhanced main orbital interface */}
        <div className="flex-1 relative flex items-center justify-center">
          {/* Central Zion core - enhanced with more life */}
          <motion.div
            className="relative z-20"
            animate={{
              scale: isZionActive ? [1, 1.1, 1] : [1, 1.02, 1],
              rotate: [0, 360],
            }}
            transition={{
              scale: { duration: isZionActive ? 1.5 : 4, repeat: Infinity },
              rotate: { duration: 60, repeat: Infinity, ease: "linear" }
            }}
          >
            <div className="relative">
              {/* Enhanced outer glow */}
              <motion.div 
                className="absolute inset-0 w-40 h-40 -m-4 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full blur-2xl opacity-60"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Main core - enhanced */}
              <motion.div
                className="relative w-32 h-32 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl cursor-pointer"
                style={{
                  boxShadow: `0 0 ${30 + Math.sin(zionPulse * 0.05) * 20}px rgba(147, 51, 234, ${connectionStrength})`
                }}
                animate={{
                  background: [
                    'linear-gradient(135deg, #9333ea, #3b82f6, #06b6d4)',
                    'linear-gradient(135deg, #3b82f6, #06b6d4, #9333ea)',
                    'linear-gradient(135deg, #06b6d4, #9333ea, #3b82f6)'
                  ]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                onClick={() => setShowChat(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Z
              </motion.div>

              {/* Enhanced rotating rings */}
              <motion.div
                className="absolute inset-0 w-32 h-32 border-2 border-purple-400/40 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 w-40 h-40 -m-4 border border-blue-400/30 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 w-48 h-48 -m-8 border border-cyan-400/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>

          {/* Enhanced orbital modules */}
          {orbits.map((orbit, index) => {
            const radius = orbit.radius;
            const x = Math.cos((orbit.angle * Math.PI) / 180) * radius;
            const y = Math.sin((orbit.angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={orbit.id}
                className="absolute z-10"
                style={{ transform: `translate(${x}px, ${y}px)` }}
                whileHover={{ scale: 1.15, z: 30 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{
                  y: {
                    duration: 4 + index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  rotate: {
                    duration: 6 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.button
                  onClick={() => handleOrbitClick(orbit)}
                  className={`w-24 h-24 bg-gradient-to-br ${orbit.color} rounded-full flex items-center justify-center text-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative group overflow-hidden`}
                  animate={orbit.pulse ? {
                    boxShadow: [
                      '0 0 20px rgba(147, 51, 234, 0.3)',
                      '0 0 40px rgba(59, 130, 246, 0.5)',
                      '0 0 20px rgba(147, 51, 234, 0.3)'
                    ]
                  } : {}}
                  transition={orbit.pulse ? { duration: 3, repeat: Infinity } : {}}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-100, 100] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  />
                  
                  {orbit.icon}
                  
                  {/* Enhanced tooltip */}
                  <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
                    <div className="bg-black/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap border border-white/20">
                      <div className="font-semibold">{orbit.name}</div>
                      <div className="text-xs text-gray-300 mt-1">{orbit.description}</div>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}

          {/* Enhanced connection lines to center */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {orbits.map((orbit, index) => {
              const radius = orbit.radius;
              const x1 = 50;
              const y1 = 50;
              const x2 = 50 + (Math.cos((orbit.angle * Math.PI) / 180) * radius) / 10;
              const y2 = 50 + (Math.sin((orbit.angle * Math.PI) / 180) * radius) / 10;

              return (
                <motion.line
                  key={`line-${orbit.id}`}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="rgba(147, 51, 234, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: 0.6,
                    stroke: [
                      'rgba(147, 51, 234, 0.4)',
                      'rgba(59, 130, 246, 0.6)',
                      'rgba(6, 182, 212, 0.5)',
                      'rgba(147, 51, 234, 0.4)'
                    ]
                  }}
                  transition={{ 
                    pathLength: { duration: 2, delay: index * 0.3 },
                    opacity: { duration: 2, delay: index * 0.3 },
                    stroke: { duration: 8, repeat: Infinity }
                  }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Enhanced active orbit details panel */}
      <AnimatePresence>
        {activeOrbit && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-0 top-0 h-full w-96 bg-black/40 backdrop-blur-xl border-l border-white/20 p-6 z-30 shadow-2xl"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveOrbit(null)}
              className="absolute top-4 right-4 text-white hover:text-purple-300 bg-white/10 rounded-full p-2 backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
            
            <div className="mt-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center space-x-4 mb-6"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${activeOrbit.color} rounded-full flex items-center justify-center text-2xl shadow-lg`}>
                  {activeOrbit.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{activeOrbit.name}</h3>
                  <p className="text-purple-300">Business Module</p>
                </div>
              </motion.div>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-300 mb-8 text-lg"
              >
                {activeOrbit.description}
              </motion.p>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="text-white font-semibold mb-4 text-lg">Quick Actions</h4>
                  <div className="space-y-3">
                    {[
                      `View All ${activeOrbit.name}`,
                      'Create New Entry',
                      'Generate Report',
                      'Export Data'
                    ].map((action, index) => (
                      <motion.button
                        key={action}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200 border border-white/10 hover:border-white/30"
                        onClick={() => sendMessage(`${action} for ${activeOrbit.name}`)}
                      >
                        {action}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="text-white font-semibold mb-4 text-lg">AI Capabilities</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Natural language processing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Notion database integration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Automated task management</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice feedback indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-red-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-red-400/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <span className="font-medium">Listening...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZionApp;