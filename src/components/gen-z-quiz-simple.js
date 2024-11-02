// src/components/GenZQuiz.jsx
import React, { useState, useEffect } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';

const GenZQuiz = () => {
  const fullDictionary = [
    { term: "A force", definition: "Unnecessarily excessive effort" },
    { term: "Bang 30s", definition: "To fight someone, as in a physical altercation" },
    { term: "Beat your face/cake your face", definition: "Apply makeup" },
    { term: "bops", definition: "A modern enjoyable song" },
    { term: "bouta", definition: "I am about to..." },
    { term: "bread", definition: "Future money" },
    { term: "Catch a fade/catch these hands", definition: "To get punched and/or knocked out" },
    { term: "Clap back", definition: "Respond to an insult with an equal or greater insult" },
    { term: "clapped", definition: "A crazy person; someone who was punched" },
    { term: "crackie", definition: "Someone who juuls/smokes" },
    { term: "cross fade", definition: "Doubly inebriated" },
    { term: "deadass", definition: "I am serious; Are you serious?" },
    { term: "finesse", definition: "To steal" },
    { term: "finna", definition: "I or We are planning something" },
    { term: "Gassing/Hyping", definition: "Offering compliments; feeding one's ego" },
    { term: "High key", definition: "Very obvious" },
    { term: "Low key", definition: "Not obvious" },
    { term: "periodt", definition: "See 'facts'" },
    { term: "slay", definition: "Do really well" },
    { term: "sus", definition: "Suspicious; shady" }
  ];

  const [dictionary, setDictionary] = useState([...fullDictionary]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);

  const getScoreCategory = (score) => {
    const percentage = (score / 20) * 100;
    if (percentage <= 20) return "cheugy Boomer";
    if (percentage <= 40) return "salty Xer";
    if (percentage <= 60) return "hardo Millennial";
    if (percentage <= 80) return "Gen Z opp";
    return "slay. No cap.";
  };

  const generateQuestion = () => {
    if (dictionary.length === 0) {
      setQuizComplete(true);
      return;
    }

    const questionIndex = Math.floor(Math.random() * dictionary.length);
    const correct = dictionary[questionIndex];
    
    const newDictionary = dictionary.filter((_, idx) => idx !== questionIndex);
    setDictionary(newDictionary);
    
    let wrongOptions = fullDictionary
      .filter(item => item.term !== correct.term)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(item => item.definition);
    
    const allOptions = [...wrongOptions, correct.definition]
      .sort(() => Math.random() - 0.5);
    
    setCurrentQuestion(correct);
    setOptions(allOptions);
    setShowResult(false);
    setSelectedOption(null);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleAnswer = (selectedDefinition) => {
    setSelectedOption(selectedDefinition);
    setShowResult(true);
    
    if (selectedDefinition === currentQuestion.definition) {
      setScore(score + 1);
    }
    setQuestionsAnswered(questionsAnswered + 1);
  };

  if (!currentQuestion && !quizComplete) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Gen Z Slang Quiz</h1>
        <div className="text-sm">
          Score: {score}/{questionsAnswered}
        </div>
      </div>

      {!quizComplete ? (
        <>
          <div className="text-center text-xl font-bold mb-6">
            What does "{currentQuestion.term}" mean?
          </div>
          
          <div className="space-y-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showResult && handleAnswer(option)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border ${
                  showResult
                    ? option === currentQuestion.definition
                      ? 'bg-green-100 border-green-500'
                      : option === selectedOption
                      ? 'bg-red-100 border-red-500'
                      : 'bg-gray-50 border-gray-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                } transition-colors`}
              >
                {option}
                {showResult && option === currentQuestion.definition && (
                  <Check className="inline ml-2 text-green-500" />
                )}
                {showResult && option === selectedOption && option !== currentQuestion.definition && (
                  <X className="inline ml-2 text-red-500" />
                )}
              </button>
            ))}
          </div>

          {showResult && (
            <div className="text-center mt-6">
              <button
                onClick={generateQuestion}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {questionsAnswered >= 20 ? "See Final Results" : "Next Question"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold">Quiz Complete!</h3>
          <div className="space-y-2">
            <p className="text-xl">
              Final Score: {score}/20 ({Math.round((score/20) * 100)}%)
            </p>
            <p className="text-lg font-semibold">
              Your Gen Z Language Level:
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {getScoreCategory(score)}
            </p>
          </div>
          <button 
            onClick={() => {
              setScore(0);
              setQuestionsAnswered(0);
              setQuizComplete(false);
              setDictionary([...fullDictionary]);
              generateQuestion();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GenZQuiz;
