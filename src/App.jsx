import React, { useState } from 'react';
import { AlertTriangle, Zap, Glibe, Cpu } from 'lucide-react';

const translator = () => {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('neutral');
  const [context, setContext] = useState('general');
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);

  const tones = ['neutral', 'polite', 'angry', 'sarcastic', 'and more'];
  const contexts = ['general public', 'workplace', 'school', 'dating/romantic', 'family', 'spouse', 'Cambridge University'];

  const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  const detectPrimes = (text) => {
    const numbers = text.match(/\b\d+\b/g);
    if (!number) return [];
    return numbers.filter(n => isPrime(parseInt(n))).map(n => parseInt(n));
  };
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold text-white">
              HUMAN-SPEECH TRANSLATOR
            </h1>
          </div>
          <p className="text-cyan-400 text-lg">For Extraterrestrial Visitors</p>
        </div>

        {/* Main Input Area */}
        <div className="bg-cyan-400 rounded-2xl p-6 mb-6">
          <label className="block text-black font-semibold mb-3 text-lg">
            ENTER HUMAN PHRASE:
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="such as I'm fine or something like that"
            className="w-full bg-white text-black border-2 border-black rounded-lg p-4 placeholder-gray-500 min-h-[100px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleTranslate();
              }
            }}
          />
          <p className="text-black text-xs mt-2">Press Ctrl+Enter to translate</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Tone Selector */}
          <div className="bg-white rounded-xl p-5 border-2 border-cyan-400">
            <label className="block text-black font-semibold mb-3">
              <Zap className="inline w-5 h-5 mr-2" />
              TONE ANALYSIS:
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-cyan-400 text-black border-2 border-black rounded-lg p-3 font-semibold"
            >
              {tones.map(t => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
            <p className="text-gray-600 text-xs mt-2">Sentiment Analysis - TBD</p>
          </div>

          {/* Context Selector */}
          <div className="bg-white rounded-xl p-5 border-2 border-cyan-400">
            <label className="block text-black font-semibold mb-3">
              <Globe className="inline w-5 h-5 mr-2" />
              CONTEXT:
            </label>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full bg-cyan-400 text-black border-2 border-black rounded-lg p-3 font-semibold"
            >
              {contexts.map(c => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
            <p className="text-gray-600 text-xs mt-2">Context Rules - TBD</p>
          </div>
        </div>

        {/* Translate Button */}
        <button
          onClick={handleTranslate}
          disabled={loading || !input.trim()}
          className="w-full bg-cyan-400 text-black font-bold py-4 px-8 rounded-xl text-xl hover:bg-cyan-300 disabled:bg-gray-600 disabled:cursor-not-allowed border-2 border-black"
        >
          {loading ? 'ANALYZING...' : 'TRANSLATE'}
        </button>

        {/* Results */}
        {translation && (
          <div className="mt-8 space-y-6">
            {/* Prime Number Warning */}
            {translation.primes.length > 0 && (
              <div className="bg-white border-4 border-cyan-400 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-8 h-8 text-black" />
                  <h3 className="text-2xl font-bold text-black">⚠ PRIME NUMBER DETECTED</h3>
                </div>
                <p className="text-black text-lg">
                  Dangerous information: {translation.primes.join(', ')}
                </p>
              </div>
            )}

            <div className="bg-cyan-400 border-4 border-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-black mb-4">INTERPRETATION:</h3>

              <div className="space-y-4">
                <div className="bg-black rounded-lg p-4 border-2 border-white">
                  <p className="text-sm text-cyan-400 mb-1">ORIGINAL PHRASE:</p>
                  <p className="text-white text-lg">"{translation.originalPhrase}"</p>
                </div>

                {translation.idiomDetected && (
                  <div className="bg-white border-2 border-black rounded-lg p-3">
                    <p className="text-black font-semibold">IDIOM DETECTED</p>
                    <p className="text-gray-600 text-xs mt-1">Future Function: Phrase Classification</p>
                  </div>
                )}

                <div className="bg-white border-2 border-black rounded-lg p-3">
                  <p className="text-black">
                    <span className="font-semibold">EMOTION SIGNAL:</span> {translation.emotionalSignal}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">Future Function: Sentiment Analysis</p>
                </div>

                <div className="bg-black rounded-lg p-5 border-2 border-white">
                  <p className="text-white text-lg leading-relaxed whitespace-pre-line">
                    {translation.interpretation}
                  </p>
                </div>

                <div className="bg-white border-2 border-black rounded-lg p-4">
                  <p className="text-black text-sm">
                    <span className="font-semibold">LITERAL vs ACTUAL:</span> {translation.literalMeaning}
                  </p>
                </div>

                <div className="bg-white border-2 border-black rounded-lg p-4">
                  <p className="text-black text-sm">
                    <span className="font-semibold">CULTURAL NOTE:</span> {translation.culturalNote}
                  </p>
                </div>

                <div className="bg-black rounded-lg p-3 border-2 border-white">
                  <p className="text-cyan-400 text-xs">
                    <span className="font-semibold">TONE:</span> {translation.tone.toUpperCase()} | 
                    <span className="font-semibold"> CONTEXT:</span> {translation.context.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quote from The Humans */}
        <div className="mt-12 bg-white border-2 border-cyan-400 rounded-xl p-6 italic">
          <p className="text-black text-center text-lg">
            "Maybe that is what beauty was, for humans. Accidents, imperfections, placed inside a pretty pattern."
          </p>
          <p className="text-gray-700 text-center text-sm mt-3">— The Humans, Matt Haig</p>
        </div>
      </div>
    </div>
  );
};

export default translator;