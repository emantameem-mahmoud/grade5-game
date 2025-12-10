import React, { useState, useEffect } from 'react';
import { GameStage, QuizState, Question, Difficulty, UserAnswer } from './types';
import { questions } from './data';
import FloatingBackground from './components/FloatingBackground';
import PlantProgress from './components/PlantProgress';
import Celebration from './components/Celebration';
import { Trophy, ArrowRight, RefreshCw, CheckCircle2, XCircle, Play, Settings, Save, Star, Share2, Check, AlertCircle, BookOpen } from 'lucide-react';
import { playCorrectSound, playIncorrectSound, playCelebrationSound, playSelectSound } from './utils/sound';

const App: React.FC = () => {
  const [gameStage, setGameStage] = useState<GameStage>(GameStage.START);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [shareBtnText, setShareBtnText] = useState('مشاركة النتيجة');
  const [isCopied, setIsCopied] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);
  
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    showResults: false,
    isAnswered: false,
    selectedOption: null,
    isCorrect: null,
    difficulty: 'easy'
  });

  // Badge customization state - Updated with Science & Tech combinations
  const [badgeEmoji, setBadgeEmoji] = useState("💻🤖");
  const badgeOptions = ["💻🤖", "🚀⭐", "🔬🧬", "🧪🧫", "🔭🌌", "⚡🔌", "🌐📡", "📱💾", "👑🏆"];

  useEffect(() => {
    // Check for saved game on mount
    const saved = localStorage.getItem('junior-tech-quiz-save');
    if (saved) {
      setHasSavedGame(true);
    }

    // Check if running in an iframe (e.g., Canva Embed)
    try {
      if (window.self !== window.top) {
        setIsEmbedded(true);
      }
    } catch (e) {
      // Access denied likely means cross-origin iframe
      setIsEmbedded(true);
    }
  }, []);

  const currentQuestion = filteredQuestions[state.currentQuestionIndex];

  const startGame = (difficulty: Difficulty) => {
    const filtered = questions.filter(q => q.difficulty === difficulty);
    setFilteredQuestions(filtered);
    setUserAnswers([]);
    setState({
      currentQuestionIndex: 0,
      score: 0,
      showResults: false,
      isAnswered: false,
      selectedOption: null,
      isCorrect: null,
      difficulty: difficulty
    });
    setGameStage(GameStage.PLAYING);
  };

  const resumeGame = () => {
    const savedStr = localStorage.getItem('junior-tech-quiz-save');
    if (savedStr) {
      const savedState = JSON.parse(savedStr);
      // Re-filter questions based on saved difficulty
      const filtered = questions.filter(q => q.difficulty === savedState.difficulty);
      setFilteredQuestions(filtered);
      
      // Restore user answers if available
      if (savedState.userAnswers) {
        setUserAnswers(savedState.userAnswers);
      }

      setState({
        ...savedState,
        isAnswered: false,
        selectedOption: null,
        isCorrect: null
      });
      setGameStage(GameStage.PLAYING);
    }
  };

  const saveProgress = () => {
    const dataToSave = {
      currentQuestionIndex: state.currentQuestionIndex,
      score: state.score,
      difficulty: state.difficulty,
      userAnswers: userAnswers
    };
    localStorage.setItem('junior-tech-quiz-save', JSON.stringify(dataToSave));
    setHasSavedGame(true);
  };

  const clearProgress = () => {
    localStorage.removeItem('junior-tech-quiz-save');
    setHasSavedGame(false);
  };

  const handleAnswer = (optionIndex: number) => {
    if (state.isAnswered) return;

    playSelectSound();

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    
    // Play evaluation sound effect slightly delayed to distinct from selection
    setTimeout(() => {
        if (isCorrect) {
          playCorrectSound();
        } else {
          playIncorrectSound();
        }
    }, 100);

    const answer: UserAnswer = {
        question: currentQuestion,
        selectedOption: optionIndex,
        isCorrect: isCorrect
    };

    setUserAnswers(prev => {
        const newAnswers = [...prev, answer];
        return newAnswers;
    });

    setState(prev => ({
      ...prev,
      isAnswered: true,
      selectedOption: optionIndex,
      isCorrect: isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score
    }));
  };

  const handleNext = () => {
    const dataToSave = {
      currentQuestionIndex: state.currentQuestionIndex,
      score: state.score,
      difficulty: state.difficulty,
      userAnswers: userAnswers 
    };
    localStorage.setItem('junior-tech-quiz-save', JSON.stringify(dataToSave));
    setHasSavedGame(true);

    if (state.currentQuestionIndex < filteredQuestions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        isAnswered: false,
        selectedOption: null,
        isCorrect: null
      }));
    } else {
      clearProgress();
      setGameStage(GameStage.FINISHED);
    }
  };

  const handleShare = async () => {
    const text = `لقد حققت ${state.score} من ${filteredQuestions.length} في مسابقة مستكشفة التكنولوجيا! 🖥️🚀\nهل يمكنكِ التغلب على نتيجتي؟`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'مستكشفة التكنولوجيا',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setShareBtnText('تم النسخ!');
        setIsCopied(true);
        setTimeout(() => {
            setShareBtnText('مشاركة النتيجة');
            setIsCopied(false);
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const getCelebrationMessage = () => {
    const percentage = (state.score / filteredQuestions.length) * 100;
    if (percentage === 100) return "أداء مذهل! أنتِ عبقرية تكنولوجيا المستقبل 🌟🏆";
    if (percentage >= 80) return "عمل رائع! أنتِ في طريقكِ لتصبحي خبيرة 🚀";
    if (percentage >= 50) return "جيد جداً! لديكِ معلومات قيمة، استمري في التعلم 📚";
    return "بداية جيدة! لا تستسلمي، حاولي مرة أخرى لتقوية معلوماتك 💪";
  };
  
  const getDifficultyLabel = () => {
    switch(state.difficulty) {
      case 'easy': return 'المستوى السهل 🌱';
      case 'medium': return 'المستوى المتوسط 🌿';
      case 'hard': return 'المستوى الصعب 🌳';
      default: return '';
    }
  };

  // Play celebration sound when finishing
  useEffect(() => {
    if (gameStage === GameStage.FINISHED && state.score > filteredQuestions.length / 2) {
      playCelebrationSound();
    }
  }, [gameStage, state.score, filteredQuestions.length]);

  return (
    <div className="relative min-h-screen flex flex-col items-center p-4 font-sans text-slate-800 overflow-x-hidden">
      <FloatingBackground />

      {/* Main Content Area - Optimized for Presentation/Embed (max-w-5xl for wider slides) */}
      <div className={`relative z-10 w-full ${isEmbedded ? 'max-w-5xl scale-95 origin-top' : 'max-w-3xl'} flex-grow flex flex-col justify-center transition-all duration-300`}>
        
        {/* Header Title & School Info - Compact if embedded */}
        <header className={`text-center animate-float ${isEmbedded ? 'mb-2' : 'mb-6'}`}>
           <div className="mb-2">
            <h2 className={`${isEmbedded ? 'text-lg' : 'text-xl md:text-2xl'} font-bold text-rose-900 drop-shadow-sm`}>مدرسة الشمال الابتدائية بنات</h2>
            <p className="text-rose-700 font-medium text-sm">اعداد المعلمة/ إيمان محمود</p>
          </div>
          <h1 className={`${isEmbedded ? 'text-3xl' : 'text-4xl md:text-5xl'} font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-800 to-red-600 drop-shadow-sm mb-2`}>
            مستكشفة التكنولوجيا 🖥️
          </h1>
          {!isEmbedded && <p className="text-slate-600 font-medium text-lg">الصف الخامس - الحوسبة وتكنولوجيا المعلومات</p>}
        </header>

        {/* --- START SCREEN --- */}
        {gameStage === GameStage.START && (
          <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl text-center transform transition-all hover:scale-[1.01] border-rose-100 animate-fade-in">
            <div className="text-6xl mb-6 animate-bounce-small">👩‍💻</div>
            <h2 className="text-2xl font-bold mb-4 text-rose-900">أهلاً بكِ أيتها المبرمجة الصغيرة!</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              هل أنتِ مستعدة لاختبار معلوماتكِ في عالم الحوسبة؟
              <br/>
              أجيبي بشكل صحيح لتنمو شجرة المعرفة الرقمية الخاصة بكِ! 🌱🌿🌳
            </p>
            
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={() => setGameStage(GameStage.DIFFICULTY_SELECT)}
                className="w-full md:w-auto group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-rose-800 to-red-600 rounded-full hover:from-rose-900 hover:to-red-700 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-rose-300"
              >
                <Play className="ml-2 w-6 h-6 fill-current" />
                <span>ابدأ التحدي</span>
              </button>

              {hasSavedGame && (
                <button
                  onClick={resumeGame}
                  className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 font-bold text-rose-800 transition-all duration-200 bg-white border-2 border-rose-200 rounded-full hover:bg-rose-50 hover:shadow-md"
                >
                  <Save className="ml-2 w-5 h-5" />
                  <span>إكمال التحدي السابق</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- DIFFICULTY SELECT SCREEN --- */}
        {gameStage === GameStage.DIFFICULTY_SELECT && (
          <div className="glass-panel rounded-3xl p-8 shadow-2xl text-center border-rose-100 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-rose-900">اختاري مستوى التحدي</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => startGame('easy')}
                className="p-6 rounded-2xl bg-green-50 border-2 border-green-200 hover:bg-green-100 hover:scale-[1.02] transition-all group flex flex-col items-center justify-center"
              >
                 <Star className="w-10 h-10 text-green-400 group-hover:fill-current mb-2" />
                 <h3 className="font-bold text-xl text-green-800 mb-1">سهل 🌱</h3>
                 <p className="text-green-600 text-sm">للمبتدئات</p>
              </button>

              <button
                onClick={() => startGame('medium')}
                className="p-6 rounded-2xl bg-yellow-50 border-2 border-yellow-200 hover:bg-yellow-100 hover:scale-[1.02] transition-all group flex flex-col items-center justify-center"
              >
                 <div className="flex mb-2">
                    <Star className="w-8 h-8 text-yellow-400 group-hover:fill-current" />
                    <Star className="w-8 h-8 text-yellow-400 group-hover:fill-current -mr-4" />
                 </div>
                 <h3 className="font-bold text-xl text-yellow-800 mb-1">متوسط 🌿</h3>
                 <p className="text-yellow-600 text-sm">للمبرمجات</p>
              </button>

              <button
                onClick={() => startGame('hard')}
                className="p-6 rounded-2xl bg-red-50 border-2 border-red-200 hover:bg-red-100 hover:scale-[1.02] transition-all group flex flex-col items-center justify-center"
              >
                 <div className="flex mb-2">
                    <Star className="w-8 h-8 text-red-400 group-hover:fill-current" />
                    <Star className="w-8 h-8 text-red-400 group-hover:fill-current -mr-4" />
                    <Star className="w-8 h-8 text-red-400 group-hover:fill-current -mr-4" />
                 </div>
                 <h3 className="font-bold text-xl text-red-800 mb-1">صعب 🌳</h3>
                 <p className="text-red-600 text-sm">للخبيرات</p>
              </button>
            </div>

            <button
              onClick={() => setGameStage(GameStage.START)}
              className="mt-8 text-slate-500 hover:text-slate-700 underline text-sm"
            >
              العودة للقائمة الرئيسية
            </button>
          </div>
        )}

        {/* --- QUIZ SCREEN --- */}
        {gameStage === GameStage.PLAYING && (
          <div className="w-full">
            <PlantProgress current={state.currentQuestionIndex} total={filteredQuestions.length} />

            <div 
              key={state.currentQuestionIndex} 
              className="glass-panel rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border-rose-100 animate-fade-in"
            >
              {/* Question Header */}
              <div className="flex justify-between items-center mb-6 border-b border-rose-100 pb-4">
                 <div className="flex gap-2">
                    <span className="bg-rose-100 text-rose-900 text-sm font-bold px-3 py-1 rounded-full">
                      سؤال {state.currentQuestionIndex + 1} / {filteredQuestions.length}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-sm font-bold px-3 py-1 rounded-full hidden md:inline-block">
                      {getDifficultyLabel()}
                    </span>
                 </div>
                <span className="text-3xl animate-pulse-slow">{currentQuestion.emoji}</span>
              </div>

              {/* Layout: Switch to Side-by-Side on wider screens (Desktop/Canva Slide) */}
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
                
                {/* Question Section */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-xl md:text-3xl font-bold text-slate-800 mb-6 leading-normal animate-fade-in opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                    {currentQuestion.text}
                  </h3>
                  
                  {/* Explanation Feedback Inline for Desktop */}
                  {state.isAnswered && (
                    <div className="hidden lg:block animate-fade-in mt-4">
                       <div className={`p-4 rounded-xl mb-4 text-sm ${state.isCorrect ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}`}>
                        <strong className="block mb-1 text-lg">
                          {state.isCorrect ? 'أحسنتِ! 🌟' : 'معلومة 💡'}
                        </strong>
                        {currentQuestion.explanation}
                      </div>
                      <button
                          onClick={handleNext}
                          className="inline-flex items-center px-6 py-3 bg-rose-900 text-white rounded-xl font-bold hover:bg-rose-800 transition-colors shadow-lg w-full justify-center"
                        >
                          <span>{state.currentQuestionIndex === filteredQuestions.length - 1 ? 'إظهار النتائج' : 'السؤال التالي'}</span>
                          <ArrowRight className="mr-2 w-5 h-5 transform rotate-180" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Options Section */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    {currentQuestion.options.map((option, idx) => {
                      let btnClass = "border-2 border-transparent bg-white hover:border-rose-300 hover:bg-rose-50 text-slate-700 shadow-sm";
                      
                      if (state.isAnswered) {
                        if (idx === currentQuestion.correctAnswer) {
                          btnClass = "bg-green-100 border-green-500 text-green-800 shadow-lg scale-[1.01]";
                        } else if (idx === state.selectedOption) {
                          btnClass = "bg-red-100 border-red-500 text-red-800 shadow-lg scale-[1.01]";
                        } else {
                          btnClass = "opacity-50 bg-gray-50 text-gray-400";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          disabled={state.isAnswered}
                          style={{ animationDelay: `${(idx + 1) * 150}ms`, animationFillMode: 'forwards' }}
                          className={`w-full p-4 rounded-xl text-right font-medium text-lg transition-all duration-300 transform ${state.isAnswered ? '' : 'hover:scale-[1.02] active:scale-95'} flex items-center justify-between ${btnClass} animate-fade-in opacity-0`}
                        >
                          <span className="flex items-center gap-3">
                            <span className="w-8 h-8 min-w-[2rem] rounded-full bg-rose-50 flex items-center justify-center text-sm font-bold text-rose-800">
                              {['أ', 'ب', 'ج', 'د'][idx]}
                            </span>
                            {option}
                          </span>
                          {state.isAnswered && idx === currentQuestion.correctAnswer && <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />}
                          {state.isAnswered && idx === state.selectedOption && idx !== currentQuestion.correctAnswer && <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile Feedback & Next Button (Hidden on Desktop) */}
              {state.isAnswered && (
                <div className="lg:hidden animate-fade-in mt-4">
                  <div className={`p-4 rounded-xl mb-6 text-sm ${state.isCorrect ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}`}>
                    <strong className="block mb-1 text-lg">
                      {state.isCorrect ? 'أحسنتِ! إجابة رائعة 🌟' : 'معلومة إضافية 💡'}
                    </strong>
                    {currentQuestion.explanation}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center px-6 py-3 bg-rose-900 text-white rounded-xl font-bold hover:bg-rose-800 transition-colors shadow-lg"
                    >
                      <span>{state.currentQuestionIndex === filteredQuestions.length - 1 ? 'إظهار النتائج' : 'السؤال التالي'}</span>
                      <ArrowRight className="mr-2 w-5 h-5 transform rotate-180" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- REVIEW SCREEN --- */}
        {gameStage === GameStage.REVIEW && (
          <div className="w-full animate-fade-in">
             <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-xl border-rose-100">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-rose-900 mb-2">مراجعة الأخطاء</h2>
                  <p className="text-slate-600">راجعي إجاباتك وتعلمي منها لتصبحي أقوى! 💪</p>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {userAnswers.filter(a => !a.isCorrect).map((answer, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-2xl">{answer.question.emoji}</span>
                        <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-1 rounded-full">سؤال {answer.question.id}</span>
                      </div>
                      
                      <h3 className="font-bold text-slate-800 mb-4 text-lg">{answer.question.text}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                         <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                           <span className="block text-red-600 font-bold mb-1 flex items-center gap-1">
                             <XCircle className="w-4 h-4"/> إجابتك:
                           </span>
                           <span className="text-slate-700">{answer.question.options[answer.selectedOption]}</span>
                         </div>
                         <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                           <span className="block text-green-600 font-bold mb-1 flex items-center gap-1">
                             <CheckCircle2 className="w-4 h-4"/> الإجابة الصحيحة:
                           </span>
                           <span className="text-slate-700">{answer.question.options[answer.question.correctAnswer]}</span>
                         </div>
                      </div>

                      <div className="text-sm bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100">
                         <strong>توضيح: </strong> {answer.question.explanation}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setGameStage(GameStage.FINISHED)}
                    className="inline-flex items-center px-6 py-3 bg-rose-900 text-white rounded-xl font-bold hover:bg-rose-800 transition-colors shadow-lg"
                  >
                    <span>عودة للنتائج</span>
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* --- RESULTS SCREEN --- */}
        {gameStage === GameStage.FINISHED && (
          <div className="text-center animate-fade-in w-full">
            <Celebration />
            <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden border-rose-100">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
              
              <div className="mb-6 inline-block p-6 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 shadow-inner animate-bounce-small">
                <Trophy className="w-16 h-16 text-yellow-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-800 mb-2">مبروك يا بطلة! 🎉</h2>
              <p className="text-slate-600 mb-6 font-medium text-lg text-rose-700">
                {getCelebrationMessage()}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                  <div className="text-sm text-rose-600 font-bold mb-1">الدرجة النهائية</div>
                  <div className="text-3xl font-black text-rose-800">{state.score} / {filteredQuestions.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                  <div className="text-sm text-green-600 font-bold mb-1">التقدير</div>
                  <div className="text-xl font-black text-green-800">
                    {state.score === filteredQuestions.length ? 'عالمة حاسوب 🧬' : state.score > filteredQuestions.length / 2 ? 'مبرمجة ناشئة 💻' : 'محاولة جيدة 📝'}
                  </div>
                </div>
              </div>

              {state.score === filteredQuestions.length && (
                <div className="mb-8 p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl text-white shadow-xl transform transition-all hover:scale-105 animate-bounce-small border-2 border-yellow-300">
                   {/* Custom Badge Selector */}
                   <div className="mb-3 text-white/90 text-sm font-medium flex items-center justify-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>اختاري شارة التميز الخاصة بكِ</span>
                   </div>
                   
                   <div className="flex justify-center gap-2 mb-4 bg-white/20 p-2 rounded-lg backdrop-blur-sm flex-wrap">
                      {badgeOptions.map((emoji) => (
                        <button 
                          key={emoji}
                          onClick={() => setBadgeEmoji(emoji)}
                          className={`min-w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all px-2 ${badgeEmoji === emoji ? 'bg-white shadow-md scale-110 text-indigo-900' : 'hover:bg-white/50 text-white'}`}
                        >
                          {emoji}
                        </button>
                      ))}
                   </div>

                   <div className="flex items-center justify-center gap-2 mb-2 animate-pulse-slow">
                     <span className="text-4xl filter drop-shadow-md">{badgeEmoji}</span>
                   </div>
                   <h3 className="font-black text-2xl md:text-3xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400 border-b border-white/20 pb-2 inline-block">
                     بطلة التحدي!
                   </h3>
                   <p className="text-xl font-bold text-indigo-100 mb-1">Challenge Champion</p>
                   <p className="text-sm text-indigo-200">أداء مثالي! أنتِ عالمة المستقبل 🌟</p>
                 </div>
              )}

              <div className="flex flex-col md:flex-row justify-center gap-3 flex-wrap">
                <button
                  onClick={() => setGameStage(GameStage.START)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <RefreshCw className="ml-2 w-5 h-5" />
                  <span>إعادة الاختبار</span>
                </button>

                {state.score < filteredQuestions.length && (
                   <button
                    onClick={() => setGameStage(GameStage.REVIEW)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-orange-50 border-2 border-orange-200 text-orange-700 rounded-xl font-bold hover:bg-orange-100 hover:border-orange-300 transition-all"
                  >
                    <BookOpen className="ml-2 w-5 h-5" />
                    <span>مراجعة الأخطاء</span>
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className={`inline-flex items-center justify-center px-6 py-3 border-2 rounded-xl font-bold transition-all ${isCopied ? 'bg-green-100 border-green-300 text-green-700' : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'}`}
                >
                  {isCopied ? <Check className="ml-2 w-5 h-5" /> : <Share2 className="ml-2 w-5 h-5" />}
                  <span>{shareBtnText}</span>
                </button>
              </div>
              
              <div className="mt-8 flex justify-center gap-4 text-3xl animate-pulse-slow">
                 <span>🍃</span><span>🍃</span><span>🍃</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER - Hidden if embedded to save space, or kept simple */}
      {!isEmbedded && (
        <footer className="relative z-10 w-full max-w-4xl mt-10 pt-4 border-t border-rose-200/50">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm md:text-base font-semibold text-rose-900 gap-2 md:gap-4 mb-4">
             <div className="flex flex-col items-center md:items-start">
               <span className="opacity-70 text-xs">منسقة القسم</span>
               <span>زينب محمد</span>
             </div>
             
             <div className="hidden md:block h-8 w-px bg-rose-300/50"></div>

             <div className="flex flex-col items-center md:items-start">
               <span className="opacity-70 text-xs">النائبة الأكاديمية</span>
               <span>لولوة السادة</span>
             </div>

             <div className="hidden md:block h-8 w-px bg-rose-300/50"></div>

             <div className="flex flex-col items-center md:items-start">
               <span className="opacity-70 text-xs">مديرة المدرسة</span>
               <span>مريم مبارك الحسيني</span>
             </div>
          </div>
          
          <div className="text-center">
            <div className="inline-block px-6 py-2 bg-white/60 rounded-full border border-rose-100 shadow-sm backdrop-blur-sm">
               <p className="text-rose-800 font-bold text-sm">الرؤية متعلم ريادي تنمية مستدامة</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;