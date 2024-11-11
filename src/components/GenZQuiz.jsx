"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fullDictionary } from '../data/dictionary';
import Image from 'next/image';

// Add this function before the component
const getScoreCategory = (score) => {
  if (score >= 9) return {
    text: "yass, slay queen 🔥",
    image: "/score-images/queen.webp"
  };
  if (score >= 7) return {
    text: "Gen Z, sus 😎",
    image: "/score-images/sus.webp"
  };
  if (score >= 5) return {
    text: "Hardo Millennial 👍",
    image: "/score-images/millenial.webp"
  };
  if (score >= 3) return {
    text: "Salty Xer 😅",
    image: "/score-images/genx.webp"
  };
  return {
    text: "Cheugy Boomer 😢",
    image: "/score-images/boomer.webp"
  };
};

// Add this function before your component
const shareResult = async (score, level, timeInMs) => {
  const timeString = formatTime(timeInMs);
  
  let text = `I scored ${score}/10 on the Gen Z Slang Quiz in ${timeString}!\nMy level: ${level} 🎯\nTest your knowledge: gen-z-quiz.vercel.app`;
  
  if (score > 0 && score === highScore) {
    text = `🏆 New High Score by ${highScoreAlias}! 🏆\n${text}`;
  }
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'My Gen Z Quiz Result',
        text: text
      });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  } catch (error) {
    console.error('Error sharing:', error);
    try {
      await navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      alert('Could not share or copy result');
    }
  }
};

// Format time function
const formatTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const GenZQuiz = () => {
  const [dictionary, setDictionary] = useState([...fullDictionary]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [highScoreAlias, setHighScoreAlias] = useState('Anonymous');
  const [highScoreTime, setHighScoreTime] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showHighScoreScreen, setShowHighScoreScreen] = useState(false);
  const [alias, setAlias] = useState('');

  // Add this function near the top of your component
  const handleKeyPress = useCallback((event, callback) => {
    if (event.key === 'Enter') {
      callback();
    }
  }, []);

  // Initialize the first question
  useEffect(() => {
    setIsLoading(false);  // Just set loading to false, don't generate question
  }, []);

  useEffect(() => {
    let interval;
    if (startTime && !quizComplete) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [startTime, quizComplete]);

  useEffect(() => {
    fetch('/api/highscore')
      .then(res => res.json())
      .then(data => {
        setHighScore(data.score);
        setHighScoreAlias(data.alias);
        setHighScoreTime(data.time);
      })
      .catch(error => console.error('Error fetching high score:', error));
  }, []);

  const generateQuestion = useCallback(() => {
    setShowWelcome(false); // Hide welcome screen when starting quiz

    // Start timer on first question
    if (questionsAnswered === 0) {
      const now = Date.now();
      setStartTime(now);
      setElapsedTime(0);
    }

    if (questionsAnswered >= 9) {
      const finalTime = Date.now() - startTime;
      setEndTime(Date.now());
      setQuizComplete(true);
      
      // Check if this is a new high score
      if (score > highScore && score > 0) {
        setShowHighScoreScreen(true);
      }
      return;
    }

    if (!showWelcome) {
      setQuestionsAnswered(prev => prev + 1);
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
    setIsLoading(false);
  }, [dictionary, score, highScore, showWelcome, questionsAnswered]);

  // Initialize the first question
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleAnswer = (selectedDefinition) => {
    setSelectedOption(selectedDefinition);
    setShowResult(true);
    
    const newScore = selectedDefinition === currentQuestion.definition ? score + 1 : score;
    setScore(newScore);
    if (typeof window !== 'undefined') {
      localStorage.setItem('genZQuizScore', newScore.toString());
    }
    
  };

  const handleKeyDown = (event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  const handleHighScoreSubmit = async (e) => {
    e.preventDefault();
    const finalTime = endTime - startTime;
    
    try {
      const response = await fetch('/api/highscore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: score,
          alias: alias.trim() || 'Anonymous',
          time: finalTime
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setHighScore(data.score);
        setHighScoreAlias(data.alias);
        setHighScoreTime(data.time);
        setShowHighScoreScreen(false);
      }
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };

  if (!fullDictionary || fullDictionary.length === 0) {
    return <div className="text-center p-6">Error: Dictionary not loaded</div>;
  }

  if (isLoading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-gray-800">
      {showWelcome ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="relative w-full h-48 mb-6">
            <Image
              src="/cover.avif"
              alt="Gen Z Slang Quiz Cover"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Gen Z Slang Quiz</h1>
          <p className="text-xl mb-8 text-gray-800">Find out how down you are with the kids these days</p>
          <button
            onClick={generateQuestion}
            onKeyPress={(e) => handleKeyPress(e, generateQuestion)}
            tabIndex={0}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Quiz
          </button>
        </motion.div>
      ) : !quizComplete ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.term}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Gen Z Slang Quiz</h1>
              <div className="text-sm space-y-1">
                <div>Score: {score}/{questionsAnswered}</div>
                <div>
                  High Score: {highScore}/10
                  {highScore > 0 && (
                    <span className="text-gray-600 ml-1">
                      by {highScoreAlias} ({formatTime(highScoreTime)})
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  Question {questionsAnswered + 1}/10
                </div>
                <div className="text-gray-700 font-mono">
                  Time: {formatTime(elapsedTime)}
                </div>
              </div>
            </div>

            <div className="text-center text-xl font-bold mb-6 text-gray-900">
              What does &quot;{currentQuestion.term}&quot; mean?
            </div>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => !showResult && handleAnswer(option)}
                  onKeyDown={(e) => handleKeyDown(e, () => !showResult && handleAnswer(option))}
                  disabled={showResult}
                  tabIndex={0}
                  aria-label={`Answer option: ${option}`}
                  role="option"
                  className={`w-full p-4 text-left rounded-lg border ${
                    showResult
                      ? option === currentQuestion.definition
                        ? 'bg-green-100 border-green-500'
                        : option === selectedOption
                        ? 'bg-red-100 border-red-500'
                        : 'bg-gray-50 border-gray-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {option}
                  {showResult && option === currentQuestion.definition && (
                    <Check className="inline ml-2 text-green-500" />
                  )}
                  {showResult && option === selectedOption && option !== currentQuestion.definition && (
                    <X className="inline ml-2 text-red-500" />
                  )}
                </motion.button>
              ))}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-6"
              >
                <button
                  onClick={generateQuestion}
                  onKeyDown={(e) => handleKeyDown(e, generateQuestion)}
                  tabIndex={0}
                  role="button"
                  aria-label={questionsAnswered >= 9 ? "See Final Results" : "Next Question"}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {questionsAnswered >= 9 ? "See Final Results" : "Next Question"}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      ) : showHighScoreScreen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-4">🎉 New High Score! 🎉</h2>
          <p className="mb-6">
            Amazing! You scored {score}/10 in {formatTime(endTime - startTime)}
          </p>
          <form onSubmit={handleHighScoreSubmit} className="space-y-4">
            <div>
              <label htmlFor="alias" className="block text-sm font-medium mb-2">
                Enter your name:
              </label>
              <input
                type="text"
                id="alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                maxLength={20}
                placeholder="Your name"
                className="w-full max-w-xs px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="space-x-4">
              <button
                type="submit"
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                onKeyDown={(e) => handleKeyDown(e, handleHighScoreSubmit)}
              >
                Save Score
              </button>
              <button
                type="button"
                onClick={() => setShowHighScoreScreen(false)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                onKeyDown={(e) => handleKeyDown(e, () => setShowHighScoreScreen(false))}
              >
                Skip
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
          <p className="mb-2">
            Final Score: {score}/10
          </p>
          <p className="mb-4">
            Time: {formatTime(endTime - startTime)}
          </p>
          <div className="mb-6">
            <p className="mb-4">Your level: {getScoreCategory(score).text}</p>
            <div className="relative w-64 h-64 mx-auto">
              <Image
                src={getScoreCategory(score).image}
                alt={getScoreCategory(score).text}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => shareResult(score, getScoreCategory(score).text, endTime - startTime)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Result
            </button>
            <button
              onClick={() => {
                setDictionary([...fullDictionary]);
                setScore(0);
                setQuestionsAnswered(0);
                setQuizComplete(false);
                setShowWelcome(true);
                setStartTime(null);
                setEndTime(null);
                localStorage.setItem('genZQuizScore', '0');
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GenZQuiz;