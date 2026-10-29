import React, { useState, useEffect, useRef } from 'react';

function SpeechInput({ onTranscript, placeholder }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => {
            const updated = prev + finalTranscript;
            onTranscript(updated.trim());
            return updated;
          });
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [onTranscript]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      onTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div>
      <button
        type="button"
        className={`btn btn-speech ${isRecording ? 'recording' : ''}`}
        onClick={toggleRecording}
      >
        {isRecording ? 'Stop Recording' : 'Start Speech Input'}
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => speakText(transcript || placeholder)}
      >
        Read Aloud
      </button>
      {transcript && (
        <div className="transcript-preview">
          <strong>Transcript:</strong> {transcript}
        </div>
      )}
    </div>
  );
}

export default SpeechInput;