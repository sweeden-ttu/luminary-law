import React, { useState } from 'react';
import { geminiService, blobToBase64 } from '../services/geminiService';

const Intake: React.FC = () => {
  const [mode, setMode] = useState<'text' | 'audio'>('text');
  const [transcript, setTranscript] = useState('');
  const [notes, setNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setResult(null);
    try {
        const base64 = await blobToBase64(file);
        // In a real app with Live API, we'd stream. 
        // Here we send the audio to Gemini to "Transcribe and Summarize" directly via generateContent
        const response = await geminiService.generateResponse(
            [],
            'Admin/Intake' as any,
            "Please transcribe this audio exactly and then provide a summary of the legal issue.",
            [{ type: 'audio', base64Data: base64, mimeType: file.type, url: '' }]
        );
        setTranscript(response);
    } catch (err) {
        console.error(err);
        setTranscript("Error processing audio file.");
    } finally {
        setAnalyzing(false);
    }
  };

  const runAnalysis = async () => {
      setAnalyzing(true);
      try {
          const data = await geminiService.analyzeIntake(transcript, notes);
          setResult(data);
      } catch (e) {
          console.error(e);
      } finally {
          setAnalyzing(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-serif text-xl font-bold text-gray-800 mb-4">New Client Intake</h2>
            
            <div className="flex gap-4 mb-6">
                <button 
                    onClick={() => setMode('text')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'text' ? 'bg-legal-100 text-legal-800 border-legal-200 border' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    ✍️ Manual Notes
                </button>
                <button 
                    onClick={() => setMode('audio')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'audio' ? 'bg-legal-100 text-legal-800 border-legal-200 border' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    🎤 Voice/Call Recording
                </button>
            </div>

            <div className="space-y-4">
                {mode === 'audio' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                        <label className="cursor-pointer block">
                            <span className="text-4xl block mb-2">📥</span>
                            <span className="text-sm font-medium text-gray-600">Upload Call Recording (MP3/WAV)</span>
                            <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                        </label>
                        {analyzing && !transcript && <p className="text-xs text-legal-500 mt-2 animate-pulse">Transcribing audio...</p>}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        {mode === 'audio' ? 'Transcript / Summary' : 'Interview Transcript / Fact Pattern'}
                    </label>
                    <textarea 
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 focus:ring-legal-500 focus:border-legal-500"
                        placeholder="Paste transcript or type client narrative here..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Additional Staff Notes</label>
                    <textarea 
                         value={notes}
                         onChange={(e) => setNotes(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm h-20 focus:ring-legal-500 focus:border-legal-500"
                        placeholder="E.g., Client seemed distressed, mentioned statute of limitations might be close..."
                    />
                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={runAnalysis}
                        disabled={analyzing || !transcript}
                        className="bg-legal-700 text-white px-6 py-2 rounded-lg hover:bg-legal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {analyzing ? 'Processing...' : 'Analyze & Structure Case'}
                    </button>
                </div>
            </div>
        </div>

        {/* Results Section */}
        {result && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
                <div className="flex justify-between items-start mb-4">
                     <h3 className="font-serif font-bold text-lg text-legal-900">Intake Assessment</h3>
                     <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">AI Generated</span>
                </div>
               
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Client Name</p>
                        <p className="font-semibold text-gray-900 mb-4">{result.clientName || 'Unknown'}</p>

                        <p className="text-xs text-gray-400 uppercase">Recommended Practice Area</p>
                        <p className="font-semibold text-legal-600 mb-4">{result.recommendedPracticeArea || 'General Civil'}</p>

                        <p className="text-xs text-gray-400 uppercase">Potential Claims</p>
                        <ul className="list-disc list-inside text-sm text-gray-700 mb-4">
                            {result.potentialClaims?.map((c: string, i: number) => <li key={i}>{c}</li>)}
                        </ul>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Summary</p>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">
                            {result.summary}
                        </p>

                        <p className="text-xs text-red-400 uppercase font-bold">Missing Information (Ask Client)</p>
                        <ul className="text-sm text-gray-700 space-y-1 mt-1">
                            {result.missingInformation?.map((m: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-red-400">•</span> {m}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                    <button className="flex-1 bg-legal-50 text-legal-700 py-2 rounded-lg text-sm font-medium hover:bg-legal-100">Draft Engagement Letter</button>
                    <button className="flex-1 bg-legal-50 text-legal-700 py-2 rounded-lg text-sm font-medium hover:bg-legal-100">Save to Case Management</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default Intake;
