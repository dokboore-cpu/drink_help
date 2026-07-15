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
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; options?: string[] }>>(
