const STORAGE_KEYS = {
  userId: "quest4you.userId",
  energy: "quest4you.energy",
  completions: "quest4you.completions",
  skips: "quest4you.skips",
  dailyState: "quest4you.dailyState"
};

const QUEST_PARTS = {
  low: {
    titles: ["Soft Start", "Quiet Win", "Gentle Reset", "Small Spark", "Calm Drift"],
    intents: [
      "Do one tiny movement that gives your brain a signal of safety.",
      "Interrupt numbness with low-pressure movement and breath.",
      "Create one visible sign that you showed up for yourself physically and emotionally.",
      "Move from stuck to slightly unstuck in under 10 minutes.",
      "Reconnect with your body instead of your stress loop."
    ],
    stepOne: [
      "Take a gentle 5-minute walk indoors, on a balcony, or outside.",
      "Stand up and do 2 minutes of shoulder, neck, and wrist stretches.",
      "Put your phone away for 10 minutes and take 10 slow breaths.",
      "Sit by a window and do a 3-minute body scan from head to toe.",
      "Play one calm song and sway or pace slowly for the full song."
    ],
    stepTwo: [
      "Write 3 journal lines: what I feel, what I need, what I can do next.",
      "Do 2 minutes of slow breathing: in for 4, out for 6.",
      "Sketch or paint one tiny thing for 6 minutes with no pressure.",
      "Call or voice-note one trusted friend for a short check-in.",
      "Notice 3 sounds, 3 colors, and 3 sensations in your body."
    ],
    stepThree: [
      "Drink water, unclench your jaw, and call it complete.",
      "Write: \"I did something for me today.\"",
      "Take 60 seconds to stretch your legs and back before finishing.",
      "Put one hand on your chest and breathe out longer than in.",
      "Leave one tiny sign of completion where you can see it."
    ],
    reflections: [
      "Low-energy care still counts as real care.",
      "Small wins are not fake wins.",
      "You are allowed to recover in public and private.",
      "Done is enough today.",
      "This is progress, even if it feels quiet."
    ]
  },
  medium: {
    titles: ["Momentum Quest", "Re-entry Mission", "Mood Nudge", "Steady Climb", "Clear Head Run"],
    intents: [
      "Build momentum without overwhelming yourself.",
      "Use motion and breath to shift out of mental fog.",
      "Reconnect to life outside work-mode through movement and expression.",
      "Make one experience that feels alive and human.",
      "Do one quest that restores attention, body energy, and connection."
    ],
    stepOne: [
      "Take a 12-minute walk outdoors or through your building.",
      "Do 8 minutes of body movement: stretch, yoga, or light mobility.",
      "Play two songs and keep your body moving for both.",
      "Step outside for sunlight and walk while noticing your breathing.",
      "Put your phone away and take a mindful walk for 10 minutes."
    ],
    stepTwo: [
      "Write 5 journal lines: what hurt, what helped, what matters now.",
      "Paint or sketch for 10 minutes with zero perfection pressure.",
      "Call a friend or loved one for a short human check-in.",
      "Do a 5-minute guided meditation with eyes closed or soft focus.",
      "Set a 7-minute timer and do one task while your phone stays away."
    ],
    stepThree: [
      "Pause for 30 seconds and notice how your body feels now.",
      "Drink water and take a full exhale before moving on.",
      "Say out loud: \"I kept a promise to myself.\"",
      "Log this quest as completed and stretch for 60 seconds.",
      "End with one thing you are grateful you noticed."
    ],
    reflections: [
      "You do not need perfect consistency for this to work.",
      "Motion often comes before motivation.",
      "A gentle push is still a push.",
      "Your effort matters even on average days.",
      "You are rebuilding trust with yourself."
    ]
  },
  high: {
    titles: ["Adventure Pulse", "Connection Run", "Bold Shift", "Open World Quest", "Energy Sprint"],
    intents: [
      "Use today's energy to create a meaningful moment.",
      "Turn momentum into a memory.",
      "Break routine with intentional novelty.",
      "Channel your energy into connection and care.",
      "Invest your high-energy window in yourself."
    ],
    stepOne: [
      "Take a new route to a cafe, park, or nearby spot.",
      "Do a 15-minute walk with upbeat music.",
      "Start a mini project for 12 focused minutes.",
      "Visit a new corner of your neighborhood.",
      "Do a focused home reset sprint for 10 minutes."
    ],
    stepTwo: [
      "Start one brief conversation with someone (cashier counts).",
      "Send one message of appreciation to someone you value.",
      "Take two photos of details that catch your eye.",
      "Create one tangible thing: note, sketch, checklist, or playlist.",
      "Pick one task you've postponed and do the first 10 minutes."
    ],
    stepThree: [
      "Write one sentence about what surprised you.",
      "Mark the quest complete and celebrate with a deep breath.",
      "Stretch for 60 seconds and notice your mood shift.",
      "Close with one action that sets up tomorrow-you.",
      "Take 30 seconds to appreciate your effort."
    ],
    reflections: [
      "Energy used with intention becomes self-respect.",
      "You turned motion into meaning.",
      "You are building a life, not just finishing tasks.",
      "You showed yourself what is still possible.",
      "This is how bigger change starts: one quest at a time."
    ]
  }
};

const todayLabel = document.getElementById("today-label");
const questTitle = document.getElementById("quest-title");
const questIntent = document.getElementById("quest-intent");
const questSteps = document.getElementById("quest-steps");
const questReflect = document.getElementById("quest-reflect");
const statusLine = document.getElementById("status-line");
const completeButton = document.getElementById("complete-button");
const skipButton = document.getElementById("skip-button");
const generateButton = document.getElementById("generate-button");
const spinButton = document.getElementById("spin-button");
const optionsHint = document.getElementById("options-hint");
const completedCount = document.getElementById("completed-count");
const streakCount = document.getElementById("streak-count");
const weekDots = document.getElementById("week-dots");

let selectedEnergy = getStoredValue(STORAGE_KEYS.energy, null);
let dailyQuestState = getStoredValue(STORAGE_KEYS.dailyState, null);

init();

function init() {
  const today = getTodayString();
  todayLabel.textContent = formatDate(today);

  ensureUserId();
  hydrateDailyState(today);
  syncEnergyButtons();
  updateGenerateControls();
  if (dailyQuestState.generated && selectedEnergy) {
    renderQuest();
  } else {
    renderQuestPlaceholder();
  }
  renderStats();
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedEnergy = chip.dataset.energy;
      setStoredValue(STORAGE_KEYS.energy, selectedEnergy);

      dailyQuestState.energy = selectedEnergy;
      dailyQuestState.variant = 0;
      dailyQuestState.generated = false;
      setStoredValue(STORAGE_KEYS.dailyState, dailyQuestState);

      syncEnergyButtons();
      updateGenerateControls();
      renderQuestPlaceholder();
      const totalOptions = getOptionCount(selectedEnergy);
      optionsHint.textContent = `Great choice. You have ${totalOptions}+ possible quests here.`;
      statusLine.textContent = "Now press Generate Quest to reveal today's experience.";
    });
  });

  generateButton.addEventListener("click", () => {
    if (!selectedEnergy) {
      statusLine.textContent = "Pick an energy level first, then generate your quest.";
      return;
    }

    dailyQuestState.energy = selectedEnergy;
    dailyQuestState.generated = true;
    dailyQuestState.variant = Number(dailyQuestState.variant || 0);
    setStoredValue(STORAGE_KEYS.dailyState, dailyQuestState);

    renderQuest();
    updateGenerateControls();
    statusLine.textContent = "Quest generated. You can spin for another option anytime.";
  });

  spinButton.addEventListener("click", () => {
    if (!selectedEnergy || !dailyQuestState.generated) {
      statusLine.textContent = "Generate a quest first, then spin for more options.";
      return;
    }

    dailyQuestState.variant = Number(dailyQuestState.variant || 0) + 1;
    setStoredValue(STORAGE_KEYS.dailyState, dailyQuestState);

    renderQuest();
    statusLine.textContent = "Spun. New quest loaded for your current energy level.";
  });

  completeButton.addEventListener("click", () => {
    const today = getTodayString();
    const completions = getStoredValue(STORAGE_KEYS.completions, []);

    if (!completions.includes(today)) {
      completions.push(today);
      completions.sort();
      setStoredValue(STORAGE_KEYS.completions, completions);
    }

    statusLine.textContent = "Quest completed. That counts, even if it felt small.";
    renderStats();
  });

  skipButton.addEventListener("click", () => {
    const today = getTodayString();
    const skips = getStoredValue(STORAGE_KEYS.skips, []);

    if (!skips.includes(today)) {
      skips.push(today);
      setStoredValue(STORAGE_KEYS.skips, skips);
    }

    statusLine.textContent = "No guilt. Rest is a valid move. Come back tomorrow.";
  });
}

function hydrateDailyState(today) {
  if (!dailyQuestState || dailyQuestState.date !== today) {
    dailyQuestState = {
      date: today,
      energy: selectedEnergy,
      variant: 0,
      generated: false
    };
    setStoredValue(STORAGE_KEYS.dailyState, dailyQuestState);
  } else {
    selectedEnergy = dailyQuestState.energy || selectedEnergy;
  }
}

function renderQuest() {
  if (!selectedEnergy) {
    renderQuestPlaceholder();
    return;
  }

  const userId = getStoredValue(STORAGE_KEYS.userId, "default-user");
  const dateSeed = hashString(`${dailyQuestState.date}-${userId}-${selectedEnergy}`);
  const variant = Number(dailyQuestState.variant || 0);
  const quest = buildQuest(selectedEnergy, dateSeed + variant * 97);

  questTitle.textContent = quest.title;
  questIntent.textContent = quest.intent;
  questReflect.textContent = quest.reflection;

  questSteps.innerHTML = "";
  quest.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    questSteps.appendChild(li);
  });

  completeButton.disabled = false;
  spinButton.disabled = false;
}

function renderQuestPlaceholder() {
  questTitle.textContent = "Choose your energy and press Generate Quest";
  questIntent.textContent = "You are in control. Pick your level, then reveal an experience.";
  questReflect.textContent = "";
  questSteps.innerHTML = "";
  completeButton.disabled = true;
  spinButton.disabled = true;
}

function updateGenerateControls() {
  generateButton.disabled = !selectedEnergy;
}

function buildQuest(energy, seedBase) {
  const group = QUEST_PARTS[energy] || QUEST_PARTS.medium;

  const titleA = pick(group.titles, seedBase + 1);
  const titleB = pick(group.titles, seedBase + 2);
  const intent = pick(group.intents, seedBase + 3);
  const stepOne = pick(group.stepOne, seedBase + 4);
  const stepTwo = pick(group.stepTwo, seedBase + 5);
  const stepThree = pick(group.stepThree, seedBase + 6);
  const reflection = pick(group.reflections, seedBase + 7);

  const title = `${titleA} ${titleB}`;

  return {
    title,
    intent,
    steps: [stepOne, stepTwo, stepThree],
    reflection
  };
}

function pick(items, seed) {
  return items[(seededRandom(seed) * items.length) | 0];
}

function getOptionCount(energy) {
  const group = QUEST_PARTS[energy] || QUEST_PARTS.medium;
  return group.titles.length * group.intents.length * group.stepOne.length * group.stepTwo.length;
}

function renderStats() {
  const completions = getStoredValue(STORAGE_KEYS.completions, []);
  completedCount.textContent = String(completions.length);
  streakCount.textContent = String(calculateStreak(completions));

  weekDots.innerHTML = "";
  const last7 = getLastNDates(7);

  last7.forEach((day) => {
    const dot = document.createElement("div");
    dot.className = "week-dot";
    if (completions.includes(day)) {
      dot.classList.add("completed");
    }
    dot.title = day;
    weekDots.appendChild(dot);
  });
}

function calculateStreak(completions) {
  if (!completions.length) return 0;

  const completionSet = new Set(completions);
  let streak = 0;
  let cursor = new Date();

  while (true) {
    const cursorString = toISODate(cursor);
    if (completionSet.has(cursorString)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    break;
  }

  return streak;
}

function ensureUserId() {
  let id = getStoredValue(STORAGE_KEYS.userId, null);
  if (!id) {
    id = `user-${Math.random().toString(36).slice(2, 10)}`;
    setStoredValue(STORAGE_KEYS.userId, id);
  }
}

function syncEnergyButtons() {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.energy === selectedEnergy);
  });
}

function getStoredValue(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStoredValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getTodayString() {
  return toISODate(new Date());
}

function toISODate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

function getLastNDates(n) {
  const dates = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(toISODate(d));
  }

  return dates;
}

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
