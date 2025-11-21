import React, { useState } from 'react';
import { AlertTriangle, Zap, Globe, Cpu } from 'lucide-react';
import './App.css';

const Translator = () => {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('neutral');
  const [context, setContext] = useState('general');
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);

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
          //"Authorization": `Bearer ${import.meta.env.VITE_API_KEY}`
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

        {/* Main Input Area */}
        <div className="input-section">
          <label className="label">ENTER HUMAN PHRASE:</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Please enter human auditory output"
            className="textarea"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTranslate();
              }
            }}
          />
          <p className="hint">Press Enter to translate</p>
        </div>

        {/* Controls */}
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

        {/* Translate Button */}
        <button
          onClick={handleTranslate}
          disabled={loading || !input.trim()}
          className="button"
        >
          {loading ? 'ANALYZING...' : 'TRANSLATE'}
        </button>

        {/* Results */}
        {translation && (
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
      </div>
    </div>
  );
};

export default Translator;