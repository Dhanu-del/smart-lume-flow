import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Car,
  Cpu,
  Gauge,
  Leaf,
  Lightbulb,
  MapPin,
  Moon,
  Pause,
  Play,
  Radar,
  RotateCcw,
  Sun,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SMARTLUME – Speed-Adaptive Smart Street Lighting" },
      {
        name: "description",
        content:
          "Interactive simulation of adaptive street lighting: higher vehicle speed illuminates a longer road section ahead, cutting energy waste on empty roads.",
      },
      { property: "og:title", content: "SMARTLUME – Speed-Adaptive Smart Street Lighting" },
      {
        property: "og:description",
        content:
          "Simulated smart-city prototype: vehicle detection, speed-based illumination distance and live energy-saving analytics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SmartLume,
});

const ZONES = 10;
const ZONE_LEN = 100;
const ROAD_LEN = ZONES * ZONE_LEN;
const WATT_PER_ZONE = 100;
const CONVENTIONAL_W = ZONES * WATT_PER_ZONE;
const TIME_SCALE = 6; // simulation speed-up factor for demo purposes

type Mode =
  | "DAYLIGHT MODE"
  | "STANDBY MODE"
  | "LOW-SPEED MODE"
  | "NORMAL-SPEED MODE"
  | "HIGH-SPEED SAFETY MODE";

function rangeForSpeed(speed: number) {
  if (speed <= 40) return 200;
  if (speed <= 80) return 400;
  return 500;
}

function modeForSpeed(speed: number): Mode {
  if (speed <= 40) return "LOW-SPEED MODE";
  if (speed <= 80) return "NORMAL-SPEED MODE";
  return "HIGH-SPEED SAFETY MODE";
}

function SmartLume() {
  const [speed, setSpeed] = useState(60);
  const [position, setPosition] = useState(150);
  const [detected, setDetected] = useState(true);
  const [night, setNight] = useState(true);
  const [running, setRunning] = useState(false);
  const [auto, setAuto] = useState(false);
  const [autoStage, setAutoStage] = useState(0);

  // --- motion loop -------------------------------------------------------
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    if (!running) {
      last.current = null;
      return;
    }
    const tick = (t: number) => {
      if (last.current === null) last.current = t;
      const dt = (t - last.current) / 1000;
      last.current = t;
      const metres = (speedRef.current / 3.6) * dt * TIME_SCALE;
      setPosition((p) => (p + metres) % ROAD_LEN);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      last.current = null;
    };
  }, [running]);

  // --- automatic demo ----------------------------------------------------
  const stages = useMemo(
    () => [
      { label: "Stage 1 · Empty road — all lights OFF (standby)", ms: 2600 },
      { label: "Stage 2 · Vehicle enters — SIMULATED DETECTION triggered", ms: 2400 },
      { label: "Stage 3 · 30 km/h — 200 m illuminated ahead", ms: 4200 },
      { label: "Stage 4 · 60 km/h — 400 m illuminated ahead", ms: 4200 },
      { label: "Stage 5 · 100 km/h — 500 m+ illuminated ahead", ms: 4600 },
      { label: "Stage 6 · Vehicle passes — lights behind dim and switch OFF", ms: 3600 },
      { label: "Stage 7 · Road empty — back to standby", ms: 2600 },
    ],
    [],
  );

  useEffect(() => {
    if (!auto) return;
    const apply = (s: number) => {
      switch (s) {
        case 0:
          setNight(true);
          setDetected(false);
          setRunning(false);
          setPosition(0);
          setSpeed(0);
          break;
        case 1:
          setDetected(true);
          setSpeed(20);
          setPosition(20);
          setRunning(true);
          break;
        case 2:
          setSpeed(30);
          break;
        case 3:
          setSpeed(60);
          break;
        case 4:
          setSpeed(100);
          break;
        case 5:
          setSpeed(100);
          break;
        case 6:
          setRunning(false);
          setDetected(false);
          setSpeed(0);
          break;
      }
    };
    apply(autoStage);
    const id = window.setTimeout(() => {
      if (autoStage >= stages.length - 1) {
        setAuto(false);
        setAutoStage(0);
      } else {
        setAutoStage((s) => s + 1);
      }
    }, stages[autoStage]!.ms);
    return () => window.clearTimeout(id);
  }, [auto, autoStage, stages]);

  const startAuto = () => {
    setAutoStage(0);
    setAuto(true);
  };

  const reset = () => {
    setAuto(false);
    setAutoStage(0);
    setRunning(false);
    setSpeed(60);
    setPosition(150);
    setDetected(true);
    setNight(true);
  };

  // --- lighting logic ----------------------------------------------------
  const illumination = rangeForSpeed(speed);
  const lightingActive = night && detected;
  const mode: Mode = !night ? "DAYLIGHT MODE" : !detected ? "STANDBY MODE" : modeForSpeed(speed);

  const zoneState = useMemo(() => {
    const start = position;
    const end = position + illumination;
    return Array.from({ length: ZONES }, (_, i) => {
      const zStart = i * ZONE_LEN;
      const zEnd = zStart + ZONE_LEN;
      if (!lightingActive) return { on: false, level: night ? 0.06 : 0 };
      const inRange = zEnd > start && zStart < end;
      const isVehicleZone = position >= zStart && position < zEnd;
      if (inRange || isVehicleZone) return { on: true, level: 1 };
      // fading tail right behind the vehicle
      if (zEnd <= start && start - zEnd < ZONE_LEN) return { on: false, level: 0.28 };
      return { on: false, level: 0.06 };
    });
  }, [position, illumination, lightingActive, night]);

  const activeZones = zoneState.filter((z) => z.on).length;
  const currentPower = activeZones * WATT_PER_ZONE;
  const savedPower = CONVENTIONAL_W - currentPower;
  const savingPct = Math.round((savedPower / CONVENTIONAL_W) * 100);
  const highSpeed = lightingActive && speed > 80;

  const setSpeedManual = (v: number) => {
    setAuto(false);
    setSpeed(v);
  };
  const setPositionManual = (v: number) => {
    setAuto(false);
    setRunning(false);
    setPosition(v);
  };

  const demo = useCallback((s: number) => {
    setAuto(false);
    setSpeed(s);
    setDetected(true);
    setNight(true);
    setRunning(true);
  }, []);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <Header />

      <section className="mx-auto mt-6 max-w-7xl">
        <ProblemStrip />
      </section>

      <section className="mx-auto mt-6 grid max-w-7xl gap-6 lg:grid-cols-[1.65fr_1fr]">
        <div className="space-y-4">
          <Road
            position={position}
            zoneState={zoneState}
            night={night}
            illumination={illumination}
            lightingActive={lightingActive}
            highSpeed={highSpeed}
            mode={mode}
          />

          {auto && (
            <div className="panel animate-fade-in px-4 py-3 text-sm">
              <span className="hud-label">Full automatic demo</span>
              <p className="mt-1 font-semibold text-primary glow-text">
                {stages[autoStage]!.label}
              </p>
              <div className="mt-2 flex gap-1">
                {stages.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= autoStage ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <Controls
            speed={speed}
            position={position}
            detected={detected}
            night={night}
            running={running}
            mode={mode}
            onSpeed={setSpeedManual}
            onPosition={setPositionManual}
            onDetected={(v) => {
              setAuto(false);
              setDetected(v);
            }}
            onNight={(v) => {
              setAuto(false);
              setNight(v);
            }}
            onRunning={(v) => {
              setAuto(false);
              setRunning(v);
            }}
            onDemo={demo}
            onAuto={startAuto}
            onReset={reset}
            auto={auto}
          />
        </div>

        <div className="space-y-4">
          <Dashboard
            speed={speed}
            position={position}
            detected={detected}
            illumination={lightingActive ? illumination : 0}
            activeZones={activeZones}
            currentPower={currentPower}
            savingPct={savingPct}
            mode={mode}
          />
          <EnergyPanel
            currentPower={currentPower}
            savedPower={savedPower}
            savingPct={savingPct}
          />
          <DemoScenario />
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl gap-6 lg:grid-cols-2">
        <FlowCard
          title="How the system works"
          icon={<Cpu className="h-4 w-4" />}
          steps={[
            "Vehicle Detection",
            "Speed Estimation",
            "ESP32 / Edge Controller",
            "Lighting Distance Calculation",
            "Adaptive Street Lights",
            "Energy Saving + Improved Visibility",
          ]}
          note="Real-world implementation can use long-range radar, LiDAR, computer vision or other suitable sensing technologies. The current prototype uses simulated detection."
        />
        <FlowCard
          title="Real-world deployment"
          icon={<Radar className="h-4 w-4" />}
          steps={[
            "Roadside Detection Sensors",
            "Edge Controller",
            "Wireless Communication",
            "Smart LED Street Lights",
            "Central Monitoring Dashboard",
          ]}
          tags={[
            "Highways",
            "Expressways",
            "Rural roads",
            "Industrial roads",
            "Low-traffic urban roads",
            "Campus roads",
          ]}
        />
      </section>

      <footer className="mx-auto mt-10 max-w-7xl pb-8 text-center text-xs text-muted-foreground">
        SMARTLUME · Digital simulation prototype · Detection is simulated, not physical sensing.
      </footer>
    </main>
  );
}

/* ------------------------------- header -------------------------------- */

function Header() {
  return (
    <header className="mx-auto max-w-7xl">
      <div className="panel flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary shadow-[var(--glow-primary)]">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-[0.18em] text-primary glow-text sm:text-3xl">
              SMARTLUME
            </h1>
            <p className="text-sm text-muted-foreground">
              Speed-Adaptive Smart Street Lighting · Smart-City Control Simulation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-warn/40 bg-warn/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-warn">
          <Radar className="h-4 w-4" /> SIMULATED LONG-RANGE DETECTION · UP TO 1 KM
        </div>
      </div>
    </header>
  );
}

function ProblemStrip() {
  const items = [
    { k: "Problem", v: "Street lights burn electricity even when roads are empty." },
    { k: "Solution", v: "Light only the road section an approaching vehicle actually needs." },
    { k: "Innovation", v: "Higher speed → longer illuminated distance ahead." },
    { k: "Key feature", v: "High-speed vehicle → minimum 500 m illumination ahead." },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <div key={i.k} className="panel px-4 py-3">
          <span className="hud-label text-primary">{i.k}</span>
          <p className="mt-1 text-sm leading-snug">{i.v}</p>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- road --------------------------------- */

function Road({
  position,
  zoneState,
  night,
  illumination,
  lightingActive,
  highSpeed,
  mode,
}: {
  position: number;
  zoneState: { on: boolean; level: number }[];
  night: boolean;
  illumination: number;
  lightingActive: boolean;
  highSpeed: boolean;
  mode: Mode;
}) {
  const posPct = (position / ROAD_LEN) * 100;
  const litStart = posPct;
  const litWidth = Math.min(100 - posPct, (illumination / ROAD_LEN) * 100);

  return (
    <div
      className="panel relative overflow-hidden px-4 pb-4 pt-3 transition-colors duration-700"
      style={{
        background: night
          ? "linear-gradient(180deg, oklch(0.19 0.04 255), oklch(0.14 0.03 250))"
          : "linear-gradient(180deg, oklch(0.72 0.09 230), oklch(0.55 0.07 235))",
      }}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="hud-label">1 km simulated road · 10 × 100 m lighting zones</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold tracking-widest ${
            mode === "HIGH-SPEED SAFETY MODE"
              ? "bg-warn/20 text-warn"
              : mode === "DAYLIGHT MODE"
                ? "bg-secondary text-secondary-foreground"
                : "bg-primary/15 text-primary"
          }`}
        >
          {mode}
        </span>
      </div>

      {highSpeed && (
        <div className="mb-3 animate-fade-in rounded-lg border border-warn/50 bg-warn/10 px-4 py-2">
          <p className="font-display text-sm font-bold tracking-widest text-warn">
            ⚠ HIGH-SPEED SAFETY MODE ACTIVE
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-warn/90">
            VEHICLE <ArrowRight className="h-3 w-3" />
            <ArrowRight className="h-3 w-3" />
            <ArrowRight className="h-3 w-3" /> 500 m+ ROAD ILLUMINATED AHEAD
          </p>
        </div>
      )}

      {/* lamps top */}
      <LampRow zoneState={zoneState} night={night} side="top" />

      {/* road surface */}
      <div className="relative h-28 overflow-hidden rounded-md bg-[oklch(0.22_0.01_250)] sm:h-32">
        {/* illuminated pool */}
        {lightingActive && (
          <div
            className="absolute inset-y-0 transition-all duration-500 ease-out"
            style={{
              left: `${litStart}%`,
              width: `${litWidth}%`,
              background:
                "linear-gradient(90deg, color-mix(in oklab, var(--lamp) 42%, transparent), color-mix(in oklab, var(--lamp) 10%, transparent))",
            }}
          />
        )}
        {/* zone dividers */}
        {Array.from({ length: ZONES - 1 }, (_, i) => (
          <div
            key={i}
            className="absolute inset-y-0 w-px bg-white/10"
            style={{ left: `${((i + 1) / ZONES) * 100}%` }}
          />
        ))}
        {/* lane markings */}
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.55)_0_36px,transparent_36px_76px)]" />
        <div className="absolute inset-x-0 top-1 h-0.5 bg-white/25" />
        <div className="absolute inset-x-0 bottom-1 h-0.5 bg-white/25" />

        {/* vehicle */}
        <div
          className="absolute top-1/2 z-10 -translate-y-1/2 transition-[left] duration-200 ease-linear"
          style={{ left: `calc(${posPct}% - 18px)` }}
        >
          <div className="relative">
            <div
              className="absolute left-7 top-1/2 h-8 w-24 -translate-y-1/2 rounded-r-full opacity-70 blur-[6px]"
              style={{
                background:
                  "linear-gradient(90deg, color-mix(in oklab, var(--lamp) 85%, transparent), transparent)",
              }}
            />
            <div className="relative grid h-9 w-11 place-items-center rounded-md bg-primary text-primary-foreground shadow-[var(--glow-primary)]">
              <Car className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* lamps bottom */}
      <LampRow zoneState={zoneState} night={night} side="bottom" />

      {/* zone scale */}
      <div className="mt-2 grid grid-cols-10 gap-1">
        {zoneState.map((z, i) => (
          <div
            key={i}
            className={`rounded px-1 py-1 text-center text-[10px] font-semibold transition-colors duration-300 ${
              z.on ? "bg-lamp/25 text-lamp" : "bg-white/5 text-muted-foreground"
            }`}
          >
            <div>Z{i + 1}</div>
            <div className="hidden sm:block">{i * 100}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LampRow({
  zoneState,
  night,
  side,
}: {
  zoneState: { on: boolean; level: number }[];
  night: boolean;
  side: "top" | "bottom";
}) {
  return (
    <div className="grid grid-cols-10 gap-1 py-1">
      {zoneState.map((z, i) => {
        const level = night ? z.level : 0;
        return (
          <div
            key={i}
            className={`flex justify-center ${side === "top" ? "items-end" : "items-start"}`}
          >
            <div className={`flex flex-col items-center ${side === "top" ? "" : "flex-col-reverse"}`}>
              <div
                className="h-3 w-3 rounded-full transition-all duration-500"
                style={{
                  background:
                    level > 0.5
                      ? "var(--lamp)"
                      : `color-mix(in oklab, var(--lamp) ${level * 100}%, oklch(0.3 0.01 250))`,
                  boxShadow: level > 0.5 ? "0 0 16px 5px color-mix(in oklab, var(--lamp) 60%, transparent)" : "none",
                }}
              />
              <div className="h-4 w-0.5 bg-white/25 sm:h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ controls -------------------------------- */

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      aria-label={ariaLabel}
      className="range-cyan"
      style={{ ["--fill" as string]: `${fill}%` }}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

function Toggle({
  on,
  onChange,
  onLabel,
  offLabel,
  onIcon,
  offIcon,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  onLabel: string;
  offLabel: string;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
      <button
        onClick={() => onChange(true)}
        className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-bold tracking-wider transition-colors ${
          on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {onIcon} {onLabel}
      </button>
      <button
        onClick={() => onChange(false)}
        className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-bold tracking-wider transition-colors ${
          !on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {offIcon} {offLabel}
      </button>
    </div>
  );
}

function Controls({
  speed,
  position,
  detected,
  night,
  running,
  mode,
  onSpeed,
  onPosition,
  onDetected,
  onNight,
  onRunning,
  onDemo,
  onAuto,
  onReset,
  auto,
}: {
  speed: number;
  position: number;
  detected: boolean;
  night: boolean;
  running: boolean;
  mode: Mode;
  onSpeed: (v: number) => void;
  onPosition: (v: number) => void;
  onDetected: (v: boolean) => void;
  onNight: (v: boolean) => void;
  onRunning: (v: boolean) => void;
  onDemo: (s: number) => void;
  onAuto: () => void;
  onReset: () => void;
  auto: boolean;
}) {
  return (
    <div className="panel space-y-5 p-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="hud-label">Vehicle speed</span>
            <span className="font-display text-3xl font-bold text-primary glow-text">
              {Math.round(speed)}
              <span className="ml-1 text-sm text-muted-foreground">km/h</span>
            </span>
          </div>
          <div className="mt-3">
            <Slider value={speed} min={0} max={120} step={1} onChange={onSpeed} ariaLabel="Vehicle speed" />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>0</span>
            <span>40</span>
            <span>80</span>
            <span>120</span>
          </div>
          <p className="mt-2 text-xs font-bold tracking-widest text-primary">{mode}</p>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="hud-label">Vehicle position</span>
            <span className="font-display text-3xl font-bold text-primary glow-text">
              {Math.round(position)}
              <span className="ml-1 text-sm text-muted-foreground">m</span>
            </span>
          </div>
          <div className="mt-3">
            <Slider
              value={Math.round(position)}
              min={0}
              max={1000}
              step={1}
              onChange={onPosition}
              ariaLabel="Vehicle position"
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>0 m</span>
            <span>500 m</span>
            <span>1000 m</span>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onRunning(!running)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
            >
              {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {running ? "PAUSE" : "START"}
            </button>
            <button
              onClick={onReset}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-bold tracking-wider transition-colors hover:bg-secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" /> RESET
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <span className="hud-label flex items-center gap-1.5">
              <Radar className="h-3.5 w-3.5" /> Simulated long-range sensor
            </span>
          </div>
          <div className="mt-2">
            <Toggle
              on={detected}
              onChange={onDetected}
              onLabel="DETECTED"
              offLabel="NOT DETECTED"
              onIcon={<Car className="h-3.5 w-3.5" />}
              offIcon={<span>○</span>}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Detection status:{" "}
            <span className={detected ? "font-bold text-success" : "font-bold text-muted-foreground"}>
              {detected ? "✓ VEHICLE DETECTED" : "○ NO VEHICLE DETECTED"}
            </span>
            <br />
            Detection range: <span className="text-foreground">Simulated: up to 1 km</span>
          </p>
        </div>

        <div>
          <span className="hud-label">Ambient light control</span>
          <div className="mt-2">
            <Toggle
              on={night}
              onChange={onNight}
              onLabel="NIGHT"
              offLabel="DAY"
              onIcon={<Moon className="h-3.5 w-3.5" />}
              offIcon={<Sun className="h-3.5 w-3.5" />}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {night
              ? "Adaptive lighting enabled — system responds to detection and speed."
              : "DAYLIGHT MODE — all street lights are switched OFF."}
          </p>
        </div>
      </div>

      <div>
        <span className="hud-label">Quick demos</span>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <DemoBtn label="LOW SPEED" sub="30 km/h · 200 m" onClick={() => onDemo(30)} />
          <DemoBtn label="MEDIUM SPEED" sub="60 km/h · 400 m" onClick={() => onDemo(60)} />
          <DemoBtn label="HIGH SPEED" sub="100 km/h · 500 m+" onClick={() => onDemo(100)} />
          <DemoBtn label="FULL AUTO DEMO" sub="7-stage sequence" onClick={onAuto} highlight active={auto} />
        </div>
      </div>
    </div>
  );
}

function DemoBtn({
  label,
  sub,
  onClick,
  highlight,
  active,
}: {
  label: string;
  sub: string;
  onClick: () => void;
  highlight?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-3 text-left transition-all hover:-translate-y-0.5 ${
        highlight
          ? "border-accent bg-accent/15 hover:bg-accent/25"
          : "border-border bg-secondary/60 hover:border-primary/60"
      } ${active ? "shadow-[var(--glow-primary)]" : ""}`}
    >
      <div className="font-display text-sm font-bold tracking-wider">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </button>
  );
}

/* ------------------------------ dashboard ------------------------------- */

function Dashboard({
  speed,
  position,
  detected,
  illumination,
  activeZones,
  currentPower,
  savingPct,
  mode,
}: {
  speed: number;
  position: number;
  detected: boolean;
  illumination: number;
  activeZones: number;
  currentPower: number;
  savingPct: number;
  mode: Mode;
}) {
  const cells = [
    { label: "Vehicle speed", value: `${Math.round(speed)} km/h`, icon: <Gauge className="h-3.5 w-3.5" /> },
    { label: "Vehicle position", value: `${Math.round(position)} m`, icon: <MapPin className="h-3.5 w-3.5" /> },
    {
      label: "Detection status",
      value: detected ? "DETECTED" : "NOT DETECTED",
      icon: <Radar className="h-3.5 w-3.5" />,
    },
    {
      label: "Illumination range",
      value: `${illumination} m`,
      icon: <Lightbulb className="h-3.5 w-3.5" />,
    },
    { label: "Active light zones", value: `${activeZones} / 10`, icon: <Activity className="h-3.5 w-3.5" /> },
    { label: "Current power", value: `${currentPower} W`, icon: <Zap className="h-3.5 w-3.5" /> },
    { label: "Conventional power", value: `${CONVENTIONAL_W} W`, icon: <Zap className="h-3.5 w-3.5" /> },
    { label: "Energy saved", value: `${savingPct} %`, icon: <Leaf className="h-3.5 w-3.5" /> },
  ];
  return (
    <div className="panel p-5">
      <h2 className="font-display text-sm font-bold tracking-[0.2em] text-primary">CONTROL DASHBOARD</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {cells.map((c) => (
          <div key={c.label} className="rounded-lg border border-border/70 bg-secondary/40 px-3 py-2">
            <div className="hud-label flex items-center gap-1">{c.icon}{c.label}</div>
            <div className="font-display text-lg font-bold text-foreground">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2">
        <div className="hud-label">System mode</div>
        <div className="font-display text-lg font-bold text-primary glow-text">{mode}</div>
      </div>
    </div>
  );
}

function Bar({ pct, tone }: { pct: number; tone: "primary" | "destructive" | "success" }) {
  const bg =
    tone === "primary" ? "bg-primary" : tone === "destructive" ? "bg-destructive" : "bg-success";
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full transition-all duration-500 ${bg}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function EnergyPanel({
  currentPower,
  savedPower,
  savingPct,
}: {
  currentPower: number;
  savedPower: number;
  savingPct: number;
}) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="panel p-5">
      <h2 className="font-display text-sm font-bold tracking-[0.2em] text-primary">ENERGY SAVING</h2>
      <div className="mt-3 flex items-center gap-5">
        <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="var(--success)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - savingPct / 100)}
            style={{ transition: "stroke-dashoffset 500ms ease" }}
          />
          <text
            x="60"
            y="60"
            transform="rotate(90 60 60)"
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--foreground)"
            fontSize="24"
            fontWeight="700"
          >
            {savingPct}%
          </text>
        </svg>
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-xs">
              <span className="hud-label">Conventional</span>
              <span className="font-bold">{CONVENTIONAL_W} W</span>
            </div>
            <Bar pct={100} tone="destructive" />
          </div>
          <div>
            <div className="flex justify-between text-xs">
              <span className="hud-label">Smart system</span>
              <span className="font-bold">{currentPower} W</span>
            </div>
            <Bar pct={(currentPower / CONVENTIONAL_W) * 100} tone="primary" />
          </div>
          <div className="text-xs text-muted-foreground">
            Power saved: <span className="font-bold text-success">{savedPower} W</span> · 100 W per zone
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoScenario() {
  const lines = [
    "A vehicle approaches a dark road.",
    "At low speed only a shorter section is illuminated.",
    "As speed increases, the illuminated area grows automatically.",
    "At high speed at least 500 m ahead is illuminated.",
    "After the vehicle passes, lights gradually switch off.",
  ];
  return (
    <div className="panel p-5">
      <h2 className="font-display text-sm font-bold tracking-[0.2em] text-primary">HACKATHON DEMO</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {lines.map((l) => (
          <li key={l} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span className="text-muted-foreground">{l}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm font-semibold text-success">
        Result: improved visibility + reduced unnecessary electricity consumption.
      </p>
    </div>
  );
}

function FlowCard({
  title,
  icon,
  steps,
  note,
  tags,
}: {
  title: string;
  icon: React.ReactNode;
  steps: string[];
  note?: string;
  tags?: string[];
}) {
  return (
    <div className="panel p-5">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold tracking-[0.2em] text-primary">
        {icon} {title.toUpperCase()}
      </h2>
      <ol className="mt-4 space-y-1">
        {steps.map((s, i) => (
          <li key={s}>
            <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-semibold">
              {s}
            </div>
            {i < steps.length - 1 && <div className="py-0.5 text-center text-primary">↓</div>}
          </li>
        ))}
      </ol>
      {tags && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              {t}
            </span>
          ))}
        </div>
      )}
      {note && <p className="mt-4 text-xs italic text-muted-foreground">{note}</p>}
    </div>
  );
}
