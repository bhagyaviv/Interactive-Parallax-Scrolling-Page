/* ==========================================================================
   SPECIMEN DATA REGISTRY
   ========================================================================== */
const creatureData = {
  shark: {
    id: "SHRK-042",
    zone: "TWILIGHT ZONE (200m - 1000m)",
    name: "Sphyrna lewini",
    commonName: "Scalloped Hammerhead Shark",
    description: "Known to descend into the Twilight Zone to forage. They possess highly specialized sensory organs called the Ampullae of Lorenzini, allowing them to detect the weak electromagnetic fields of prey hiding in the dark ocean bed.",
    maxDepth: "1,000 m",
    bio: "NONE",
    mechanism: "Electroreception (Lorenzini pores)"
  },
  jellyfish: {
    id: "CNID-108",
    zone: "MIDNIGHT ZONE (1000m - 4000m)",
    name: "Aurelia aurita",
    commonName: "Bioluminescent Moon Jelly",
    description: "A translucent drifter that emits a soft cyan bioluminescence. In the pitch black of the Midnight Zone, they use their glowing bells to confuse predators and attract plankton to their stinging tentacles.",
    maxDepth: "1,500 m",
    bio: "LOW (Cyan fluorescence)",
    mechanism: "Green Fluorescent Proteins (GFP)"
  },
  "jellyfish-purple": {
    id: "CNID-215",
    zone: "MIDNIGHT ZONE (1000m - 4000m)",
    name: "Periphylla periphylla",
    commonName: "Helmet Jellyfish",
    description: "A deep-water jellyfish with a deep reddish-purple bell. They display rapid light-flashing behavior when disturbed, triggering a blinding burst of bioluminescence designed to startle deep-sea hunters.",
    maxDepth: "7,000 m",
    bio: "HIGH (Flashing Magenta)",
    mechanism: "Luciferin-luciferase reaction"
  },
  vent: {
    id: "GEO-909",
    zone: "THE ABYSS (4000m - 6000m)",
    name: "Black Smoker",
    commonName: "Hydrothermal Vent",
    description: "Mineral-rich chimneys formed from geothermal activity beneath the crust. They spew mineral-heavy water at temperatures exceeding 400°C. They sustain unique chemotrophic ecosystems that survive without any sunlight.",
    maxDepth: "Sub-crustal",
    bio: "THERMAL INFRARED GLOW",
    mechanism: "Chemosynthetic bacteria symbiosis"
  },
  squid: {
    id: "CEPH-772",
    zone: "THE ABYSS (4000m - 6000m)",
    name: "Architeuthis dux",
    commonName: "Giant Squid",
    description: "An elusive giant of the deep ocean. Equipped with eyes the size of basketballs to capture any faint speck of light, they hunt in deep submarine canyons, engaging in legendary battles with sperm whales.",
    maxDepth: "2,000 m+",
    bio: "MODERATE (Photophores)",
    mechanism: "Light-emitting skin cells"
  },
  anglerfish: {
    id: "TELE-093",
    zone: "HADAL TRENCHES (6000m+)",
    name: "Melanocetus johnsonii",
    commonName: "Humpback Anglerfish",
    description: "A legendary ambush predator. Females carry a glowing bulb (esca) extending from their head, filled with symbiotic bioluminescent bacteria. They wave this light to lure curious prey directly into their needle-sharp jaws.",
    maxDepth: "4,500 m",
    bio: "HIGH (Luminous Lure)",
    mechanism: "Symbiotic Photobacterium"
  },
  ruins: {
    id: "ANOM-001",
    zone: "HADAL TRENCHES (6000m+)",
    name: "Challenger Monoliths",
    commonName: "Submerged Ancient Ruins",
    description: "Highly geometric structures found embedded in the walls of the Mariana Trench. Covered in glowing alien-like glyphs, they emit localized magnetic fields and thermal spikes that defy geological explanation.",
    maxDepth: "10,994 m",
    bio: "ANOMALOUS (Constant pink emission)",
    mechanism: "Unknown Energy Signature"
  }
};

/* ==========================================================================
   DOM ELEMENTS SELECTORS
   ========================================================================== */
const scrollContainer = document.getElementById("scroll-container");
const depthNumber = document.getElementById("depth-number");
const tempNumber = document.getElementById("temp-number");
const pressureNumber = document.getElementById("pressure-number");
const progressBar = document.getElementById("gauge-progress-bar");
const consoleLogs = document.getElementById("console-logs");
const sonarContainer = document.getElementById("sonar-container");
const sonarPingBtn = document.getElementById("sonar-ping-btn");
const cruiseBtn = document.getElementById("cruise-btn");
const resurfaceBtn = document.getElementById("resurface-btn");
const speedBars = document.getElementById("speed-bars-indicator").children;
const glitchOverlay = document.getElementById("hud-glitch");
const audioBtn = document.getElementById("audio-btn");
const sonarSound = document.getElementById("sonar-sound");
const ambientOcean = document.getElementById("ambient-ocean");

// Modal Elements
const creatureModal = document.getElementById("creature-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalId = document.getElementById("modal-id");
const modalZone = document.getElementById("modal-zone");
const modalName = document.getElementById("modal-name");
const modalCommonName = document.getElementById("modal-common-name");
const modalDescription = document.getElementById("modal-description");
const modalStatDepth = document.getElementById("modal-stat-depth");
const modalStatBio = document.getElementById("modal-stat-bio");
const modalStatMechanism = document.getElementById("modal-stat-mechanism");

/* ==========================================================================
   STATE VARIABLES
   ========================================================================== */
let scrollY = 0;
let maxScroll = 1;
let currentDepth = 0;
let targetDepth = 0;
let isCruising = false;
let cruiseSpeed = 2; // Pixels per frame
let activeZone = "epipelagic";
let audioEnabled = false;

/* ==========================================================================
   DIAGNOSTIC LOGGING FUNCTION
   ========================================================================== */
function logTelemetry(message, type = "info") {
  const timestamp = new Date().toLocaleTimeString([], { hour12: false });
  const logDiv = document.createElement("div");
  logDiv.textContent = `[${timestamp}] ${message}`;
  
  if (type === "success") logDiv.className = "text-green";
  else if (type === "warning") logDiv.className = "text-magenta";
  else if (type === "info") logDiv.className = "text-cyan";
  
  consoleLogs.appendChild(logDiv);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;

  // Keep logs list lean
  if (consoleLogs.children.length > 20) {
    consoleLogs.removeChild(consoleLogs.firstChild);
  }
}

/* ==========================================================================
   PARALLAX SCROLL CONTROLLER
   ========================================================================== */
const parallaxLayers = document.querySelectorAll(".parallax-layer");

function updateParallax() {
  scrollY = window.pageYOffset || document.documentElement.scrollTop;
  maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) maxScroll = 1;

  // Update root scroll variable for CSS
  document.documentElement.style.setProperty("--scroll-y", `${scrollY}px`);

  // Move layers dynamically
  parallaxLayers.forEach(layer => {
    const speed = parseFloat(layer.getAttribute("data-speed")) || 0;
    const axis = layer.getAttribute("data-axis") || "vertical";
    
    // Calculate vertical offset relative to current scroll
    if (axis === "vertical") {
      let yOffset = scrollY * speed;
      layer.style.transform = `translateY(${yOffset}px) translateZ(0)`;
    }
  });

  // Calculate dynamic ocean telemetry values
  const scrollPct = scrollY / maxScroll;
  progressBar.style.height = `${scrollPct * 100}%`;

  // Calculate Depth: 0m to 10,994m (Challenger Deep)
  targetDepth = Math.round(scrollPct * 10994);

  // Smooth telemetry numbers update
  currentDepth += (targetDepth - currentDepth) * 0.15;
  if (Math.abs(targetDepth - currentDepth) < 1) currentDepth = targetDepth;

  depthNumber.textContent = Math.round(currentDepth).toLocaleString();

  // Temperature formula: Starts at 24.5C, drops fast, stabilizes around 1.2C
  let currentTemp = 24.5 - (scrollPct * 20); // Fast drop first
  if (scrollPct > 0.1) {
    currentTemp = 4.5 - ((scrollPct - 0.1) * 3.3);
  }
  if (currentTemp < 1.2) currentTemp = 1.2;
  tempNumber.textContent = currentTemp.toFixed(1);

  // Pressure: increases by 1 atm for every 10m depth
  let currentPressure = 1.0 + (currentDepth / 10);
  pressureNumber.textContent = currentPressure.toFixed(1);

  // Check and trigger Zone transitions
  checkZoneTransitions(scrollPct);
  
  // Custom horizontal movements for deep sea creatures based on scroll
  animateCreatures(scrollY);
}

// Track zone thresholds
const zoneThresholds = [
  { limit: 0.15, key: "epipelagic", name: "EPIPELAGIC ZONE (Sunlight)" },
  { limit: 0.40, key: "mesopelagic", name: "MESOPELAGIC ZONE (Twilight)" },
  { limit: 0.65, key: "bathypelagic", name: "BATHYPELAGIC ZONE (Midnight)" },
  { limit: 0.88, key: "abyssopelagic", name: "ABYSSOPELAGIC ZONE (The Abyss)" },
  { limit: 1.00, key: "hadal", name: "HADAL ZONE (Trenches)" }
];

function checkZoneTransitions(scrollPct) {
  let activeIndex = 0;
  for (let i = 0; i < zoneThresholds.length; i++) {
    if (scrollPct >= (i > 0 ? zoneThresholds[i-1].limit : 0)) {
      activeIndex = i;
    }
  }

  const newZone = zoneThresholds[activeIndex].key;
  if (newZone !== activeZone) {
    activeZone = newZone;
    
    // Highlight depth gauge marker
    document.querySelectorAll(".gauge-marker").forEach(marker => {
      if (marker.getAttribute("data-zone") === activeZone) {
        marker.classList.add("active");
      } else {
        marker.classList.remove("active");
      }
    });

    // Screen glitch animation when crossing pressure barriers
    glitchOverlay.classList.add("glitch-active");
    setTimeout(() => {
      glitchOverlay.classList.remove("glitch-active");
    }, 450);

    logTelemetry(`Entering ${zoneThresholds[activeIndex].name}.`, "success");
    logTelemetry(`Ambient Pressure: ${pressureNumber.textContent} ATM. Temp: ${tempNumber.textContent}°C.`, "info");
  }
}

// Side creature animations linked to scroll positions
function animateCreatures(scrollY) {
  // Shark swims in Twilight
  const shark = document.getElementById("shark-creature");
  const sharkSection = document.getElementById("mesopelagic");
  const sharkStart = sharkSection.offsetTop - window.innerHeight;
  if (scrollY > sharkStart && scrollY < sharkStart + window.innerHeight * 2.5) {
    const progress = (scrollY - sharkStart) / (window.innerHeight * 2.5);
    // Move from right to left
    const xPos = 120 - (progress * 160); // Percentage offset
    const yPos = Math.sin(progress * Math.PI * 2) * 50; // Wavy vertical swim path
    shark.style.transform = `translateX(${xPos}%) translateY(${yPos}px)`;
  }

  // Squid swims in Abyss
  const squid = document.getElementById("squid-creature");
  const squidSection = document.getElementById("abyssopelagic");
  const squidStart = squidSection.offsetTop - window.innerHeight;
  if (scrollY > squidStart && scrollY < squidStart + window.innerHeight * 2.5) {
    const progress = (scrollY - squidStart) / (window.innerHeight * 2.5);
    // Move diagonally from bottom-right to top-left
    const xPos = 110 - (progress * 150);
    const yPos = 80 - (progress * 120);
    squid.style.transform = `translateX(${xPos}%) translateY(${yPos}px) rotate(${-15 + (progress * 25)}deg)`;
  }

  // Anglerfish cruises in Hadal
  const angler = document.getElementById("angler-creature");
  const anglerSection = document.getElementById("hadal");
  const anglerStart = anglerSection.offsetTop - window.innerHeight;
  if (scrollY > anglerStart && scrollY < anglerStart + window.innerHeight * 2.5) {
    const progress = (scrollY - anglerStart) / (window.innerHeight * 2.5);
    // Move from left to right
    const xPos = -40 + (progress * 160);
    const yPos = Math.sin(progress * Math.PI * 4) * 30; // Rapid swimming oscillation
    angler.style.transform = `translateX(${xPos}%) translateY(${yPos}px)`;
  }
}

// Performant scroll listener using requestAnimationFrame
let lastScrollY = 0;
function onScroll() {
  lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  requestAnimationFrame(updateParallax);
}

window.addEventListener("scroll", onScroll);
window.addEventListener("resize", () => {
  requestAnimationFrame(updateParallax);
});

/* ==========================================================================
   AMBIENT BUBBLE PHYSICS ENGINE (HTML5 CANVAS)
   ========================================================================== */
const canvas = document.getElementById("bubble-canvas");
const ctx = canvas.getContext("2d");

let bubbles = [];
const bubbleCount = 45;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Bubble {
  constructor() {
    this.reset();
    this.y = Math.random() * canvas.height; // Distribute vertically at start
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 20;
    this.size = Math.random() * 4 + 1; // 1px to 5px size
    this.speed = Math.random() * 1.5 + 0.5; // Upward speed
    this.wobble = Math.random() * 0.02; // Side wiggle frequency
    this.wobbleSpeed = Math.random() * 0.05;
    this.wobbleAngle = 0;
    this.opacity = Math.random() * 0.4 + 0.1;
  }

  update() {
    this.y -= this.speed * (1 + (scrollY / 1000) * 0.02); // Speed up slightly as page scrolls
    this.wobbleAngle += this.wobbleSpeed;
    this.x += Math.sin(this.wobbleAngle) * 0.3;

    // Check bounds
    if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.fill();

    // Glint highlight on bubble
    if (this.size > 2) {
      ctx.beginPath();
      ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 1.8})`;
      ctx.fill();
    }
  }
}

// Initialize bubble array
for (let i = 0; i < bubbleCount; i++) {
  bubbles.push(new Bubble());
}

function animateBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  bubbles.forEach(bubble => {
    bubble.update();
    bubble.draw();
  });

  requestAnimationFrame(animateBubbles);
}
requestAnimationFrame(animateBubbles);

/* ==========================================================================
   SONAR SYSTEM (RADAR SCANNER & CLICK TRIGGER)
   ========================================================================== */
function triggerSonar(clickX, clickY) {
  // Play sonar ping sound (if unmuted)
  if (audioEnabled) {
    sonarSound.currentTime = 0;
    sonarSound.play().catch(e => console.log("Audio play blocked by browser."));
  }

  // Create sonar ring element
  const ring = document.createElement("div");
  ring.className = "sonar-ring";
  ring.style.left = `${clickX}px`;
  ring.style.top = `${clickY}px`;
  sonarContainer.appendChild(ring);

  // Remove ring element after animation completes
  setTimeout(() => {
    ring.remove();
  }, 1600);

  logTelemetry("Sonar pulse emitted. Analyzing reflections...", "info");

  // Check all revealable items in active viewport
  const revealables = document.querySelectorAll(".sonar-reveal");
  let detectedCount = 0;

  revealables.forEach(item => {
    const rect = item.getBoundingClientRect();
    const itemX = rect.left + rect.width / 2;
    const itemY = rect.top + rect.height / 2;
    
    // Distance between click point and creature center
    const dist = Math.hypot(clickX - itemX, clickY - itemY);

    // Expand discovery window
    if (dist < window.innerWidth * 1.2) {
      // Add detected class with staggered delay based on distance
      const delay = dist * 0.8; // millisecond delay based on sound speed wave
      setTimeout(() => {
        if (!item.classList.contains("detected")) {
          item.classList.add("detected");
          detectedCount++;
          const name = item.id.replace("-creature", "").replace("hydro-", "").replace("ancient-", "");
          logTelemetry(`Bio-signature locked: SPECIMEN [${name.toUpperCase()}].`, "success");
        }
      }, delay);
    }
  });
}

// Sonar trigger on screen click
document.body.addEventListener("click", (e) => {
  // Avoid triggers when clicking interactive HUD panels or close buttons
  if (
    e.target.closest(".dashboard-hud") || 
    e.target.closest(".main-header") || 
    e.target.closest(".depth-gauge-container") ||
    e.target.closest(".console-hud") ||
    e.target.closest(".info-card") ||
    e.target.closest(".section-content")
  ) {
    return;
  }
  triggerSonar(e.clientX, e.clientY);
});

// Keypress listener for Sonar (Key P)
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "p") {
    // Ping from screen center
    triggerSonar(window.innerWidth / 2, window.innerHeight / 2);
  }
});

// Dashboard HUD Button binding
sonarPingBtn.addEventListener("click", () => {
  triggerSonar(window.innerWidth / 2, window.innerHeight / 2);
});

/* ==========================================================================
   AUTO-CRUISE PILOT CONTROLS
   ========================================================================== */
let cruiseAnimationFrame;

function cruiseScroll() {
  if (!isCruising) return;
  
  let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  if (currentScroll >= maxScroll - 1) {
    stopCruise();
    logTelemetry("Descent target achieved. Auto Descent deactivated.", "success");
    return;
  }

  window.scrollTo(0, currentScroll + cruiseSpeed);
  cruiseAnimationFrame = requestAnimationFrame(cruiseScroll);
}

function startCruise() {
  isCruising = true;
  cruiseBtn.classList.add("active");
  cruiseBtn.querySelector(".btn-text").textContent = "STOP PILOT";
  
  // Activate speed bars
  for (let i = 0; i < speedBars.length; i++) {
    speedBars[i].classList.add("active");
  }
  
  logTelemetry("Auto Descent pilot engaged. Initiating hull thrusters...", "info");
  requestAnimationFrame(cruiseScroll);
}

function stopCruise() {
  isCruising = false;
  cruiseBtn.classList.remove("active");
  cruiseBtn.querySelector(".btn-text").textContent = "AUTO DESCENT";
  
  // Reset speed bars to lowest thruster level
  for (let i = 1; i < speedBars.length; i++) {
    speedBars[i].classList.remove("active");
  }

  logTelemetry("Auto Descent pilot disengaged.", "warning");
  cancelAnimationFrame(cruiseAnimationFrame);
}

cruiseBtn.addEventListener("click", () => {
  if (isCruising) {
    stopCruise();
  } else {
    startCruise();
  }
});

/* ==========================================================================
   SPECIMEN MODAL CARDS HANDLERS
   ========================================================================== */
document.querySelectorAll(".creature-hover-hotspot").forEach(hotspot => {
  hotspot.addEventListener("click", (e) => {
    e.stopPropagation(); // Avoid triggering screen-wide Sonar ping on hotspot click
    
    const key = hotspot.getAttribute("data-creature");
    const data = creatureData[key];
    
    if (data) {
      modalId.textContent = data.id;
      modalZone.textContent = data.zone;
      modalName.textContent = data.name;
      modalCommonName.textContent = data.commonName;
      modalDescription.textContent = data.description;
      modalStatDepth.textContent = data.maxDepth;
      modalStatBio.textContent = data.bio;
      modalStatMechanism.textContent = data.mechanism;
      
      creatureModal.classList.add("active");
      logTelemetry(`Opening Specimen Analysis File: ${data.id}.`, "info");
    }
  });
});

closeModalBtn.addEventListener("click", () => {
  creatureModal.classList.remove("active");
});

// Close modal on clicking backdrop
creatureModal.addEventListener("click", (e) => {
  if (e.target === creatureModal) {
    creatureModal.classList.remove("active");
  }
});

/* ==========================================================================
   RAPID ASCENT PROTOCOL
   ========================================================================== */
let ascentInterval;

resurfaceBtn.addEventListener("click", () => {
  if (isCruising) stopCruise();

  logTelemetry("EMERGENCY SYSTEM ACTIVATED.", "warning");
  logTelemetry("INITIATING BALLAST TANKS BLOWOUT. STAND BY FOR RAPID ASCENT.", "warning");
  
  // Flash Glitch effect continuously during ascent
  glitchOverlay.classList.add("glitch-active");

  const startScroll = window.pageYOffset || document.documentElement.scrollTop;
  const duration = 2500; // 2.5 seconds to surface
  const startTime = performance.now();

  function ascentAnimation(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-in-out ease function
    const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out
    const nextScroll = startScroll * (1 - ease);
    
    window.scrollTo(0, nextScroll);

    if (progress < 1) {
      requestAnimationFrame(ascentAnimation);
    } else {
      glitchOverlay.classList.remove("glitch-active");
      logTelemetry("Submersible safely surfaced. Ballast tanks reset.", "success");
    }
  }

  requestAnimationFrame(ascentAnimation);
});

/* ==========================================================================
   AUDIO SETTINGS
   ========================================================================== */
audioBtn.addEventListener("click", () => {
  audioEnabled = !audioEnabled;

  if (audioEnabled) {
    audioBtn.classList.add("active");
    audioBtn.querySelector("span").textContent = "MUTE SOUND";
    ambientOcean.play().catch(e => console.log("Ambient audio blocked by user permission."));
    logTelemetry("Submersible hydrophone array: ENABLED", "success");
  } else {
    audioBtn.classList.remove("active");
    audioBtn.querySelector("span").textContent = "PLAY SOUND";
    ambientOcean.pause();
    logTelemetry("Submersible hydrophone array: DISABLED", "warning");
  }
});

/* ==========================================================================
   DEPTH ANCHORS CLICK DELEGATION
   ========================================================================== */
document.querySelectorAll(".gauge-marker").forEach(marker => {
  marker.addEventListener("click", (e) => {
    e.stopPropagation();
    const zoneId = marker.getAttribute("data-zone");
    const targetElement = document.getElementById(zoneId);
    
    if (targetElement) {
      if (isCruising) stopCruise();
      
      logTelemetry(`Setting autopilot target: ${zoneId.toUpperCase()}`, "info");
      
      // Perform smooth scroll to target
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  });
});

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
window.onload = () => {
  // Reset scroll to top on refresh for consistent loading sequence
  setTimeout(() => {
    window.scrollTo(0, 0);
    updateParallax();
  }, 100);
  
  logTelemetry("All systems ready. Awaiting instructions.", "success");
};
