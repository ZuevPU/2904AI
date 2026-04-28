const stages = Array.from(document.querySelectorAll(".stage"));
const stageDots = Array.from(document.querySelectorAll(".stage-dot"));
const stageIndicator = document.getElementById("stageIndicator");
const progressFill = document.getElementById("progressFill");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const menuToggle = document.getElementById("menuToggle");
const stageNav = document.getElementById("stageNav");

let currentStage = 0;

const libraryPrompts = [
  "Создай интерактивный диалог-тренажёр: ученик играет роль Раскольникова, отвечает на вопросы Сони. 5 реплик с вариантами ответов и обратной связью",
  "Придумай 3 задачи на проценты в контексте футбола. Добавь визуальную подсказку и пошаговое решение",
  "Создай интерактивный рабочий лист по теме 'Линейные уравнения'. Генерируй 5 случайных уравнений вида ax + b = c (коэффициенты должны быть целыми числами от -10 до 10). Ученик вводит ответ в поле. При нажатии 'Проверить': если верно — зеленым цветом 'Молодец!', если неверно — покажи правильный ответ и краткую подсказку, как решить (например: 'Сначала перенеси свободный член вправо'). В конце покажи итоговый счет (например, 4 из 5). Дизайн должен быть строгим, школьным.",
  "Создай квиз из 7 вопросов по теме 'Фотосинтез' с разным уровнем сложности. После каждого ответа — объяснение, почему вариант верный/неверный"
];

function renderStage() {
  stages.forEach((stage, index) => {
    stage.classList.toggle("active", index === currentStage);
  });

  stageDots.forEach((dot, index) => {
    const isActive = index === currentStage;
    dot.classList.toggle("active", isActive);
    dot.setAttribute("aria-current", isActive ? "step" : "false");
  });

  stageIndicator.textContent = `Этап ${currentStage + 1}/4`;
  progressFill.style.width = `${((currentStage + 1) / stages.length) * 100}%`;

  prevBtn.disabled = currentStage === 0;
  nextBtn.disabled = currentStage === stages.length - 1;
}

function goToStage(stageIndex) {
  if (stageIndex < 0 || stageIndex >= stages.length) return;
  currentStage = stageIndex;
  renderStage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

prevBtn.addEventListener("click", () => goToStage(currentStage - 1));
nextBtn.addEventListener("click", () => goToStage(currentStage + 1));

stageDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    goToStage(Number(dot.dataset.step));
    stageNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

menuToggle?.addEventListener("click", () => {
  const isOpen = stageNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

function getCopyText(button) {
  if (button.dataset.copyText) return button.dataset.copyText;
  const targetId = button.dataset.copyTarget;
  if (!targetId) return "";
  const node = document.getElementById(targetId);
  return node ? node.textContent.trim() : "";
}

function showCopyStatus(button) {
  button.classList.add("copied");
  const status = button.parentElement.querySelector(".copy-status");
  if (status) status.textContent = "Скопировано! ✓";
  const originalLabel = button.textContent;
  button.textContent = "✓ Скопировано";

  window.setTimeout(() => {
    button.classList.remove("copied");
    button.textContent = originalLabel;
    if (status) status.textContent = "";
  }, 1500);
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    showCopyStatus(button);
  } catch (error) {
    const status = button.parentElement.querySelector(".copy-status");
    if (status) status.textContent = "Не удалось скопировать";
    console.error(error);
  }
}

document.querySelectorAll(".copy-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const text = getCopyText(button);
    if (text) copyText(text, button);
  });
});

const builderInputs = [
  document.getElementById("roleInput"),
  document.getElementById("taskInput"),
  document.getElementById("contextInput"),
  document.getElementById("formatInput"),
  document.getElementById("constraintsInput")
];
const generatedPrompt = document.getElementById("generatedPrompt");
const builderOptionButtons = Array.from(document.querySelectorAll(".builder-option"));

function updatePromptBuilder() {
  if (!generatedPrompt) return;
  const values = builderInputs.map((input) => input.value.trim());
  const hasValue = values.some(Boolean);
  if (!hasValue) {
    generatedPrompt.textContent = "Заполните поля конструктора, чтобы получить готовый промпт.";
    return;
  }
  generatedPrompt.textContent = `Роль: ${values[0] || "[Роль]"}
Задача: ${values[1] || "[Задача]"}
Контекст: ${values[2] || "[Контекст]"}
Формат: ${values[3] || "[Формат]"}
Ограничения: ${values[4] || "[Ограничения]"}`;
}

builderInputs.forEach((input) => {
  if (!input) return;
  input.addEventListener("input", updatePromptBuilder);
  input.addEventListener("input", () => {
    const section = input.closest(".builder-section");
    if (!section) return;
    section.querySelectorAll(".builder-option.active").forEach((button) => {
      button.classList.remove("active");
    });
  });
});

if (builderOptionButtons.length > 0) {
  builderOptionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.builderTarget;
      if (!targetId) return;
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      const section = button.closest(".builder-section");
      if (section) {
        section.querySelectorAll(".builder-option").forEach((item) => item.classList.remove("active"));
      }
      button.classList.add("active");
      targetInput.value = button.textContent.trim();
      updatePromptBuilder();
    });
  });
}

const randomPromptBtn = document.getElementById("randomPromptBtn");
const randomPromptOutput = document.getElementById("randomPromptOutput");
const levelTabs = Array.from(document.querySelectorAll("[data-level-tab]"));
const levelPanels = Array.from(document.querySelectorAll("[data-level-panel]"));
const stage1FullscreenBtn = document.getElementById("stage1FullscreenBtn");
const stage1PromptFrame = document.getElementById("stage1PromptFrame");
const stage3FullscreenBtn = document.getElementById("stage3FullscreenBtn");
const stage3PromptFrame = document.getElementById("stage3PromptFrame");
const stage4FullscreenBtn = document.getElementById("stage4FullscreenBtn");
const stage4PromptFrame = document.getElementById("stage4PromptFrame");
const levelFullscreenButtons = Array.from(document.querySelectorAll(".level-fullscreen-btn"));
const s4BuildBtn = document.getElementById("s4BuildBtn");
const s4ClearBtn = document.getElementById("s4ClearBtn");
const s4PromptOutput = document.getElementById("s4PromptOutput");
const s4Role = document.getElementById("s4Role");
const s4Subject = document.getElementById("s4Subject");
const s4Class = document.getElementById("s4Class");
const s4Topic = document.getElementById("s4Topic");
const s4Duration = document.getElementById("s4Duration");
const s4Equipment = document.getElementById("s4Equipment");
const s4Description = document.getElementById("s4Description");
const artifactChips = Array.from(document.querySelectorAll(".artifact-chip"));
const s4TechniqueCheckboxes = Array.from(document.querySelectorAll(".s4Technique"));

if (randomPromptBtn && randomPromptOutput) {
  randomPromptBtn.addEventListener("click", () => {
    const randomItem = libraryPrompts[Math.floor(Math.random() * libraryPrompts.length)];
    randomPromptOutput.textContent = randomItem;
  });
}

function showLevel(levelId) {
  levelTabs.forEach((tab) => {
    const isActive = tab.dataset.levelTab === levelId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  levelPanels.forEach((panel) => {
    const isActive = panel.dataset.levelPanel === levelId;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });
}

levelTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    showLevel(tab.dataset.levelTab);
  });
});

async function toggleFullscreen(targetElement) {
  if (!targetElement) return;
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await targetElement.requestFullscreen();
  } catch (error) {
    console.error("Fullscreen error:", error);
  }
}

stage1FullscreenBtn?.addEventListener("click", async () => {
  await toggleFullscreen(stage1PromptFrame);
});

stage3FullscreenBtn?.addEventListener("click", async () => {
  await toggleFullscreen(stage3PromptFrame);
});

stage4FullscreenBtn?.addEventListener("click", async () => {
  await toggleFullscreen(stage4PromptFrame);
});

if (levelFullscreenButtons.length > 0) {
  levelFullscreenButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const frameId = button.dataset.fullscreenTarget;
      const frame = frameId ? document.getElementById(frameId) : null;
      await toggleFullscreen(frame);
    });
  });
}

if (artifactChips.length > 0) {
  artifactChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      artifactChips.forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
    });
  });
}

function buildStage4Prompt() {
  const role = s4Role?.value.trim() || "Ты — профессиональный методист и педагог-дизайнер с опытом создания современных уроков.";
  const subject = s4Subject?.value.trim() || "[Предмет]";
  const className = s4Class?.value.trim() || "[Класс]";
  const topic = s4Topic?.value.trim() || "[Тема]";
  const duration = s4Duration?.value.trim() || "[40 мин]";
  const equipment = s4Equipment?.value.trim() || "[проектор, смартфоны, интерактивная доска, базовый набор...]";
  const description = s4Description?.value.trim() || "[Тема / описание]";
  const activeArtifact = document.querySelector(".artifact-chip.active")?.dataset.artifactType || "Викторина / Тест";
  const selectedTechniques = s4TechniqueCheckboxes
    .filter((item) => item.checked)
    .map((item) => `□ ${item.value}`);

  const techniquesBlock = selectedTechniques.length
    ? selectedTechniques.join("\n")
    : "□ [Выберите 4-6 интерактивных приёмов]";

  return `${role}
ЗАДАЧА:
Создай детальный план гибридного урока (офлайн + цифровые элементы), который будет интересен РАЗНЫМ типам учеников.

ТЕМА / ОПИСАНИЕ:
${description}

ТИП АРТЕФАКТА:
${activeArtifact}

ПАРАМЕТРЫ УРОКА:
• Предмет: ${subject}
• Класс: ${className}
• Тема: ${topic}
• Длительность: ${duration}
• Техническое оснащение: ${equipment}

УЧТИ РАЗНЫЕ ТИПЫ УЧЕНИКОВ:
✓ Визуалы → схемы, инфографика, видео, цветовое кодирование
✓ Аудиалы → обсуждения, подкасты, озвучка, дебаты
✓ Кинестетики → движение, манипуляции, эксперименты, ролевые сценки
✓ Цифровые аборигены → гаджеты, интерактив, геймификация, мгновенная обратная связь
✓ Медлительные/тревожные → чёткие инструкции, время на осмысление, безопасная среда
✓ Одарённые/быстрые → дополнительные челленджи, исследовательские мини-задачи

СТРУКТУРА ОТВЕТА (строго по пунктам):
ЦЕЛИ (по таксономии Блума)
- Знать/Понимать/Применять/Анализировать...

ПОЭТАПНЫЙ ПЛАН (с таймингом)
Для каждого этапа укажи:
1. Название этапа + время
2. Действия учителя (конкретные фразы, инструкции)
3. Действия учеников
4. [Интерактив] — какой элемент и для каких типов учеников
5. [Цифровой инструмент] — название сервиса/приложения + как использовать
6. [Адаптация] — как включить всех типов учеников

БАНК ИНТЕРАКТИВНЫХ ПРИЁМОВ (выбери 4-6, подходящих под тему)
${techniquesBlock}

МАТЕРИАЛЫ И РЕСУРСЫ
• Для учителя: чек-лист подготовки, скрипты фраз, критерии наблюдения
• Для учеников: раздатка (текст/схема/чек-лист), ссылки, QR-коды
• Цифровые инструменты: названия + краткая инструкция "как за 1 минуту"
• Запасной офлайн-план: если техника подведёт

СЕКРЕТЫ ВОВЛЕЧЕНИЯ (практические лайфхаки)
→ Как переключить внимание, если класс "потерялся"
→ Как дать слово тихим ученикам без стресса
→ Как превратить ошибку в учебный момент
→ Как быстро проверить понимание ВСЕХ (не только активных)

ОЦЕНИВАНИЕ
• Формирующее: 2-3 быстрых способа "снять пульс" урока
• Критерии успеха: что ученик сможет СДЕЛАТЬ после урока
• Самооценка: простой шаблон для рефлексии ученика
• Домашнее задание: 3 варианта на выбор (базовый / творческий / исследовательский)

БОНУС: "Вау-момент"
Предложи 1 неожиданный элемент, который запомнится:
- Связь с реальной жизнью / профессиями
- Неочевидный факт или парадокс по теме
- Мини-эксперимент, который можно сделать прямо сейчас
- Эмоциональный якорь (история, образ, метафора)

СТИЛЬ ОТВЕТА:
• Конкретно, без воды — учитель должен взять и провести
• Примеры фраз, названий сервисов, временных рамок
• Визуальное оформление: эмодзи, маркеры, чёткие заголовки
• Адаптивность: пометки [для начальной школы] / [для старшеклассников], где уместно

ВАЖНО:
Не предлагай интерактив ради интерактива. Каждый элемент должен работать на цель урока и учитывать разнообразие учеников.`;
}

const hasStage4Builder =
  s4BuildBtn &&
  s4ClearBtn &&
  s4PromptOutput &&
  s4Role &&
  s4Subject &&
  s4Class &&
  s4Topic &&
  s4Duration &&
  s4Equipment &&
  s4Description;

if (hasStage4Builder) {
  s4BuildBtn.addEventListener("click", () => {
    s4PromptOutput.textContent = buildStage4Prompt();
  });

  s4ClearBtn.addEventListener("click", () => {
    [s4Role, s4Subject, s4Class, s4Topic, s4Duration, s4Equipment, s4Description].forEach((input) => {
      input.value = "";
    });
    s4TechniqueCheckboxes.forEach((item, idx) => {
      item.checked = idx < 4;
    });
    artifactChips.forEach((chip, idx) => chip.classList.toggle("active", idx === 0));
    s4PromptOutput.textContent = "Заполните параметры и нажмите «Собрать промпт».";
  });
}

renderStage();
