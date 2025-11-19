import { useState, useCallback, useEffect } from 'react'
import { allEpisodes, summary, getTotalEpisodes } from './data/episodes.js'
import { commonWords, getWordsByType } from './CommonWords/commonWords.js'

function App() {
  const [currentEpisode, setCurrentEpisode] = useState(null)
  const [viewMode, setViewMode] = useState('summary')
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [episodesCollapsed, setEpisodesCollapsed] = useState(true)
  const [commonWordsCollapsed, setCommonWordsCollapsed] = useState(true)
  const [selectedWordType, setSelectedWordType] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentSpeakingText, setCurrentSpeakingText] = useState(null)
  const [speechRate, setSpeechRate] = useState(() => {
    const saved = localStorage.getItem('speechRate')
    return saved ? parseFloat(saved) : 0.9
  })
  const [englishVoice, setEnglishVoice] = useState(() => {
    return localStorage.getItem('englishVoice') || ''
  })
  const [frenchVoice, setFrenchVoice] = useState(() => {
    return localStorage.getItem('frenchVoice') || ''
  })
  const [availableVoices, setAvailableVoices] = useState([])
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setViewMode('summary')
    
    // Close sidebar on mobile by default
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    // Load available voices
    const loadVoices = () => {
      if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices()
        setAvailableVoices(voices)
      }
    }
    
    loadVoices()
    // Some browsers load voices asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    
    // Cleanup: stop speaking when component unmounts
    return () => {
      window.removeEventListener('resize', handleResize)
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const handleEpisodeSelect = useCallback((episodeNumber) => {
    if (episodeNumber === 0) {
      setViewMode('summary')
      setCurrentEpisode(null)
      setSelectedWordType(null)
    } else {
      const episode = allEpisodes[episodeNumber - 1]
      if (episode) {
        setCurrentEpisode(episode)
        setViewMode('episode')
        setSelectedEpisodeNumber(episodeNumber)
        setSelectedWordType(null)
      }
    }
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  const handleWordTypeSelect = useCallback((wordType) => {
    setSelectedWordType(wordType)
    setViewMode('words')
    setCurrentEpisode(null)
    setSelectedEpisodeNumber(0)
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  const getBestVoice = useCallback((language) => {
    const langPrefix = language.startsWith('fr') ? 'fr' : 'en'
    const selectedVoice = language.startsWith('fr') ? frenchVoice : englishVoice
    
    if (selectedVoice) {
      const voice = availableVoices.find(v => v.name === selectedVoice)
      if (voice) return voice
    }
    
    // Find best default voice for the language
    const langVoices = availableVoices.filter(v => v.lang.startsWith(langPrefix))
    
    // Prefer default voice
    const defaultVoice = langVoices.find(v => v.default)
    if (defaultVoice) return defaultVoice
    
    // Prefer local voices (not remote)
    const localVoices = langVoices.filter(v => !v.voiceURI.includes('remote') && !v.voiceURI.includes('network'))
    if (localVoices.length > 0) {
      // Prefer voices with better quality indicators
      const preferred = localVoices.find(v => 
        v.name.toLowerCase().includes('premium') || 
        v.name.toLowerCase().includes('enhanced') ||
        v.name.toLowerCase().includes('neural')
      )
      if (preferred) return preferred
      return localVoices[0]
    }
    
    // Fallback to any voice for the language
    return langVoices[0] || null
  }, [englishVoice, frenchVoice, availableVoices])

  const speakText = useCallback((text, language = 'en-US') => {
    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported in your browser.')
      return
    }

    // Stop any current speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    utterance.rate = speechRate
    utterance.pitch = 1
    utterance.volume = 1

    // Get best voice for the language
    const bestVoice = getBestVoice(language)
    if (bestVoice) {
      utterance.voice = bestVoice
      utterance.lang = bestVoice.lang // Use voice's native language
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
      setCurrentSpeakingText(text)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setCurrentSpeakingText(null)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      setCurrentSpeakingText(null)
    }

    window.speechSynthesis.speak(utterance)
  }, [speechRate, getBestVoice])

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setCurrentSpeakingText(null)
    }
  }, [])

  const handleSpeakEnglish = useCallback((text) => {
    if (isSpeaking && currentSpeakingText === text) {
      stopSpeaking()
    } else {
      speakText(text, 'en-US')
    }
  }, [isSpeaking, currentSpeakingText, speakText, stopSpeaking])

  const handleSpeakFrench = useCallback((text) => {
    if (isSpeaking && currentSpeakingText === text) {
      stopSpeaking()
    } else {
      speakText(text, 'fr-FR')
    }
  }, [isSpeaking, currentSpeakingText, speakText, stopSpeaking])

  const handleRateChange = useCallback((rate) => {
    setSpeechRate(rate)
    localStorage.setItem('speechRate', rate.toString())
  }, [])

  const handleEnglishVoiceChange = useCallback((voiceName) => {
    setEnglishVoice(voiceName)
    localStorage.setItem('englishVoice', voiceName)
  }, [])

  const handleFrenchVoiceChange = useCallback((voiceName) => {
    setFrenchVoice(voiceName)
    localStorage.setItem('frenchVoice', voiceName)
  }, [])

  const getVoicesByLanguage = useCallback((lang) => {
    let voices = []
    if (lang === 'en') {
      voices = availableVoices.filter(v => v.lang.startsWith('en'))
    } else {
      voices = availableVoices.filter(v => v.lang.startsWith('fr'))
    }
    
    // Sort voices: default first, then local voices, then by name
    return voices.sort((a, b) => {
      // Default voice first
      if (a.default && !b.default) return -1
      if (!a.default && b.default) return 1
      
      // Prefer local voices (not remote/network)
      const aIsLocal = !a.voiceURI.includes('remote') && !a.voiceURI.includes('network')
      const bIsLocal = !b.voiceURI.includes('remote') && !b.voiceURI.includes('network')
      if (aIsLocal && !bIsLocal) return -1
      if (!aIsLocal && bIsLocal) return 1
      
      // Prefer premium/enhanced/neural voices
      const aIsPremium = a.name.toLowerCase().includes('premium') || 
                        a.name.toLowerCase().includes('enhanced') ||
                        a.name.toLowerCase().includes('neural')
      const bIsPremium = b.name.toLowerCase().includes('premium') || 
                        b.name.toLowerCase().includes('enhanced') ||
                        b.name.toLowerCase().includes('neural')
      if (aIsPremium && !bIsPremium) return -1
      if (!aIsPremium && bIsPremium) return 1
      
      // Finally sort alphabetically
      return a.name.localeCompare(b.name)
    })
  }, [availableVoices])

  const renderEpisode = useCallback((episode) => {
    if (!episode || !episode.paragraphs) return null

    return (
      <div className="px-4 sm:px-6 md:px-10 pb-12 max-w-full">
        <div className={`fixed top-0 right-0 bg-white min-h-[80px] sm:min-h-[70px] md:min-h-[90px] py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6 lg:px-10 border-b border-gray-200 z-50 shadow-sm transition-all duration-300 ${sidebarOpen ? 'sm:left-[280px]' : 'sm:left-0'} left-0`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-0 max-w-[900px] mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight m-0 pr-2 break-words">
              {episode.title}
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-2 md:px-3 py-2 sm:py-1.5 md:py-2 text-xs sm:text-xs md:text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded-lg transition-colors touch-manipulation min-h-[40px] sm:min-h-0"
                aria-label="Speech settings"
                title="Speech Settings"
              >
                <span className="text-base sm:text-lg">⚙️</span> <span className="hidden md:inline">Settings</span>
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-2 md:px-3 py-2 sm:py-1.5 md:py-2 text-xs sm:text-xs md:text-sm text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-lg transition-colors touch-manipulation min-h-[40px] sm:min-h-0"
                  aria-label="Stop speaking"
                >
                  <span className="text-base sm:text-lg">⏸</span> <span className="hidden md:inline">Stop</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="pt-[140px] sm:pt-[120px] md:pt-[110px] max-w-full">
          {episode.paragraphs.map((para, index) => (
            <div key={index} className="mb-6 sm:mb-8">
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                  <div className="text-xs font-semibold uppercase text-gray-500 tracking-wide">
                    English
                  </div>
                  <button
                    onClick={() => handleSpeakEnglish(para.english)}
                    className="flex items-center gap-1.5 sm:gap-1 px-3 sm:px-2 md:px-3 py-2.5 sm:py-1.5 md:py-2 text-xs sm:text-xs md:text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded transition-colors touch-manipulation min-h-[40px] sm:min-h-0"
                    aria-label="Play English text"
                  >
                    {isSpeaking && currentSpeakingText === para.english ? (
                      <>
                        <span className="text-red-500 text-base sm:text-sm">⏸</span> <span className="hidden md:inline">Stop</span>
                      </>
                    ) : (
                      <>
                        <span className="text-base sm:text-sm">▶</span> <span className="hidden md:inline">Play</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-base sm:text-lg leading-relaxed sm:leading-relaxed text-gray-800 m-0 break-words">
                  {para.english}
                </p>
              </div>
              <div className="pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                  <div className="text-xs font-semibold uppercase text-gray-500 tracking-wide">
                    Français
                  </div>
                  <button
                    onClick={() => handleSpeakFrench(para.french)}
                    className="flex items-center gap-1.5 sm:gap-1 px-3 sm:px-2 md:px-3 py-2.5 sm:py-1.5 md:py-2 text-xs sm:text-xs md:text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded transition-colors touch-manipulation min-h-[40px] sm:min-h-0"
                    aria-label="Play French text"
                  >
                    {isSpeaking && currentSpeakingText === para.french ? (
                      <>
                        <span className="text-red-500 text-base sm:text-sm">⏸</span> <span className="hidden md:inline">Arrêter</span>
                      </>
                    ) : (
                      <>
                        <span className="text-base sm:text-sm">▶</span> <span className="hidden md:inline">Lire</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-base sm:text-lg leading-relaxed sm:leading-relaxed text-gray-600 m-0 italic break-words">
                  {para.french}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }, [sidebarOpen, handleSpeakEnglish, handleSpeakFrench, isSpeaking, currentSpeakingText, stopSpeaking, showSettings])

  const renderSummary = useCallback(() => {
    if (!summary || !summary.paragraphs) return null

    return (
      <div className="px-4 sm:px-6 md:px-10 pb-12 max-w-full">
        <div className={`fixed top-0 right-0 bg-white min-h-[80px] sm:min-h-[70px] md:min-h-[90px] py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6 lg:px-10 border-b border-gray-200 z-50 shadow-sm transition-all duration-300 ${sidebarOpen ? 'sm:left-[280px]' : 'sm:left-0'} left-0`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-0 max-w-[900px] mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight m-0 pr-2 break-words">
              {summary.title}
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-2 md:px-3 py-2 sm:py-1.5 md:py-2 text-xs sm:text-xs md:text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded-lg transition-colors touch-manipulation min-h-[40px] sm:min-h-0"
                aria-label="Speech settings"
                title="Speech Settings"
              >
                <span className="text-base sm:text-lg">⚙️</span> <span className="hidden md:inline">Settings</span>
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-2 md:px-3 py-2 sm:py-1.5 md:py-2 text-xs sm:text-xs md:text-sm text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-lg transition-colors touch-manipulation min-h-[40px] sm:min-h-0"
                  aria-label="Stop speaking"
                >
                  <span className="text-base sm:text-lg">⏸</span> <span className="hidden md:inline">Stop</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="pt-[140px] sm:pt-[120px] md:pt-[110px] max-w-full">
          {summary.paragraphs.map((para, index) => (
            <div key={index} className="mb-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                  <div className="text-xs font-semibold uppercase text-gray-500 tracking-wide">
                    English
                  </div>
                  <button
                    onClick={() => handleSpeakEnglish(para.english)}
                    className="flex items-center gap-1.5 sm:gap-1 px-3 sm:px-2 md:px-3 py-2.5 sm:py-1.5 md:py-2 text-xs sm:text-xs md:text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded transition-colors touch-manipulation min-h-[40px] sm:min-h-0"
                    aria-label="Play English text"
                  >
                    {isSpeaking && currentSpeakingText === para.english ? (
                      <>
                        <span className="text-red-500 text-base sm:text-sm">⏸</span> <span className="hidden md:inline">Stop</span>
                      </>
                    ) : (
                      <>
                        <span className="text-base sm:text-sm">▶</span> <span className="hidden md:inline">Play</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-base sm:text-lg leading-relaxed sm:leading-relaxed text-gray-800 m-0 break-words">
                  {para.english}
                </p>
              </div>
              <div className="pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                  <div className="text-xs font-semibold uppercase text-gray-500 tracking-wide">
                    Français
                  </div>
                  <button
                    onClick={() => handleSpeakFrench(para.french)}
                    className="flex items-center gap-1.5 sm:gap-1 px-3 sm:px-2 md:px-3 py-2.5 sm:py-1.5 md:py-2 text-xs sm:text-xs md:text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded transition-colors touch-manipulation min-h-[40px] sm:min-h-0"
                    aria-label="Play French text"
                  >
                    {isSpeaking && currentSpeakingText === para.french ? (
                      <>
                        <span className="text-red-500 text-base sm:text-sm">⏸</span> <span className="hidden md:inline">Arrêter</span>
                      </>
                    ) : (
                      <>
                        <span className="text-base sm:text-sm">▶</span> <span className="hidden md:inline">Lire</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-base sm:text-lg leading-relaxed sm:leading-relaxed text-gray-600 m-0 italic break-words">
                  {para.french}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }, [sidebarOpen, handleSpeakEnglish, handleSpeakFrench, isSpeaking, currentSpeakingText, stopSpeaking, showSettings])

  const renderWords = useCallback((wordType) => {
    if (!wordType || !commonWords[wordType]) return null
    const words = getWordsByType(wordType)

    return (
      <div className="px-4 sm:px-6 md:px-10 pb-12 max-w-full">
        <div className={`fixed top-0 right-0 bg-white min-h-[80px] sm:min-h-[70px] md:min-h-[90px] py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6 lg:px-10 border-b border-gray-200 z-50 shadow-sm transition-all duration-300 ${sidebarOpen ? 'sm:left-[280px]' : 'sm:left-0'} left-0`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-0 max-w-[900px] mx-auto">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight m-0 pr-2 break-words">
              Common Words — {wordType.charAt(0).toUpperCase() + wordType.slice(1)}s
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-2 md:px-3 py-2 sm:py-1.5 md:py-2 text-xs sm:text-xs md:text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded-lg transition-colors touch-manipulation min-h-[40px] sm:min-h-0"
                aria-label="Speech settings"
                title="Speech Settings"
              >
                <span className="text-base sm:text-lg">⚙️</span> <span className="hidden md:inline">Settings</span>
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-2 md:px-3 py-2 sm:py-1.5 md:py-2 text-xs sm:text-xs md:text-sm text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-lg transition-colors touch-manipulation min-h-[40px] sm:min-h-0"
                  aria-label="Stop speaking"
                >
                  <span className="text-base sm:text-lg">⏸</span> <span className="hidden md:inline">Stop</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="pt-[140px] sm:pt-[120px] md:pt-[110px] max-w-full">
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-6">
              {words.length} {wordType}(s)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {words.map((wordObj, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-100 active:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="text-base sm:text-lg font-semibold text-gray-900 break-words flex-1">
                      {wordObj.english}
                    </div>
                    <button
                      onClick={() => handleSpeakEnglish(wordObj.english)}
                      className="text-gray-400 hover:text-indigo-600 active:text-indigo-700 transition-colors touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center flex-shrink-0"
                      aria-label="Play English word"
                      title="Play English"
                    >
                      <span className="text-base sm:text-lg">▶</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="text-sm sm:text-base text-indigo-600 break-words flex-1">
                      {wordObj.french}
                    </div>
                    <button
                      onClick={() => handleSpeakFrench(wordObj.french)}
                      className="text-gray-400 hover:text-indigo-600 active:text-indigo-700 transition-colors touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center flex-shrink-0"
                      aria-label="Play French word"
                      title="Play French"
                    >
                      <span className="text-base sm:text-lg">▶</span>
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 italic break-words">
                    {wordObj.pronunciation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }, [sidebarOpen, handleSpeakEnglish, handleSpeakFrench, isSpeaking, currentSpeakingText, stopSpeaking, showSettings])

  const totalEpisodes = getTotalEpisodes()

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[90] md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar w-[85vw] sm:w-[280px] max-w-[320px] bg-gray-50 border-r border-gray-200 fixed h-screen overflow-y-auto transition-transform duration-300 ease-in-out z-[100] shadow-lg md:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-5 py-4 sm:py-6 flex justify-between items-center z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 m-0">Bilingual Reader</h2>
          <button 
            className="bg-transparent border-0 text-xl sm:text-2xl cursor-pointer text-gray-600 py-2 px-3 sm:py-1 sm:px-2 rounded transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        <nav className="py-5">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase text-gray-500 tracking-wide px-5 mb-3">
              Navigation
            </div>
            <button
              onClick={() => handleEpisodeSelect(0)}
              className={`block w-full py-3 sm:py-2.5 px-4 sm:px-5 bg-transparent border-0 text-left text-gray-600 text-base sm:text-[0.95rem] font-normal cursor-pointer transition-all border-l-4 touch-manipulation min-h-[44px] sm:min-h-0 flex items-center ${
                viewMode === 'summary' 
                  ? 'bg-gray-100 text-indigo-500 border-l-indigo-500 font-medium' 
                  : 'border-transparent hover:bg-gray-100 hover:text-gray-800 active:bg-gray-100'
              }`}
            >
              Summary
            </button>
          </div>
          <div className="mb-4">
            <button
              onClick={() => setEpisodesCollapsed(!episodesCollapsed)}
              className="w-full flex items-center justify-between px-4 sm:px-5 mb-3 bg-transparent border-0 cursor-pointer hover:bg-gray-100 active:bg-gray-100 py-3 sm:py-2 rounded transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
              aria-label={episodesCollapsed ? 'Expand episodes' : 'Collapse episodes'}
            >
              <div className="text-xs sm:text-xs font-semibold uppercase text-gray-500 tracking-wide">
                Episodes
              </div>
              <span className={`text-gray-400 text-base sm:text-sm transition-transform duration-200 ${episodesCollapsed ? '-rotate-90' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${episodesCollapsed ? 'max-h-0' : 'max-h-[1000px]'}`}>
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handleEpisodeSelect(num)}
                  className={`block w-full py-3 sm:py-2.5 px-4 sm:px-5 bg-transparent border-0 text-left text-gray-600 text-base sm:text-[0.95rem] font-normal cursor-pointer transition-all border-l-4 touch-manipulation min-h-[44px] sm:min-h-0 flex items-center ${
                    viewMode === 'episode' && selectedEpisodeNumber === num
                      ? 'bg-gray-100 text-indigo-500 border-l-indigo-500 font-medium'
                      : 'border-transparent hover:bg-gray-100 hover:text-gray-800 active:bg-gray-100'
                  }`}
                >
                  Episode {num}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-8">
            <button
              onClick={() => setCommonWordsCollapsed(!commonWordsCollapsed)}
              className="w-full flex items-center justify-between px-4 sm:px-5 mb-3 bg-transparent border-0 cursor-pointer hover:bg-gray-100 active:bg-gray-100 py-3 sm:py-2 rounded transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
              aria-label={commonWordsCollapsed ? 'Expand common words' : 'Collapse common words'}
            >
              <div className="text-xs sm:text-xs font-semibold uppercase text-gray-500 tracking-wide">
                Common Words
              </div>
              <span className={`text-gray-400 text-base sm:text-sm transition-transform duration-200 ${commonWordsCollapsed ? '-rotate-90' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${commonWordsCollapsed ? 'max-h-0' : 'max-h-[1000px]'}`}>
              {Object.keys(commonWords).map((wordType) => (
                <button
                  key={wordType}
                  onClick={() => handleWordTypeSelect(wordType)}
                  className={`block w-full py-3 sm:py-2.5 px-4 sm:px-5 bg-transparent border-0 text-left text-gray-600 text-base sm:text-[0.95rem] font-normal cursor-pointer transition-all border-l-4 touch-manipulation min-h-[44px] sm:min-h-0 flex items-center ${
                    viewMode === 'words' && selectedWordType === wordType
                      ? 'bg-gray-100 text-indigo-500 border-l-indigo-500 font-medium'
                      : 'border-transparent hover:bg-gray-100 hover:text-gray-800 active:bg-gray-100'
                  }`}
                >
                  {wordType.charAt(0).toUpperCase() + wordType.slice(1)}s ({getWordsByType(wordType).length})
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 min-h-screen bg-white relative transition-all duration-300 ${sidebarOpen ? 'md:ml-[280px]' : 'md:ml-0'} ml-0`}>
        {!sidebarOpen && (
          <button 
            className="fixed top-4 left-4 sm:top-5 sm:left-5 w-12 h-12 sm:w-11 sm:h-11 bg-white border border-gray-200 rounded-lg text-xl sm:text-2xl cursor-pointer flex items-center justify-center shadow-lg z-[100] transition-all text-gray-600 hover:bg-gray-50 active:bg-gray-100 hover:border-gray-300 hover:shadow-xl touch-manipulation"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}
        <div className="max-w-[900px] mx-auto p-0">
          {viewMode === 'summary' 
            ? renderSummary() 
            : viewMode === 'words' 
            ? renderWords(selectedWordType)
            : currentEpisode && renderEpisode(currentEpisode)}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[200] flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Speech Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 active:text-gray-700 text-2xl sm:text-3xl touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close settings"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-5 sm:space-y-6">
              {/* Speech Rate */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
                  Speech Speed: {speechRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 touch-manipulation"
                />
                <div className="flex justify-between text-xs sm:text-xs text-gray-500 mt-2 sm:mt-1">
                  <span>0.5x (Slow)</span>
                  <span>1.0x (Normal)</span>
                  <span>2.0x (Fast)</span>
                </div>
              </div>

              {/* English Voice */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  English Voice
                  <span className="block sm:inline text-xs text-gray-500 sm:ml-2 mt-1 sm:mt-0">(Recommended voices appear first)</span>
                </label>
                <select
                  value={englishVoice}
                  onChange={(e) => handleEnglishVoiceChange(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent touch-manipulation"
                >
                  <option value="">Auto-select Best Voice</option>
                  {getVoicesByLanguage('en').map((voice) => {
                    const isLocal = !voice.voiceURI.includes('remote') && !voice.voiceURI.includes('network')
                    const isPremium = voice.name.toLowerCase().includes('premium') || 
                                   voice.name.toLowerCase().includes('enhanced') ||
                                   voice.name.toLowerCase().includes('neural')
                    let label = voice.name
                    if (voice.default) label += ' ⭐ (Default)'
                    if (isPremium) label += ' ✨ (Premium)'
                    if (!isLocal) label += ' 🌐 (Remote)'
                    return (
                      <option key={voice.name} value={voice.name}>
                        {label}
                      </option>
                    )
                  })}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Premium/Enhanced voices offer better clarity
                </p>
              </div>

              {/* French Voice */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  French Voice
                  <span className="block sm:inline text-xs text-gray-500 sm:ml-2 mt-1 sm:mt-0">(Recommended voices appear first)</span>
                </label>
                <select
                  value={frenchVoice}
                  onChange={(e) => handleFrenchVoiceChange(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent touch-manipulation"
                >
                  <option value="">Auto-select Best Voice</option>
                  {getVoicesByLanguage('fr').map((voice) => {
                    const isLocal = !voice.voiceURI.includes('remote') && !voice.voiceURI.includes('network')
                    const isPremium = voice.name.toLowerCase().includes('premium') || 
                                   voice.name.toLowerCase().includes('enhanced') ||
                                   voice.name.toLowerCase().includes('neural')
                    let label = voice.name
                    if (voice.default) label += ' ⭐ (Default)'
                    if (isPremium) label += ' ✨ (Premium)'
                    if (!isLocal) label += ' 🌐 (Remote)'
                    return (
                      <option key={voice.name} value={voice.name}>
                        {label}
                      </option>
                    )
                  })}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Premium/Enhanced voices offer better clarity
                </p>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-4 py-3 sm:py-2 bg-indigo-600 text-white text-base sm:text-sm rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
