import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Upload, LayoutDashboard, Info, Phone, LogIn, LogOut, UserPlus, 
  ShieldAlert, RefreshCw, Download, FileText, CheckCircle, AlertTriangle, 
  MapPin, Volume2, Globe, ArrowRight, User, Trash2, Database, BarChart2,
  TrendingUp, Award, Award as Trophy, MapPin as GpsIcon, Activity, HelpCircle
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.port === '5173' || window.location.port === '5174' 
    ? "http://localhost:8000" 
    : window.location.origin);

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    title: "VedicLivestock AI",
    subtitle: "AI-Powered Breed Recognition System",
    home: "Home",
    about: "About Project",
    upload: "Analyze Breed",
    dashboard: "Analytics Dashboard",
    admin: "Admin Control",
    contact: "Contact Us",
    login: "Log In",
    signup: "Sign Up",
    logout: "Log Out",
    welcome: "Welcome back",
    uploadTitle: "Drop Cattle or Buffalo Image Here",
    uploadDesc: "Supports JPEG, PNG up to 10MB",
    selectFile: "Browse files",
    cameraBtn: "Use Live Camera",
    captureBtn: "Capture Image",
    predicting: "AI is analyzing features...",
    resultTitle: "Prediction Result",
    confidence: "Confidence Score",
    animalType: "Livestock Group",
    origin: "Geographical Origin",
    milkProd: "Avg Milk Yield",
    characteristics: "Physical Features",
    availability: "State Availability",
    lifespan: "Avg Lifespan",
    suggestTitle: "Similar Breed Suggestions",
    diseaseRisk: "Health & Disease Risk Suggestion",
    speakBtn: "Read Aloud Details",
    gpsTitle: "Breed Distribution Map (Predominant Regions)",
  },
  ta: {
    title: "வேதிக்லைவ்ஸ்டாக் AI",
    subtitle: "செயற்கை நுண்ணறிவு கால்நடை இனம் கண்டறிதல்",
    home: "முகப்பு",
    about: "திட்டம் பற்றி",
    upload: "இனத்தை பகுப்பாய்",
    dashboard: "டாஷ்போர்டு",
    admin: "நிர்வாகக் குழு",
    contact: "தொடர்பு கொள்ள",
    login: "உள்நுழைய",
    signup: "பதிவு செய்க",
    logout: "வெளியேறுக",
    welcome: "மீண்டும் வருக",
    uploadTitle: "மாடு அல்லது எருமை படத்தைப் பதிவேற்றவும்",
    uploadDesc: "JPEG, PNG வடிவங்கள் (அதிகபட்சம் 10MB)",
    selectFile: "கோப்பைத் தேர்ந்தெடு",
    cameraBtn: "கேமராவைப் பயன்படுத்தவும்",
    captureBtn: "புகைப்படம் எடு",
    predicting: "AI பகுப்பாய்வு செய்கிறது...",
    resultTitle: "கண்டுபிடிப்பு முடிவு",
    confidence: "நம்பிக்கை சதவீதம்",
    animalType: "கால்நடை வகை",
    origin: "தோற்றம்",
    milkProd: "சராசரி பால் உற்பத்தி",
    characteristics: "உடல் பண்புகள்",
    availability: "கிடைக்கும் மாநிலங்கள்",
    lifespan: "சராசரி ஆயுட்காலம்",
    suggestTitle: "ஒத்த இனப் பரிந்துரைகள்",
    diseaseRisk: "சுகாதார ஆபத்து மற்றும் நோய் பரிந்துரைகள்",
    speakBtn: "விவரங்களைப் படிக்கவும்",
    gpsTitle: "இன விநியோக வரைபடம் (முக்கிய பகுதிகள்)",
  },
  hi: {
    title: "वैदिकलाइवस्टॉक AI",
    subtitle: "एआई-संचालित पशु नस्ल पहचान प्रणाली",
    home: "मुख्य पृष्ठ",
    about: "परियोजना विवरण",
    upload: "नस्ल का विश्लेषण",
    dashboard: "डैशबोर्ड विश्लेषण",
    admin: "एडमिन पैनल",
    contact: "संपर्क करें",
    login: "लॉग इन",
    signup: "साइन अप",
    logout: "लॉग आउट",
    welcome: "आपका स्वागत है",
    uploadTitle: "गाय या भैंस की फोटो यहां डालें",
    uploadDesc: "JPEG, PNG फाइलें (अधिकतम 10MB)",
    selectFile: "फ़ाइल चुनें",
    cameraBtn: "लाइव कैमरा इस्तेमाल करें",
    captureBtn: "फोटो खींचे",
    predicting: "एआई सुविधाओं का विश्लेषण कर रहा है...",
    resultTitle: "पूर्वानुमान परिणाम",
    confidence: "सटीकता स्कोर",
    animalType: "पशु का प्रकार",
    origin: "मूल स्थान",
    milkProd: "औसत दूध उत्पादन",
    characteristics: "शारीरिक विशेषताएँ",
    availability: "राज्य उपलब्धता",
    lifespan: "औसत जीवनकाल",
    suggestTitle: "समान नस्ल के सुझाव",
    diseaseRisk: "स्वास्थ्य एवं रोग जोखिम सुझाव",
    speakBtn: "विवरण बोलकर सुनाएं",
    gpsTitle: "नस्ल वितरण मानचित्र (प्रमुख क्षेत्र)",
  }
};

const DISEASE_SUGGESTIONS = {
  "Gir": {
    disease: "Mastitis & Milk Fever",
    prevention: "Ensure proper sanitization of cow sheds, wash udders with warm antiseptic water before milking. Feed calcium-rich mineral mixtures pre-lactation."
  },
  "Sahiwal": {
    disease: "Ticks Infestation & Tympany (Bloat)",
    prevention: "Regular application of herbal acaricides. Avoid sudden feeding of large amounts of wet leguminous green fodder."
  },
  "Red Sindhi": {
    disease: "Foot and Mouth Disease (FMD)",
    prevention: "Strict bi-annual vaccination schedule. Isolate sick animals immediately and disinfect stalls with sodium carbonate solution."
  },
  "Ongole": {
    disease: "Foot Rot & Haemorrhagic Septicaemia (HS)",
    prevention: "Keep hooves clean and dry during monsoon. Administer HS vaccines before the monsoon seasons."
  },
  "Tharparkar": {
    disease: "Ectoparasites & Heat Stress",
    prevention: "Though highly resistant, regular visual checkups for ticks are recommended. Provide cool drinking water during extreme peak summers."
  },
  "Hallikar": {
    disease: "Hoof Cracks & Joint Strain",
    prevention: "Regular trimming and inspection of draft hooves. Provide mineral supplements containing zinc and calcium for strong bones."
  },
  "Kangayam": {
    disease: "Dehydration & Joint Inflammation",
    prevention: "Ensure electrolyte water replacement after heavy field tasks. Treat minor leg abrasions early to prevent chronic joint swelling."
  },
  "Deoni": {
    disease: "Black Quarter (BQ)",
    prevention: "Inoculate with BQ vaccine annually before the rainy season. Promptly burn/bury carcasses of any infected stock."
  },
  "Murrah": {
    disease: "Lumpy Skin Disease (LSD) & Mastitis",
    prevention: "Routine vaccination for LSD. Clean the buffalo wallowing pond regularly to prevent waterborne bacterial infections."
  },
  "Jaffarabadi": {
    disease: "Hemorrhagic Septicemia (Gal Ghotu)",
    prevention: "Pre-monsoon vaccination. Avoid exposure to extreme cold winds in early winter, keep bedding dry."
  },
  "Surti": {
    disease: "Reproductive Disorders & Ketosis",
    prevention: "Maintain energy-balanced feed ration during early lactation. Monitor heat cycles carefully."
  },
  "Mehsana": {
    disease: "Subclinical Mastitis",
    prevention: "Perform regular strip cup tests to spot early udder thickening. Dry off udders properly post-milking."
  },
  "Pandharpuri": {
    disease: "Pneumonia during high humidity",
    prevention: "Ensure adequate cross-ventilation in barns. Protect calves from direct rainfall drafts."
  },
  "Bhadawari": {
    disease: "Fatty Liver Syndrome & Vitamin Deficiencies",
    prevention: "Given high milk fat production, ensure diets contain a balanced fat-to-fiber ratio. Supplement with Vitamin A & E."
  }
};

// Predominant coordinates of states for map visualization
const STATE_COORDS = {
  "Gujarat": { x: 28, y: 55 },
  "Rajasthan": { x: 30, y: 38 },
  "Maharashtra": { x: 36, y: 65 },
  "Madhya Pradesh": { x: 44, y: 52 },
  "Punjab": { x: 35, y: 22 },
  "Haryana": { x: 38, y: 28 },
  "Uttar Pradesh": { x: 50, y: 35 },
  "Delhi": { x: 40, y: 30 },
  "Andhra Pradesh": { x: 48, y: 78 },
  "Telangana": { x: 45, y: 70 },
  "Tamil Nadu": { x: 47, y: 90 },
  "Karnataka": { x: 36, y: 80 },
  "Kerala": { x: 42, y: 92 },
  "Bihar": { x: 62, y: 40 }
};

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [lang, setLang] = useState('en');
  const [user, setUser] = useState(null);
  
  // Auth state
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Upload/Prediction state
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Dashboard state
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);

  // Admin state
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminDatasets, setAdminDatasets] = useState([]);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [syncingDataset, setSyncingDataset] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const t = TRANSLATIONS[lang];

  // Check persistent login on load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch Dashboard Stats & History when Tab changes
  useEffect(() => {
    if (currentTab === 'dashboard') {
      fetchDashboardStats();
      fetchPredictionHistory();
    }
    if (currentTab === 'admin' && user?.role === 'admin') {
      fetchAdminUsers();
      fetchAdminDatasets();
      fetchPredictionHistory(); // Admins see all
    }
  }, [currentTab, user]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported on this browser.");
    }
  };

  const handleSpeechOutput = () => {
    if (!predictionResult) return;
    const r = predictionResult;
    const voiceText = lang === 'en' 
      ? `Predicted breed is ${r.predicted_breed}, which is a ${r.animal_type}. The confidence score is ${r.confidence}. This breed originated in ${r.breed_details.origin}. Its average milk production is ${r.breed_details.milk_production}.`
      : lang === 'ta'
      ? `கண்டறியப்பட்ட இனம் ${r.predicted_breed}. இது ஒரு ${r.animal_type === 'Cattle' ? 'மாடு' : 'எருமை'} ஆகும். இதன் துல்லியம் ${r.confidence}. இதன் பூர்வீகம் ${r.breed_details.origin}. இதன் சராசரி பால் உற்பத்தி ${r.breed_details.milk_production}.`
      : `पहचाना गया पशु नस्ल ${r.predicted_breed} है। यह एक ${r.animal_type === 'Cattle' ? 'गाय' : 'भैंस'} है। इसका शुद्धता स्कोर ${r.confidence} है। इसका मूल स्थान ${r.breed_details.origin} है। इसका औसत दूध उत्पादन ${r.breed_details.milk_production} है।`;
    speak(voiceText);
  };

  const fetchDashboardStats = async () => {
    try {
      const url = user ? `${API_BASE_URL}/api/dashboard/stats?username=${user.username}` : `${API_BASE_URL}/api/dashboard/stats`;
      const res = await fetch(url);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Failed to fetch dashboard stats", e);
    }
  };

  const fetchPredictionHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/history?username=${user.username}`);
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data);
      }
    } catch (e) {
      console.error("Failed to fetch admin users", e);
    }
  };

  const fetchAdminDatasets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/datasets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminDatasets(data);
      }
    } catch (e) {
      console.error("Failed to fetch datasets", e);
    }
  };

  const handleSyncDatasets = async () => {
    setSyncingDataset(true);
    setAdminSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/datasets/refresh`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminSuccess(data.message);
        fetchAdminDatasets();
      }
    } catch (e) {
      setAdminError("Failed to sync dataset counts.");
    } finally {
      setSyncingDataset(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setAdminError('');
    setAdminSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAdminSuccess("User deleted successfully.");
        fetchAdminUsers();
      } else {
        const data = await res.json();
        setAdminError(data.detail || "Failed to delete user.");
      }
    } catch (e) {
      setAdminError("Network error deleting user.");
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = ` वैदिकलाइवस्टॉक_रिपोर्ट_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      alert("Failed to export report CSV");
    }
  };

  const handleAuthSubmit = async (e, type) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authUsername || !authPassword) {
      setAuthError("All fields are required");
      return;
    }

    if (type === 'signup' && !authEmail) {
      setAuthError("Email is required for signup");
      return;
    }

    try {
      const endpoint = type === 'login' ? 'login' : 'register';
      const payload = type === 'login' 
        ? { username: authUsername, password: authPassword }
        : { username: authUsername, email: authEmail, password: authPassword };

      const res = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.detail || "Authentication failed");
        return;
      }

      if (type === 'signup') {
        setAuthSuccess("Registration successful! Please log in.");
        setAuthEmail('');
        setAuthPassword('');
      } else {
        // Logged in
        localStorage.setItem('token', data.access_token);
        const userData = { username: data.username, role: data.role };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setAuthUsername('');
        setAuthPassword('');
        setCurrentTab('home');
      }
    } catch (error) {
      setAuthError("Could not connect to authentication server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentTab('home');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setUploadError("Invalid file type. Only JPEG and PNG are supported.");
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setPredictionResult(null);
      setUploadError('');
    }
  };

  // Camera helpers
  const startCamera = async () => {
    setCameraActive(true);
    setPredictionResult(null);
    setImagePreview(null);
    setSelectedFile(null);
    setUploadError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) {
      setUploadError("Could not access camera feed. Check permissions.");
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(blob));
        stopCamera();
      }, 'image/jpeg');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      setUploadError("Please select or capture an image first.");
      return;
    }
    setIsPredicting(true);
    setUploadError('');
    setPredictionResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (user) {
      formData.append('username', user.username);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setPredictionResult(data);
      } else {
        const err = await res.json();
        setUploadError(err.detail || "Error predicting breed.");
      }
    } catch (e) {
      setUploadError("Network connection error. Check if backend is running.");
    } finally {
      setIsPredicting(false);
    }
  };

  // Helper for rendering GPS highlights on map of India
  const renderGPSRegions = (breed) => {
    const breedDetails = predictionResult?.breed_details || {};
    const states = breedDetails.state_availability ? breedDetails.state_availability.split(',').map(s => s.trim()) : [];
    
    return (
      <div className="relative w-full h-[320px] bg-slate-900/60 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center p-4">
        {/* Simple simulated SVG Outline Map of India (conceptual representation for demo) */}
        <svg viewBox="0 0 100 100" className="w-[280px] h-[280px] text-slate-700 opacity-80">
          {/* Rough schematic paths representing India boundary */}
          <path 
            d="M38 12 L43 20 L40 28 L45 32 L40 40 L35 42 L25 50 L28 60 L38 68 L34 76 L38 88 L43 94 L47 88 L46 80 L52 74 L55 60 L62 55 L75 52 L82 45 L68 38 L58 35 L52 28 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1"
            className="text-white/10"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1">
            <GpsIcon className="w-3 h-3 text-brandBlue animate-pulse" /> Live Distribution Nodes
          </span>
          <span className="text-[10px] text-slate-500">Note: Points represent historical breeding zones.</span>
        </div>

        {/* Dynamic highlights based on breed states */}
        {states.map((state, i) => {
          const coords = STATE_COORDS[state] || { x: 50 + (i * 5), y: 50 - (i * 8) };
          return (
            <div 
              key={state}
              className="absolute group flex flex-col items-center"
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            >
              <div className="w-3.5 h-3.5 bg-brandGreen/40 border border-brandGreen rounded-full flex items-center justify-center animate-ping absolute" />
              <div className="w-3 h-3 bg-brandGreen border-2 border-white rounded-full relative flex items-center justify-center cursor-pointer shadow-lg shadow-brandGreen/40" />
              <div className="bg-slate-950/90 text-white text-[10px] py-0.5 px-1.5 rounded border border-white/10 mt-1 pointer-events-auto backdrop-blur-sm whitespace-nowrap shadow-xl">
                {state}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 flex flex-col font-outfit select-none relative overflow-hidden">
      {/* Background glow animations */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none" />

      {/* --- HEADER NAVBAR --- */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-darkBg/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brandBlue to-brandGreen flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Camera className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-none">
                {t.title}
              </h1>
              <p className="text-[10px] text-slate-500 tracking-wide mt-0.5">{t.subtitle}</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1.5">
            {[
              { id: 'home', label: t.home, icon: Globe },
              { id: 'about', label: t.about, icon: Info },
              { id: 'upload', label: t.upload, icon: Camera },
              { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
              { id: 'contact', label: t.contact, icon: Phone },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  currentTab === tab.id 
                    ? 'bg-blue-600/10 text-brandBlue border border-blue-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}

            {user?.role === 'admin' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  currentTab === 'admin' 
                    ? 'bg-amber-600/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                {t.admin}
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-900/60 border border-white/5 rounded-lg p-0.5">
              {['en', 'ta', 'hi'].map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-all ${
                    lang === l ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">{user.username}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500">{user.role}</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-2 rounded-lg bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setCurrentTab('auth')} 
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-blue-600/10"
              >
                <LogIn className="w-4 h-4" />
                {t.login}
              </button>
            )}
          </div>

        </div>
      </header>

      {/* --- MAIN PAGE CONTENT CONTAINER --- */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <AnimatePresence mode="wait">
          
          {/* 1. HOME TAB */}
          {currentTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Hero Banner */}
              <div className="text-center max-w-3xl mx-auto space-y-6 pt-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-brandBlue">
                  <span className="w-1.5 h-1.5 rounded-full bg-brandBlue animate-ping" />
                  National Agri-Tech Digital Prototype
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Next-Gen Indian <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandBlue to-brandGreen">Livestock Breed</span> Recognition
                </h1>
                <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
                  A state-of-the-art Deep Learning framework built to classify 14 core indigenous cattle and buffalo breeds of India. Supporting rural dairy farmers and veterinary experts with instant analytics.
                </p>
                <div className="flex justify-center gap-4 pt-2">
                  <button 
                    onClick={() => setCurrentTab('upload')} 
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all"
                  >
                    Start AI Analysis <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setCurrentTab('about')} 
                    className="px-6 py-3 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 transition-all font-semibold"
                  >
                    Technical Report
                  </button>
                </div>
              </div>

              {/* Grid Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Database className="w-5 h-5 text-brandBlue" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Full-Spectrum Breeds</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Trained directly on 14 major Indian cattle & buffalo classes including high-yield dairy Gir, Sahiwal, Murrah, Surti, and elite draught breeds like Hallikar.
                  </p>
                </div>

                <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-brandGreen" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Smart Decision Support</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Provides multi-lingual voice outputs, real-time camera processing, historical statistics tracking, geographical maps, and disease suggestions.
                  </p>
                </div>

                <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Academic Prototype</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Tailored with clean FastAPI routes, SQLAlchemy database mapping, PyTorch CNN models, and user/admin dashboards perfect for final-year showcases.
                  </p>
                </div>
              </div>

              {/* Quick Info Stats */}
              <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-blue-950/10 to-emerald-950/10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <h4 className="text-3xl md:text-4xl font-extrabold text-white">14</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Breeds Supported</p>
                  </div>
                  <div>
                    <h4 className="text-3xl md:text-4xl font-extrabold text-white">96.5%</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Target Accuracy</p>
                  </div>
                  <div>
                    <h4 className="text-3xl md:text-4xl font-extrabold text-white">3+</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Languages</p>
                  </div>
                  <div>
                    <h4 className="text-3xl md:text-4xl font-extrabold text-white">&lt; 1s</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Inference Speed</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. ABOUT TAB */}
          {currentTab === 'about' && (
            <motion.div 
              key="about"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 max-w-4xl mx-auto"
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-extrabold text-white">Project Abstract</h2>
                <div className="glass-panel p-6 rounded-2xl text-slate-300 leading-relaxed text-sm space-y-4">
                  <p>
                    This project presents an artificial intelligence-driven web prototype focused on the automated identification of native Indian cattle and buffalo breeds. Traditional breed identification relies on visual inspections by experts, which can be error-prone and unavailable in remote rural districts. Using a custom Convolutional Neural Network (CNN) architecture built on PyTorch, this system categorizes livestock into 14 distinct breeds based on uploaded images or live camera frames.
                  </p>
                  <p>
                    The system implements standard digital image preprocessing (resizing to 224x224, pixel-value normalization, and data augmentation) and provides a secure, role-based multi-user web dashboard. In addition to predictions, the system returns detailed profiles (such as average milk yields, state distribution maps, and specific disease liabilities) to deliver actionable veterinary guidance directly to farmers.
                  </p>
                </div>
              </div>

              {/* Model Architecture Section */}
              <div className="space-y-4">
                <h2 className="text-3xl font-extrabold text-white">System Architecture & Pipeline</h2>
                <div className="glass-panel p-6 rounded-2xl space-y-6">
                  {/* Schematic representation of pipeline */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 text-center">
                    <div className="bg-slate-900 border border-white/10 p-3 rounded-xl w-full md:w-auto">
                      <div className="text-xs font-bold text-brandBlue uppercase">1. Image Input</div>
                      <div className="text-[10px] text-slate-500 mt-1">Gallery / Live Camera Feed</div>
                    </div>
                    <div className="text-slate-500 font-bold">→</div>
                    <div className="bg-slate-900 border border-white/10 p-3 rounded-xl w-full md:w-auto">
                      <div className="text-xs font-bold text-brandBlue uppercase">2. Preprocessing</div>
                      <div className="text-[10px] text-slate-500 mt-1">224x224 Resize, Normalize</div>
                    </div>
                    <div className="text-slate-500 font-bold">→</div>
                    <div className="bg-slate-900 border border-white/10 p-3 rounded-xl w-full md:w-auto">
                      <div className="text-xs font-bold text-brandBlue uppercase">3. CNN Classifier</div>
                      <div className="text-[10px] text-slate-500 mt-1">PyTorch Feature Extraction</div>
                    </div>
                    <div className="text-slate-500 font-bold">→</div>
                    <div className="bg-slate-900 border border-white/10 p-3 rounded-xl w-full md:w-auto">
                      <div className="text-xs font-bold text-brandBlue uppercase">4. Softmax Output</div>
                      <div className="text-[10px] text-slate-500 mt-1">Class Probabilities (14 classes)</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white">Neural Network Specifications</h4>
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400">
                          <th className="py-2">Layer Group</th>
                          <th className="py-2">Layer Type</th>
                          <th className="py-2">Dimensions Out</th>
                          <th className="py-2">Activation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        <tr>
                          <td className="py-2 font-mono text-brandBlue">Input Layer</td>
                          <td className="py-2">RGB Image Tensor</td>
                          <td className="py-2">3 x 224 x 224</td>
                          <td className="py-2">-</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-brandBlue">Conv2D Block 1</td>
                          <td className="py-2">Convolution + MaxPool</td>
                          <td className="py-2">16 x 112 x 112</td>
                          <td className="py-2">ReLU</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-brandBlue">Conv2D Block 2</td>
                          <td className="py-2">Convolution + MaxPool</td>
                          <td className="py-2">32 x 56 x 56</td>
                          <td className="py-2">ReLU</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-brandBlue">Conv2D Block 3</td>
                          <td className="py-2">Convolution + MaxPool</td>
                          <td className="py-2">64 x 28 x 28</td>
                          <td className="py-2">ReLU</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-brandBlue">Dense Head 1</td>
                          <td className="py-2">Flatten + Linear + Dropout</td>
                          <td className="py-2">128</td>
                          <td className="py-2">ReLU + Dropout(0.3)</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-brandBlue">Dense Head 2</td>
                          <td className="py-2">Linear Out</td>
                          <td className="py-2">14 classes</td>
                          <td className="py-2">Softmax</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. UPLOAD TAB */}
          {currentTab === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* File Upload / Camera Capture Panel */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Livestock Input Source</h2>
                    {cameraActive && (
                      <button 
                        onClick={stopCamera}
                        className="text-xs px-2.5 py-1 rounded bg-red-950/20 border border-red-500/20 text-red-400"
                      >
                        Cancel Camera
                      </button>
                    )}
                  </div>

                  {uploadError && (
                    <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      {uploadError}
                    </div>
                  )}

                  {/* Camera view or File drag area */}
                  {cameraActive ? (
                    <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                        <button 
                          onClick={capturePhoto}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg text-sm font-semibold shadow-lg shadow-emerald-500/20"
                        >
                          <Camera className="w-4 h-4" />
                          {t.captureBtn}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {imagePreview ? (
                        <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
                          <img src={imagePreview.startsWith('blob:') ? imagePreview : `${API_BASE_URL}/${imagePreview}`} alt="Preview" className="max-h-full max-w-full object-contain" />
                          <button
                            onClick={() => { setSelectedFile(null); setImagePreview(null); setPredictionResult(null); }}
                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-900/30 hover:bg-slate-900/50 transition-all aspect-video">
                          <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                          <div className="w-12 h-12 rounded-full bg-blue-500/5 flex items-center justify-center border border-blue-500/10">
                            <Upload className="w-6 h-6 text-brandBlue" />
                          </div>
                          <span className="text-sm font-semibold text-white">{t.uploadTitle}</span>
                          <span className="text-xs text-slate-500">{t.uploadDesc}</span>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-600/10 border border-blue-500/20 text-brandBlue mt-1">
                            {t.selectFile}
                          </span>
                        </label>
                      )}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-4">
                    {!cameraActive && (
                      <button
                        onClick={startCamera}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 transition-all font-semibold"
                      >
                        <Camera className="w-5 h-5 text-brandBlue" />
                        {t.cameraBtn}
                      </button>
                    )}
                    
                    <button
                      onClick={handlePredict}
                      disabled={!selectedFile || isPredicting}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                        selectedFile && !isPredicting
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
                          : 'bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isPredicting ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin text-brandBlue" />
                          {t.predicting}
                        </>
                      ) : (
                        "Analyze Breed"
                      )}
                    </button>
                  </div>

                </div>

                {/* Predict Result / Empty Info State Panel */}
                <div className="flex flex-col gap-6">
                  {predictionResult ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-panel p-6 rounded-2xl flex flex-col gap-6"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <CheckCircle className="w-5.5 h-5.5 text-brandGreen animate-bounce" />
                          {t.resultTitle}
                        </h2>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSpeechOutput}
                            className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/20 text-brandBlue hover:bg-blue-600 hover:text-white transition-all"
                            title={t.speakBtn}
                          >
                            <Volume2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>

                      {/* Primary Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{t.animalType}</div>
                          <div className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${predictionResult.animal_type === 'Cattle' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                            {predictionResult.animal_type}
                          </div>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Predicted Breed</div>
                          <div className="text-lg font-bold text-white mt-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                            {predictionResult.predicted_breed}
                          </div>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 col-span-2">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{t.confidence}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-2xl font-extrabold text-brandGreen">{predictionResult.confidence}</span>
                            <div className="flex-1 bg-slate-950 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-brandBlue to-brandGreen h-full rounded-full transition-all duration-500" 
                                style={{ width: predictionResult.confidence }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Breed Spec Details */}
                      <div className="space-y-3.5">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-semibold">{t.origin}</span>
                          <span className="text-sm text-slate-200 font-medium mt-0.5">{predictionResult.breed_details.origin}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-semibold">{t.milkProd}</span>
                          <span className="text-sm text-slate-200 font-medium mt-0.5">{predictionResult.breed_details.milk_production}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-semibold">{t.characteristics}</span>
                          <span className="text-sm text-slate-300 leading-relaxed mt-0.5 text-justify">{predictionResult.breed_details.physical_characteristics}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-semibold">{t.availability}</span>
                            <span className="text-xs text-slate-200 font-medium mt-0.5">{predictionResult.breed_details.state_availability}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-semibold">{t.lifespan}</span>
                            <span className="text-xs text-slate-200 font-medium mt-0.5">{predictionResult.breed_details.average_lifespan}</span>
                          </div>
                        </div>
                      </div>

                      {/* Suggestions list */}
                      <div className="border-t border-white/5 pt-4">
                        <div className="text-xs text-slate-500 font-semibold mb-2">{t.suggestTitle}</div>
                        <div className="flex gap-2 flex-wrap">
                          {predictionResult.similar_suggestions.map(s => (
                            <span key={s} className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-white/10 text-slate-300 font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                    </motion.div>
                  ) : (
                    <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-4 h-full min-h-[300px]">
                      <HelpCircle className="w-12 h-12 text-slate-600 animate-pulse" />
                      <div>
                        <h3 className="text-lg font-bold text-white">Awaiting Analysis</h3>
                        <p className="text-slate-500 text-xs mt-1 max-w-xs mx-auto">
                          Upload an image of an Indian cow or buffalo and run the classification engine to generate the AI results.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Extra advanced features panel - Disease suggestions */}
                  {predictionResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-panel p-5 rounded-2xl flex flex-col gap-3"
                    >
                      <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        {t.diseaseRisk}
                      </h3>
                      {(() => {
                        const diseaseInfo = DISEASE_SUGGESTIONS[predictionResult.predicted_breed] || { disease: "N/A", prevention: "N/A" };
                        return (
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-slate-400 font-semibold">Common Liability: </span>
                              <span className="text-amber-400 font-bold">{diseaseInfo.disease}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-semibold">Preventative Guidelines: </span>
                              <p className="text-slate-300 leading-relaxed mt-1 text-justify">{diseaseInfo.prevention}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                </div>
              </div>

              {/* Advanced distribution map displayed under primary panels */}
              {predictionResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 gap-6"
                >
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5.5 h-5.5 text-brandBlue" />
                      {t.gpsTitle}
                    </h3>
                    {renderGPSRegions(predictionResult.predicted_breed)}
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}

          {/* 4. ANALYTICS DASHBOARD TAB */}
          {currentTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Stat Boxes */}
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <BarChart2 className="w-6 h-6 text-brandBlue" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total Audits</div>
                      <div className="text-2xl font-bold text-white mt-0.5">{stats.total_predictions}</div>
                    </div>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-brandGreen" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Common Breed</div>
                      <div className="text-lg font-bold text-white mt-0.5 truncate max-w-[150px]">{stats.most_detected_breed}</div>
                    </div>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Mean Confidence</div>
                      <div className="text-2xl font-bold text-white mt-0.5">{stats.average_accuracy}%</div>
                    </div>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Database className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Cattle / Buffalo</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {stats.cattle_count} Cows / {stats.buffalo_count} Buffs
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts Section */}
              {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Timeline Line Chart */}
                  <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-base font-bold text-white mb-4">Historical Audit Activity (Last 7 Days)</h3>
                    <div className="h-[260px]">
                      <Line 
                        data={{
                          labels: stats.history_timeline.labels,
                          datasets: [{
                            label: 'Predictions Run',
                            data: stats.history_timeline.values,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
                            x: { grid: { display: false }, ticks: { color: '#64748b' } }
                          },
                          plugins: { legend: { display: false } }
                        }}
                      />
                    </div>
                  </div>

                  {/* Breed Distribution Pie Chart */}
                  <div className="glass-panel p-6 rounded-2xl flex flex-col">
                    <h3 className="text-base font-bold text-white mb-4">Breed Distribution (Volume)</h3>
                    <div className="h-[220px] flex items-center justify-center">
                      {stats.breed_distribution.labels.length > 0 ? (
                        <Pie 
                          data={{
                            labels: stats.breed_distribution.labels,
                            datasets: [{
                              data: stats.breed_distribution.values,
                              backgroundColor: [
                                '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', 
                                '#06b6d4', '#14b8a6', '#f43f5e', '#a855f7', '#6366f1'
                              ],
                              borderWidth: 1,
                              borderColor: '#1e293b'
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'right', ticks: { color: '#94a3b8' } } }
                          }}
                        />
                      ) : (
                        <div className="text-xs text-slate-500">No predictions recorded yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* History Table */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4">Audit History Log</h3>
                {history.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400">
                          <th className="py-2.5 px-3">Thumbnail</th>
                          <th className="py-2.5 px-3">Group</th>
                          <th className="py-2.5 px-3">Predicted Breed</th>
                          <th className="py-2.5 px-3">Confidence</th>
                          <th className="py-2.5 px-3">Time Run</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {history.map(row => (
                          <tr key={row.id} className="hover:bg-white/5">
                            <td className="py-2 px-3">
                              <div className="w-12 h-10 rounded overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center">
                                <img src={`${API_BASE_URL}/${row.image_path}`} alt="Log Thumbnail" className="max-h-full max-w-full object-cover" />
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.animal_type === 'Cattle' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {row.animal_type}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-semibold">{row.predicted_breed}</td>
                            <td className="py-2 px-3 text-brandGreen font-bold">{row.confidence}%</td>
                            <td className="py-2 px-3 text-slate-500">{new Date(row.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No prediction history found. Start by running an analysis.
                  </div>
                )}
              </div>

              {/* Show Model Training Metrics Images if available */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-5 h-5 text-brandBlue" />
                    Deep Learning Training Metrics (Loss & Accuracy curves)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center min-h-[220px]">
                    {/* Live plot rendering from API */}
                    <img 
                      src={`${API_BASE_URL}/charts/training_metrics.png`} 
                      alt="Loss & Accuracy Graphs" 
                      className="max-h-[260px] rounded-lg border border-white/5 shadow-2xl"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=400"; // Fallback placeholder
                      }}
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-3 text-xs leading-relaxed text-slate-400">
                    <p className="text-slate-200 font-semibold text-sm">Transfer Learning Performance:</p>
                    <p>
                      The model is trained on custom augmented subsets of Gir, Sahiwal, Murrah and surrounding Indian livestock pictures. Early stopping prevents overfitting.
                    </p>
                    <p>
                      The learning curves on the left showcase convergence across epochs. Validation checkpoints monitor real-time model stability.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* 5. ADMIN CONTROL PANEL TAB */}
          {currentTab === 'admin' && user?.role === 'admin' && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-7 h-7 text-amber-500" />
                  Admin Control Panel
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow"
                  >
                    <Download className="w-4 h-4" /> Export CSV Report
                  </button>
                  <button
                    onClick={handleSyncDatasets}
                    disabled={syncingDataset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 text-xs text-slate-300 font-bold hover:bg-slate-800 transition-all"
                  >
                    {syncingDataset ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-brandBlue" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-brandBlue" />
                    )}
                    Sync Dataset Folder
                  </button>
                </div>
              </div>

              {adminSuccess && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs">
                  {adminSuccess}
                </div>
              )}

              {adminError && (
                <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs">
                  {adminError}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Users Management */}
                <div className="glass-panel p-5 rounded-xl space-y-4 lg:col-span-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <User className="w-4.5 h-4.5 text-brandBlue" />
                    Manage Users ({adminUsers.length})
                  </h3>
                  <div className="max-h-[350px] overflow-y-auto divide-y divide-white/5 space-y-2">
                    {adminUsers.map(u => (
                      <div key={u.id} className="pt-2 flex items-center justify-between text-xs">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold">{u.username}</span>
                          <span className="text-[10px] text-slate-500">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.2 rounded-[4px] text-[9px] uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.role}
                          </span>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1 rounded hover:bg-red-500/20 text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dataset Counts */}
                <div className="glass-panel p-5 rounded-xl space-y-4 lg:col-span-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Database className="w-4.5 h-4.5 text-brandGreen" />
                    Dataset Directory Metrics (Images count)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-2">
                    {adminDatasets.map(ds => (
                      <div key={ds.id} className="bg-slate-900/60 p-3 rounded-lg border border-white/5 flex flex-col justify-between">
                        <span className="text-xs text-white font-bold">{ds.breed_name}</span>
                        <span className="text-[10px] text-slate-500">{ds.animal_type}</span>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                          <span className="text-[10px] text-slate-400">Images:</span>
                          <span className="text-xs font-extrabold text-brandBlue">{ds.image_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* View uploaded history images */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4">Live Captured Database Assets</h3>
                {history.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {history.map(row => (
                      <div key={row.id} className="bg-slate-900/40 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
                        <div className="w-full aspect-video rounded overflow-hidden bg-slate-950 flex items-center justify-center">
                          <img src={`${API_BASE_URL}/${row.image_path}`} alt="Cattle upload" className="max-h-full max-w-full object-cover" />
                        </div>
                        <div className="text-[9px]">
                          <span className="font-bold text-white block truncate">{row.predicted_breed}</span>
                          <span className="text-slate-500 block truncate">{new Date(row.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">No images stored in history database yet.</div>
                )}
              </div>

            </motion.div>
          )}

          {/* 6. CONTACT TAB */}
          {currentTab === 'contact' && (
            <motion.div 
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <h2 className="text-3xl font-extrabold text-white text-center">Contact Developers</h2>
              <p className="text-slate-400 text-center text-sm max-w-md mx-auto">
                Have questions regarding the Deep Learning model weights, or integration code? Feel free to contact our development team.
              </p>
              
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Institution</span>
                    <span className="text-sm font-semibold text-white mt-1">National Institute of Agri-Tech</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Email Support</span>
                    <span className="text-sm font-semibold text-brandBlue mt-1">support@vediclivestock.res.in</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-3">Project Lead Developers</span>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="font-bold text-white">Shree K.</span>
                      <span>Lead DL Engineer (B.Tech Final Year)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-white">Antigravity AI</span>
                      <span>Co-Developer Agent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample demo support contact form */}
              <form className="glass-panel p-6 rounded-2xl space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Feedback sent! Thank you."); }}>
                <h3 className="text-sm font-bold text-white">Send Project Feedback</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Your Name" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" required />
                  <textarea placeholder="Message..." rows="4" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" required></textarea>
                  <button type="submit" className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow">
                    Submit Feedback
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* 7. AUTH LOGIN/SIGNUP TAB */}
          {currentTab === 'auth' && (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6">
                
                {/* Header Switcher */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <button
                    onClick={() => { setIsAdminMode(false); setAuthError(''); setAuthSuccess(''); }}
                    className={`text-sm font-bold ${!isAdminMode ? 'text-brandBlue' : 'text-slate-400 hover:text-white'}`}
                  >
                    User Login / Signup
                  </button>
                  <button
                    onClick={() => { setIsAdminMode(true); setAuthError(''); setAuthSuccess(''); }}
                    className={`text-sm font-bold ${isAdminMode ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}
                  >
                    Admin Access
                  </button>
                </div>

                {authSuccess && (
                  <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {authSuccess}
                  </div>
                )}

                {authError && (
                  <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {authError}
                  </div>
                )}

                {/* Form fields */}
                {isAdminMode ? (
                  <form onSubmit={(e) => handleAuthSubmit(e, 'login')} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Admin Username</label>
                      <input 
                        type="text" 
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        placeholder="e.g. admin" 
                        className="bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500/60"
                        required 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Admin Security Password</label>
                      <input 
                        type="password" 
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500/60"
                        required 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs transition-all shadow-md shadow-amber-500/10"
                    >
                      Authenticate Admin Credentials
                    </button>
                    <div className="text-[10px] text-slate-500 text-center">
                      Hint: Use default credentials <b>admin</b> / <b>admin123</b>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* User forms (both login and register stacked for simple UX tabs) */}
                    <div className="space-y-4">
                      <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold">Sign In to Dashboard</h3>
                      <form onSubmit={(e) => handleAuthSubmit(e, 'login')} className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Username" 
                          value={authUsername}
                          onChange={(e) => setAuthUsername(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" 
                          required 
                        />
                        <input 
                          type="password" 
                          placeholder="Password" 
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" 
                          required 
                        />
                        <button type="submit" className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow">
                          Log In
                        </button>
                        <div className="text-[10px] text-slate-500 text-center">
                          Hint: Use standard user <b>farmer</b> / <b>farmer123</b>
                        </div>
                      </form>
                    </div>

                    <div className="border-t border-white/5 pt-4 space-y-4">
                      <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold">New Account Registration</h3>
                      <form onSubmit={(e) => handleAuthSubmit(e, 'signup')} className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="New Username" 
                          value={authUsername}
                          onChange={(e) => setAuthUsername(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" 
                          required 
                        />
                        <input 
                          type="email" 
                          placeholder="Email Address" 
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" 
                          required 
                        />
                        <input 
                          type="password" 
                          placeholder="Password" 
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" 
                          required 
                        />
                        <button type="submit" className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow">
                          Register Account
                        </button>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* --- FOOTER SECTION --- */}
      <footer className="border-t border-white/5 py-6 bg-slate-950/40 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} VedicLivestock AI Prototype. Designed for National Animal Husbandry Project Showcase.</p>
          <div className="flex gap-4">
            <a onClick={() => setCurrentTab('about')} className="cursor-pointer hover:text-white transition-all">Documentation</a>
            <a onClick={() => setCurrentTab('contact')} className="cursor-pointer hover:text-white transition-all">Support Desk</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
