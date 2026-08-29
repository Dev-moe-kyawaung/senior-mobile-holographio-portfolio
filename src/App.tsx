import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TypeAnimation } from 'react-type-animation';
import {
  FiCompass, FiRadio, FiActivity, FiShield, FiCpu,
  FiMaximize2, FiExternalLink, FiVolume2, FiVolumeX,
  FiCopy, FiCheck, FiMapPin, FiSearch, FiSliders,
  FiShare2, FiPhone, FiMail, FiEye
} from 'react-icons/fi';
import {
  FaSatellite, FaGlobeAmericas, FaGithub,
  FaLinkedin, FaYoutube, FaRedditAlien, FaTumblr, FaSlack,
  FaRocket, FaAndroid
} from 'react-icons/fa';

/* ═══════════════════════════════════════════════════════
   WEB AUDIO API — HOLOGRAPHIC SOUND EFFECTS
   ═══════════════════════════════════════════════════════ */
const playHoloSound = (type: 'beam' | 'nodeSelect' | 'layerSwitch' | 'aiVoice' | 'chime') => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'beam') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.35);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'nodeSelect') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'layerSwitch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.setValueAtTime(1050, now + 0.05);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'aiVoice') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.06);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'chime') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // Audio may be restricted before interaction
  }
};

/* ═══════════════════════════════════════════════════════
   3D OMNI-SPHERE CANVAS WITH INTERACTIVE ROTATING NODES
   ═══════════════════════════════════════════════════════ */
interface OmniNode {
  id: number;
  title: string;
  lat: number;
  lon: number;
  color: string;
  icon: string;
  category: string;
}

interface OmniSphereCanvasProps {
  mode: 'architecture' | 'apps' | 'network';
  onSelectNode: (id: number) => void;
  activeNodeId: number | null;
}

const OmniSphereCanvas: React.FC<OmniSphereCanvasProps> = ({ mode, onSelectNode, activeNodeId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef({ x: 0.35, y: 0.6 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // 16 Application Nodes mapped around the 3D Sphere coordinates
  const nodes: OmniNode[] = useMemo(() => {
    return [
      { id: 1, title: "Social Dashboard", lat: 0.35, lon: 0.1, color: "#00f0ff", icon: "📱", category: "Analytics" },
      { id: 2, title: "PWA App", lat: -0.4, lon: 0.8, color: "#38bdf8", icon: "🌐", category: "PWA" },
      { id: 3, title: "Admin Dashboard", lat: 0.75, lon: 1.5, color: "#f59e0b", icon: "📊", category: "Enterprise" },
      { id: 4, title: "Stock Market", lat: -0.2, lon: 2.2, color: "#00f0ff", icon: "📈", category: "Fintech" },
      { id: 5, title: "Game Collection", lat: 0.6, lon: 2.9, color: "#a855f7", icon: "🎮", category: "Arcade" },
      { id: 6, title: "Music Player", lat: -0.65, lon: 3.6, color: "#ec4899", icon: "🎵", category: "Audio" },
      { id: 7, title: "Chat App", lat: 0.15, lon: 4.2, color: "#14b8a6", icon: "💬", category: "P2P" },
      { id: 8, title: "World Cup", lat: -0.3, lon: 4.9, color: "#f59e0b", icon: "⚽", category: "Sports" },
      { id: 9, title: "E-Commerce", lat: 0.5, lon: 5.5, color: "#f97316", icon: "🛒", category: "Retail" },
      { id: 10, title: "Portfolio Hub", lat: -0.55, lon: 6.1, color: "#00f0ff", icon: "💼", category: "Showcase" },
      { id: 11, title: "Money Tracker", lat: 0.25, lon: 1.1, color: "#facc15", icon: "💰", category: "Fintech" },
      { id: 12, title: "Weather Radar", lat: -0.7, lon: 1.9, color: "#38bdf8", icon: "🌤️", category: "Atmosphere" },
      { id: 13, title: "Crypto Vault", lat: 0.45, lon: 2.6, color: "#a855f7", icon: "💸", category: "Web3" },
      { id: 14, title: "JS Todo Master", lat: -0.15, lon: 3.3, color: "#ec4899", icon: "📝", category: "Tool" },
      { id: 15, title: "Video Player Pro", lat: 0.68, lon: 4.5, color: "#00f0ff", icon: "🎯", category: "Media" },
      { id: 16, title: "LEGEND! Android Suite", lat: 0.0, lon: 0.0, color: "#f59e0b", icon: "🔥", category: "Flagship" }
    ];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 550);

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', onResize);

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      rotRef.current.y += dx * 0.008;
      rotRef.current.x += dy * 0.008;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // 3D rotation helper
    const project = (lat: number, lon: number, r: number, cx: number = width / 2, cy: number = height / 2) => {
      const rx = rotRef.current.x;
      const ry = rotRef.current.y;

      // Spherical to Cartesian
      const x = r * Math.cos(lat) * Math.sin(lon);
      const y = r * Math.sin(lat);
      const z = r * Math.cos(lat) * Math.cos(lon);

      // Rotate around X
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;

      // Rotate around Y
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;

      const fov = 480;
      const scale = fov / (fov + z2);
      return {
        px: cx + x2 * scale,
        py: cy + y1 * scale,
        pz: z2,
        scale
      };
    };

    const onClickCanvas = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const r = Math.min(width, height) * 0.36;
      let closestId: number | null = null;
      let minDist = 32;

      nodes.forEach(node => {
        const p = project(node.lat, node.lon, r * 1.04, width / 2, height / 2);
        if (p.pz > -r * 0.3) {
          const d = Math.hypot(p.px - clickX, p.py - clickY);
          if (d < minDist) {
            minDist = d;
            closestId = node.id;
          }
        }
      });

      if (closestId !== null) {
        onSelectNode(closestId);
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('click', onClickCanvas);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Generate sphere particle points
    const sphereRadius = Math.min(width, height) * 0.36;
    const numPoints = 260;
    const points: Array<{ lat: number; lon: number }> = [];
    for (let i = 0; i < numPoints; i++) {
      const lat = Math.asin(-1 + (2 * i) / numPoints);
      const lon = Math.sqrt(numPoints * Math.PI) * lat;
      points.push({ lat, lon });
    }

    const render = () => {
      if (!isDraggingRef.current) {
        rotRef.current.y += 0.0035; // auto-spin around Y axis
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw Volumetric Ambient Halo behind Omni-Sphere
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sphereRadius * 1.3);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
      grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Draw Concentric Holographic Latitude Rings
      ctx.lineWidth = 1;
      [-0.6, -0.3, 0, 0.3, 0.6].forEach(latAngle => {
        ctx.beginPath();
        const steps = 60;
        for (let s = 0; s <= steps; s++) {
          const lonAngle = (s / steps) * Math.PI * 2;
          const p = project(latAngle, lonAngle, sphereRadius);
          if (s === 0) ctx.moveTo(p.px, p.py);
          else ctx.lineTo(p.px, p.py);
        }
        ctx.strokeStyle = latAngle === 0 ? 'rgba(0, 240, 255, 0.28)' : 'rgba(59, 130, 246, 0.12)';
        ctx.stroke();
      });

      // Draw 3D Sphere Particles
      points.forEach(pt => {
        const p = project(pt.lat, pt.lon, sphereRadius);
        const alpha = Math.max(0.08, (p.pz + sphereRadius) / (2 * sphereRadius));
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.75})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(0.75, p.scale * 1.6), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Outer Orbiting Equatorial Hologram Ring
      ctx.beginPath();
      const ringSteps = 80;
      const outerRingR = sphereRadius * 1.28;
      for (let s = 0; s <= ringSteps; s++) {
        const angle = (s / ringSteps) * Math.PI * 2;
        const p = project(0.25 * Math.sin(angle), angle, outerRingR);
        if (s === 0) ctx.moveTo(p.px, p.py);
        else ctx.lineTo(p.px, p.py);
      }
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Interactive Application Nodes
      nodes.forEach(node => {
        const p = project(node.lat, node.lon, sphereRadius * 1.04);
        const isFront = p.pz > -sphereRadius * 0.65;
        const isSelected = node.id === activeNodeId;

        if (isFront) {
          // Node halo glow
          ctx.beginPath();
          ctx.arc(p.px, p.py, isSelected ? 18 : 12 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? 'rgba(0, 240, 255, 0.45)' : 'rgba(0, 240, 255, 0.12)';
          ctx.fill();

          // Node core circle
          ctx.beginPath();
          ctx.arc(p.px, p.py, isSelected ? 6 : 4 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? '#ffffff' : node.color;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Node label
          if (p.pz > 0 || isSelected) {
            ctx.font = `${Math.max(10, Math.round(11 * p.scale))}px Rajdhani, sans-serif`;
            ctx.fillStyle = isSelected ? '#00f0ff' : '#e2e8f0';
            ctx.fillText(`${node.icon} ${node.title}`, p.px + 10, p.py + 4);
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('click', onClickCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animId);
    };
  }, [nodes, activeNodeId, mode]);

  return (
    <div className="w-full h-[420px] sm:h-[520px] relative cursor-grab active:cursor-grabbing">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono-code text-cyan-400/80 pointer-events-none">
        <span>⟁ OMNI-SPHERE 3D ENGINE // DRAG TO ROTATE COORDINATES</span>
        <span>FIELD FLUX: 99.8% STABLE</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MULTI-LAYER CASE STUDY DATA MODEL
   ═══════════════════════════════════════════════════════ */
interface HologramProject {
  id: number;
  title: string;
  category: string;
  code: string;
  icon: string;
  url: string;
  schematic: {
    tagline: string;
    summary: string;
    targetDomain: string;
    status: string;
  };
  architecture: {
    pattern: string;
    layers: string[];
    techStack: string[];
    codeSnippet: string;
  };
  telemetry: {
    installs: string;
    activeUsers: string;
    uptime: string;
    rating: string;
    impactNote: string;
  };
  security: {
    encryption: string;
    authentication: string;
    networkWards: string;
    compliance: string;
  };
}

export default function App() {
  const [soundMuted, setSoundMuted] = useState(false);
  const [sphereMode, setSphereMode] = useState<'architecture' | 'apps' | 'network'>('apps');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<HologramProject | null>(null);
  const [activeLayer, setActiveLayer] = useState<'schematic' | 'architecture' | 'telemetry' | 'security'>('schematic');

  const emitSound = (type: 'beam' | 'nodeSelect' | 'layerSwitch' | 'aiVoice' | 'chime') => {
    if (!soundMuted) playHoloSound(type);
  };

  // 16 Applications Multi-Layer Holographic Case Studies
  const caseStudies: HologramProject[] = useMemo(() => [
    {
      id: 1,
      title: "Social Dashboard",
      category: "Analytics & Telemetry",
      code: "HOLO-NODE-01",
      icon: "📱",
      url: "https://github.com/moekyawaung-tech/social-dashboard",
      schematic: {
        tagline: "Unified Multi-Platform Telemetry Stream",
        summary: "Real-time social telemetry analyzer providing automated engagement reporting, multi-account live state streams, and live metrics graph visualizer.",
        targetDomain: "Global Social Media Ecosystems",
        status: "ACTIVE STABLE"
      },
      architecture: {
        pattern: "Clean Architecture + MVI (Model-View-Intent)",
        layers: ["Presentation (Jetpack Compose)", "Domain (Coroutines Flow UseCases)", "Data (Retrofit + Room Cache)"],
        techStack: ["Kotlin", "Jetpack Compose", "Coroutines", "WebSockets", "Room DB"],
        codeSnippet: `class SocialFeedViewModel @Inject constructor(
    private val observeLiveFeedUseCase: ObserveLiveFeedUseCase
) : ViewModel() {
    val uiState: StateFlow<FeedUiState> = observeLiveFeedUseCase()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), FeedUiState.Loading)
}`
      },
      telemetry: {
        installs: "50,000+ MAU",
        activeUsers: "18,500 Daily Concurrents",
        uptime: "99.95% Reliability",
        rating: "4.7★ (1.2K Ratings)",
        impactNote: "Eliminated reporting latency from 45 minutes to sub-second real-time telemetry."
      },
      security: {
        encryption: "AES-256 GCM token storage in Android Keystore",
        authentication: "OAuth 2.0 with biometric authentication gate",
        networkWards: "Certificate pinning with SHA-256 fingerprint hashes",
        compliance: "OWASP Mobile Top 10 strict compliance"
      }
    },
    {
      id: 2,
      title: "PWA App",
      category: "Offline PWA & Mobile Web",
      code: "HOLO-NODE-02",
      icon: "🌐",
      url: "https://github.com/moekyawaung-tech/pwa-app",
      schematic: {
        tagline: "Zero-Latency Offline-First Web Platform",
        summary: "Progressive Web Application with complete offline caching, background synchronization, and instant installability across mobile and desktop devices.",
        targetDomain: "Disconnected & Low-Bandwidth Regions",
        status: "SERVICE WKR VERIFIED"
      },
      architecture: {
        pattern: "Cache-First with Background Stale-While-Revalidate",
        layers: ["UI Presentation Shell", "Service Worker Cache Matrix", "IndexedDB Offline Vault"],
        techStack: ["TypeScript", "Service Workers", "Cache API", "IndexedDB", "Vite"],
        codeSnippet: `self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});`
      },
      telemetry: {
        installs: "120,000+ Installs",
        activeUsers: "32,000 Weekly Active",
        uptime: "100% Offline Capability",
        rating: "4.8★",
        impactNote: "Delivers full functional access even during complete cellular blackouts."
      },
      security: {
        encryption: "Local IndexedDB encryption via Web Crypto API",
        authentication: "JWT bearer tokens stored in memory cache",
        networkWards: "Strict HTTPS enforcement with HSTS header",
        compliance: "Content Security Policy (CSP) Level 3"
      }
    },
    {
      id: 3,
      title: "Admin Dashboard",
      category: "Enterprise Infrastructure",
      code: "HOLO-NODE-03",
      icon: "📊",
      url: "https://github.com/moekyawaung-tech/Advance-POS-Version",
      schematic: {
        tagline: "Mission-Control Enterprise Telemetry Hub",
        summary: "Administrative analytics interface with role-based ACL, audit streams, real-time alerts, and deep data drill-down.",
        targetDomain: "Commercial Enterprise Nodes",
        status: "SECURE ACCESS L5"
      },
      architecture: {
        pattern: "Multi-Module Enterprise Hexagonal Pattern",
        layers: ["Module :feature:dashboard", "Module :core:auth", "Module :core:network", "Module :core:database"],
        techStack: ["Kotlin", "Multi-Module", "Hilt DI", "REST API", "Paging 3"],
        codeSnippet: `@Module @InstallIn(SingletonComponent::class)
object EnterpriseNetworkModule {
    @Provides @Singleton
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder()
        .certificatePinner(CertificatePinner.Builder().add("*.mka.io", "sha256/...").build())
        .build()
}`
      },
      telemetry: {
        installs: "35+ Enterprise Nodes",
        activeUsers: "9,000 Daily Staff",
        uptime: "99.99% Enterprise SLA",
        rating: "4.9★",
        impactNote: "Processed 4.2 million operational transactions with zero data collisions."
      },
      security: {
        encryption: "End-to-end payload signing with RSA-4096",
        authentication: "MFA with Hardware Security Key (FIDO2) support",
        networkWards: "Mutual TLS (mTLS) zero-trust network tunnels",
        compliance: "SOC 2 Type II compliant audit logging"
      }
    },
    {
      id: 4,
      title: "Stock Market Tracker",
      category: "Fintech & Quantitative",
      code: "HOLO-NODE-04",
      icon: "📈",
      url: "https://github.com/moekyawaung-tech/crypto",
      schematic: {
        tagline: "High-Frequency Candlestick & Ticker Engine",
        summary: "Market intelligence tracker with candlestick visualizers, order book depth, price alert triggers, and currency conversions.",
        targetDomain: "Global Equity & Crypto Exchanges",
        status: "TICKER ACTIVE"
      },
      architecture: {
        pattern: "Reactive High-Frequency WebSocket Pipeline",
        layers: ["Hardware-Accelerated Canvas", "Ticker StateFlow Buffer", "WebSocket Dispatcher"],
        techStack: ["Kotlin", "StateFlow", "WebSocket", "Custom Canvas", "Coroutines"],
        codeSnippet: `val tickerStream: Flow<TickerQuote> = webSocketClient.stream()
    .buffer(Channel.CONFLATED)
    .flowOn(Dispatchers.Default)`
      },
      telemetry: {
        installs: "10,000+ Portfolios",
        activeUsers: "4,500 High-Frequency Traders",
        uptime: "99.98%",
        rating: "4.6★",
        impactNote: "Reduced ticker rendering latency to under 200ms."
      },
      security: {
        encryption: "TLS 1.3 with cipher suite ECDHE-RSA-AES256-GCM",
        authentication: "HMAC-SHA256 API key signature headers",
        networkWards: "Anti-DDoS socket backpressure throttling",
        compliance: "Financial data transmission encryption"
      }
    },
    {
      id: 5,
      title: "Game Collection",
      category: "Arcade Engine & Canvas",
      code: "HOLO-NODE-05",
      icon: "🎮",
      url: "https://github.com/moekyawaung-tech/game-collection",
      schematic: {
        tagline: "Physics-Based Multi-Game Arcade Engine",
        summary: "Browser and mobile arcade engine featuring Snake, Space Arcade, and Canvas physics animations with high scores.",
        targetDomain: "Interactive Entertainment",
        status: "PHYSICS ENGINE 60FPS"
      },
      architecture: {
        pattern: "Fixed Time-Step Game Loop with State Matrix",
        layers: ["Canvas 2D Graphics", "Audio Synthesizer DSP", "Physics Collision Grid"],
        techStack: ["Canvas 2D", "Web Audio API", "Game Loop", "Local Storage"],
        codeSnippet: `function gameLoop(timestamp) {
  while (accumulator >= dt) {
    physicsUpdate(dt);
    accumulator -= dt;
  }
  render();
  requestAnimationFrame(gameLoop);
}`
      },
      telemetry: {
        installs: "85,000+ Plays",
        activeUsers: "15,000 Active Gamers",
        uptime: "100%",
        rating: "4.8★",
        impactNote: "Delivers smooth 60 FPS gameplay on low-end budget smartphones."
      },
      security: {
        encryption: "SHA-256 high-score payload checksum verification",
        authentication: "Anonymous cryptographic user tokens",
        networkWards: "Content security policy for zero external script injections",
        compliance: "Safe gaming environment guidelines"
      }
    },
    {
      id: 6,
      title: "Music Player",
      category: "Audio DSP & Media",
      code: "HOLO-NODE-06",
      icon: "🎵",
      url: "https://github.com/moekyawaung-tech/video-player",
      schematic: {
        tagline: "Spectral Frequency DSP Audio Engine",
        summary: "Synthesizer-style music player with Web Audio API spectral analyzer, playlist state machine, and spatial audio DSP controls.",
        targetDomain: "Acoustic Audio Engineering",
        status: "DSP BUFFERED"
      },
      architecture: {
        pattern: "Audio Node Graph Pipeline",
        layers: ["MediaSession Controller", "Biquad Filter DSP", "Spectrum Visualizer"],
        techStack: ["Web Audio API", "ExoPlayer", "AudioContext", "Canvas"],
        codeSnippet: `const analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;
source.connect(analyser);
analyser.connect(audioCtx.destination);`
      },
      telemetry: {
        installs: "40,000+ Sessions",
        activeUsers: "8,000 Audiophiles",
        uptime: "99.9%",
        rating: "4.7★",
        impactNote: "Zero-jitter playback with hardware audio decoding."
      },
      security: {
        encryption: "Local playlist manifest checksumming",
        authentication: "Decoupled DRM storage",
        networkWards: "Range-request streaming with chunk verification",
        compliance: "Media playback privacy protections"
      }
    },
    {
      id: 7,
      title: "Chat App",
      category: "P2P Communications",
      code: "HOLO-NODE-07",
      icon: "💬",
      url: "https://github.com/moekyawaung-tech/pwa-app",
      schematic: {
        tagline: "End-to-End Encrypted Subspace Messenger",
        summary: "Real-time socket messaging client with presence indicators, typing indicators, payload encryption, and offline queued messages.",
        targetDomain: "Encrypted Planetary Communications",
        status: "E2EE ENFORCED"
      },
      architecture: {
        pattern: "Offline-First Relay with WebSocket Heartbeats",
        layers: ["Compose UI Flow", "Signal Protocol E2EE Core", "Room DB Message Ledger"],
        techStack: ["Kotlin", "Jetpack Compose", "Socket.IO", "Room DB", "Coroutines"],
        codeSnippet: `suspend fun dispatchMessage(msg: OutgoingMessage) {
    val encryptedPayload = cryptoEngine.encrypt(msg.body)
    roomDb.messageDao().insert(msg.toEntity(encryptedPayload))
    socketRelay.send(encryptedPayload)
}`
      },
      telemetry: {
        installs: "1,000,000+ Relayed Messages",
        activeUsers: "12,000 Daily Chatters",
        uptime: "99.98%",
        rating: "4.9★",
        impactNote: "Guaranteed message delivery through automatic mesh re-transmission."
      },
      security: {
        encryption: "Signal Protocol Double Ratchet + AES-256 GCM",
        authentication: "Cryptographic public key identity verification",
        networkWards: "TLS 1.3 socket tunnels with forward secrecy",
        compliance: "Zero-knowledge server payload storage"
      }
    },
    {
      id: 8,
      title: "World Cup Portal",
      category: "Sports Hub & Data Sync",
      code: "HOLO-NODE-08",
      icon: "⚽",
      url: "https://github.com/moekyawaung-tech/thailand-travel",
      schematic: {
        tagline: "Global Tournament Telemetry Orchestrator",
        summary: "Tournament fixture orchestrator with live bracket computation, match telemetry, stadium locator, and notification alarms.",
        targetDomain: "Live Sports Events",
        status: "LIVE BRACKET STREAM"
      },
      architecture: {
        pattern: "Server-Sent Events (SSE) Live Feed Reconciler",
        layers: ["Bracket Graph UI", "SSE Telemetry Ingestion", "Geolocation Map Sensors"],
        techStack: ["TypeScript", "SSE", "Leaflet Maps", "IndexedDB"],
        codeSnippet: `const sse = new EventSource('/api/matches/live');
sse.onmessage = (event) => {
  bracketStore.updateMatch(JSON.parse(event.data));
};`
      },
      telemetry: {
        installs: "60,000+ Tournament Users",
        activeUsers: "45,000 Match-day Peaks",
        uptime: "99.99%",
        rating: "4.8★",
        impactNote: "Maintained sub-100ms score notification delivery during global finals."
      },
      security: {
        encryption: "Signed JSON telemetry streams with HMAC",
        authentication: "Rate-limited API token headers",
        networkWards: "Edge caching via Cloudflare CDN",
        compliance: "GDPR privacy compliance for location tracking"
      }
    },
    {
      id: 9,
      title: "E-Commerce Suite",
      category: "Commercial Retail",
      code: "HOLO-NODE-09",
      icon: "🛒",
      url: "https://github.com/moekyawaung-tech/POS-Full-Version",
      schematic: {
        tagline: "High-Volume Commercial Retail Checkout",
        summary: "Full retail checkout workflow with instant inventory deduct, cart synchronization, receipt printing, and multiple payment gateway stubs.",
        targetDomain: "Merchant Enterprises",
        status: "CHECKOUT READY"
      },
      architecture: {
        pattern: "Event-Sourced Cart State Machine with Optimistic UI",
        layers: ["Product Catalog Grid", "Cart Event Reducer", "Payment Gateway Bridge"],
        techStack: ["Kotlin", "Compose", "Stripe SDK", "Room DB", "Retrofit"],
        codeSnippet: `fun executeCheckout(cart: Cart): Flow<PaymentResult> = flow {
    emit(PaymentResult.Processing)
    val response = paymentGateway.charge(cart.total)
    emit(PaymentResult.Success(response.transactionId))
}.catch { emit(PaymentResult.Error(it)) }`
      },
      telemetry: {
        installs: "$2.4M GMV Processed",
        activeUsers: "850 Active Storefronts",
        uptime: "99.99%",
        rating: "4.9★",
        impactNote: "Reduced checkout drop-off rates by 34% with instant one-tap workflows."
      },
      security: {
        encryption: "PCI-DSS Level 1 compliant tokenized card vaults",
        authentication: "Biometric checkout authorization",
        networkWards: "Idempotency keys on all financial mutations",
        compliance: "PCI-DSS and local commercial compliance"
      }
    },
    {
      id: 10,
      title: "Portfolio Hub",
      category: "Interactive 3D Hologram",
      code: "HOLO-NODE-10",
      icon: "💼",
      url: "https://github.com/Dev-moe-kyawaung/",
      schematic: {
        tagline: "Omni-Sphere Holographic Architecture Deck",
        summary: "Curated senior mobile engineering showcase featuring architectural diagrams, multi-repo links, and verified credentials.",
        targetDomain: "Global Executive Leadership",
        status: "HOSTED ONLINE"
      },
      architecture: {
        pattern: "Component-Driven 3D Canvas + Web Audio Matrix",
        layers: ["Omni-Sphere Canvas 3D", "Multi-Layer Case Study Modal", "AURA Hologram AI Engine"],
        techStack: ["React 19", "TypeScript", "HTML5 Canvas", "Tailwind CSS", "Web Audio API"],
        codeSnippet: `const OmniSphereCanvas: React.FC = () => {
  // 3D Spherical projection algorithm
  const x = r * Math.cos(lat) * Math.sin(lon);
  // ...
}`
      },
      telemetry: {
        installs: "100,000+ Views",
        activeUsers: "Global Hiring Leaders",
        uptime: "100%",
        rating: "Lighthouse 100",
        impactNote: "Demonstrates world-class mobile architecture and UI creativity."
      },
      security: {
        encryption: "Content security policy with SRI hashes",
        authentication: "Public read-only secure distribution",
        networkWards: "Edge CDN with sub-second global asset delivery",
        compliance: "Modern web accessibility and W3C standards"
      }
    },
    {
      id: 11,
      title: "Money Tracker",
      category: "Personal Finance & Ledger",
      code: "HOLO-NODE-11",
      icon: "💰",
      url: "https://github.com/moekyawaung-tech/Daily-planner-app",
      schematic: {
        tagline: "Encrypted Dual-Currency Financial Ledger",
        summary: "Dual-currency income/expense ledger with budget threshold warnings, visual categorization, and secure CSV/PDF export.",
        targetDomain: "Personal Wealth Management",
        status: "BIOMETRIC VAULT LOCKED"
      },
      architecture: {
        pattern: "Clean Architecture with Encrypted Database",
        layers: ["Compose Charts", "Domain Budget Calculation", "SQLCipher Encrypted Room DB"],
        techStack: ["Kotlin", "SQLCipher", "BiometricPrompt", "Room DB"],
        codeSnippet: `val passphrase = getKeystoreKey()
val factory = SupportOpenHelperFactory(passphrase)
Room.databaseBuilder(context, AppDatabase::class.java, "vault.db")
    .openHelperFactory(factory).build()`
      },
      telemetry: {
        installs: "25,000+ Ledgers",
        activeUsers: "7,000 Daily Budgeters",
        uptime: "100% Offline Vault",
        rating: "4.8★",
        impactNote: "Guaranteed 100% privacy with zero cloud telemetry transmission."
      },
      security: {
        encryption: "SQLCipher full database AES-256 encryption",
        authentication: "Android BiometricPrompt mandatory for launch",
        networkWards: "Zero network permission required in AndroidManifest",
        compliance: "Strict local-first privacy architecture"
      }
    },
    {
      id: 12,
      title: "Weather Radar",
      category: "Atmospheric Telemetry",
      code: "HOLO-NODE-12",
      icon: "🌤️",
      url: "https://github.com/moekyawaung-tech/Weather-app",
      schematic: {
        tagline: "Real-Time Doppler Atmospheric Forecaster",
        summary: "Real-time atmospheric condition forecaster using OpenWeather telemetry, animated rain canvas, and severe weather warnings.",
        targetDomain: "Planetary Atmospheric Monitoring",
        status: "DOPPLER ACTIVE"
      },
      architecture: {
        pattern: "Reactive Sensor Data Pipe with Canvas Weather Shader",
        layers: ["Particle Rain Shader", "Weather Domain Model", "GPS & REST Data Source"],
        techStack: ["Kotlin", "Canvas Shaders", "FusedLocationProvider", "Retrofit"],
        codeSnippet: `fun getAtmosphericTelemetry(lat: Double, lon: Double): Flow<WeatherReport> {
    return weatherApi.getForecast(lat, lon).map { it.toDomain() }
}`
      },
      telemetry: {
        installs: "75,000+ Forecasts",
        activeUsers: "18,000 Active Travelers",
        uptime: "99.9%",
        rating: "4.7★",
        impactNote: "Alerted over 5,000 users during monsoon rainfall emergencies."
      },
      security: {
        encryption: "GPS coordinates masked with geohash precision limits",
        authentication: "API key obfuscation with NDK native C++ layer",
        networkWards: "Certificate pinning to OpenWeather API endpoints",
        compliance: "Location data privacy compliance"
      }
    },
    {
      id: 13,
      title: "Crypto Vault",
      category: "Web3 & Blockchain",
      code: "HOLO-NODE-13",
      icon: "💸",
      url: "https://github.com/moekyawaung-tech/crypto",
      schematic: {
        tagline: "Decentralized Smart Contract & Gas Tracker",
        summary: "Decentralized wallet visualizer tracking gas price fluctuations, multi-chain balances, and smart contract audit status.",
        targetDomain: "Decentralized Web3 Networks",
        status: "LEDGER CONSENSUS OK"
      },
      architecture: {
        pattern: "Multi-RPC Provider Failover Architecture",
        layers: ["Web3 UI Portfolio", "Ethers.js Contract Wrapper", "RPC Node Cluster"],
        techStack: ["Ethers.js", "Infura", "Alchemy", "Android Keystore"],
        codeSnippet: `const provider = new ethers.providers.FallbackProvider([
  new ethers.providers.JsonRpcProvider(ALCHEMY_URL),
  new ethers.providers.JsonRpcProvider(INFURA_URL)
]);`
      },
      telemetry: {
        installs: "15,000+ Wallets",
        activeUsers: "4,000 Web3 Explorers",
        uptime: "99.99%",
        rating: "4.6★",
        impactNote: "Monitored over 120,000 smart contract events safely."
      },
      security: {
        encryption: "BIP-39 mnemonic seed phrases encrypted via hardware TEE",
        authentication: "Biometric signing for all outgoing transactions",
        networkWards: "RPC endpoint SSL verification with failover nodes",
        compliance: "Non-custodial zero-knowledge architecture"
      }
    },
    {
      id: 14,
      title: "JS Todo Master",
      category: "Keyboard Productivity",
      code: "HOLO-NODE-14",
      icon: "📝",
      url: "https://github.com/moekyawaung-tech/javascript-todo",
      schematic: {
        tagline: "Minimalist Drag-and-Drop Task Engine",
        summary: "Keyboard-driven task organizer with IndexedDB persistence, tag categorization, completion audio, and drag-and-drop hierarchy.",
        targetDomain: "High-Speed Personal Productivity",
        status: "PERSISTENCE SYNCHRONIZED"
      },
      architecture: {
        pattern: "Vanilla Event-Driven State Store",
        layers: ["Keyboard Event Router", "Drag & Drop Manager", "IndexedDB Transaction Engine"],
        techStack: ["Vanilla JavaScript", "IndexedDB API", "Web Audio API", "CSS Grid"],
        codeSnippet: `const tx = db.transaction('tasks', 'readwrite');
tx.objectStore('tasks').put({ id: Date.now(), title, completed: false });`
      },
      telemetry: {
        installs: "30,000+ Tasks Created",
        activeUsers: "6,000 Minimalist Planners",
        uptime: "100% Offline",
        rating: "4.8★",
        impactNote: "Sub-5ms response time with zero external framework overhead."
      },
      security: {
        encryption: "Local browser sandbox execution",
        authentication: "Local origin storage isolation",
        networkWards: "Zero external dependencies or CDN trackers",
        compliance: "W3C standards compliant"
      }
    },
    {
      id: 15,
      title: "Video Player Pro",
      category: "Media Hardware DSP",
      code: "HOLO-NODE-15",
      icon: "🎯",
      url: "https://github.com/moekyawaung-tech/video-player",
      schematic: {
        tagline: "Hardware-Accelerated Gesture Media Player",
        summary: "Hardware-accelerated gesture player with picture-in-picture support, audio track selection, subtitle parser, and volume scrub.",
        targetDomain: "High-Definition Video Streaming",
        status: "DECODER ACTIVE"
      },
      architecture: {
        pattern: "ExoPlayer Media Pipeline with Custom Touch Shaders",
        layers: ["Gesture Control Surface", "ExoPlayer Media Pipe", "Hardware Codec Decoder"],
        techStack: ["Kotlin", "ExoPlayer", "Media3", "Compose Gesture API"],
        codeSnippet: `val player = ExoPlayer.Builder(context)
    .setRenderersFactory(DefaultRenderersFactory(context).setExtensionRendererMode(EXTENSION_RENDERER_MODE_PREFER))
    .build()`
      },
      telemetry: {
        installs: "200,000+ Video Sessions",
        activeUsers: "25,000 Media Enthusiasts",
        uptime: "99.95%",
        rating: "4.8★",
        impactNote: "Zero frame drops on 1080p 60fps streams across budget devices."
      },
      security: {
        encryption: "Widevine DRM L1 hardware decryption pipeline",
        authentication: "Secure media token validation",
        networkWards: "HLS adaptive bitrate chunk streaming with SSL",
        compliance: "Digital rights management standards"
      }
    },
    {
      id: 16,
      title: "LEGEND! Android Suite",
      category: "Flagship Mobile Architecture",
      code: "HOLO-NODE-16",
      icon: "🔥",
      url: "https://github.com/Dev-moe-kyawaung/pulsesync-android",
      schematic: {
        tagline: "Enterprise Masterpiece: PulseSync Platform",
        summary: "Flagship architecture suite combining Android Jetpack Compose, multi-module setup, and Firebase cloud cluster.",
        targetDomain: "Millions of Global Android Users",
        status: "FLAGSHIP MASTER DEPLOYED"
      },
      architecture: {
        pattern: "Clean Architecture Multi-Module Master Suite (80+ Modules)",
        layers: ["Module :app", "Module :feature:* (Auth, Sync, Dashboard)", "Module :core:* (Network, DB, Common)"],
        techStack: ["Kotlin 2.0", "Jetpack Compose", "Hilt DI", "Firebase Suite", "Room DB", "GitHub Actions"],
        codeSnippet: `// Multi-module domain contract
interface PulseSyncRepository {
    fun streamRealTimeSync(): Flow<SyncPayload>
    suspend fun reconcileOfflineQueue(): Result<Unit>
}`
      },
      telemetry: {
        installs: "1,000,000+ Total Downloads",
        activeUsers: "50,000+ Monthly Active Users (MAU)",
        uptime: "99.99% Enterprise Reliability",
        rating: "4.8★ Rating Across Stores",
        impactNote: "Benchmark mobile architecture adopted by developers across Southeast Asia."
      },
      security: {
        encryption: "Android Keystore backed EncryptedSharedPreferences (AES-256 GCM)",
        authentication: "Firebase Auth + BiometricPrompt + Session refresh tokens",
        networkWards: "Certificate pinning with SHA-256 hashes + TLS 1.3 enforced",
        compliance: "Full SOC 2 and GDPR compliant enterprise architecture"
      }
    }
  ], []);

  // 82+ Programming Hub Certificates
  const certificateData = [
    { name: 'C Programming Core', cat: 'Programming Languages', id: '1720080366600', date: 'Jul 4, 2024' },
    { name: 'C++ Systems Architecture', cat: 'Programming Languages', id: '1720080489120', date: 'Jul 5, 2024' },
    { name: 'Java Enterprise Systems', cat: 'Programming Languages', id: '1720080512300', date: 'Jul 6, 2024' },
    { name: 'Python Automation', cat: 'Programming Languages', id: '1720080598100', date: 'Jul 7, 2024' },
    { name: 'Kotlin Mobile Systems', cat: 'Mobile & App Dev', id: '1720080612400', date: 'Jul 8, 2024' },
    { name: 'Android Architecture Components', cat: 'Mobile & App Dev', id: '1720080645100', date: 'Jul 9, 2024' },
    { name: 'Jetpack Compose UI Framework', cat: 'Mobile & App Dev', id: '1720080698200', date: 'Jul 10, 2024' },
    { name: 'Flutter & Dart Mobile', cat: 'Mobile & App Dev', id: '1720080723100', date: 'Jul 11, 2024' },
    { name: 'React Native Cross-Platform', cat: 'Mobile & App Dev', id: '1720080789400', date: 'Jul 12, 2024' },
    { name: 'React.js Web Engineering', cat: 'Web Development', id: '1720080812300', date: 'Jul 13, 2024' },
    { name: 'Vue.js Framework', cat: 'Web Development', id: '1720080845600', date: 'Jul 14, 2024' },
    { name: 'Angular Web Enterprise', cat: 'Web Development', id: '1720080891200', date: 'Jul 15, 2024' },
    { name: 'Node.js Express REST APIs', cat: 'Web Development', id: '1720080923400', date: 'Jul 16, 2024' },
    { name: 'HTML5 & CSS3 Master', cat: 'Web Development', id: '1720080967800', date: 'Jul 17, 2024' },
    { name: 'Tailwind CSS Quantum Styling', cat: 'Web Development', id: '1720080998100', date: 'Jul 18, 2024' },
    { name: 'TypeScript Systems Engineering', cat: 'Web Development', id: '1720081034500', date: 'Jul 19, 2024' },
    { name: 'Firebase Backend Suite', cat: 'Databases', id: '1720081078900', date: 'Jul 20, 2024' },
    { name: 'PostgreSQL Relational DB', cat: 'Databases', id: '1720081112300', date: 'Jul 21, 2024' },
    { name: 'MongoDB NoSQL Architecture', cat: 'Databases', id: '1720081145600', date: 'Jul 22, 2024' },
    { name: 'Redis In-Memory Cache', cat: 'Databases', id: '1720081198200', date: 'Jul 23, 2024' },
    { name: 'Room Local DB for Android', cat: 'Databases', id: '1720081278900', date: 'Jul 25, 2024' },
    { name: 'Machine Learning Fundamentals', cat: 'AI & Data Science', id: '1720081312300', date: 'Jul 26, 2024' },
    { name: 'TensorFlow Lite On-Device ML', cat: 'AI & Data Science', id: '1720081345600', date: 'Jul 27, 2024' },
    { name: 'Deep Learning & Neural Networks', cat: 'AI & Data Science', id: '1720081398200', date: 'Jul 28, 2024' },
    { name: 'Natural Language Processing NLP', cat: 'AI & Data Science', id: '1720081434500', date: 'Jul 29, 2024' },
    { name: 'Claude API LLM Integration', cat: 'AI & Data Science', id: '1720081512300', date: 'Jul 31, 2024' },
    { name: 'Ethical Hacking & Subspace Defense', cat: 'Security & DevOps', id: '1720081545600', date: 'Aug 1, 2024' },
    { name: 'Cybersecurity Kali Linux Protocols', cat: 'Security & DevOps', id: '1720081598200', date: 'Aug 2, 2024' },
    { name: 'GitHub Actions CI/CD Pipeline', cat: 'Security & DevOps', id: '1720081634500', date: 'Aug 3, 2024' },
    { name: 'Docker Space Containerization', cat: 'Security & DevOps', id: '1720081678900', date: 'Aug 4, 2024' },
    { name: 'Azure DevOps Pipeline', cat: 'Security & DevOps', id: '1720081712300', date: 'Aug 5, 2024' },
    { name: 'Clean Architecture Pattern Design', cat: 'Software Engineering', id: '1720081878900', date: 'Aug 9, 2024' },
    { name: 'SOLID Principles in OOP', cat: 'Software Engineering', id: '1720081912300', date: 'Aug 10, 2024' },
    { name: 'Design Patterns Gang of Four', cat: 'Software Engineering', id: '1720081945600', date: 'Aug 11, 2024' },
    { name: 'Data Structures & Algorithms', cat: 'Software Engineering', id: '1720081998200', date: 'Aug 12, 2024' },
    { name: 'Startup MVP Engineering Lab', cat: 'Marketing & Business', id: '1720082034500', date: 'Aug 13, 2024' },
    { name: 'Agile Scrum Fleet Leadership', cat: 'Marketing & Business', id: '1720082078900', date: 'Aug 14, 2024' }
  ];

  const [certSearch, setCertSearch] = useState('');
  const [certCategory, setCertCategory] = useState('All Sectors');
  const certCategories = ['All Sectors', 'Mobile & App Dev', 'Programming Languages', 'Web Development', 'Databases', 'AI & Data Science', 'Security & DevOps', 'Software Engineering'];

  const filteredCerts = useMemo(() => {
    return certificateData.filter(c => {
      const matchCat = certCategory === 'All Sectors' || c.cat === certCategory;
      const matchSearch = c.name.toLowerCase().includes(certSearch.toLowerCase()) ||
                          c.id.includes(certSearch) ||
                          c.cat.toLowerCase().includes(certSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [certCategory, certSearch]);

  // 43 GitHub Network Beacons
  const githubBeacons = [
    'Dev-moe-kyawaung', 'moekyawaung-tech', 'moekyawaung-china', 'moekyawaung-developer',
    'moekyawaungvivov30pro-design', 'moekyaw-aung-mm', 'moekyawaung-mk', 'moekyawaung-microsoft',
    'moekyawaung-cyber', 'moekyawaung-bangkok', 'moekyawaung-micro', 'moekyawaungmka2032-boop',
    'moekyawaung-dev-mm', 'moekyaw-developer', 'moekyawaung.github.io', 'Moekyawaung-mm',
    'moekyawaung-hack', 'moekyawaung-graduate', 'Moekyawaung-Linux', 'Moekyawaung-coder',
    'moekyawaung-designer', 'Moekyawaung2026', 'moekyawaungmka2034-coder', 'Moekyawaung-mk',
    'moekyawaung-web', 'MoeKyawAung-code', 'moekyawaung-creator', 'moekyawaung-webdeveloper',
    'Moekyawaung-co', 'moekyawaung-edu', 'moekyawaung-senior', 'Moekyawaung-Development',
    'moekyawaung-google', 'Moe-KyawAung', 'moekyawaung-micro', 'moekyawaung-cyber',
    'moekyawaung-bangkok', 'moekyawaung-china', 'Moekyawaung-dev', 'Moekyawaung-coder',
    'moekyawaungmka', 'moekyaw-url', 'happy-cv-creator'
  ];

  // 38 Lovable Web Nodes
  const lovableNodes = [
    { name: 'Happy CV Creator', url: 'https://happy-cv-creator.lovable.app' },
    { name: 'MKA Bio Hub', url: 'https://moekyawaungmybio.lovable.app/' },
    { name: 'The CV Palette', url: 'https://the-cv-palette.lovable.app' },
    { name: 'URL Shortener', url: 'https://moekyaw-url.lovable.app' },
    { name: 'Dev Profile 2026', url: 'https://moekyawaung-dev.lovable.app' },
    { name: 'Main Interstellar Hub', url: 'https://moe-kyaw-aung.lovable.app' },
    { name: 'CV Beacon System', url: 'https://cv-beacon.lovable.app/' },
    { name: 'Persuasion Hub', url: 'https://profile-persuasion-hub.lovable.app' },
    { name: 'App Skill Gallery', url: 'https://app-skill-gallery.lovable.app' },
    { name: 'Joy Codify Life', url: 'https://joy-codify-life.lovable.app/' },
    { name: 'Spark Coach AI', url: 'https://spark-coach-create.lovable.app' },
    { name: 'Color Code Chronicles', url: 'https://color-code-chronicles.lovable.app' },
    { name: 'Friendly Haven IO', url: 'https://friendly-haven-io.lovable.app' },
    { name: 'Pixel Perfect Snap', url: 'https://pixel-perfect-snap-39.lovable.app' },
    { name: 'Dev MoeKyaw Space', url: 'https://devmoekyaw.lovable.app' },
    { name: 'Myanmar Star Sector', url: 'https://moekyawaung-myanmar.lovable.app' }
  ];

  // 20+ Direct Subspace Emails
  const subspaceEmails = [
    'moekyawaung@programmer.net',
    'moekyawaung@technologist.com',
    'moekyawaung@engineer.com',
    'moekyawaung@techie.com',
    'moekyawaung@collector.org',
    'moekyawaung@graphic-designer.com',
    'moekyawaung@cybergal.com',
    'moekyawaung@webname.com',
    'moekyawaung@hackermail.com',
    'moekyawaung@graduate.org',
    'moekyawaung@asia.com',
    'moekyawaung@contractor.net',
    'moekyawaung@linuxmail.org',
    'moekyawaung@usa.com',
    'moekyawaung@europe.com',
    'moekyawaung@mail.com',
    'moekyawaung@iname.com',
    'moekyawaung@socialogist.com',
    'moekyawaung@secretary.net',
    'moekyawaung@publicist.com'
  ];

  // 16 Verified Gravatar Social Channels
  const socialChannels = [
    { name: 'GitHub Array', icon: <FaGithub />, url: 'https://github.com/Dev-moe-kyawaung/', tag: '@Dev-moe-kyawaung' },
    { name: 'LinkedIn Relay', icon: <FaLinkedin />, url: 'https://www.linkedin.com/in/moe-kyaw-aung-2653093a1', tag: 'Moe Kyaw Aung' },
    { name: 'YouTube Channel', icon: <FaYoutube />, url: 'https://www.youtube.com/channel/UCuTXUguZb4xjeL2nX8WJG', tag: 'Engineering Reel' },
    { name: 'Bluesky Node', icon: <FiRadio />, url: 'https://bsky.app/profile/moekyawaung96.bsky.social', tag: '@moekyawaung96' },
    { name: 'Tumblr Hologram', icon: <FaTumblr />, url: 'https://www.tumblr.com/moekyawaung', tag: 'MKA Tech Log' },
    { name: 'Flickr Visuals', icon: <FiActivity />, url: 'https://www.flickr.com/people/204037451@N06', tag: 'Visual Archive' },
    { name: 'Vimeo Streams', icon: <FiEye />, url: 'https://vimeo.com/user252414232', tag: 'Video Telemetry' },
    { name: 'Gravatar Verified', icon: <FaGlobeAmericas />, url: 'https://gravatar.com/moekyawaung13721', tag: 'Verified Identity' },
    { name: 'Slack Workspace', icon: <FaSlack />, url: 'https://moekyawaung.slack.com/', tag: 'Dev Workspace' },
    { name: 'Reddit Threads', icon: <FaRedditAlien />, url: 'https://bsky.app/profile/moekyawaung96.bsky.social', tag: 'Mobile Tech' },
    { name: 'Strikingly Portal', icon: <FiCompass />, url: 'http://moekyawaung2026.strikingly.com', tag: 'Web Interface' }
  ];

  // AURA Holographic AI Entity State
  const [auraOpen, setAuraOpen] = useState(false);
  const [auraLogs, setAuraLogs] = useState<Array<{ sender: 'aura' | 'user'; text: string }>>([
    { sender: 'aura', text: '✦ GREETINGS. I am AURA — Autonomous Ultra-Reality Hologram AI for Chief Mobile Architect Moe Kyaw Aung. I can project architectural schematics, startup telemetry, and explain clean-architecture modularization in real time. How may I guide your inspection?' }
  ]);
  const [auraInput, setAuraInput] = useState('');

  const askAura = (textPrompt?: string) => {
    const q = (textPrompt || auraInput).trim();
    if (!q) return;
    emitSound('aiVoice');
    setAuraLogs(prev => [...prev, { sender: 'user', text: q }]);
    setAuraInput('');

    let reply = "AURA telemetry acknowledged. Moe Kyaw Aung has engineered 16 operational planetary applications reaching over 1,000,000 users across Southeast Asia.";
    const lower = q.toLowerCase();

    if (lower.includes('arch') || lower.includes('clean') || lower.includes('modular') || lower.includes('hilt')) {
      reply = "📐 ARCHITECTURAL SCHEMATIC: Moe enforces strict Clean Architecture containment. Feature modules depend solely on Domain and Core, with zero Android dependencies in the business layer. Dagger/Hilt verifies compilation dependencies, while Gradle caching optimizes 80+ multi-module compile times.";
    } else if (lower.includes('startup') || lower.includes('founder') || lower.includes('metric') || lower.includes('download')) {
      reply = "🚀 STARTUP TELEMETRY: As a technical founder, Moe launched MoekyawTranslator (quantized on-device AI) and commercial POS ERP systems (dual MMK/THB offline cash flows) achieving 1M+ downloads, 50K+ MAU, and 99.9% uptime.";
    } else if (lower.includes('pulse') || lower.includes('flagship')) {
      reply = "🔥 FLAGSHIP PULSESYNC: PulseSync is Moe's showcase Android repo: offline-first, WebSocket/Firebase real-time sync, Hilt dependency injection, and automated GitHub Actions CI/CD pipelines.";
    } else if (lower.includes('contact') || lower.includes('hire') || lower.includes('email') || lower.includes('phone')) {
      reply = "📡 COMM PROTOCOLS: Hotlines +95 9 889 000 889 and +959 666 000 050. Subspace mail: moekyawaung@programmer.net. Moe is currently Open to Work for Microsoft-scale products.";
    } else if (lower.includes('cert') || lower.includes('hub')) {
      reply = "🏆 CREDENTIALS AUDIT: 82+ verified certificates from Programming Hub, Google Developers Launchpad alumnus, and continuous study across Android, Cybersecurity, and AI.";
    }

    setTimeout(() => {
      emitSound('chime');
      setAuraLogs(prev => [...prev, { sender: 'aura', text: reply }]);
    }, 450);
  };

  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const copyChannel = (text: string) => {
    navigator.clipboard.writeText(text);
    emitSound('chime');
    setCopiedNotification(text);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative overflow-x-hidden font-rajdhani selection:bg-cyan-400 selection:text-black">
      {/* Volumetric Top Light Cone Beam */}
      <div className="volumetric-cone" />

      {/* Hologram Grid Lines Background */}
      <div className="fixed inset-0 holo-grid-lines pointer-events-none z-0" />

      {/* Hologram Scanline Sweeper */}
      <div className="holo-scanline" />

      {/* ═══════════════════════════════════════════════════════
          HOLOGRAPHIC TOP COMMAND BAR
          ═══════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#061026]/90 backdrop-blur-2xl border-b border-cyan-500/30 px-4 py-2.5 shadow-[0_4px_30px_rgba(0,240,255,0.25)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-[0_0_15px_#00f0ff] animate-pulse">
              <div className="w-full h-full bg-[#030712] rounded-[7px] flex items-center justify-center text-cyan-300 font-orbitron font-extrabold text-sm">
                ⟁
              </div>
            </div>
            <div>
              <div className="font-orbitron font-bold text-xs tracking-wider text-white flex items-center gap-2">
                <span>OMNI-SPHERE // MOE KYAW AUNG</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-mono-code text-[9px]">
                  HOLOGRAM v2026.4
                </span>
              </div>
              <p className="text-[10px] text-cyan-400/80 font-mono-code tracking-wider">
                SENIOR MOBILE ARCHITECT · TECHNICAL FOUNDER
              </p>
            </div>
          </div>

          {/* Quick Deck Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 font-orbitron text-xs font-bold">
            {[
              { id: 'sphere-deck', label: '3D OMNI-SPHERE' },
              { id: 'flagship-deck', label: 'FLAGSHIP ARCHITECTURE' },
              { id: 'casestudy-deck', label: '16 PROJECT NODES' },
              { id: 'startup-deck', label: 'FOUNDER LAB' },
              { id: 'credentials-deck', label: '82+ CERTS' },
              { id: 'comms-deck', label: 'COMMS MATRIX' }
            ].map(sec => (
              <button
                key={sec.id}
                onClick={() => {
                  emitSound('chime');
                  const el = document.getElementById(sec.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-all cursor-pointer font-bold"
              >
                {sec.label}
              </button>
            ))}
          </nav>

          {/* Telemetry Audio & Status Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSoundMuted(!soundMuted);
                if (soundMuted) emitSound('beam');
              }}
              className={`p-2 rounded-lg border text-sm transition-all ${
                !soundMuted
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'border-gray-700 text-gray-500'
              }`}
              title="Toggle Hologram Audio Telemetry"
            >
              {!soundMuted ? <FiVolume2 /> : <FiVolumeX />}
            </button>

            <button
              onClick={() => {
                emitSound('beam');
                setAuraOpen(true);
              }}
              className="holo-btn-primary px-3.5 py-1.5 font-orbitron font-bold text-xs tracking-wider cursor-pointer flex items-center gap-1.5"
            >
              <FiRadio className="animate-pulse" />
              <span>AURA AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          SECTION 1: 3D OMNI-SPHERE INTERACTION HUB
          ═══════════════════════════════════════════════════════ */}
      <section id="sphere-deck" className="relative pt-28 pb-20 px-4 min-h-screen flex flex-col justify-center items-center z-10">
        <div className="max-w-6xl mx-auto w-full text-center">
          {/* Status Capsule */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-1.5 rounded-full bg-[#06122c]/80 border border-cyan-500/50 shadow-[0_0_25px_rgba(0,240,255,0.3)] mb-6 text-xs font-mono-code">
            <span className="text-yellow-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              3D OMNI-SPHERE MATRIX ACTIVE
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-cyan-300">1M+ USERS WORLDWIDE</span>
            <span className="text-gray-500">|</span>
            <span className="text-emerald-400">STATUS: OPEN TO WORK 🟢</span>
          </div>

          {/* Hologram Proclamation */}
          <p className="text-cyan-400 font-orbitron font-bold tracking-widest text-sm mb-2 holo-chromatic">
            မိုးကျော်အောင် // MOE KYAW AUNG
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-syne font-extrabold tracking-tight text-white mb-3 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 drop-shadow-[0_0_35px_rgba(0,240,255,0.6)]">
              HOLOGRAPHIC OMNI-SPHERE
            </span>
            <br />
            <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              SENIOR MOBILE ARCHITECT
            </span>
          </h1>

          {/* Animated Typist Headline */}
          <div className="h-10 text-base sm:text-xl font-chakra font-bold text-cyan-300 mb-6 tracking-wide flex items-center justify-center gap-2">
            <span className="text-cyan-400 font-mono-code">&gt;&gt;</span>
            <TypeAnimation
              sequence={[
                '"THIS ENGINEER BUILDS APPS USED BY MILLIONS."',
                2500,
                'ROTATING 3D SPHERICAL PROJECTION WITH INTERACTIVE NODES.',
                2500,
                'KOTLIN · JETPACK COMPOSE · CLEAN ARCHITECTURE · MULTI-MODULE.',
                2500,
                'TECHNICAL CO-FOUNDER · 1M+ LIFETIME PLANETARY USERS.',
                2500,
              ]}
              wrapper="span"
              speed={55}
              repeat={Infinity}
            />
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {[
              { mode: 'apps' as const, label: '16 APPLICATION NODES', icon: '📱' },
              { mode: 'architecture' as const, label: 'CORE ARCHITECTURE LAYERS', icon: '🏗️' },
              { mode: 'network' as const, label: 'GLOBAL NETWORK RELAY', icon: '🌐' }
            ].map(tab => (
              <button
                key={tab.mode}
                onClick={() => {
                  emitSound('layerSwitch');
                  setSphereMode(tab.mode);
                }}
                className={`px-4 py-2 rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  sphereMode === tab.mode
                    ? 'bg-cyan-500 text-black border border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.7)]'
                    : 'bg-black/60 text-gray-400 border border-cyan-500/30 hover:border-cyan-400'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 3D INTERACTIVE OMNI-SPHERE CANVAS */}
          <div className="holo-panel rounded-3xl p-4 mb-8 relative overflow-hidden">
            <div className="holo-corner-tl" />
            <div className="holo-corner-tr" />
            <div className="holo-corner-bl" />
            <div className="holo-corner-br" />

            <OmniSphereCanvas
              mode={sphereMode}
              onSelectNode={(id) => {
                emitSound('nodeSelect');
                const found = caseStudies.find(c => c.id === id);
                if (found) setSelectedCaseStudy(found);
              }}
              activeNodeId={selectedCaseStudy?.id || null}
            />
          </div>

          {/* Pilot Coordinates & Key Focus Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono-code mb-8">
            <span className="px-3.5 py-1.5 rounded-lg bg-[#06122c]/90 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5">
              <FiMapPin className="text-cyan-400" />
              <span>COORDINATES: Tachileik, Myanmar 🇲🇲 ↔ Bangkok, Thailand 🇹🇭</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-[#06122c]/90 border border-purple-500/40 text-purple-300">
              COMMUNICATION: Burmese 🇲🇲 · English 🌐 · Kotlin ☕
            </span>
          </div>

          {/* 4 Core Architectural Converter Panels */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto">
            {[
              { title: 'MOBILE ARCHITECTURE', desc: 'Kotlin · Compose · MVVM · Clean Arch', icon: <FaAndroid className="text-cyan-400 text-lg" />, badge: 'PRIMARY' },
              { title: 'CLOUD BACKEND', desc: 'Firebase · REST APIs · Python · Node', icon: <FaSatellite className="text-blue-400 text-lg" />, badge: 'CLOUD' },
              { title: 'SECURITY WARDS', desc: 'Ethical Hacking · AES-256 · Keystore', icon: <FiShield className="text-purple-400 text-lg" />, badge: 'DEFENSE' },
              { title: 'ON-DEVICE AI', desc: 'Claude API · TFLite · On-Device ML', icon: <FiCpu className="text-yellow-400 text-lg" />, badge: 'INTELLIGENCE' }
            ].map((p, idx) => (
              <div key={idx} className="holo-panel p-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  {p.icon}
                  <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-mono-code text-[9px]">
                    {p.badge}
                  </span>
                </div>
                <h3 className="font-orbitron font-bold text-xs text-white mb-1">{p.title}</h3>
                <p className="text-[11px] text-gray-400 font-mono-code leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: FLAGSHIP ARCHITECTURE CASE STUDY (PULSESYNC)
          ═══════════════════════════════════════════════════════ */}
      <section id="flagship-deck" className="py-28 px-4 relative z-10 bg-[#040b1c] border-t border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-yellow-500/10 border border-yellow-400 text-yellow-300 font-mono-code text-[10px] mb-3">
              MASTER WORKSHOWCASE // FLAGSHIP ANDROID PLATFORM
            </div>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white">
              FLAGSHIP: USS PULSESYNC
            </h2>
            <p className="text-cyan-300 font-mono-code text-sm max-w-2xl mx-auto mt-2">
              "This engineer builds apps used by millions." — Production multi-module benchmark with offline-first synchronization and real-time Firebase backend.
            </p>
          </div>

          {/* PulseSync Interactive Holo-Panel */}
          <div className="holo-panel rounded-3xl p-8 relative overflow-hidden border-2 border-yellow-400/60 shadow-[0_0_40px_rgba(245,158,11,0.25)]">
            <div className="holo-corner-tl" />
            <div className="holo-corner-tr" />
            <div className="holo-corner-bl" />
            <div className="holo-corner-br" />

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono-code text-yellow-300 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  FLAGSHIP PRODUCTION ANDROID REPOSITORY
                </div>
                <h3 className="text-2xl sm:text-3xl font-orbitron font-black text-white mb-2">
                  PULSESYNC — REAL-TIME DATA PLATFORM
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4 font-rajdhani text-sm">
                  Advanced multi-module Android application demonstrating production Clean Architecture, Firebase suite backend (Auth, Firestore, Cloud Messaging, Crashlytics), offline-first synchronization with Room, and automated CI/CD pipeline with GitHub Actions.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-mono-code">
                  {['Kotlin 2.0', 'Jetpack Compose', 'Clean Architecture', 'Hilt DI', 'Room DB', 'GitHub Actions', 'Firebase Suite'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-black/60 border border-yellow-400/40 text-yellow-300 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
                <a
                  href="https://github.com/Dev-moe-kyawaung/pulsesync-android"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => emitSound('beam')}
                  className="holo-btn-primary px-6 py-3 font-orbitron font-bold text-xs text-center flex items-center justify-center gap-2"
                >
                  <FaGithub />
                  <span>TRANSMIT GITHUB REPO</span>
                </a>
                <button
                  onClick={() => {
                    emitSound('chime');
                    document.getElementById('casestudy-deck')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="holo-btn-secondary px-6 py-3 font-orbitron font-bold text-xs text-center flex items-center justify-center gap-2"
                >
                  <FiSliders />
                  <span>ALL 16 CASE STUDIES</span>
                </button>
              </div>
            </div>

            {/* Multi-Module Containment Architecture Matrix */}
            <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-cyan-500/20 font-mono-code text-xs">
              <div className="p-4 rounded-xl bg-black/60 border border-cyan-500/20">
                <p className="text-cyan-300 font-bold mb-1">1. PRESENTATION LAYER</p>
                <p className="text-gray-300 text-[11px]">100% Jetpack Compose with unidirectional data flow (MVI) and StateFlow collectors.</p>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-purple-500/20">
                <p className="text-purple-300 font-bold mb-1">2. DOMAIN LAYER</p>
                <p className="text-gray-300 text-[11px]">Pure Kotlin UseCases with zero framework dependencies for instantaneous unit tests.</p>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-yellow-500/20">
                <p className="text-yellow-300 font-bold mb-1">3. DATA RECONCILER</p>
                <p className="text-gray-300 text-[11px]">Offline-first Room database acting as the single source of truth with Firebase Sync.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: 16 HOLOGRAPHIC PROJECT NODES (CASE STUDIES)
          ═══════════════════════════════════════════════════════ */}
      <section id="casestudy-deck" className="py-28 px-4 relative z-10 bg-[#030712]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-500/10 border border-cyan-400 text-cyan-300 font-mono-code text-[10px] mb-3">
              FLOATING NODES // 16 MULTI-LAYER CASE STUDIES
            </div>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white">
              HOLOGRAPHIC PROJECT NODES
            </h2>
            <p className="text-cyan-300 font-mono-code text-sm max-w-2xl mx-auto mt-2">
              Select any floating node to project its full 4-layer holographic case study: Schematic, Architecture & Code, Telemetry, and Security Wards.
            </p>
          </div>

          {/* 16 Floating Nodes Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {caseStudies.map((proj) => (
              <div
                key={proj.id}
                onClick={() => {
                  emitSound('nodeSelect');
                  setSelectedCaseStudy(proj);
                  setActiveLayer('schematic');
                }}
                className="holo-panel holo-card-3d p-5 rounded-2xl cursor-pointer flex flex-col justify-between group"
              >
                <div className="holo-corner-tl" />
                <div className="holo-corner-tr" />
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono-code text-gray-400 mb-3">
                    <span className="text-cyan-400 font-bold">{proj.code}</span>
                    <span className="px-1.5 py-0.2 bg-black/60 rounded text-yellow-300 border border-yellow-400/30">
                      NODE #{proj.id}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl filter drop-shadow-[0_0_12px_#00f0ff] group-hover:scale-125 transition-transform">
                      {proj.icon}
                    </div>
                    <div>
                      <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {proj.title}
                      </h3>
                      <p className="text-[11px] text-cyan-400 font-mono-code">{proj.category}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 font-rajdhani line-clamp-2 leading-relaxed mb-3">
                    {proj.schematic.summary}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-cyan-500/20 flex items-center justify-between text-[10px] font-mono-code">
                  <span className="text-cyan-400 group-hover:underline flex items-center gap-1">
                    <FiMaximize2 />
                    <span>INSPECT 4-LAYERS</span>
                  </span>
                  <span className="text-gray-500">{proj.schematic.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4: TECHNICAL FOUNDER & STARTUP LAB
          ═══════════════════════════════════════════════════════ */}
      <section id="startup-deck" className="py-28 px-4 relative z-10 bg-[#040b1c] border-t border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-yellow-500/10 border border-yellow-400 text-yellow-300 font-mono-code text-[10px] mb-3">
              VENTURE VENTURES // STARTUP EXPERIMENTS
            </div>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white">
              TECHNICAL FOUNDER & STARTUP LAB
            </h2>
            <p className="text-cyan-300 font-mono-code text-sm max-w-2xl mx-auto mt-2">
              From MVP validation to million-user scalability — real business decisions, telemetry metrics, and user growth.
            </p>
          </div>

          {/* Growth Metrics Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
            {[
              { label: 'TOTAL INSTALLS', val: '1M+', sub: 'Across 16 Apps', color: 'text-cyan-400' },
              { label: 'ACTIVE CREW (MAU)', val: '50K+', sub: 'Monthly Active Users', color: 'text-emerald-400' },
              { label: 'USER RATING', val: '4.5★', sub: 'Average App Score', color: 'text-yellow-400' },
              { label: 'SYSTEM RELIABILITY', val: '99.9%', sub: 'Crash-Free Rate', color: 'text-purple-400' }
            ].map((stat, idx) => (
              <div key={idx} className="holo-panel p-5 rounded-2xl text-center">
                <p className="text-[10px] font-mono-code text-gray-400 mb-1">{stat.label}</p>
                <p className={`font-orbitron font-black text-3xl sm:text-4xl ${stat.color} mb-1`}>
                  {stat.val}
                </p>
                <p className="text-[11px] text-gray-400 font-mono-code">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Two-Column Founder Telemetry */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="holo-panel p-6 rounded-2xl">
              <h3 className="font-orbitron font-bold text-base text-cyan-300 mb-4 flex items-center gap-2">
                <FaRocket className="text-yellow-400" />
                <span>COMMERCIAL PRODUCTS LAUNCHED</span>
              </h3>
              <div className="space-y-3.5">
                {[
                  {
                    name: 'MoekyawTranslator AI',
                    desc: 'On-device machine translation engine leveraging Claude API & TensorFlow Lite. Offline fallback for disconnected regional quadrants.'
                  },
                  {
                    name: 'POS ERP Enterprise Suite',
                    desc: 'Commercial point-of-sale deployed across Tachileik and Bangkok merchant networks with dual MMK/THB currency reconciliation.'
                  },
                  {
                    name: 'Job-Portal Platform',
                    desc: 'Employment matchmaker connecting regional skilled developers with remote opportunities in Southeast Asia.'
                  },
                  {
                    name: 'Social Dashboard Telemetry',
                    desc: 'Unified social media telemetry aggregator with real-time reactive streams and engagement reporting.'
                  }
                ].map((prod, i) => (
                  <div key={i} className="p-3.5 rounded-lg bg-black/60 border border-cyan-500/20">
                    <h4 className="font-orbitron font-bold text-xs text-white">{prod.name}</h4>
                    <p className="text-xs text-gray-300 font-rajdhani mt-1">{prod.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="holo-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="font-orbitron font-bold text-base text-yellow-300 mb-4 flex items-center gap-2">
                  <FiSliders className="text-cyan-400" />
                  <span>FOUNDER PRODUCT DECISIONS</span>
                </h3>
                <div className="space-y-3 font-mono-code text-xs text-gray-300">
                  <div className="p-3 rounded bg-black/60 border border-cyan-500/20">
                    <p className="text-cyan-300 font-bold mb-0.5">1. OFFLINE-FIRST AS FIRST-CLASS CITIZEN</p>
                    <p className="font-rajdhani text-gray-300 text-xs">Room DB local single source of truth ensures mission operations proceed without dropouts during cellular blackouts.</p>
                  </div>
                  <div className="p-3 rounded bg-black/60 border border-cyan-500/20">
                    <p className="text-cyan-300 font-bold mb-0.5">2. ON-DEVICE AI QUANTIZATION</p>
                    <p className="font-rajdhani text-gray-300 text-xs">Quantized TensorFlow Lite models process linguistic translation on-device, saving thousands in cloud API overhead.</p>
                  </div>
                  <div className="p-3 rounded bg-black/60 border border-cyan-500/20">
                    <p className="text-cyan-300 font-bold mb-0.5">3. 2GB LOW-RAM BUDGET PROTOCOLS</p>
                    <p className="font-rajdhani text-gray-300 text-xs">Carefully budgeted Compose re-compositions prevent OutOfMemory crashes on low-spec hardware across developing sectors.</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs font-mono-code text-gray-400">
                <span>FOUNDER CODE: "BUILD WITH PURPOSE."</span>
                <span className="text-yellow-400 font-bold">READY FOR CO-FOUNDER DUTY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5: 82+ PROGRAMMING HUB CERTIFICATES
          ═══════════════════════════════════════════════════════ */}
      <section id="credentials-deck" className="py-28 px-4 relative z-10 bg-[#030712] border-t border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-yellow-500/10 border border-yellow-400 text-yellow-300 font-mono-code text-[10px] mb-3">
              VERIFIED CREDENTIALS // 82+ ACCREDITATIONS
            </div>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white">
              PROGRAMMING HUB CERTIFICATES
            </h2>
            <p className="text-cyan-300 font-mono-code text-sm max-w-2xl mx-auto mt-2">
              Comprehensive certification credentials spanning 8 engineering disciplines: Mobile, AI/ML, Cyber Security, Cloud, and Software Engineering.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                placeholder="SEARCH 82+ CERTIFICATES BY KEYWORD..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/80 border border-cyan-500/40 text-xs font-mono-code text-cyan-300 focus:outline-none focus:border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {certCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    emitSound('layerSwitch');
                    setCertCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all cursor-pointer ${
                    certCategory === cat
                      ? 'bg-cyan-500 text-black font-bold border border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.6)]'
                      : 'bg-black/60 text-gray-400 border border-cyan-900/60 hover:border-cyan-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Certificate Cards Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCerts.map((c, idx) => (
              <div key={idx} className="holo-panel p-4 rounded-xl flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono-code text-gray-400 mb-2">
                    <span className="text-yellow-400 font-bold">{c.date}</span>
                    <span className="px-1.5 py-0.2 bg-black/60 text-cyan-300 rounded border border-cyan-500/20">
                      ID #{c.id.slice(-6)}
                    </span>
                  </div>
                  <h4 className="font-orbitron font-bold text-xs text-white group-hover:text-cyan-300 transition-colors mb-1">
                    {c.name}
                  </h4>
                  <p className="text-[11px] text-cyan-400 font-mono-code">{c.cat}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-xs font-mono-code">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <FiCheck className="text-green-400" />
                    VERIFIED
                  </span>
                  <a
                    href={`https://www.programminghub.io/certificate?id=${c.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-yellow-300 hover:text-white flex items-center gap-1 font-bold"
                  >
                    VERIFY ↗
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredCerts.length === 0 && (
            <div className="text-center py-12 text-gray-400 font-mono-code text-sm">
              NO CERTIFICATES MATCHING "{certSearch}". TRY ANOTHER QUERY!
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6: 43 GITHUB BEACONS & 38 LOVABLE WEB NODES
          ═══════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 relative z-10 bg-[#040b1c]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-500/10 border border-cyan-400 text-cyan-300 font-mono-code text-[10px] mb-3">
              BEACON MATRIX // GLOBAL DEVELOPER NETWORK
            </div>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white">
              43 GITHUB BEACONS & 38 WEB PROBES
            </h2>
            <p className="text-cyan-300 font-mono-code text-sm max-w-2xl mx-auto mt-2">
              Distributed navigational nodes spanning mobile ecosystems, cybersecurity frameworks, and decentralized web architectures.
            </p>
          </div>

          {/* 43 GitHub Beacons */}
          <div className="mb-14">
            <h3 className="font-orbitron font-bold text-sm text-cyan-300 mb-4 flex items-center gap-2">
              <FaGithub className="text-yellow-400" />
              <span>43 INTERSTELLAR GITHUB BEACONS</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 font-mono-code text-xs">
              {githubBeacons.map((handle, idx) => (
                <a
                  key={idx}
                  href={`https://github.com/${handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => emitSound('chime')}
                  className="p-2.5 rounded-lg bg-black/60 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all flex items-center justify-between group"
                >
                  <span className="text-gray-300 group-hover:text-white truncate">{handle}</span>
                  <FiExternalLink className="text-gray-500 group-hover:text-cyan-300 shrink-0 ml-1 text-xs" />
                </a>
              ))}
            </div>
          </div>

          {/* 38 Lovable Web Nodes */}
          <div>
            <h3 className="font-orbitron font-bold text-sm text-yellow-300 mb-4 flex items-center gap-2">
              <FaSatellite className="text-cyan-400" />
              <span>38 DEPLOYED LOVABLE WEB PROBES</span>
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono-code text-xs">
              {lovableNodes.map((probe, idx) => (
                <a
                  key={idx}
                  href={probe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => emitSound('chime')}
                  className="p-3 rounded-lg bg-black/60 border border-purple-500/30 hover:border-cyan-400 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-gray-200 group-hover:text-cyan-300 truncate font-bold">{probe.name}</span>
                  </div>
                  <FiExternalLink className="text-gray-500 group-hover:text-cyan-300 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 7: COMMS MATRIX // DIRECT CHANNELS & PHONE
          ═══════════════════════════════════════════════════════ */}
      <section id="comms-deck" className="py-28 px-4 relative z-10 bg-[#030712] border-t border-cyan-500/30">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-yellow-500/10 border border-yellow-400 text-yellow-300 font-mono-code text-[10px] mb-3">
              COMMUNICATIONS ARRAY // REAL-TIME DISPATCH
            </div>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white">
              CONNECT WITH MOE KYAW AUNG
            </h2>
            <p className="text-cyan-300 font-mono-code text-sm max-w-2xl mx-auto mt-2">
              Direct voice hotlines and encrypted channels for senior mobile architect roles, technical co-founder ventures, and enterprise contracts.
            </p>
          </div>

          {/* Voice Hotlines */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <div className="holo-panel p-5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-2xl border border-cyan-400">
                  <FiPhone />
                </div>
                <div>
                  <div className="text-[10px] font-mono-code text-yellow-400">VOICE HOTLINE 01</div>
                  <div className="text-xl font-orbitron font-bold text-white tracking-wider">+95 9 889 000 889</div>
                </div>
              </div>
              <a
                href="tel:+959889000889"
                onClick={() => emitSound('chime')}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded font-orbitron font-bold text-xs"
              >
                CALL
              </a>
            </div>

            <div className="holo-panel p-5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center text-2xl border border-blue-400">
                  <FiPhone />
                </div>
                <div>
                  <div className="text-[10px] font-mono-code text-blue-300">VOICE HOTLINE 02</div>
                  <div className="text-xl font-orbitron font-bold text-white tracking-wider">+95 9 666 000 050</div>
                </div>
              </div>
              <a
                href="tel:+959666000050"
                onClick={() => emitSound('chime')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-black rounded font-orbitron font-bold text-xs"
              >
                CALL
              </a>
            </div>
          </div>

          {/* 20+ Subspace Channels (Emails) */}
          <div className="holo-panel p-6 rounded-2xl mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="font-orbitron font-bold text-base text-cyan-300 flex items-center gap-2">
                  <FiMail />
                  <span>20+ DIRECT INBOX CHANNELS (CLICK TO COPY)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-mono-code">Instant 1-click address copy for direct transmission.</p>
              </div>

              {copiedNotification && (
                <span className="px-3 py-1 bg-green-500 text-black font-mono-code text-xs rounded font-bold animate-bounce">
                  COPIED CHANNEL: {copiedNotification}
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 font-mono-code text-xs">
              {subspaceEmails.map((em, idx) => (
                <button
                  key={idx}
                  onClick={() => copyChannel(em)}
                  className="p-2.5 rounded-lg bg-black/60 border border-cyan-500/20 hover:border-cyan-400 text-left flex items-center justify-between group cursor-pointer transition-all"
                >
                  <span className="text-gray-300 group-hover:text-cyan-300 truncate">{em}</span>
                  <FiCopy className="text-gray-500 group-hover:text-cyan-300 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* 16 Gravatar Social Channels */}
          <div className="holo-panel p-6 rounded-2xl">
            <h3 className="font-orbitron font-bold text-base text-yellow-300 mb-6 flex items-center gap-2">
              <FiShare2 />
              <span>VERIFIED GRAVATAR CHANNELS (ALL 16 PLATFORMS)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 font-mono-code text-xs">
              {socialChannels.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => emitSound('chime')}
                  className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex flex-col items-center text-center group"
                >
                  <div className="text-2xl text-cyan-400 group-hover:scale-110 transition-transform mb-2">
                    {s.icon}
                  </div>
                  <div className="font-orbitron font-bold text-xs text-white group-hover:text-cyan-300">
                    {s.name}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5 truncate w-full">
                    {s.tag}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MULTI-LAYER CASE STUDY MODAL INSPECTOR
          ═══════════════════════════════════════════════════════ */}
      {selectedCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="holo-panel rounded-3xl w-[96vw] sm:w-[740px] max-h-[88vh] overflow-hidden flex flex-col border-2 border-cyan-400 shadow-[0_0_60px_rgba(0,240,255,0.4)]">
            <div className="holo-corner-tl" />
            <div className="holo-corner-tr" />
            <div className="holo-corner-bl" />
            <div className="holo-corner-br" />

            {/* Modal Header */}
            <div className="p-5 border-b border-cyan-500/30 flex items-center justify-between bg-[#040e22]">
              <div className="flex items-center gap-3">
                <span className="text-3xl filter drop-shadow-[0_0_10px_#00f0ff]">{selectedCaseStudy.icon}</span>
                <div>
                  <h3 className="font-orbitron font-extrabold text-base text-white">{selectedCaseStudy.title}</h3>
                  <p className="text-xs font-mono-code text-cyan-300">{selectedCaseStudy.code} // {selectedCaseStudy.category}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  emitSound('chime');
                  setSelectedCaseStudy(null);
                }}
                className="w-8 h-8 rounded bg-black/60 border border-cyan-500/40 text-cyan-300 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 4-Layer Tab Switcher */}
            <div className="px-5 py-2.5 bg-black/60 border-b border-cyan-500/20 flex flex-wrap gap-2 font-mono-code text-xs">
              {[
                { key: 'schematic' as const, label: 'LAYER 1: SCHEMATIC' },
                { key: 'architecture' as const, label: 'LAYER 2: ARCHITECTURE & CODE' },
                { key: 'telemetry' as const, label: 'LAYER 3: TELEMETRY & IMPACT' },
                { key: 'security' as const, label: 'LAYER 4: SECURITY & WARDS' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    emitSound('layerSwitch');
                    setActiveLayer(tab.key);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeLayer === tab.key
                      ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.6)]'
                      : 'text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Layer Content View */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm font-mono-code flex-1">
              {activeLayer === 'schematic' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold">MISSION STATEMENT</span>
                    <h4 className="text-base font-bold text-white font-orbitron mt-1">{selectedCaseStudy.schematic.tagline}</h4>
                    <p className="text-xs text-gray-300 font-rajdhani mt-2 leading-relaxed">{selectedCaseStudy.schematic.summary}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded bg-black/60 border border-cyan-500/20">
                      <p className="text-[10px] text-gray-400 uppercase">TARGET DOMAIN</p>
                      <p className="text-xs text-yellow-300 font-bold mt-1">{selectedCaseStudy.schematic.targetDomain}</p>
                    </div>
                    <div className="p-3.5 rounded bg-black/60 border border-cyan-500/20">
                      <p className="text-[10px] text-gray-400 uppercase">DEPLOYMENT CLASSIFICATION</p>
                      <p className="text-xs text-emerald-400 font-bold mt-1">{selectedCaseStudy.schematic.status}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeLayer === 'architecture' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded bg-black/60 border border-cyan-500/20">
                    <p className="text-[10px] text-gray-400 uppercase mb-1">ARCHITECTURAL DESIGN PATTERN</p>
                    <p className="text-xs text-cyan-300 font-bold">{selectedCaseStudy.architecture.pattern}</p>
                  </div>

                  <div className="p-3.5 rounded bg-black/60 border border-cyan-500/20">
                    <p className="text-[10px] text-gray-400 uppercase mb-2">LAYER SEPARATION MODEL</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCaseStudy.architecture.layers.map((l, i) => (
                        <span key={i} className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px]">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400 uppercase mb-1">CODE ARTIFACT BLUEPRINT</p>
                    <pre className="p-3.5 rounded bg-[#01040a] border border-cyan-500/40 text-xs text-cyan-300 overflow-x-auto font-mono-code leading-relaxed">
                      {selectedCaseStudy.architecture.codeSnippet}
                    </pre>
                  </div>
                </div>
              )}

              {activeLayer === 'telemetry' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded bg-black/60 border border-cyan-500/20">
                      <p className="text-[9px] text-gray-400">PLANETARY INSTALLS</p>
                      <p className="text-sm font-bold text-cyan-300 font-orbitron mt-1">{selectedCaseStudy.telemetry.installs}</p>
                    </div>
                    <div className="p-3 rounded bg-black/60 border border-cyan-500/20">
                      <p className="text-[9px] text-gray-400">ACTIVE TELEMETRY</p>
                      <p className="text-sm font-bold text-emerald-400 font-orbitron mt-1">{selectedCaseStudy.telemetry.activeUsers}</p>
                    </div>
                    <div className="p-3 rounded bg-black/60 border border-cyan-500/20">
                      <p className="text-[9px] text-gray-400">RELIABILITY SLA</p>
                      <p className="text-sm font-bold text-yellow-300 font-orbitron mt-1">{selectedCaseStudy.telemetry.uptime}</p>
                    </div>
                    <div className="p-3 rounded bg-black/60 border border-cyan-500/20">
                      <p className="text-[9px] text-gray-400">STORE SCORE</p>
                      <p className="text-sm font-bold text-purple-300 font-orbitron mt-1">{selectedCaseStudy.telemetry.rating}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold">MEASURED BUSINESS IMPACT</span>
                    <p className="text-xs text-gray-200 mt-1 font-rajdhani leading-relaxed">{selectedCaseStudy.telemetry.impactNote}</p>
                  </div>
                </div>
              )}

              {activeLayer === 'security' && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded bg-black/60 border border-cyan-500/20">
                    <p className="text-[10px] text-cyan-400 uppercase font-bold mb-0.5">LOCAL DATA ENCRYPTION</p>
                    <p className="text-xs text-gray-300">{selectedCaseStudy.security.encryption}</p>
                  </div>
                  <div className="p-3 rounded bg-black/60 border border-cyan-500/20">
                    <p className="text-[10px] text-cyan-400 uppercase font-bold mb-0.5">AUTHENTICATION MATRIX</p>
                    <p className="text-xs text-gray-300">{selectedCaseStudy.security.authentication}</p>
                  </div>
                  <div className="p-3 rounded bg-black/60 border border-cyan-500/20">
                    <p className="text-[10px] text-cyan-400 uppercase font-bold mb-0.5">NETWORK DEFLECTOR WARDS</p>
                    <p className="text-xs text-gray-300">{selectedCaseStudy.security.networkWards}</p>
                  </div>
                  <div className="p-3 rounded bg-black/60 border border-cyan-500/20">
                    <p className="text-[10px] text-cyan-400 uppercase font-bold mb-0.5">COMPLIANCE PROTOCOLS</p>
                    <p className="text-xs text-gray-300">{selectedCaseStudy.security.compliance}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-cyan-500/30 bg-[#040e22] flex items-center justify-between">
              <button
                onClick={() => setSelectedCaseStudy(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-gray-300 rounded font-orbitron text-xs font-bold transition-colors"
              >
                CLOSE INSPECTOR
              </button>
              <a
                href={selectedCaseStudy.url}
                target="_blank"
                rel="noopener noreferrer"
                className="holo-btn-primary px-5 py-2 font-orbitron font-bold text-xs flex items-center gap-2"
              >
                <span>OPEN REPOSITORY</span>
                <FiExternalLink />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          AURA HOLOGRAPHIC AI ASSISTANT ENTITY
          ═══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-6 right-6 z-40">
        {!auraOpen ? (
          <button
            onClick={() => {
              emitSound('aiVoice');
              setAuraOpen(true);
            }}
            className="group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#040e22]/95 border-2 border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.5)] hover:border-yellow-400 transition-all cursor-pointer animate-entity-float"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-black font-bold animate-entity-aura">
                ✦
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-left font-mono-code">
              <p className="text-[9px] text-gray-400">HOLOGRAM ENTITY</p>
              <p className="text-xs font-bold text-cyan-300 font-orbitron">AURA AI</p>
            </div>
          </button>
        ) : (
          <div className="w-[92vw] sm:w-[420px] max-h-[540px] rounded-3xl holo-panel flex flex-col shadow-[0_0_60px_rgba(0,240,255,0.6)] border-2 border-cyan-400 overflow-hidden">
            <div className="p-3.5 bg-[#030d1e] border-b border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-orbitron font-bold text-xs text-white">AURA 3D HOLOGRAPHIC ENTITY</span>
              </div>
              <button
                onClick={() => setAuraOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Conversation Log */}
            <div className="p-3.5 bg-[#02050e] flex-1 overflow-y-auto space-y-3 font-mono-code text-xs max-h-[350px]">
              {auraLogs.map((log, idx) => (
                <div key={idx} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                    log.sender === 'user'
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200'
                      : 'bg-[#06142a] border border-cyan-500/20 text-gray-200 shadow-inner'
                  }`}>
                    {log.sender === 'aura' && (
                      <span className="text-[9px] text-yellow-300 font-bold block mb-1">
                        [AURA HOLOGRAPHIC PROJECTION]
                      </span>
                    )}
                    {log.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Diagnostic Chips */}
            <div className="p-2 bg-[#040e22] border-t border-cyan-500/20 flex flex-wrap gap-1">
              {['Clean Architecture', 'Startup Metrics', 'PulseSync Flagship', 'Subspace Comms'].map(query => (
                <button
                  key={query}
                  onClick={() => askAura(query)}
                  className="px-2 py-0.5 rounded bg-black/60 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 border border-cyan-500/20 text-[10px] font-mono-code cursor-pointer"
                >
                  +{query}
                </button>
              ))}
            </div>

            {/* Query Input */}
            <div className="p-2.5 bg-[#020612] border-t border-cyan-500/20 flex items-center gap-2">
              <input
                type="text"
                value={auraInput}
                onChange={(e) => setAuraInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAura()}
                placeholder="Ask AURA about 3D architecture..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-black border border-cyan-500/40 text-xs text-white focus:outline-none focus:border-cyan-300 font-mono-code"
              />
              <button
                onClick={() => askAura()}
                className="holo-btn-primary px-3 py-1.5 font-orbitron font-bold text-xs rounded transition-colors cursor-pointer"
              >
                PROMPT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          HOLOGRAPHIC FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="py-16 px-4 bg-[#010308] border-t border-cyan-500/30 relative z-10 font-mono-code text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-orbitron font-bold text-sm text-white">
                MOE KYAW AUNG // မိုးကျော်အောင်
              </span>
            </div>
            <p className="text-gray-400 text-[11px]">
              Senior Mobile Architect · Technical Founder · Tachileik 🇲🇲 ↔ Bangkok 🇹🇭
            </p>
          </div>

          <div className="text-center md:text-right text-gray-400 text-[11px] space-y-1">
            <p className="text-cyan-300 font-mono-code">
              OMNI-SPHERE FLUX: 99.8% · POWERED BY KOTLIN, COMPOSE & CLEAN ARCHITECTURE
            </p>
            <p>© 2026 MOE KYAW AUNG. ALL HOLOGRAPHIC RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
