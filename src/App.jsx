import React, { useState } from 'react';
import { AlertTriangle, Zap, Globe, Cpu } from 'lucide-react';
import './App.css';

const Translator = () => {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('neutral');
  const [context, setContext] = useState('general');
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);

  const tones = ['neutral', 'polite', 'angry', 'sarcastic', 'and more'];
  const contexts = ['general public', 'workplace', 'school', 'dating/romantic', 'family', 'spouse', 'Cambridge University'];

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const primes = detectPrimes(input);

    //ai placeholder
    const analysis = {
      interpretation: 'tbd',
      emotionalSignal: "tbd",
      culturalNote: 'tbd',
      idiomDetected: true, //ig idk
      literalMeaning: "tbd"
    };

    setTranslation({
      ...analysis,
      primes,
      originalPhrase: input,
      tone,
      context
    });
    setLoading(false);
  };

    return (
    <div className="container">
      <div className="max-width">
        <div className="header">
          <div className="header-flex">
            <Globe size={48} color="#22d3ee" />
            <h1 className="title">HUMAN-SPEECH TRANSLATOR</h1>
          </div>
          <p className="subtitle">For Extraterrestrial Visitors</p>
        </div>

        {/* Main Input Area */}
        <div className="input-section">
          <label className="label">ENTER HUMAN PHRASE:</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="such as I'm fine or something like that"
            className="textarea"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleTranslate();
              }
            }}
          />
          <p className="hint">Press Ctrl+Enter to translate</p>
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
                    <span className="bold-label">CULTURAL NOTE:</span> {translation.culturalNote}
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