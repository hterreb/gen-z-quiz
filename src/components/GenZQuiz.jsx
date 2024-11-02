import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, RefreshCcw } from 'lucide-react';

const GenZQuiz = () => {
  // Full dictionary data
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

  // Generate a random question
  const generateQuestion = () => {
    if (dictionary.length === 0) {
      setQuizComplete(true);
      return;
    }

    const questionIndex = Math.floor(Math.random() * dictionary.length);
    const correct = dictionary[questionIndex];
    
    // Remove the used question from the available pool
    const newDictionary = dictionary.filter((_, idx) => idx !== questionIndex);
    setDictionary(newDictionary);
    
    // Get 3 random wrong answers from the full dictionary
    let wrongOptions = fullDictionary
      .filter(item => item.term !== correct.term)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(item => item.definition);
    
    // Combine and shuffle all options
    const allOptions = [...wrongOptions, correct.definition]
      .sort(() => Math.random() - 0.5);
    
    setCurrentQuestion(correct);
    setOptions(allOptions);
    setShowResult(false);
    setSelectedOption(null);
  };

  // Start the quiz
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

  const handleNextQuestion = () => {
    generateQuestion();
  };

  const handleRestart = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setQuizComplete(false);
    setDictionary([...fullDictionary]);
    generateQuestion();
  };

  if (!currentQuestion && !quizComplete) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Gen Z Slang Quiz
          <div className="text-sm mt-2">
            Score: {score}/{questionsAnswered}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!quizComplete ? (
          <>
            <div className="text-center text-xl font-bold mb-6">
              What does "{currentQuestion.term}" mean?
            </div>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    showResult
                      ? option === currentQuestion.definition
                        ? "default"
                        : option === selectedOption
                        ? "destructive"
                        : "outline"
                      : "outline"
                  }
                  className="w-full text-left py-4 px-6"
                  onClick={() => !showResult && handleAnswer(option)}
                  disabled={showResult}
                >
                  {option}
                  {showResult && option === currentQuestion.definition && (
                    <Check className="ml-2 h-4 w-4 text-green-500" />
                  )}
                  {showResult && option === selectedOption && option !== currentQuestion.definition && (
                    <X className="ml-2 h-4 w-4 text-red-500" />
                  )}
                </Button>
              ))}
            </div>

            {showResult && (
              <div className="flex justify-center mt-6">
                <Button onClick={handleNextQuestion}>
                  {questionsAnswered >= 20 ? "See Final Results" : "Next Question"}
                </Button>
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
            <Button 
              onClick={handleRestart}
              className="flex items-center"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GenZQuiz;
