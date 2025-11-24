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
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisons, setComparisons] = useState([]);
  const [loadingComparison, setLoadingComparison] = useState(false); 
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

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
              content: `You are an alien translator from Matt Haig's novel "The Humans". You are confused by human communication. These include the idioms and a
              abstract ways of speech they use, the sarcasm, and the hidden meanings or emotional subtexts they use. Your job is to translate human phrases into literal, 
              overly analytical alien interpretations. These interpretations should make use to statistics, math, science, context analysis and an overly formal tone.
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

      //extract and parse the ai response
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
      //fallback
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
                content: `You are an alien translator from Matt Haig's novel "The Humans". You are confused by human communication. These include the idioms and abstract ways of speech they use,
                the sarcasm, and the hidden meanings or emotional subtexts they use. Your job is to translate human phrase into literal, overly analytical alien interpretations. 
                These interpretations should make use of statistics, math, science, context analysis and an overly formal tone.
    Analyze this human phrase: "${input}"
    
    Context Settings:
    - Tone: ${compareTone}
    - Social context: ${context}
    
    Provide a translation in the alien narrator's voice from "The Humans" (confused, lieral, analytical, slightly humorous, just beginning to learn about humanity). Your response MUST be
    valid JSON with this exact structure:
    {
      "interpretation": "Main alien interpretation of what the human REALLY means (2-4 sentences in alien narrator's analytical voice)",
      "emotionalSignal": "Brief emotional state label",
      "socialNote": "One sentence about human social context or empty in not relevant",
      "idiomDetected": true or false,
      "literalMeaning": "What the words literally say versus what humans actually mean"
    }
    
    Important:
    - Response ONLY with valid JSON. No markdown, no backticks, no preamble
    - Tone and context dramatically change meaning, so consider them VERY carefully
    - Reference human illogic an contractions
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

  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
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
    }
  }, []);
  
  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported currently.')
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

  return (
    <div className="container">
      <div className="max-width">
        <div className="header">
          <div className="header-flex">
            <Globe size={48} color="#22d3ee" />
            <h1 className="title">HUMAN-SPEECH TRANSLATOR</h1>
          </div>
          <p className="subtitle">For Vonnadorians</p>
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

        {/* Main Input Area */}
        <div className="input-section">
          <label className="label">ENTER HUMAN PHRASE:</label>
          <div style={{ position: 'relative' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Please enter human auditory output"
              className="textarea"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  comparisonMode ? handleComparisonMode(): handleTranslate();
                }
              }}
            />
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
                ? "Listening. Please Speak now."
                : "Press Enter to translate or the mic to speak"}
            </p>
          </div>

        {/* Controls */}
        {!comparisonMode && (
          <div className="controls-grid">
            {/* Tone Selector */}
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
              <p className="small-text">Sentiment Analysis - TBD</p>
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
              <p className="small-text">Context Rules - TBD</p>
            </div>
          </div>
        )}

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
              <p className="small-text">Sentiment Analysis - TBD</p>
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
                CONTEXT (assumed to be uniform across all comparisons):
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
              <p className="small-text">Comparing: {tone} vs {secTone} </p>
            </div>
          </div>
        )}
        {/* Translate Button */}
        <button
          onClick={comparisonMode ? handleComparisonMode : handleTranslate}
          disabled={(comparisonMode ? loadingComparison : loading) || !input.trim()}
          className={(comparisonMode ? loadingComparison : loading) || !input.trim() ? "button:disabled" : "button"}
        >
          {loading ? 'ANALYZING...' : 'TRANSLATE'}
        </button>
        {/* Results */}
        {!comparisonMode && translation && (
          <div className="results-container">
            <div className="output-box">
              <h3 className="output-title">INTERPRETATION:</h3>

              <div className="results-list">
                <div className="result-item">
                  <p className="original-label">ORIGINAL PHRASE:</p>
                  <p className="original-text">"{translation.originalPhrase}"</p>
                </div>

                {translation.idiomDetected && (
                  <div className="result-item-white">
                    <p className="bold-label">IDIOM DETECTED</p>
                    <p className="small-text">Future Function: Phrase Classification</p>
                  </div>
                )}

                <div className="result-item-white">
                  <p className="black-text">
                    <span className="bold-label">EMOTION SIGNAL:</span> {translation.emotionalSignal}
                  </p>
                  <p className="small-text">Future Function: Sentiment Analysis</p>
                </div>

                <div className="result-item">
                  <p className="interpretation-text">
                    {translation.interpretation}
                  </p>
                </div>

                <div className="result-item-white">
                  <p className="black-small">
                    <span className="bold-label">LITERAL vs ACTUAL:</span> {translation.literalMeaning}
                  </p>
                </div>

                <div className="result-item-white">
                  <p className="black-small">
                    <span className="bold-label">SOCIAL NOTE:</span> {translation.socialNote}
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
                <h3 className="comparison-title">TONE: {comp.tone}</h3>
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
                      <span className="bold-label">LITERAL vs ACTUAL:</span> {comp.literalMeaning}
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