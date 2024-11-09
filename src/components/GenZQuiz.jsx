"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fullDictionary } from '../data/dictionary';
import Image from 'next/image';

// Add this function before the component
const getScoreCategory = (score) => {
  if (score >= 18) return {
    text: "yass, slay queen 🔥",
    image: "/score-images/queen.webp"
  };
  if (score >= 15) return {
    text: "Gen Z, sus 😎",
    image: "/score-images/sus.webp"
  };
  if (score >= 10) return {
    text: "Hardo Millennial 👍",
    image: "/score-images/millenial.webp"
  };
  if (score >= 5) return {
    text: "Salty Xer 😅",
    image: "/score-images/genx.webp"
  };
  return {
    text: "Cheugy Boomer 😢",
    image: "/score-images/boomer.webp"
  };
};

const GenZQuiz = () => {
  const [dictionary, setDictionary] = useState([...fullDictionary]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);


   // Initialize the first question
   useEffect(() => {
    setIsLoading(false);  // Just set loading to false, don't generate question
  }, []);

  const generateQuestion = useCallback(() => {
    setShowWelcome(false); // Hide welcome screen when starting quiz

    if (dictionary.length === 0) {
      setQuizComplete(true);
      if (score > highScore) {
        setHighScore(score);
        if (typeof window !== 'undefined') {
          localStorage.setItem('genZQuizHighScore', score.toString());
        }
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
  }, [dictionary, score, highScore, showWelcome]);

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
              <h1 className="text-2xl font-bold mb-2 text-gray-900">Gen Z Slang Quiz</h1>
              <div className="text-sm space-y-1 text-gray-800">
                <div>Score: {score}/{questionsAnswered}</div>
                <div>High Score: {highScore}/20</div>
                {!quizComplete && (
                  <div className="text-gray-700">
                    Question {questionsAnswered + 1}/20
                  </div>
                )}
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
                  disabled={showResult}
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
                  } transition-colors`}
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
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {questionsAnswered >= 20 ? "See Final Results" : "Next Question"}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Quiz Complete!</h2>
          <p className="mb-4 text-gray-800">
            Final Score: {score}/20
            {score > highScore && " - New High Score! 🎉"}
          </p>
          <div className="mb-6">
            <p className="mb-4 text-gray-800">Your level: {getScoreCategory(score).text}</p>
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
          <button
            onClick={() => {
              setDictionary([...fullDictionary]);
              setScore(0);
              setQuestionsAnswered(0);
              setQuizComplete(false);
              setShowWelcome(true);
              localStorage.setItem('genZQuizScore', '0');
              generateQuestion();
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default GenZQuiz;