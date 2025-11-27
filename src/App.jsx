import React, { useState } from 'react';
import { AlertTriangle, Zap, Globe, Cpu, GitCompare, Mic } from 'lucide-react';
import './App.css';

const Translator = () => {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('neutral');
  const [secTone, setSecTone] = useState('sarcastic');
  const [context, setContext] = useState('general');
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  //comparison mode consts
  const [comparisonMode, setComparisonMode] = useState(false); 
  const [comparisons, setComparisons] = useState([]); 
  const [loadingComparison, setLoadingComparison] = useState(false); 
  //speech recognition consts
  const [isListening, setIsListening] = useState(false); 
  const [recognition, setRecognition] = useState(null); 
  const [wakeWordRecognition, setWakeWordRecognition] = useState(null); 
  const [isWakeWordActive, setIsWakeWordActive] = useState(false); 

  const tones = ['neutral', 'polite', 'angry', 'sarcastic', 'tired', 'passive-aggressive', 'excited'];
  const contexts = ['general public', 'workplace', 'school', 'dating/romantic', 'family', 'spouse', 'Cambridge University'];

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:3001/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3-32b",
          messages: [
            {
              role: "user",
              content: `You are Vonni, an alien translator from Matt Haig's novel "The Humans". You are confused by human communication, and so are humans. These include the idioms 
                and the abstract ways of speech they use, the sarcasm, as well as the hidden meanings or emotional subtexts they use. Your job is to "translate" human phrases into 
                literal, overly analytical alien interpretations. These interpretations should make use to statistics, math, science, context analysis and an overly formal tone.
    Analyse this human phrase: "${input}"
    Context Settings:
    - Tone: ${tone}
    - Social context: ${context}
    
    Provide a translation in the alien narrator's voice from "The Humans" (confused, literal, analytical, slight humorous, just beginning to learn about humanity).  Your 
    response MUST be valid JSON with this exact structure:
    
    {
      "interpretation": "Main alien interpretation of what the human REALLY means (2-4 sentences in alien narrator's analytical voice)",
      "emotionalSignal": "Brief emotional state label (e.g., 'Hidden Distress', 'Tactical apology')",
      "socialNote": "One sentence about human social context or empty string if not relevant",
      "idiomDetected": true or false,
      "literalMeaning": "What the words literally say versus what humans actually mean"
    }
    
    Important:
    - Respond ONLY with valid JSON. No markdown, no backticks, no preamble
    - Tone and context dramatically change meaning - consider them carefully
    - Reference human illogic and contradictions
    - Be analytical
    - Keep it concise but insightful`
            }
          ],
        })
      });
      const data = await response.json();

      if(!response.ok) {
        throw new Error(data.error?.message || 'AI translation failed');
      }

      const text = data.choices[0].message.content;
      const cleanText = text.replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(cleanText);

      setTranslation({
        ...analysis,
        originalPhrase: input,
        tone,
        context
      });
    } catch (err) {
      console.error('Translation error:', err);
      setTranslation({
        interpretation: 'ERROR: Translation system malfunction. Human communication unclear.',
        emotionalSignal: "SYSTEM ERROR",
        socialNote: "Unable to process social context",
        idiomDetected: false,
        literalMeaning: "System unable to compare literal and actual meanings",
        originalPhrase: input,
        tone,
        context
      });
    } finally {
      setLoading(false);
    }
  };

  //comparison mode handler
  const handleComparisonMode = async () => {
    if (!input.trim()) return;
    setLoadingComparison(true);
    setComparisons([]);

    //compare diff tones within the same context
    const tonesToCompare = [tone, secTone];
    const results = [];

    for (const compareTone of tonesToCompare) {
      try {
        const response = await fetch("http://localhost:3001/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen/qwen3-32b",
            messages: [
              {
                role: "user",
                
                content: `You are Vonni, an alien translator from Matt Haig's novel "The Humans". You are confused by human communication, and so are humans. These include the idioms 
                and the abstract ways of speech they use, the sarcasm, as well as the hidden meanings or emotional subtexts they use. Your job is to "translate" human phrases into 
                literal, overly analytical alien interpretations. These interpretations should make use to statistics, math, science, context analysis and an overly formal tone.
    Analyse this human phrase: "${input}"
    Context Settings:
    - Tone: ${tone}
    - Social context: ${context}
    
    Provide a translation in the alien narrator's voice from "The Humans" (confused, literal, analytical, slight humorous, just beginning to learn about humanity).  Your 
    response MUST be valid JSON with this exact structure:
    
    {
      "interpretation": "Main alien interpretation of what the human REALLY means (2-4 sentences in alien narrator's analytical voice)",
      "emotionalSignal": "Brief emotional state label (e.g., 'Hidden Distress', 'Tactical apology')",
      "socialNote": "One sentence about human social context or empty string if not relevant",
      "idiomDetected": true or false,
      "literalMeaning": "What the words literally say versus what humans actually mean"
    }
    
    Important:
    - Respond ONLY with valid JSON. No markdown, no backticks, no preamble
    - Tone and context dramatically change meaning - consider them carefully
    - Reference human illogic and contradictions
    - Be analytical
    - Keep it concise but insightful`
              }
            ],
          })
        });

        const data = await response.json();

        if (response.ok) {
          const text = data.choices[0].message.content;
          const cleanText = text.replace(/```json|```/g, "").trim();
          const analysis = JSON.parse(cleanText);

          results.push({
            ...analysis,
            tone: compareTone,
            context
          });
        }
      } catch (err) {
        console.error(`Comparison error for ${compareTone}:`, err);
      }
    }

    setComparisons(results);
    setLoadingComparison(false);
  };

  //speech recognition setup with wake word detection
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      //main recognition for capturing phrases
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Captured phrase:', transcript);
        setInput(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);

      // NEW: Wake word recognition (always listening for "Hey Vonni")
      const wakeWordInstance = new SpeechRecognition();
      wakeWordInstance.continuous = true;
      wakeWordInstance.interimResults = true;
      wakeWordInstance.lang = 'en-US';

      wakeWordInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
          .toLowerCase();
        
        console.log('Wake word listening:', transcript);
        
        // Detect "Hey Vonni" or variations
        if (transcript.includes('hey vonni') || transcript.includes('hey vonnie') || transcript.includes('hey bonnie')) {
          console.log('Wake word detected!');
          wakeWordInstance.stop();
          setIsWakeWordActive(false);
          // Start main recognition
          recognitionInstance.start();
          setIsListening(true);
        }
      };

      wakeWordInstance.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.error('Wake word recognition error:', event.error);
        }
      };

      wakeWordInstance.onend = () => {
        // Restart wake word detection if it was active
        if (isWakeWordActive) {
          setTimeout(() => {
            try {
              wakeWordInstance.start();
            } catch (e) {
              console.log('Wake word restart skipped');
            }
          }, 100);
        }
      };

      setWakeWordRecognition(wakeWordInstance);
    }
  }, [isWakeWordActive]);
  
  // NEW: Manual mic button toggle
  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const toggleWakeWord = () => {
    if (!wakeWordRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (isWakeWordActive) {
      wakeWordRecognition.stop();
      setIsWakeWordActive(false);
    } else {
      try {
        wakeWordRecognition.start();
        setIsWakeWordActive(true);
      } catch (e) {
        console.error('Failed to start wake word detection:', e); 
      }
    }
  };

  return (
    <div className="container">
      <div className="max-width">
        {/* Header */}
        <div className="header">
          <div className="header-flex">
            <Globe size={48} color="#22d3ee" />
            <h1 className="title">VONNI</h1>
          </div>
          <p className="subtitle">The Vonnadorian Translator Living in Your Ear</p>
          <p className="hint" style={{marginTop: '0.5rem', fontSize: '0.9rem', color: '#22d3ee'}}>
            Say "Hey Vonni" to activate voice input
          </p>
        </div>

        {/* Wake word toggle Button */}
        <div style={{textAlign: 'center', marginBottom: '1rem'}}>
          <button
            onClick={toggleWakeWord}
            className={isWakeWordActive ? "ww-button active" : "ww-button"}
          >
            {isWakeWordActive ? 'Listening for "Hey Vonni"...' : 'Enable "Hey Vonni" wake word'}
          </button>
        </div>
        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button 
            onClick={() => setComparisonMode(false)}
            className='mode-button'
          >
            <Zap size={20} style={{display: 'inline', marginRight: '0.5rem'}} />
            SINGLE TRANSLATION
          </button>
          <button
            onClick={() => setComparisonMode(true)}
            className="mode-button"
          >
            <GitCompare size={20} style={{display: 'inline', marginRight: '0.5rem'}} />
            COMPARISON MODE
          </button>
        </div>

        {/* Main Input Area with Mic Button */}
        <div className="input-section">
          <label className="label">ENTER HUMAN PHRASE:</label>
          <div style={{ position: 'relative' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Please enter human auditory output or say 'Hey Vonni'"
              className="textarea"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  comparisonMode ? handleComparisonMode(): handleTranslate();
                }
              }}
            />
            {/* Mic button for manual voice input */}
            <button
              onClick={toggleListening}
              className={isListening ? "mic-button listening" : "mic-button"}
              title={isListening ? "Stop recording" : "Start voice input"}
              type="button"
            >
              <Mic size={34} />
            </button>
          </div>
          <p className="hint">
            {isListening
              ? "Vonni is listening. Please speak now."
              : isWakeWordActive
              ? 'Say "Hey Vonni" to start'
              : "Press Enter to translate, click the mic, or enable wake word"}
          </p>
        </div>

        {/* Controls for Single Mode */}
        {!comparisonMode && (
          <div className="controls-grid">
            <div className="control-box">
              <label className="control-label">
                <Zap size={20} />
                TONE ANALYSIS:
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="select"
              >
                {tones.map(t => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="control-box">
              <label className="control-label">
                <Globe size={20} />
                CONTEXT:
              </label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="select"
              >
                {contexts.map(c => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Comparison Mode Controls */}
        {comparisonMode && (
          <div className="controls-grid">
            {/* First Tone Selector */}
            <div className="control-box">
              <label className="control-label">
                <Zap size={20} />
                FIRST TONE:
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="select"
              >
                {tones.map(t => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Second Tone Selector */}
            <div className="control-box">
              <label className="control-label">
                <Zap size={20} />
                SECOND TONE:
              </label>
              <select 
                value={secTone}
                onChange={(e) => setSecTone(e.target.value)}
                className="select"
              >
                {tones.map(t => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Context Selector */}
            <div className="control-box">
              <label className="control-label">
                <Globe size={20} />
                CONTEXT:
              </label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="select"
              >
                {contexts.map(c => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
              <p className="small-text">Comparing: {tone.toUpperCase()} vs {secTone.toUpperCase()}</p>
            </div>
          </div>
        )}

        {/* Translate Button */}
        <button
          onClick={comparisonMode ? handleComparisonMode : handleTranslate}
          disabled={(comparisonMode ? loadingComparison : loading) || !input.trim()}
          className={(comparisonMode ? loadingComparison : loading) || !input.trim() ? "button:disabled" : "button"}
        >
          {comparisonMode 
            ? (loadingComparison ? 'ANALYZING ALL TONES...' : 'COMPARE TONES')
            : (loading ? 'ANALYZING...' : 'TRANSLATE')}
        </button>

        {/* Single Translation Results */}
        {!comparisonMode && translation && (
          <div className="results-container">
            <div className="output-box">
              <h3 className="output-title">VONNI'S INTERPRETATION:</h3>

              <div className="results-list">
                <div className="result-item">
                  <p className="original-label">ORIGINAL PHRASE:</p>
                  <p className="original-text">"{translation.originalPhrase}"</p>
                </div>

                <div className="result-item-white">
                  <p className="black-text">
                    <span className="bold-label">EMOTION SIGNAL:</span> {translation.emotionalSignal}
                  </p>
                </div>

                <div className="result-item">
                  <p className="interpretation-text">
                    {translation.interpretation}
                  </p>
                </div>

                <div className="result-item-white">
                  <p className="black-small">
                    <span className="bold-label">SOCIAL NOTE:</span> {translation.socialNote}
                  </p>
                </div>

                {/* Suggested Response field */}
                <div className="result-item-white">
                  <p className="black-small">
                    <span className="bold-label">SUGGESTED RESPONSE:</span> {translation.suggestedResponse}
                  </p>
                </div>

                <div className="result-item">
                  <p className="cyan-small">
                    <span className="bold-label">TONE:</span> {translation.tone.toUpperCase()} | 
                    <span className="bold-label"> CONTEXT:</span> {translation.context.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Comparison Mode Results */}
        {comparisonMode && comparisons.length > 0 && (
          <div className="comparison-grid">
            {comparisons.map((comp, idx) => (
              <div key={idx} className="comparison-card">
                <h3 className="comparison-title">TONE: {comp.tone.toUpperCase()}</h3>
                <div className="results-list">
                  <div className="result-item-white">
                    <p className="black-text">
                      <span className="bold-label">EMOTION:</span> {comp.emotionalSignal}
                    </p>
                  </div>

                  <div className="result-item">
                    <p className="interpretation-text">{comp.interpretation}</p>
                  </div>

                  <div className="result-item-white">
                    <p className="black-small">
                      <span className="bold-label">SUGGESTED RESPONSE:</span> {comp.suggestedResponse}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Translator;