import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import {
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  UserCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Briefcase,
  Award,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  Menu,
  X,
  Scale,
  Calendar,
  ThumbsUp,
  Sparkles,
  Zap
} from "lucide-react";

// Types for Lead Submission
interface Lead {
  id: string;
  name: string;
  phone: string;
  content: string;
  caseType: string;
  timestamp: string;
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}

function AnimatedCounter({ value, duration = 1500, decimals = 0, suffix = "" }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!window.IntersectionObserver) {
      setHasStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number | null = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = progress * (value - startValue) + startValue;
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, value, duration]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function App() {
  // Navigation states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [caseType, setCaseType] = useState("면허취소");
  const [content, setContent] = useState("");
  const [agree, setAgree] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Submissions state (persisted to LocalStorage + initial seed for conversion social proof)
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem("drunk_driving_leads");
    if (saved) return JSON.parse(saved);
    
    // Seed data to make the page look alive and converting!
    return [
      { id: "1", name: "홍*표", phone: "010-****-5182", caseType: "면허취소", content: "생계형 운전자 구제 상담", timestamp: "3분 전" },
      { id: "2", name: "이*민", phone: "010-****-9014", caseType: "행정심판", content: "혈중알코올농도 0.089% 감경", timestamp: "11분 전" },
      { id: "3", name: "박*훈", phone: "010-****-2361", caseType: "이의신청", content: "퀵서비스 종사자 면허 취소 구제", timestamp: "25분 전" },
      { id: "4", name: "최*서", phone: "010-****-7892", caseType: "면허정지", content: "단순 음주 적발 감경 방안", timestamp: "48분 전" },
    ];
  });



  // FAQ Accordion states
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Policy Modal state for footer privacy/terms links
  const [policyModal, setPolicyModal] = useState<{ title: string; content: string } | null>(null);

  // KakaoTalk Simulated Assistant states
  const [isKakaoOpen, setIsKakaoOpen] = useState(false);
  const [chatStep, setChatStep] = useState<string>("welcome");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; options?: string[] }>>([
    {
      sender: "bot",
      text: "안녕하세요! 음주운전 행정구제 24시간 비대면 무료 진단 센터입니다. ⚖️\n\n면허가 취소/정지될 위기에 처하셨다면, 골든타임 내 분석이 가장 중요합니다. 몇 가지 선택지만 클릭하시면 '예상 구제 확률'을 알려드립니다.",
      options: ["음주운전 구제 진단 시작하기", "대표 번호 즉시 통화"]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Refs for tracking scroll / intersection observer
  const formRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Framer Motion useScroll and useTransform for Parallax effect on Hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 160]);
  const heroOpacity = useTransform(scrollY, [0, 800], [1, 0.45]);
  const heroScale = useTransform(scrollY, [0, 800], [1, 0.95]);

  // Floating scroll progress / visibility state
  const [showFloatingWidget, setShowFloatingWidget] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowFloatingWidget(true);
      } else {
        setShowFloatingWidget(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Form submit handler
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("성함을 입력해주세요.");
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      alert("올바른 연락처를 입력해주세요.");
      return;
    }
    if (!agree) {
      alert("개인정보 처리방침에 동의하셔야 신청 가능합니다.");
      return;
    }

    setIsSubmitting(true);

    // Simulate server request delay
    setTimeout(() => {
      const newLead: Lead = {
        id: Date.now().toString(),
        name: name.slice(0, 1) + "*" + (name.length > 2 ? name.slice(2) : name.slice(1)),
        phone: phone.slice(0, 3) + "-****-" + phone.slice(-4),
        caseType,
        content: content || "음주운전 행정구제 상담 희망",
        timestamp: "방금 전"
      };

      const updated = [newLead, ...leads];
      setLeads(updated);
      localStorage.setItem("drunk_driving_leads", JSON.stringify(updated));

      setIsSubmitting(false);
      setShowSuccessModal(true);

      // Reset form
      setName("");
      setPhone("");
      setContent("");
    }, 1200);
  };

  // KakaoTalk Interactive logic
  const handleChatOption = (option: string) => {
    // Add user message
    const newMessages = [...chatMessages, { sender: "user" as const, text: option }];
    setChatMessages(newMessages);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (option === "음주운전 구제 진단 시작하기") {
        setChatMessages(prev => [
          ...prev,
          {
            sender: "bot",
            text: "첫 번째 단계입니다.\n현재 부과받으신 행정 처분 종류는 무엇인가요?",
            options: ["면허 취소 (1년/2년 등)", "면허 정지 (110일 등)", "경찰 조사 전/단속 직후"]
          }
        ]);
        setChatStep("select_disposition");
      } else if (option === "대표 번호 즉시 통화") {
        setChatMessages(prev => [
          ...prev,
          {
            sender: "bot",
            text: "📞 대표 행정사 직통 전화 번호는 [010.8114.4300] 입니다. 스마트폰 환경이시라면 아래 전화를 걸어 즉시 대면 무료 긴급 상담을 개시하실 수 있습니다.\n\n주말 및 야간에도 24시간 즉시 상담 가능합니다.",
            options: ["다시 진단하기", "메시지 남기기"]
          }
        ]);
        setChatStep("direct_call");
      } else if (option === "면허 취소 (1년/2년 등)" || option === "면허 정지 (110일 등)" || option === "경찰 조사 전/단속 직후") {
        setChatMessages(prev => [
          ...prev,
          {
            sender: "bot",
            text: `알겠습니다. ${option} 상태이시군요. 두 번째 단계로, 단속 당시 측정된 '혈중알코올농도' 구간은 어디에 해당하시나요?`,
            options: ["0.08% 미만 (정지 수준)", "0.08% ~ 0.12% 미만", "0.12% ~ 0.20% 미만", "0.20% 이상 또는 이진아웃(2회)"]
          }
        ]);
        setChatStep("select_bac");
      } else if (
        option.includes("0.08%") || 
        option.includes("0.12%") || 
        option.includes("0.20%")
      ) {
        setChatMessages(prev => [
          ...prev,
          {
            sender: "bot",
            text: "귀하의 상황을 정밀 분석 중입니다...\n\n마지막으로, 면허 구제 성공률을 극대화하기 위해 '감경 가산 요건'이 있으신지 선택해주세요. (중복 해당시 가장 핵심 요건 선택)",
            options: ["운전 필수 생계형 직업 (택배/영업/화물 등)", "과거 5년 이상 음주 이력 없음", "단속 과정의 억울함/불가피성", "해당 사항 없음 / 위급함"]
          }
        ]);
        setChatStep("select_factor");
      } else if (
        option.includes("생계형") ||
        option.includes("5년 이상") ||
        option.includes("단속 과정") ||
        option.includes("해당 사항 없음")
      ) {
        // Evaluate dynamic success probability
        let probability = "65% ~ 85%";
        let analysisText = "";

        if (option.includes("생계형")) {
          probability = "75% ~ 90%";
          analysisText = "생계형 운전자 요건이 성립되어 행정심판 시 '처분의 가혹성'이 강하게 반영되어 감경 확률이 매우 높은 편입니다.";
        } else if (option.includes("5년 이상")) {
          probability = "70% ~ 85%";
          analysisText = "장기 무사고 및 음주 이력 없음 요건은 행정심판 위원회에서 반성도와 평소 운전 행실을 높이 평가받는 아주 좋은 감경 요소입니다.";
        } else if (option.includes("단속 과정")) {
          probability = "65% ~ 80%";
          analysisText = "단속 과정에서의 긴급 피난 여부나 위법 단속 쟁점이 있다면 행정심판 청구를 통해 매우 세부적인 구제 전략 수립이 가능합니다.";
        } else {
          probability = "50% ~ 70%";
          analysisText = "다소 엄격한 상황이지만, 운전 경력, 반성문, 탄원서 및 재발방지 노력을 결합해 인도적 참작을 유도하는 맞춤 전략을 수립해야 합니다.";
        }

        setChatMessages(prev => [
          ...prev,
          {
            sender: "bot",
            text: `🎯 [구제 확률 가분석 결과]\n\n귀하의 예상 면허 구제(감경) 확률은 약 **${probability}** 수준으로 가분석되었습니다.\n\n${analysisText}\n\n행정심판 서류 검토 및 1:1 맞춤 청구문 작성을 위해 아래 양식에 성함과 연락처를 알려주시면 전문 행정사가 긴급 연락하여 세부 심층 자문을 무료로 진행해 드리겠습니다.`,
            options: ["무료 전문 상담 신청하기", "다시 진단하기"]
          }
        ]);
        setChatStep("result");
      } else if (option === "무료 전문 상담 신청하기" || option === "메시지 남기기") {
        setChatMessages(prev => [
          ...prev,
          {
            sender: "bot",
            text: "감사합니다. 화면 상단의 '무료 상담 신청 카드'에 성함과 연락처를 기입해주시거나, 대표 번호 [010.8114.4300]으로 즉시 연락하시면 더 빠르게 1:1 집중 지원을 받으실 수 있습니다. 지금 상담 카드로 안내해 드릴까요?",
            options: ["상담 카드로 스크롤", "대표 번호 통화 연결"]
          }
        ]);
        setChatStep("scroll_or_call");
      } else if (option === "상담 카드로 스크롤") {
        scrollToForm();
        setChatMessages(prev => [
          ...prev,
          {
            sender: "bot",
            text: "화면 상단의 신청 폼으로 이동했습니다. 성함과 전화번호를 작성하시고 '무료 상담 신청' 버튼을 눌러주십시오.",
            options: ["대화 종료 및 카카오톡 닫기"]
          }
        ]);
        setChatStep("end");
      } else if (option === "대표 번호 통화 연결") {
        window.location.href = "tel:010-8114-4300";
      } else {
        // Default reboot
        setChatMessages([
          {
            sender: "bot",
            text: "음주운전 행정구제 24시간 진단 센터입니다. ⚖️\n\n면허가 취소/정지될 위기에 처하셨다면, 골든타임 내 분석이 가장 중요합니다. 몇 가지 선택지만 클릭하시면 '예상 구제 확률'을 알려드립니다.",
            options: ["음주운전 구제 진단 시작하기", "대표 번호 즉시 통화"]
          }
        ]);
        setChatStep("welcome");
      }
    }, 800);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    // Pulse animation or visual cue could be added
  };

  // Live simulation tickers for simulated FOMO social proof - Slightly slower transition (8 seconds)
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTickerIdx(prev => (prev + 1) % leads.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [leads.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050F1E] via-[#0B1F3A] to-[#040C18] text-slate-100 font-sans relative overflow-x-hidden pb-24 md:pb-0">
      
      {/* Dynamic Background Mesh Effect with Multiple Glowing Circles for Frosted Glass Backdrop */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0B1F3A]/30 via-transparent to-[#040C18]/80 -z-10 pointer-events-none" />
      <div className="absolute top-[5%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-gold-500/10 to-transparent filter blur-[100px] -z-10 pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute top-[35%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#122B4D]/40 to-transparent filter blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-[65%] left-[8%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-tr from-gold-500/5 to-[#1B3C66]/30 filter blur-[130px] -z-10 pointer-events-none animate-pulse duration-[12000ms]" />
      <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-[#122B4D]/30 to-transparent filter blur-[110px] -z-10 pointer-events-none" />

      {/* STICKY HEADER - Premium Frosted Glass */}
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 transition-all duration-300 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center shadow-lg shadow-gold-500/20">
              <Scale className="w-5 h-5 text-navy-950" />
            </div>
            <div>
              <div className="font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                온결 <span className="text-gold-500">행정사사무소</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Administrative Relief & Legal Advisory</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#trust" className="text-sm text-slate-300 hover:text-gold-400 transition-colors font-medium">핵심 신뢰지표</a>
            <a href="#cases" className="text-sm text-slate-300 hover:text-gold-400 transition-colors font-medium">구제 대상 사례</a>
            <a href="#process" className="text-sm text-slate-300 hover:text-gold-400 transition-colors font-medium">구제 프로세스</a>
            <a href="#why" className="text-sm text-slate-300 hover:text-gold-400 transition-colors font-medium">선택 이유</a>
            <a href="#faq" className="text-sm text-slate-300 hover:text-gold-400 transition-colors font-medium">자주 묻는 질문</a>
          </nav>

          {/* Call & Kakao Quick buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.a
              href="tel:010-8114-4300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 shadow-md shadow-red-950/40 animate-pulse"
              id="header_call_btn"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">24H 긴급상담</span> 010.8114.4300
            </motion.a>

            <motion.a
              href="https://pf.kakao.com/_HeShX"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] rounded-full text-xs sm:text-sm font-bold transition-all duration-300 shadow-md cursor-pointer"
              id="header_kakao_btn"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span className="hidden md:inline">카톡 자격진단</span>
            </motion.a>

            {/* Mobile menu toggle */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-slate-400 hover:text-white md:hidden cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown - Frosted Glass */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-navy-950/90 backdrop-blur-xl border-b border-white/10"
            >
              <div className="px-4 py-6 space-y-4">
                <a
                  href="#trust"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-medium text-slate-300 hover:text-gold-500 transition-colors"
                >
                  핵심 신뢰지표
                </a>
                <a
                  href="#cases"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-medium text-slate-300 hover:text-gold-500 transition-colors"
                >
                  구제 대상 사례
                </a>
                <a
                  href="#process"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-medium text-slate-300 hover:text-gold-500 transition-colors"
                >
                  구제 프로세스
                </a>
                <a
                  href="#why"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-medium text-slate-300 hover:text-gold-500 transition-colors"
                >
                  선택 이유
                </a>
                <a
                  href="#faq"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-medium text-slate-300 hover:text-gold-500 transition-colors"
                >
                  자주 묻는 질문
                </a>
                <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      scrollToForm();
                    }}
                    className="w-full text-center py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-bold rounded-lg text-sm shadow-md"
                  >
                    무료 온라인 상담 신청
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* TOP HERO SECTION */}
      <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="hero">
        
        {/* Real-time Ticker Bar for Social Proof / Conversion Optimization - Frosted Glass */}
        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 sm:px-6 py-2.5 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-slate-300 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-gold-400">실시간 상담 접수 현황</span>
          </div>
          
          <div className="flex-1 px-4 overflow-hidden h-5 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTickerIdx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute w-full text-slate-200 flex items-center gap-2"
              >
                <span className="font-bold text-white">{leads[currentTickerIdx]?.name}</span>
                <span className="text-slate-400">({leads[currentTickerIdx]?.phone})</span>
                <span className="bg-white/10 text-gold-400 px-2 py-0.5 rounded text-[10px] font-medium border border-white/10">{leads[currentTickerIdx]?.caseType}</span>
                <span className="truncate max-w-[150px] sm:max-w-xs text-slate-300 text-xs">"{leads[currentTickerIdx]?.content}"</span>
                <span className="ml-auto text-gold-500 font-medium text-xs">{leads[currentTickerIdx]?.timestamp}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <button onClick={scrollToForm} className="text-gold-400 hover:text-gold-300 text-xs font-bold flex items-center gap-1 transition-all">
            나도 진단받기 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero text (Left Side) */}
          <motion.div className="lg:col-span-7 space-y-8" style={{ y: heroY, opacity: heroOpacity }}>
            
            {/* Urgent Badge - Frosted */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
              <Zap className="w-4 h-4 text-gold-400 animate-bounce" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-gold-400">음주운전 처분 통지 후 90일 이내 필수 청구</span>
            </div>

            {/* Main Big Title */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                음주운전 행정구제
                <span className="block mt-2 text-gold-gradient">
                  골든타임을 놓치지 마십시오
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                단속 직후 및 취소 결정 통보를 받은 순간부터 면허 구제의 카운트다운이 시작됩니다. 단 하루의 지체도 감경 가능성을 낮추게 됩니다.
              </p>
            </div>

            {/* Grid Badges for key services with Glassmorphism */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "면허취소 구제", desc: "110일 면허정지로 감경" },
                { name: "면허정지 감경", desc: "결격기간 소멸 및 구제" },
                { name: "행정심판 대행", desc: "중앙행정심판 공식대응" },
                { name: "이의신청 대행", desc: "경찰청 특별이의신청" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card glass-card-hover p-3 rounded-xl text-center shadow-lg"
                >
                  <p className="font-bold text-gold-400 text-sm sm:text-base group-hover:text-gold-300 transition-colors">{item.name}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Quick Consultation Guarantee Statement - Frosted */}
            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl max-w-xl">
              <ShieldCheck className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  신속하고 명확한 전문 행정 구제 약속
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  누적 상담 데이터와 실제 행정심판 인용 판결 분석을 바탕으로, 귀하의 알코올 농도와 생계 연관성을 종합 반영한 1:1 무조건적 구제 전략을 도출합니다.
                </p>
              </div>
            </div>



          </motion.div>

          {/* Consultation Form Card (Right Side) - Premium Frosted Gold Pulse */}
          <div ref={formRef} className="lg:col-span-5 relative" id="consultation-form">
            <div className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-gold-500 pointer-events-none opacity-40 hidden sm:block" />
            <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-gold-500 pointer-events-none opacity-40 hidden sm:block" />

            <div className="glass-panel-gold animate-gold-pulse rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              
              {/* Card top branding */}
              <div className="mb-6">
                <span className="text-[10px] font-bold text-gold-400 tracking-widest uppercase bg-gold-500/10 px-2.5 py-1 rounded">24 Hours Open</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">무료 행정구제 신청</h3>
                <p className="text-xs text-slate-400 mt-1">자료 검토 후 30분 이내 긴급 전문 가이드를 제시합니다.</p>
              </div>

              {/* Form elements */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Name */}
                <div>
                  <label htmlFor="form_name" className="block text-xs font-semibold text-slate-300 mb-1.5">이름 (실명)</label>
                  <div className="relative">
                    <input
                      id="form_name"
                      type="text"
                      required
                      placeholder="성함을 입력해주세요"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full glass-input rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="form_phone" className="block text-xs font-semibold text-slate-300 mb-1.5">연락처 (휴대폰)</label>
                  <input
                    id="form_phone"
                    type="tel"
                    required
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full glass-input rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                {/* Case Type Dropdown */}
                <div>
                  <label htmlFor="form_case" className="block text-xs font-semibold text-slate-300 mb-1.5">사건 처분 유형</label>
                  <select
                    id="form_case"
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value)}
                    className="w-full glass-input rounded-lg px-4 py-3 text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="면허취소" className="bg-navy-950 text-white">면허취소 처분 (BAC 0.08% 이상)</option>
                    <option value="면허정지" className="bg-navy-950 text-white">면허정지 처분 (BAC 0.03% ~ 0.08%)</option>
                    <option value="경찰조사" className="bg-navy-950 text-white">경찰조사 동석 및 진술 전략</option>
                    <option value="행정심판" className="bg-navy-950 text-white">행정심판 청구서 작성 대행</option>
                    <option value="이의신청" className="bg-navy-950 text-white">이의신청 자격 심층 상담</option>
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="form_content" className="block text-xs font-semibold text-slate-300 mb-1.5">상담 내용 (알코올 수치, 직업 등)</label>
                  <textarea
                    id="form_content"
                    rows={3}
                    placeholder="예: 회사원, 혈중알코올농도 0.085%, 무사고 10년, 생계 곤란 사유 소명 희망"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full glass-input rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 outline-none resize-none"
                  />
                </div>

                {/* Privacy Consent Checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="form_agree"
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 rounded bg-[#071324] border-white/20 text-gold-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="form_agree" className="text-[11px] text-slate-400 leading-snug cursor-pointer select-none">
                    개인정보 수집 및 이용목적 동의 (상담 응대 및 법률 정보 안내를 위해 한정 활용되며 목적 달성 후 안전하게 파기됩니다.) <span className="text-gold-500">[필수]</span>
                  </label>
                </div>

                {/* Submit button with shimmer */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-bold text-base rounded-xl transition-all duration-300 shadow-xl shadow-gold-500/10 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden shimmer-btn active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>무료 상담 신청</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-500">신청하신 내용은 철저하게 비밀 보장(비공개)이 유지됩니다.</p>

              </form>
            </div>
          </div>

        </div>
      </section>

      {/* TRUST INDICATORS SECTION (Hero 아래 신뢰지표) - Premium Frosted Glass */}
      <section className="bg-white/5 border-y border-white/10 py-16 px-4 sm:px-6 lg:px-8" id="trust">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">TRUST INDICATORS</span>
            <h2 className="text-3xl font-extrabold text-white">행정구제 4대 핵심 신뢰 지표</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">말뿐이 아닌, 구체적이고 신뢰할 수 있는 데이터와 법리적 접근으로 최상의 구제안을 도출합니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Clock className="w-6 h-6 text-navy-950" />,
                title: "빠른 상담",
                badge: "24/7 즉시 대응",
                desc: "처분 즉시 분석을 개시하며 야간/주말에도 공백 없는 24시간 긴급 대응반을 가동해 사건의 골든타임을 확보합니다."
              },
              {
                icon: <Briefcase className="w-6 h-6 text-navy-950" />,
                title: "맞춤 전략",
                badge: "1:1 집중 설계",
                desc: "단순 양식 복사가 아닌 혈중알코올농도, 운전 경력, 직업 필수성, 반성 유무 등을 입체적으로 검토해 소명 주장을 구성합니다."
              },
              {
                icon: <Scale className="w-6 h-6 text-navy-950" />,
                title: "행정심판 대응",
                badge: "인용 판례 기반",
                desc: "경찰 피의자 조사 준비 단계부터 행정심판 청구서 제출 및 입증자료 전담 확보까지 물샐틈없는 법리 구성을 가이드합니다."
              },
              {
                icon: <MapPin className="w-6 h-6 text-navy-950" />,
                title: "전국 상담 가능",
                badge: "비대면 신속 처리",
                desc: "서울에서 제주까지 전국 모든 경찰청과 행정심판위원회 관할 사건에 대해 원격/비대면 서류 처리 시스템으로 대처 가능합니다."
              }
            ].map((indicator, index) => (
              <div
                key={index}
                className="glass-card glass-card-hover p-6 rounded-2xl shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-md shadow-gold-500/10">
                      {indicator.icon}
                    </div>
                    <span className="text-[10px] font-bold text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-full">{indicator.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">{indicator.title}</h3>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{indicator.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">인증 완료</span>
                  <ThumbsUp className="w-4 h-4 text-gold-500/60" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* KEY ACHIEVEMENTS & NUMBERS (숫자 카운터 애니메이션) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-16 relative overflow-hidden" id="achievements">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,169,106,0.03),transparent_70%)] pointer-events-none" />
        
        <div className="space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-500">OUR INTEGRITY</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">오직 정직함과 철저한 정성으로 보답합니다</h2>
          <p className="text-sm text-slate-400">
            온결은 무리한 수임 유도나 과장된 성공 확률을 내세우지 않습니다. 하루 한정 상담과 전담 책임제로 차별화된 꼼꼼한 밀착 구제를 약속드립니다.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            {
              value: 100,
              decimals: 0,
              suffix: "%",
              label: "대표 행정사 1:1 직접 밀착 전담",
              desc: "중간 사무장이나 영업 직원 배제, 채영재 대표행정사가 상담부터 직접 연구 및 서류 집필"
            },
            {
              value: 3,
              decimals: 0,
              suffix: "명",
              label: "하루 한정 심층 분석 제한",
              desc: "공장식 다량 집필을 거부하고, 하루 단 3명만 집중 접수하여 사건의 고밀도 맞춤 서류 완성"
            },
            {
              value: 24,
              decimals: 0,
              suffix: "H",
              label: "실시간 긴급 소통 시스템",
              desc: "사건 초기 조력의 골든타임을 지키기 위해 24시간 언제든 실시간 밀착 답변과 조율 가능"
            },
            {
              value: 100,
              decimals: 0,
              suffix: "%",
              label: "투명하고 정직한 자격요건 진단",
              desc: "의뢰인의 상황을 있는 그대로 투명하게 분석하여 무분별한 수수료 요구 없이 확실한 방향 제시"
            }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="glass-card p-6 sm:p-8 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden group border border-white/5 hover:border-gold-500/20 shadow-2xl transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold-600 to-gold-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-gold-gradient tracking-tight">
                <AnimatedCounter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
              </p>
              <p className="text-xs sm:text-sm font-bold text-white mt-4">{stat.label}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-2 text-center leading-relaxed">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Button placed in Achievements */}
        <div className="pt-4">
          <motion.button
            onClick={scrollToForm}
            whileHover={{ scale: 1.03, translateY: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-extrabold text-sm rounded-xl transition-all duration-300 shadow-xl cursor-pointer shadow-gold-500/10"
          >
            <span>실시간 구제 가능 여부 즉시 확인하기</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </section>

      {/* CASES SECTION ("이런 경우 상담이 필요합니다") - Frosted Glass */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12" id="cases">
        
        <div className="text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-500">TARGET AUDIENCE</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">이런 경우 반드시 상담이 필요합니다</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            단순히 포기하거나 기소 전 단계에서 실망하지 마십시오. 아래의 조건 중 단 한 가지라도 해당 사항이 있다면 처분 감경 및 면허 구제 대상에 포함됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full filter blur-xl" />
            <div className="flex items-center gap-3.5 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 font-bold text-sm">01</span>
              <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">면허취소 처분 통보</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              관할 경찰청으로부터 운전면허 취소 결정 통지서를 수령하였거나, 사전 통보를 받아 실제 면허 취소 결격을 앞둔 상태인 경우. <span className="text-gold-400 font-semibold">90일 카운트다운</span>이 적용됩니다.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full filter blur-xl" />
            <div className="flex items-center gap-3.5 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 font-bold text-sm">02</span>
              <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">혈중알코올농도 수치</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              면허 취소 기준치인 0.08% 이상으로 적발되었으나 농도가 다소 낮아 구제 가능성이 높은 구간(0.08% ~ 0.12%대)에 해당하거나, 단속 과정 상의 절차적 하자가 있는 경우.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full filter blur-xl" />
            <div className="flex items-center gap-3.5 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 font-bold text-sm">03</span>
              <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">생계형 및 직무상 운전자</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              버스/택시 기사, 화물차 차주, 유통/택배 기사, 납품 종사자, 외근 영업직, 자영업 등 면허 취소 처분으로 인해 본인과 부양가족의 실질적 가계 유지 및 직장이 상실될 수밖에 없는 곤란성.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full filter blur-xl" />
            <div className="flex items-center gap-3.5 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 font-bold text-sm">04</span>
              <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">과거 공적 및 정상 참작</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              장기 무사고 운전 경력이 있거나, 국토교통부 모범 운전자 표창 보유, 국가 유공자, 사회 봉사 실적 및 사회적 약자 요건이 있으며 과거 주취운전 이진아웃 전력이 없는 단순 초범인 경우.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden md:col-span-2 lg:col-span-2">
            <div className="absolute top-0 right-0 w-36 h-36 bg-gold-500/5 rounded-full filter blur-xl" />
            <div className="flex items-center gap-3.5 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 font-bold text-sm">05</span>
              <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">불가피한 운전 사유 및 경찰 조사 대응</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              대리운전 기사를 명확히 호출했으나 목적지 정차 시비나 비매너 주차로 인해 단 몇 미터만 극히 움직였거나, 응급 환자 이송 등 긴급 피난 요건이 인정되어 처분 자체의 정상과 고의성의 흠결 소명이 적극적으로 동반될 수 있는 특수 사정.
            </p>
          </div>

        </div>

        <div className="text-center pt-4">
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/5 hover:bg-white/10 border border-gold-500/50 hover:border-gold-500 text-gold-400 font-bold text-sm rounded-xl transition-all duration-300 shadow-xl cursor-pointer"
          >
            <span>내 상황이 구제 대상에 해당하는지 분석받기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </section>

      {/* PROCESS SECTION (Timeline) - Frosted Glass */}
      <section className="bg-white/5 border-y border-white/10 py-20 px-4 sm:px-6 lg:px-8" id="process">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">ROADMAP</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">행정심판 구제 5단계 프로세스</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">상담 접수부터 최종 인용(면허 감경) 판결을 받아내기까지 일관되고 투명한 전문 절차를 따릅니다.</p>
          </div>

          {/* Timeline UI */}
          <div className="relative">
            {/* Background line for timeline (hidden on mobile, shown on md screens) */}
            <div className="absolute top-1/2 left-4 md:left-1/2 right-4 h-0.5 bg-white/20 -translate-y-1/2 -z-10 hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              {[
                {
                  step: "01",
                  title: "상담신청 및 접수",
                  desc: "24시간 접수창구를 통해 이름, 전화번호, 처분 일자를 작성해 즉시 무료 가분석을 신청합니다."
                },
                {
                  step: "02",
                  title: "사건 정밀 분석",
                  desc: "운전경력증명서, 적발 당시 조서 등을 기반으로 감경에 작용할 종합 가산요소를 면밀히 파악합니다."
                },
                {
                  step: "03",
                  title: "구제 전략 수립",
                  desc: "해당 행정 처분으로 인한 일가족의 파탄 및 위법 소지 소명 중심의 1:1 맞춤 청구 이유서를 설계합니다."
                },
                {
                  step: "04",
                  title: "행정심판 공식 청구",
                  desc: "중앙행정심판위원회에 공식 청구서 및 참작자료(반성문, 탄원서)를 누락 없이 제출하고 대응합니다."
                },
                {
                  step: "05",
                  title: "결과 및 면허 회복",
                  desc: "심리 위원회 재결 결과를 확인하고 면허 정지 또는 벌점 감경 결정을 받아 면허 구제를 최종 확정합니다."
                }
              ].map((proc, index) => (
                <div key={index} className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-full flex items-center justify-center font-bold text-gold-400 text-lg shadow-lg group-hover:border-gold-500 group-hover:bg-white/15 transition-all duration-300">
                    {proc.step}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-4 group-hover:text-gold-400 transition-colors">{proc.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-xs">{proc.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button in Process Section */}
          <div className="text-center pt-8">
            <motion.button
              onClick={scrollToForm}
              whileHover={{ scale: 1.03, translateY: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-extrabold text-sm rounded-xl transition-all duration-300 shadow-xl cursor-pointer"
            >
              <span>5단계 구제 가이드 자문단 배정받기</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

        </div>
      </section>

      {/* WHY CHOOSE US ("왜 우리를 선택해야 하나") - Frosted Glass */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12" id="why">
        
        <div className="text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-500">OUR COMMITMENT</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">왜 온결은 오직 의뢰인 한 분의 삶에 온전히 집중할까요?</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            정형화된 공장식 서류나 무책임한 대량 수임으로는 감경을 기대할 수 없습니다. 온결은 개개인의 절박한 사정과 구체적인 사실 관계를 집요하게 분석하여 독창적인 소명 논리를 집필합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-card glass-card-hover p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-gold-400" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors font-semibold">골든타임 신속 대응</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              상담 즉시 대표행정사가 직접 투입되어 경찰서 피의자 조서 작성 요령 안내 및 증명서 보정 등 즉시 효력이 발생하는 최적 절차를 지연 없이 밟아 드립니다.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-gold-400" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors font-semibold">정성과 진정성의 밀착 집필</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              인터넷에서 짜깁기한 무의미한 서류가 아닙니다. 채영재 대표행정사가 의뢰인의 삶과 생계 곤란 등 절박한 가치를 가슴 깊이 이해하고 심판위원의 공감을 이끄는 맞춤 소명으로 구제를 이끌어 냅니다.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-gold-400" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors font-semibold">1:1 철저한 개별 맞춤</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              성공 가능성 제로인 무의미한 수수료 요구를 원천 배제하며, 서류 한 자 한 자 개별적인 가계 곤란 증명과 반성 내용을 각색해 직접 수작업 작성합니다.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-gold-400" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors font-semibold">체계적 진행 시스템</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              사건 접수, 피청구인 답변서에 대한 추가 보완 서류 대응, 마지막 심리기일 통보 및 결과 송달까지 문자 메시지 실시간 알림과 피드백을 수시 공유합니다.
            </p>
          </div>

        </div>

        {/* CTA Button in Why Choose Us Section */}
        <div className="text-center pt-10">
          <motion.button
            onClick={scrollToForm}
            whileHover={{ scale: 1.03, translateY: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-extrabold text-sm rounded-xl transition-all duration-300 shadow-xl cursor-pointer"
          >
            <span>차별화된 전략으로 즉시 분석받기</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

      </section>

      {/* FAQ SECTION - Frosted Glass */}
      <section className="bg-white/5 border-t border-white/10 py-20 px-4 sm:px-6 lg:px-8" id="faq">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">LAW FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">행정심판 구제 자주 묻는 질문</h2>
            <p className="text-sm text-slate-400">일방적인 설명보다 고객분들이 가장 빈번하게 고민하시는 핵심 법률 의문을 엄선하여 답변해 드립니다.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "음주운전 적발 후 언제 행정심판을 청구해야 하나요?",
                a: "운전면허 취소 처분 결정 통지서를 수령한 날로부터 90일 이내에 반드시 행정심판을 제기하셔야 합니다. 이 90일은 절대 불변의 기한이며, 90일이 하루라도 초과될 경우 아무리 가혹하거나 억울한 사유가 있어도 심판 청구 자체가 ‘각하(부적법 거절)’처리되므로 반드시 그 전에 상담하여 완벽한 청구 서류 작성을 끝마쳐야 합니다."
              },
              {
                q: "혈중알코올농도가 높은 경우에도 구제가 가능한가요?",
                a: "농도가 0.08%에 근접할수록 감경 확률이 통상적으로 높아지지만, 0.12%를 넘거나 0.15% 전후의 수치라 하더라도 대리 기사 고의 퇴근 등 불가피한 기동이었음을 입증하거나, 오랜 무사고 경력, 직무상 운전 기여도가 절대적이어서 면허 취소 시 가족 전체의 붕괴가 초래되는 긴박성 등이 서류에 정교하게 반영된다면 인용이나 정지로의 성공적 일부 감경이 충분히 실현될 수 있습니다."
              },
              {
                q: "생계형 운전자는 구제 확률이 확실히 다른가요?",
                a: "예, 맞습니다. 택시/버스/화물, 배송업 직종과 영업직 등 본인 스스로가 운전하여 수익을 창출하는 운수 및 물류 종사자는 면허 취소가 곧 ‘직무 정지 및 실직’을 유발하기에 법률적으로 ‘처분의 가혹성’을 가산받는 핵심 우대 집단입니다. 하지만 단순히 생계형 직무라는 말 한마디만으로는 부족하며 채무 상태, 가족 부양 현황을 서류로 치밀하게 증명해야 합니다."
              },
              {
                q: "이의신청과 행정심판의 핵심 차이는 무엇인가요?",
                a: "이의신청은 처분을 집행한 지방경찰청에 소명하는 절차이며, 자격 요건이 대단히 제한적(BAC 0.100% 이하, 과거 5년 내 무사고 초범, 생계 필수 운전자 등)입니다. 반면 행정심판은 국민권익위원회 산하의 독립적인 사법성 행정심판위원회가 심리하므로 요건 제한이 전혀 없어 누구나 청구할 수 있고 구제 확률과 위원회 인용 비중 또한 이의신청보다 현저히 높습니다."
              },
              {
                q: "구제 심판 진행 중에는 운전이 원천 불가능한가요?",
                a: "취소 처분 개시일 이후에는 원칙적으로 효력이 박탈되어 무면허 운전이 되므로 운전하실 수 없습니다. 그러나 사전 통지 기간과 함께 부여받는 40일간의 '임시운전면허' 동안은 정상 운전이 가능하며, 해당 기간 내에 행정심판 청구와 함께 '집행정지 신청'을 조속히 함께 청구하여 인용 결정을 얻어내면 재판 결과가 확정될 때까지 면허 효력을 일시 연장시킬 수 있는 신속 긴급 트랙도 병행 가능합니다."
              }
            ].map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="glass-card rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-white hover:text-gold-400 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                      <span className="font-bold text-sm sm:text-base pr-4">{faq.q}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gold-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/10 bg-white/5"
                      >
                        <div className="p-5 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
                          <p>{faq.a}</p>
                          <p className="text-[11px] text-gold-500 font-semibold pt-1">
                            ※ 본 내용은 일반적인 처분 기준이며, 각 사건의 혈중 알코올 및 제반 정황에 따라 맞춤 전략서 작성이 권고됩니다.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* CTA Button in FAQ Section */}
          <div className="text-center pt-10">
            <motion.button
              onClick={scrollToForm}
              whileHover={{ scale: 1.03, translateY: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/5 hover:bg-white/10 border border-gold-500/40 hover:border-gold-500 text-gold-400 font-extrabold text-sm rounded-xl transition-all duration-300 shadow-xl cursor-pointer"
            >
              <span>궁금한 사항 1:1 맞춤 법률 질의하기</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

        </div>
      </section>

      {/* FINAL CTA SECTION - Frosted Glass */}
      <section className="bg-gradient-to-r from-[#030d1a] via-[#051429] to-[#030d1a] border-t border-white/10 py-20 px-4 sm:px-6 lg:px-8 text-center relative" id="cta">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,169,106,0.05),transparent_60%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          
          <div className="inline-flex h-1.5 w-16 bg-gold-500 rounded-full mb-2" />
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            면허 구제의 골든타임,<br className="sm:hidden" /> 지금 바로 상담을 신청하세요.
          </h2>
          
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            행정 처분 결정을 고민만 하다 보내기엔 90일은 매우 짧습니다. 지금 전화하시거나 온라인 무료 신청 폼에 세부 내용을 기입하여 기회를 살리십시오.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            
            <button
              onClick={scrollToForm}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-bold text-base rounded-xl transition-all duration-300 shadow-xl shadow-gold-500/20 flex items-center justify-center gap-2 cursor-pointer shimmer-btn relative overflow-hidden"
            >
              <span>무료 상담 신청하기</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="tel:010-8114-4300"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-slate-100 font-bold text-base rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5 text-gold-400" />
              <span>긴급 전화 자문: 010.8114.4300</span>
            </a>

          </div>

          <p className="text-[11px] text-slate-500">24시간 휴일 무휴 접수 | 전문 자문 행정사 즉시 연결 보장</p>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#030812] border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-8">
          
          {/* Corporate Legal Info */}
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-gold-500" />
              <span className="font-bold text-slate-300 text-sm">온결행정사사무소</span>
            </div>
            
            <p className="leading-relaxed">
              상호: 온결행정사사무소 | 대표행정사: 채영재 <br />
              주소: 부산광역시 강서구 명지국제7로 133 상가1동 101호 | 대표전화: 010.8114.4300 <br />
              이메일: cyj_adminpro@naver.com
            </p>

            <p className="text-[10px] text-slate-600 leading-relaxed">
              Disclaimer: 본 사이트에 표시 및 서술된 법률 정보 및 인용 확률 가분석은 참고 사항일 뿐이며, 사건 당시의 명확한 알코올 농도, 진술 대립, 경찰청 가이드라인 및 재판부 사정에 따라 최종 결과는 달라질 수 있습니다. 최종 소장 기재 시에는 공식 구제 위원 검토가 필수 요구됩니다.
            </p>
          </div>

          {/* Policy Links */}
          <div className="space-y-4 md:text-right">
            <div className="flex flex-wrap md:justify-end gap-4 text-slate-400 font-semibold text-xs">
              <a href="#privacy" onClick={(e) => { e.preventDefault(); setPolicyModal({ title: '개인정보 처리방침', content: '본 센터는 고객의 개인정보를 최우선으로 보호하며, 수집된 이름 및 연락처는 상담 연결 및 자문 제공 이외의 마케팅 용도로 임의 제공 또는 유출하지 않으며 상담 즉시 보관 후 파기 규정에 의거하여 처리됩니다. 상담 응대 이외의 다른 목적으로 가공되거나 활용되지 않습니다.' }); }} className="hover:text-gold-400 transition-colors cursor-pointer">개인정보 처리방침</a>
              <span className="text-slate-700">|</span>
              <a href="#terms" onClick={(e) => { e.preventDefault(); setPolicyModal({ title: '이용약관', content: '이용자는 본 플랫폼이 제공하는 자문 분석을 참고용으로 활용하며, 실제 분쟁 해결 및 구제 성립은 최종 행정심판 청구서 제출 이후 위원회의 심의를 통해 법적으로 완결됩니다. 무단 복제 및 전재를 엄격히 금합니다.' }); }} className="hover:text-gold-400 transition-colors cursor-pointer">이용약관</a>
              <span className="text-slate-700">|</span>
              <a href="#legal" onClick={(e) => { e.preventDefault(); setPolicyModal({ title: '행정사 고지', content: '본 센터는 행정사법 제2조 및 법률 규정에 부합하는 합법적인 행정기관 문서 작성 및 서류 대행 서비스를 엄격하게 준수합니다. 음주운전 처분에 대한 이의신청, 행정심판 구제서 작성 지원을 행정사법에 의거하여 성실히 처리합니다.' }); }} className="hover:text-gold-400 transition-colors cursor-pointer">행정사 고지</a>
            </div>
            <p className="text-[10px] text-slate-600">© 2026 온결행정사사무소. All rights reserved. Designed and Handcrafted with Conversion UX.</p>
          </div>

        </div>
      </footer>

      {/* FLOATING ACTION WIDGET (Bottom Right on Desktop / Sticky Mobile Bar) */}
      {showFloatingWidget && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 max-w-[90vw]">
          
          {/* Quick Consultation Badge */}
          <button
            onClick={scrollToForm}
            className="hidden sm:flex items-center gap-2 bg-[#0B1F3A] hover:bg-[#122B4D] text-slate-100 border border-gold-500/40 py-2.5 px-4 rounded-full shadow-2xl text-xs font-bold transition-all hover:scale-105"
            id="floating_scroll_form"
          >
            <Clock className="w-4 h-4 text-gold-500 animate-spin" />
            <span>온라인 즉시 분석</span>
          </button>

          {/* Quick Phone Call Widget */}
          <a
            href="tel:010-8114-4300"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 w-14 h-14 sm:w-auto sm:h-auto sm:px-5 sm:py-3.5 font-bold text-sm"
            id="floating_call_btn"
          >
            <Phone className="w-5 h-5" />
            <span className="hidden sm:inline">24시 긴급 전화: 010.8114.4300</span>
          </a>

          {/* Floating Kakao Widget */}
          <motion.a
            href="https://pf.kakao.com/_HeShX"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 w-14 h-14 sm:w-auto sm:h-auto sm:px-5 sm:py-3.5 font-extrabold text-sm cursor-pointer"
            id="floating_kakao_btn"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span className="hidden sm:inline">24H 카톡 자격진단</span>
          </motion.a>

        </div>
      )}

      {/* DYNAMIC KAKAOTALK INTERACTIVE CHAT POPUP */}
      <AnimatePresence>
        {isKakaoOpen && (
          <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[550px] bg-[#9bbbd4] z-50 flex flex-col shadow-2xl sm:rounded-2xl border-2 border-yellow-400 overflow-hidden">
            
            {/* Chat Header */}
            <div className="bg-[#5a7b9a] px-4 py-3.5 flex items-center justify-between text-white border-b border-[#4d6a85]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
                  <Scale className="w-4 h-4 text-navy-950" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">행정구제 24H AI 자격진단</h4>
                  <p className="text-[10px] text-yellow-300 font-medium">행정사 1:1 진단 연계 채널</p>
                </div>
              </div>
              <button
                onClick={() => setIsKakaoOpen(false)}
                className="p-1 text-slate-200 hover:text-white rounded transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans bg-[#b2c7da]">
              
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%] space-y-1">
                    
                    {/* Bot Title */}
                    {msg.sender === "bot" && (
                      <span className="text-[10px] text-slate-700 ml-1 font-semibold">24시 구제 진단 봇</span>
                    )}

                    {/* Balloon */}
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        msg.sender === "user"
                          ? "bg-yellow-300 text-[#3C1E1E] rounded-tr-none font-medium"
                          : "bg-white text-slate-800 rounded-tl-none font-medium whitespace-pre-wrap"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Interactive Options below bot message */}
                    {msg.sender === "bot" && msg.options && (
                      <div className="flex flex-col gap-1.5 pt-2">
                        {msg.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => handleChatOption(opt)}
                            className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-[#122B4D] px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-between group active:scale-[0.98]"
                          >
                            <span>{opt}</span>
                            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-gold-500" />
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white px-3 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              )}

            </div>

            {/* Simulated Chat Input */}
            <div className="bg-white p-3 flex items-center gap-2 border-t border-slate-200">
              <input
                type="text"
                placeholder="답변 버튼을 누르거나 직접 기재하세요..."
                disabled
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-500 placeholder-slate-400 outline-none"
              />
              <button
                disabled
                className="w-8 h-8 bg-yellow-400 text-navy-950 rounded-full flex items-center justify-center opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-yellow-400 text-[10px] text-[#3C1E1E] text-center py-1.5 font-bold">
              ⚡ 분석을 통해 얻은 결과는 즉각 1:1 무료 문자 보고서로 전환됩니다.
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* LEAD SUBMISSION SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-[#071324]/80 backdrop-blur-sm"
              onClick={() => setShowSuccessModal(false)}
            />

            {/* Modal Box */}
            <div className="bg-[#0B1F3A] border-2 border-gold-500/50 p-6 sm:p-8 rounded-2xl max-w-md w-full relative z-10 shadow-2xl text-center space-y-6">
              
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto border border-gold-500">
                <CheckCircle2 className="w-8 h-8 text-gold-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">무료 상담 신청 완료</h3>
                <p className="text-sm text-gold-400 font-semibold">골든타임 대응반에 성공적으로 접수되었습니다.</p>
                <p className="text-xs text-slate-400 leading-relaxed pt-2">
                  작성해주신 농도 및 유형 데이터를 전담 행정사가 긴급 배정받아 면밀 분석을 시작합니다. <span className="text-white font-bold">30분 이내</span>에 기입하신 번호로 맞춤 유선 전화를 드리겠습니다.
                </p>
              </div>

              <div className="bg-[#071324] border border-[#122B4D] p-3.5 rounded-xl">
                <p className="text-xs text-red-400 font-bold">🚨 직통 전화 상담 연결 🚨</p>
                <p className="text-[11px] text-slate-400 mt-1">상담원이 바로 통화 연결을 통해 시간을 더 아끼시려면 대표전화로 유선 연결하십시오.</p>
                <a
                  href="tel:010-8114-4300"
                  className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors w-full justify-center"
                >
                  <Phone className="w-3.5 h-3.5" /> 010.8114.4300 즉시 무료 연결
                </a>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                확인 및 닫기
              </button>

            </div>

          </div>
        )}
      </AnimatePresence>

      {/* POLICY DETAILS MODAL */}
      <AnimatePresence>
        {policyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-[#071324]/80 backdrop-blur-sm"
              onClick={() => setPolicyModal(null)}
            />

            {/* Modal Box */}
            <div className="glass-panel-gold p-6 sm:p-8 rounded-2xl max-w-lg w-full relative z-10 shadow-2xl text-left space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-gold-500" />
                  {policyModal.title}
                </h3>
                <button
                  onClick={() => setPolicyModal(null)}
                  className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-sm text-slate-300 leading-relaxed max-h-96 overflow-y-auto pr-2 whitespace-pre-line">
                {policyModal.content}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setPolicyModal(null)}
                  className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE PERSISTENT FLOATING CTA - Slide in from bottom */}
      <AnimatePresence>
        {showFloatingWidget && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#050F1E]/90 backdrop-blur-lg border-t border-white/10 px-4 py-3 pb-safe shadow-2xl flex items-center gap-3"
          >
            <motion.a
              href="tel:010-8114-4300"
              whileTap={{ scale: 0.93 }}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-red-950/20"
            >
              <Phone className="w-4 h-4" />
              <span>긴급 직통 전화</span>
            </motion.a>
            <motion.button
              onClick={scrollToForm}
              whileTap={{ scale: 0.93 }}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 text-xs sm:text-sm font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-gold-500/15"
            >
              <Sparkles className="w-4 h-4" />
              <span>1:1 무료 진단받기</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Simple Helper Component
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
