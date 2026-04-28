/*
===========================================
  MADDAD PROJECT — script.js
  كل منطق التطبيق في ملف واحد
===========================================

  أقسام هذا الملف (ابحث عن التعليقات):
  
  1. [INDEX PAGE]         ← دوال صفحة البداية
  2. [PARENT PAGE]        ← تسجيل الدخول وإنشاء الحساب
  3. [HOME NEW PAGE]      ← الصفحة الرئيسية (بعد التسجيل أول مرة)
  4. [HOME LOGIN PAGE]    ← الصفحة الرئيسية (بعد الدخول)
  5. [QUESTIONNAIRE]      ← منطق الاستبيان العشرة أسئلة
  6. [RESULT PAGE]        ← عرض النتيجة + رسالة التذكير للمتوسط
  7. [FOLLOWUP PAGE]      ← أسئلة المتابعة (للخطر العالي فقط)
  8. [GROWTH DATA]        ← بيانات مساحة النمو (ألعاب + نصائح)
  9. [GAMES PAGE]         ← صفحة مساحة النمو
  10. [GROWTH DETAIL]     ← تفاصيل اللعبة أو النصيحة
  11. [CHILD PAGES]       ← صفحات الطفل

  منطق التصنيف:
  - منخفض  → لا أسئلة متابعة، يرجع للرئيسية
  - متوسط  → لا أسئلة متابعة، يروح للألعاب مباشرة + تذكير بعد شهر
  - عالي   → أسئلة متابعة إلزامية

  ألوان التطبيق:
  - الكحلي الأساسي: #3c5274
  - الكحلي الفاتح:  #7a93b5  (زر السابق)
  - الكحلي الناعم:  #c8d8ea  (خلفيات)
===========================================
*/

/* =========================
   INDEX PAGE
========================= */
function goParent() {
  window.location.href = "pages/parent.html";
}

function goChild(){
  window.location.href="pages/child-login.html";
}


/* =========================
   PARENT PAGE
========================= */
function showSignup() {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("signupBox").style.display = "block";
}

function showLogin() {
  document.getElementById("signupBox").style.display = "none";
  document.getElementById("loginBox").style.display = "block";
}

function selectOption(button, inputId, value, errorId) {
  const group = button.parentElement;
  const buttons = group.querySelectorAll(".selection-btn");

  buttons.forEach(btn => btn.classList.remove("selected"));
  button.classList.add("selected");

  document.getElementById(inputId).value = value;

  if (errorId) {
    document.getElementById(errorId).textContent = "";
  }
}

function validateEmail(input, errorId) {
  const error = document.getElementById(errorId);
  const pattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  const value = input.value.trim();

  if (!value) {
    error.textContent = "البريد الإلكتروني مطلوب";
  } else if (!pattern.test(value)) {
    error.textContent = "صيغة البريد الإلكتروني غير صحيحة";
  } else {
    error.textContent = "";
  }
}

// mode: isSignup=true shows format rules | isSignup=false (login) just checks not empty
function validatePassword(input, errorId, isSignup = true) {
  const error = document.getElementById(errorId);
  const value = input.value;

  if (!value) {
    error.textContent = "كلمة المرور مطلوبة";
    input.dataset.valid = "false";
    return;
  }

  // For login: server validates — skip format rules
  if (!isSignup) {
    error.textContent = "";
    input.dataset.valid = "true";
    return;
  }

  const rules = [
    { test: value.length >= 8, label: "8 أحرف على الأقل" },
    { test: /[A-Z]/.test(value), label: "حرف كبير (A-Z)" },
    { test: /[a-z]/.test(value), label: "حرف صغير (a-z)" },
    { test: /[0-9]/.test(value), label: "رقم واحد على الأقل" },
    { test: /[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(value), label: "رمز خاص (!@#$%...)" }
  ];

  const allPassed = rules.every(rule => rule.test);
  input.dataset.valid = allPassed ? "true" : "false";

  const listItems = rules.map(rule =>
    `<li style="color:${rule.test ? 'green' : 'red'};">
      ${rule.test ? '✅' : '❌'} ${rule.label}
    </li>`
  ).join("");

  error.innerHTML = `<ul>${listItems}</ul>`;
}

function validateName(input, errorId) {
  const error = document.getElementById(errorId);
  const pattern = /^[\u0600-\u06FFa-zA-Z\s]+$/;
  const value = input.value.trim();

  if (!value) {
    error.textContent = "اسم الطفل مطلوب";
  } else if (value.length < 2) {
    error.textContent = "الاسم يجب أن يكون حرفين على الأقل";
  } else if (!pattern.test(value)) {
    error.textContent = "الاسم يجب أن يحتوي على حروف فقط";
  } else {
    error.textContent = "";
  }
}

function submitLogin() {
  const emailInput = document.getElementById("parentLoginEmail");
  const passwordInput = document.getElementById("parentLoginPassword");

  validateEmail(emailInput, "loginEmailError");
  validatePassword(passwordInput, "loginPasswordError", false);

  const emailValid = !document.getElementById("loginEmailError").textContent;
  const passwordValid = passwordInput.dataset.valid === "true";

  if (emailValid && passwordValid) {
    parentLogin();
  }
}

function submitSignup() {
  const nameInput = document.getElementById("signupChildName");
  const ageInput = document.getElementById("signupChildAge");
  const genderInput = document.getElementById("signupChildGender");
  const emailInput = document.getElementById("signupEmail");
  const passwordInput = document.getElementById("signupPassword");

  validateName(nameInput, "signupNameError");
  validateEmail(emailInput, "signupEmailError");
  validatePassword(passwordInput, "signupPasswordError");

  if (!ageInput.value) {
    document.getElementById("signupAgeError").textContent = "يرجى اختيار عمر الطفل";
  } else {
    document.getElementById("signupAgeError").textContent = "";
  }

  if (!genderInput.value) {
    document.getElementById("signupGenderError").textContent = "يرجى اختيار جنس الطفل";
  } else {
    document.getElementById("signupGenderError").textContent = "";
  }

  const nameValid = !document.getElementById("signupNameError").textContent;
  const ageValid = !!ageInput.value;
  const genderValid = !!genderInput.value;
  const emailValid = !document.getElementById("signupEmailError").textContent;
  const passwordValid = passwordInput.dataset.valid === "true";

  if (nameValid && ageValid && genderValid && emailValid && passwordValid) {
    parentSignup();
  }
}

async function parentSignup() {
  const childName = document.getElementById("signupChildName").value.trim();
  const childAge = document.getElementById("signupChildAge").value;
  const childGender = document.getElementById("signupChildGender").value;
  const parentRole = document.getElementById("signupParentRole")?.value || "";
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (!childName || !childAge || !childGender || !email || !password) {
    alert("فضلاً عبئي جميع الحقول");
    return;
  }

  // Always save locally first so data is available even without backend
  const account = {
    childName,
    childAge,
    childGender,
    parentRole,
    email,
    createdAt: new Date().toLocaleDateString("ar-SA"),
  };
  localStorage.setItem("maddadAccount", JSON.stringify(account));
  localStorage.setItem("maddadLoggedIn", "true");

  // Try the backend API
  try {
    const result = await apiRegister({
      email,
      password,
      child_name: childName,
      child_age: childAge,
      child_gender: childGender,
    });
    // Update with API response if available
    if (result && result.child_name) {
      account.childName = result.child_name;
      account.childAge = result.child_age;
      account.childGender = result.child_gender;
      localStorage.setItem("maddadAccount", JSON.stringify(account));
    }
  } catch (err) {
    if (err.status === 409) {
      alert("البريد الإلكتروني مستخدم بالفعل");
      localStorage.removeItem("maddadAccount");
      localStorage.removeItem("maddadLoggedIn");
      return;
    }
    // Backend unavailable — local data already saved above, continue
  }

  window.location.href = "home-new.html";
}

async function parentLogin() {
  const email = document.getElementById("parentLoginEmail").value.trim();
  const password = document.getElementById("parentLoginPassword").value.trim();

  if (!email || !password) {
    alert("فضلاً أدخلي البريد الإلكتروني وكلمة المرور");
    return;
  }

  // Try the backend API first
  try {
    const result = await apiLogin(email, password);
    // Ensure account info is stored from API response
    if (result && result.child_name) {
      const account = {
        childName: result.child_name,
        childAge: result.child_age,
        childGender: result.child_gender,
        email: result.email || email,
        createdAt: new Date().toLocaleDateString("ar-SA"),
      };
      localStorage.setItem("maddadAccount", JSON.stringify(account));
      localStorage.setItem("maddadLoggedIn", "true");
    }
    window.location.href = "home-login.html";
    return;
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      return;
    }
    // Backend unavailable – check whether a cached session exists for this email
    const savedAccount = JSON.parse(localStorage.getItem("maddadAccount"));
    if (savedAccount && email === savedAccount.email && localStorage.getItem("maddadLoggedIn") === "true") {
      window.location.href = "home-login.html";
    } else {
      alert("تعذّر الوصول إلى الخادم. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.");
    }
  }
}

/* =========================
   HOME NEW PAGE
========================= */

async function logout() {
  await apiLogout();
  window.location.href = "../index.html";
}

function startQuestionnaire() {
  window.location.href = "questionnaire.html";
}


/* =========================
   HOME LOGIN PAGE
========================= */

function goGames() {
  window.location.href = "games.html";
}

function goSettings() {
  window.location.href = "settings.html";
}

async function loadLoginHomePage() {
  const loggedIn = localStorage.getItem("maddadLoggedIn");
  const savedAccount = JSON.parse(localStorage.getItem("maddadAccount"));

  if (loggedIn !== "true" || !savedAccount) {
    window.location.href = "parent.html";
    return;
  }

  // Refresh profile from the API (silently falls back to cache on error)
  let account = savedAccount;
  try {
    const profile = await apiGetProfile();
    account = {
      childName: profile.child_name,
      childAge: profile.child_age,
      childGender: profile.child_gender,
      email: profile.email,
    };
  } catch (_) {}

  const welcomeTitle = document.getElementById("welcomeTitle");
  const childNameText = document.getElementById("childNameText");
  const childAgeText = document.getElementById("childAgeText");
  const childGenderText = document.getElementById("childGenderText");
  const emailText = document.getElementById("emailText");

  if (welcomeTitle) {
    const role = account.parentRole || "";
    const name = account.childName || "";
    let greeting = "أهلاً ولي الأمر";
    if (role === "أب" && name) greeting = `أهلاً بأبو ${name}`;
    else if (role === "أم" && name) greeting = `أهلاً بأم ${name}`;
    else if (name) greeting = `أهلاً بك، ولي أمر ${name}`;
    welcomeTitle.textContent = greeting;
  }

  if (childNameText) {
    childNameText.textContent = account.childName || "-";
  }

  if (childAgeText) {
    childAgeText.textContent = account.childAge || "-";
  }

  if (childGenderText) {
    childGenderText.textContent = account.childGender || "-";
  }

  if (emailText) {
    emailText.textContent = account.email || "-";
  }
}

/* =========================
   QUESTIONNAIRE HELPERS
========================= */

function getSavedAccount() {
  return JSON.parse(localStorage.getItem("maddadAccount"));
}

function getAssessment() {
  return JSON.parse(localStorage.getItem("maddadAssessment")) || null;
}

function saveAssessment(data) {
  localStorage.setItem("maddadAssessment", JSON.stringify(data));
}

function startQuestionnaire() {
  localStorage.removeItem("maddadQuestionnaireProgress");
  localStorage.removeItem("maddadAssessment");
  window.location.href = "questionnaire.html";
}

function resetQuestionnaireAndGoHome() {
  localStorage.removeItem("maddadQuestionnaireProgress");
  currentQuestionIndex = 0;
  questionnaireAnswers = {};
  window.location.href = "home-login.html";
}

const skillKeys = [
  "response_to_name",
  "eye_contact",
  "social_smile",
  "imitation",
  "discrimination",
  "pointing_with_finger",
  "facial_expressions",
  "joint_attention",
  "play_skills",
  "response_to_commands"
];

const skillLabelsArabic = {
  response_to_name: "الاستجابة للاسم",
  eye_contact: "التواصل البصري",
  social_smile: "الابتسامة الاجتماعية",
  imitation: "التقليد",
  discrimination: "التمييز",
  pointing_with_finger: "الإشارة بالإصبع",
  facial_expressions: "تعابير الوجه",
  joint_attention: "الانتباه المشترك",
  play_skills: "مهارات اللعب",
  response_to_commands: "تنفيذ الأوامر"
};

function calculateScore(answersObj) {
  let score = 0;
  skillKeys.forEach(key => {
    score += Number(answersObj[key] || 0);
  });
  return score;
}

function classifyRisk(ageGroup, score) {
  if (ageGroup === "12-18") {
    if (score <= 2) return "low";
    if (score >= 3 && score <= 5) return "medium";
    return "high";
  }

  if (ageGroup === "19-24") {
    if (score <= 2) return "low";
    if (score >= 3 && score <= 4) return "medium";
    return "high";
  }

  if (ageGroup === "25-30") {
    if (score <= 1) return "low";
    if (score >= 2 && score <= 4) return "medium";
    return "high";
  }

  if (ageGroup === "31-36") {
    if (score <= 1) return "low";
    if (score >= 2 && score <= 3) return "medium";
    return "high";
  }

  return "low";
}

function riskTextArabic(risk) {
  if (risk === "low") return "منخفضة";
  if (risk === "medium") return "متوسطة";
  return "مرتفعة";
}

function getFailedSkills(answersObj) {
  return skillKeys.filter(key => Number(answersObj[key]) === 1);
}

/* =========================
   QUESTIONNAIRE PAGE
========================= */

const questionnaireSteps = [
  {
    key: "response_to_name",
    title: "الاستجابة للاسم",
    description: "يستجيب طفلك عند مناداته باسمه، يلتفت أو ينظر إليك.",
    options: [
      { label: "نعم", value: "0" },
      { label: "لا", value: "1" }
    ]
  },
  {
    key: "eye_contact",
    title: "التواصل البصري",
    description: "يتواصل طفلك معك بصريًا / ينظر إليك لمدة 3 - 5 ثوانٍ أثناء لعبك، غنائك، أو تحدثك معه.",
    options: [
      { label: "نعم", value: "0" },
      { label: "لا", value: "1" }
    ]
  },
  {
    key: "social_smile",
    title: "الابتسامة الاجتماعية",
    description: "عندما يستيقظ طفلك صباحًا، أو عند مقابلة أحد الوالدين أو الأشخاص المألوفين؛ فإنه يبتسم لك / لهم.",
    options: [
      { label: "نعم", value: "0" },
      { label: "لا", value: "1" }
    ]
  },
  {
    key: "imitation",
    title: "التقليد",
    description: "يحاول طفلك تقليد أفعالك أو أفعال الأشخاص من حوله.",
    options: [
      { label: "نعم", value: "0" },
      { label: "لا", value: "1" }
    ]
  },
  {
    key: "discrimination",
    title: "التمييز",
    description: "يشير طفلك إلى أعضاء جسمه عند سؤاله ويميز الأدوات اليومية والأشخاص.",
    options: [
      { label: "نعم", value: "0" },
      { label: "لا", value: "1" }
    ]
  },
  {
    key: "pointing_with_finger",
    title: "الإشارة بالإصبع",
    description: "عند رغبة طفلك بالحصول على شيء أو لفت الانتباه؛ فإنه يشير إليه بإصبعه.",
    options: [
      { label: "نعم", value: "0" },
      { label: "لا", value: "1" }
    ]
  },
  {
    key: "facial_expressions",
    title: "تعابير الوجه",
    description: "يميز طفلك مشاعر الآخرين ويعطي ردة فعل مناسبة حسب الموقف.",
    options: [
      { label: "نعم", value: "0" },
      { label: "لا", value: "1" }
    ]
  },
  {
    key: "joint_attention",
    title: "الانتباه المشترك",
    description: "يحضر طفلك لعبة مهتمًا بها ويُريها للآخرين وينتظر تفاعلهم.",
    options: [
      { label: "نعم", value: "0" },
      { label: "لا", value: "1" }
    ]
  },
  {
    key: "play_skills",
    title: "مهارات اللعب",
    description: "يندمج طفلك في اللعب الوظيفي أو التخيلي.",
    options: [
      { label: "نعم", value: "0" },
      { label: "لا", value: "1" }
    ]
  },
  {
    key: "response_to_commands",
    title: "تنفيذ الأوامر",
    description: "يتبع طفلك الأوامر اليومية البسيطة.",
    options: [
      { label: "نعم", value: "0" },
      { label: "لا", value: "1" }
    ]
  }
];

let currentQuestionIndex = 0;
let questionnaireAnswers = {};

function loadQuestionnairePage() {
  const loggedIn = localStorage.getItem("maddadLoggedIn");
  const savedAccount = getSavedAccount();

  if (loggedIn !== "true" || !savedAccount) {
    window.location.href = "parent.html";
    return;
  }

  const savedProgress = JSON.parse(localStorage.getItem("maddadQuestionnaireProgress"));

  if (savedProgress) {
    currentQuestionIndex = savedProgress.currentQuestionIndex || 0;
    questionnaireAnswers = savedProgress.answers || {};
  } else {
    currentQuestionIndex = 0;
    questionnaireAnswers = {};
  }

  renderQuestionStep();
}

function renderQuestionStep() {
  const step = questionnaireSteps[currentQuestionIndex];
  if (!step) return;

  const progress = document.getElementById("questionProgress");
  const title = document.getElementById("questionTitle");
  const description = document.getElementById("questionDescription");
  const optionsBox = document.getElementById("questionOptions");
  const error = document.getElementById("questionnaireError");
  const prevBtn = document.getElementById("prevQuestionBtn");
  const nextBtn = document.getElementById("nextQuestionBtn");

  if (error) error.textContent = "";

  progress.textContent = `السؤال: ${currentQuestionIndex + 1}/${questionnaireSteps.length}`;
  title.textContent = step.title;
  description.textContent = step.description || "";

  optionsBox.innerHTML = "";

  step.options.forEach(option => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "questionnaire-option";

    if (questionnaireAnswers[step.key] === option.value) {
      btn.classList.add("selected");
    }

    btn.textContent = option.label;
    btn.onclick = () => selectQuestionOption(step.key, option.value);

    optionsBox.appendChild(btn);
  });

  if (prevBtn) {
    prevBtn.style.visibility = currentQuestionIndex === 0 ? "hidden" : "visible";
  }

  if (nextBtn) {
    nextBtn.textContent = currentQuestionIndex === questionnaireSteps.length - 1 ? "إنهاء" : "التالي";
  }

  localStorage.setItem("maddadQuestionnaireProgress", JSON.stringify({
    currentQuestionIndex,
    answers: questionnaireAnswers
  }));
}

function selectQuestionOption(key, value) {
  questionnaireAnswers[key] = value;
  renderQuestionStep();
}

function goPrevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestionStep();
  }
}

function goNextQuestion() {
  const step = questionnaireSteps[currentQuestionIndex];
  const error = document.getElementById("questionnaireError");

  if (!questionnaireAnswers[step.key]) {
    if (error) error.textContent = "يرجى اختيار إجابة قبل المتابعة.";
    return;
  }

  if (currentQuestionIndex < questionnaireSteps.length - 1) {
    currentQuestionIndex++;
    renderQuestionStep();
  } else {
    finishQuestionnaire();
  }
}

async function finishQuestionnaire() {
  const account = getSavedAccount();

  const answers = {
    response_to_name: Number(questionnaireAnswers.response_to_name),
    eye_contact: Number(questionnaireAnswers.eye_contact),
    social_smile: Number(questionnaireAnswers.social_smile),
    imitation: Number(questionnaireAnswers.imitation),
    discrimination: Number(questionnaireAnswers.discrimination),
    pointing_with_finger: Number(questionnaireAnswers.pointing_with_finger),
    facial_expressions: Number(questionnaireAnswers.facial_expressions),
    joint_attention: Number(questionnaireAnswers.joint_attention),
    play_skills: Number(questionnaireAnswers.play_skills),
    response_to_commands: Number(questionnaireAnswers.response_to_commands)
  };

  const score = calculateScore(answers);
  const initialRisk = classifyRisk(account.childAge, score);
  const failedSkills = getFailedSkills(answers);

  let mlRisk = initialRisk;
  let mlConfidence = null;
  let resultId = null;

  // Request ML prediction from the backend
  try {
    const apiResult = await apiSubmitQuestionnaire(
      account.childAge,
      account.childGender,
      answers
    );
    mlRisk = apiResult.prediction.risk;
    mlConfidence = apiResult.prediction.confidence;
    resultId = apiResult.result_id;
  } catch (_) {
    // Backend unavailable – use rule-based result only
  }

  const assessment = {
    ageGroup: account.childAge,
    gender: account.childGender,
    initialAnswers: answers,
    currentAnswers: { ...answers },
    initialScore: score,
    initialRisk: initialRisk,
    mlRisk: mlRisk,
    mlConfidence: mlConfidence,
    resultId: resultId,
    failedSkills: failedSkills,
    followupNeeded: (initialRisk === "high"),
    followupComplete: false,
    finalScore: score,
    finalRisk: initialRisk
  };

  saveAssessment(assessment);
  localStorage.removeItem("maddadQuestionnaireProgress");
  window.location.href = "result.html";
}


/* =========================
   RESULT PAGE
========================= */

function loadResultPage() {

  const assessment = getAssessment();

  if (!assessment) {
    window.location.href = "questionnaire.html";
    return;
  }

  const resultMainCard = document.getElementById("resultMainCard");
  const resultIcon = document.getElementById("resultIcon");
  const resultTitle = document.getElementById("resultTitle");
  const resultText = document.getElementById("resultText");
  const resultSummary = document.getElementById("resultSummary");
  const resultMainBtn = document.getElementById("resultMainBtn");
  const resultSecondaryBtn = document.getElementById("resultSecondaryBtn");

  let shownRisk = assessment.initialRisk;
  let shownScore = assessment.initialScore;

  if (assessment.followupComplete) {
    shownRisk = assessment.finalRisk;
    shownScore = assessment.finalScore;
  }

  resultMainCard.classList.remove("low-theme", "medium-theme", "high-theme");



  /* =========================
     LOW
  ========================= */

  if (shownRisk === "low") {

    resultMainCard.classList.add("low-theme");
    resultIcon.src = "../pictures/result-low.png";

    resultTitle.textContent =
      "نبشرك طفلك بخير ولا تظهر عليه علامات تدعو القلق";

    if (assessment.followupComplete) {
      resultText.textContent =
        "هذه النتيجة النهائية بعد أسئلة المتابعة والتي ساعدت في الوصول إلى تقييم أدق.";
    } else {
      resultText.textContent = "";
    }

    resultMainBtn.textContent = "العودة إلى الصفحة الرئيسية";
    resultMainBtn.className = "result-main-btn btn-green";

    resultSecondaryBtn.style.display = "none";
  }



  /* =========================
     MEDIUM
  ========================= */

  else if (shownRisk === "medium") {

    resultMainCard.classList.add("medium-theme");
    resultIcon.src = "../pictures/result-medium.png";

    resultTitle.textContent =
      "تشير النتائج إلى وجود علامات قد تشير إلى احتمالية متوسطة للتوحد";

    resultText.textContent =
      "ننصح بمتابعة الأنشطة والألعاب التفاعلية لتعزيز مهارات طفلك.";

    resultMainBtn.textContent = "الأنشطة والألعاب";
    resultMainBtn.className = "result-main-btn btn-yellow";

    resultSecondaryBtn.style.display = "none";
  }



  /* =========================
     HIGH
  ========================= */

  else {

    resultMainCard.classList.add("high-theme");
    resultIcon.src = "../pictures/result-high.png";

    resultTitle.textContent =
      "تشير النتائج إلى وجود علامات قد تشير إلى احتمالية أعلى للتوحد";

    if (assessment.followupComplete) {

      resultText.textContent =
        "هذه النتيجة النهائية بعد أسئلة المتابعة والتي ساعدت في الوصول إلى تصنيف أكثر دقة.";

      resultMainBtn.textContent = "الأنشطة المقترحة";
      resultMainBtn.className = "result-main-btn btn-red";

    } else {

      resultText.textContent = "يُنصح بإكمال التقييم الإضافي";

      resultMainBtn.textContent = "أسئلة المتابعة";
      resultMainBtn.className = "result-main-btn btn-red";
    }

    resultSecondaryBtn.style.display = "none";
  }



  // ── نقاط النمو: المهارات الفاشلة — فقط إذا لم تكن النتيجة منخفضة ──
  const failedSkills = assessment.failedSkills || [];
  const failedSkillsHTML = (shownRisk !== "low" && failedSkills.length > 0)
    ? `<div class="result-failed-skills">
        <strong>المهارات التي تحتاج متابعة:</strong>
        <ul class="result-skills-list">
          ${failedSkills.map(s => `<li>${skillLabelsArabic[s] || s}</li>`).join("")}
        </ul>
       </div>`
    : "";

  const mlLine = (assessment.mlRisk && assessment.mlConfidence)
    ? `<div class="result-ml-line">🤖 <strong>تقدير الذكاء الاصطناعي:</strong> ${riskTextArabic(assessment.mlRisk)} (${Math.round(assessment.mlConfidence * 100)}%)</div>`
    : "";

  resultSummary.innerHTML = `
    <div class="result-summary-grid">
      <span class="result-summary-label">العمر</span>
      <span class="result-summary-val">${assessment.ageGroup} شهر</span>
      <span class="result-summary-label">مستوى الاحتمالية</span>
      <span class="result-summary-val">${riskTextArabic(shownRisk)}</span>
    </div>
    ${failedSkillsHTML}
    ${mlLine}
  `;

  // ── تذكير الاحتمالية المتوسطة ──────────────────────
  if (shownRisk === "medium") {
    _checkMediumReminder();
  }
}

function _checkMediumReminder() {
  const now = Date.now();
  const stored = localStorage.getItem("maddadMediumDate");

  if (!stored) {
    // أول مرة يظهر فيها medium — نحفظ التاريخ ونعرض رسالة التذكير
    localStorage.setItem("maddadMediumDate", String(now));
    _showMediumReminderBanner(false);
  } else {
    const firstDate = parseInt(stored, 10);
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    const isAfterMonth = (now - firstDate) >= oneMonthMs;

    if (isAfterMonth) {
      // ظهرت متوسطة بعد شهر → تصبح عالية
      _showMediumEscalationBanner();
    } else {
      // لم يمر شهر بعد
      _showMediumReminderBanner(true, firstDate);
    }
  }
}

function _googleCalendarUrl(targetDate) {
  // Format date for Google Calendar: YYYYMMDDTHHmmssZ
  const pad = n => String(n).padStart(2, '0');
  const d = new Date(targetDate);
  const start = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
  const end   = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate()+1)}`;
  const title = encodeURIComponent('إعادة استبيان مدد للكشف المبكر عن التوحد');
  const details = encodeURIComponent('حان موعد إعادة استبيان مدد لمتابعة نمو طفلك. افتح التطبيق وأعد الاستبيان.');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
}

function _showMediumReminderBanner(showDate, firstDate) {
  const container = document.getElementById("resultBtnsWrap");
  const targetTs = firstDate ? firstDate + 30 * 86400000 : Date.now() + 30 * 86400000;
  const targetDate = new Date(targetTs);
  const dateLabel = targetDate.toLocaleDateString("ar-SA", { year:"numeric", month:"long", day:"numeric" });
  const calUrl = _googleCalendarUrl(targetTs);

  const banner = document.createElement("div");
  banner.className = "medium-reminder-banner";
  banner.innerHTML = `
    <div style="text-align:right;">
      <strong>يحتاج طفلك إعادة الاستبيان بعد شهر</strong><br>
      <span style="font-size:13px;opacity:0.85;">أضفه لتقويمك حتى لا تنساه، الموعد المقترح: <strong>${dateLabel}</strong></span>
      <div style="margin-top:12px;">
        <a href="${calUrl}" target="_blank" class="calendar-add-btn">
          أضف للتقويم
        </a>
      </div>
    </div>
  `;
  container.parentNode.insertBefore(banner, container);
}

function _downloadIcal(targetTs) {
  const pad = n => String(n).padStart(2, '0');
  const d = new Date(targetTs);
  const d2 = new Date(targetTs + 3600000);
  const fmt = x => x.getUTCFullYear() + pad(x.getUTCMonth()+1) + pad(x.getUTCDate()) + 'T' + pad(x.getUTCHours()) + pad(x.getUTCMinutes()) + '00Z';
  const ical = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Maddad//AR',
    'BEGIN:VEVENT',
    'DTSTART:' + fmt(d),
    'DTEND:' + fmt(d2),
    'SUMMARY:إعادة استبيان مدد للكشف المبكر عن التوحد',
    'DESCRIPTION:حان موعد إعادة استبيان مدد. افتح التطبيق وأعد الاستبيان لمتابعة نمو طفلك.',
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'maddad-reminder.ics'; a.click();
  URL.revokeObjectURL(url);
}

function _showMediumEscalationBanner() {
  const container = document.getElementById("resultBtnsWrap");
  const banner = document.createElement("div");
  banner.className = "medium-escalation-banner";
  banner.innerHTML = `
    <span class="reminder-icon">⚠️</span>
    <div>
      <strong>تنبيه مهم: النتيجة لا تزال متوسطة بعد شهر</strong><br>
      <span>ننصح بشدة بمراجعة متخصص طبي لتقييم دقيق وشامل لطفلك</span>
    </div>
  `;
  container.parentNode.insertBefore(banner, container);
  localStorage.removeItem("maddadMediumDate"); // reset for next cycle
}

function handleResultMainAction() {
  const assessment = getAssessment();
  if (!assessment) {
    window.location.href = "questionnaire.html";
    return;
  }

  const shownRisk = assessment.followupComplete ? assessment.finalRisk : assessment.initialRisk;

  if (!assessment.followupComplete && shownRisk === "high") {
    window.location.href = "followup.html";
    return;
  }

 

  window.location.href = "games.html";
}



function goBackHome() {
  window.location.href = "home-login.html";
}

/* =========================
   FOLLOWUP PAGE
========================= */

let followupSteps = [];
let currentFollowupIndex = 0;
let followupCollectedAnswers = {};
let followupBtnState = {};

const FOLLOWUP_STEPS_CONFIG = {

  eye_contact: {
    title: "متابعة: التواصل البصري",
    question: "هل ينظر طفلك إلى عينيك؟",
    type: "checkbox",
    name: "eye_contact_context",
    options: [
      { label: "عند حاجته لشيء", value: "needs" },
      { label: "أثناء اللعب معك", value: "play" },
      { label: "أثناء تناول الطعام", value: "eating" },
      { label: "أثناء ارتداء الملابس", value: "dressing" },
      { label: "عند قراءة قصة له", value: "story" },
      { label: "عند التحدث معه", value: "talking" }
    ],
    subQuestion: {
      id: "eyeSubBox",
      title: "عندما تكون مع طفلك خلال اليوم، هل ينظر إلى عينيك لمدة لا تقل عن خمس ثوانٍ؟",
      name: "eye_contact_sub"
    }
  },

response_to_name: {
  title: "متابعة: الاستجابة للاسم",
  question: "",
  type: "radio",
  name: "response_to_name_followup",
  options: [
    { label: "نعم", value: "yes" },
    { label: "لا", value: "no" }
  ]
},

  joint_attention: {
  title: "متابعة: الانتباه المشترك",
  question: "إذا أشرتِ لطفلك إلى لعبة أو شيء مثير للاهتمام، هل يحاول لفت انتباهك إليه بالإشارة أو بالنظر إليه أو بإظهاره لك؟",
  type: "radio",
  name: "joint_attention_followup",
  options: [
    { label: "نعم", value: "yes" },
    { label: "لا", value: "no" }
  ]
},

facial_expressions: {
  title: "متابعة: تعابير الوجه",
  question: "عندما يكون أحد من حول طفلك منزعجًا أو يبكي، هل ينظر إليه طفلك أو يحاول مواساته؟",
  type: "radio",
  name: "facial_expressions_followup",
  options: [
    { label: "نعم", value: "yes" },
    { label: "لا", value: "no" }
  ]
},
  
  pointing_with_finger: {
    title: "متابعة: الإشارة بالإصبع",
    question: "اختاري ما ينطبق على طفلك:",
    type: "checkbox",
    name: "pointing_context",
    options: [
      { label: "هل طفلك يمد يده للأشياء؟", value: "hand" },
      { label: "هل يقودك بيده نحو الشيء؟", value: "lead" },
      { label: "هل يحاول أخذ الشيء بنفسه؟", value: "take" },
      { label: "هل يطلب الشيء باستخدام كلمات أو أصوات؟", value: "voice" }
    ],
    subQuestion: {
      id: "pointSubBox",
      title: 'إذا قلت له "أرِني"، هل يشير طفلك إلى الشيء؟',
      name: "pointing_sub"
    }
  },

  imitation: {
    title: "متابعة: التقليد",
    question: "اختاري ما ينطبق على طفلك:",
    type: "checkbox",
    name: "imitation_context",
    options: [
      { label: " يخرج لسانه", value: "tongue" },
      { label: " يصدر أصواتاً مضحكة", value: "sounds" },
      { label: ' يلوح قاصداً "وداعاً" (أو يشير لـ "وداعاً")', value: "wave" },
      { label: " يصفق بيده", value: "clap" },
      { label: ' يضع إصبعه على شفتيه كإشارة لـ "السكوت"/"الصمت"', value: "shush" },
      { label: " يرسل قبلة في الهواء", value: "kiss" }
    ]
  },

  discrimination: {
    title: "متابعة: التمييز",
    question: "اختاري ما ينطبق على طفلك:",
    type: "checkbox",
    name: "discrimination_context",
    options: [
      { label: 'التعرّف على جزء من جسمهم عندما تسأل "أين أنفك؟" أو "أين عينك؟"', value: "body_part" },
      { label: 'الالتفات أو النظر إلى والد أو شقيق عندما تذكر اسمهم "أين ماما؟"', value: "look_person" },
      { label: 'الإشارة إلى غرض مألوف ويومي (مثل كرسي أو مصباح) عندما تسأل "أين الكرسي؟"', value: "point_object" },
      { label: 'إحضار غرض مألوف ويومي (مثل ملعقة أو بطانية) عندما تطلب منهم "أحضر الملعقة"', value: "bring_object" }
    ]
  },
  play_skills: {
  title: "متابعة: مهارات اللعب",
  question: "",
  type: "radio",
  name: "play_skills_followup",
  options: [
    { label: "نعم", value: "yes" },
    { label: "لا", value: "no" }
  ]
},

  // ── الاستجابة للتعليمات ── (Figure A.2)
  // إذا الجواب الأصلي "نعم" → Pass مباشرة
  // إذا الجواب الأصلي "لا" → يسأل عن الإيماءات
  response_to_commands: {
    title: "متابعة: الاستجابة للتعليمات",
    question: "هل يستطيع طفلك اتباع أوامر تتضمن إيماءات أو إشارات بدلاً من الكلام فقط؟ (مثال: هل يستجيب لحركة يدك التي تشير إليه بالجلوس؟ أو هل يأخذ شيئاً عندما تشير إليه؟)",
    type: "radio",
    name: "response_to_commands_followup",
    onlyIfFail: true,   // only show this step if initial answer was لا (1)
    options: [
      { label: "نعم", value: "yes" },
      { label: "لا", value: "no" }
    ],
    scoring: { yes: "pass", no: "fail" }
  },

};

function loadFollowupPage() {
  const assessment = getAssessment();

  if (!assessment) {
    window.location.href = "questionnaire.html";
    return;
  }

  if (assessment.initialRisk === "low") {
    window.location.href = "result.html";
    return;
  }

  const failed = assessment.failedSkills || [];
  followupSteps = [];
  followupCollectedAnswers = {};
  followupBtnState = {};
  currentFollowupIndex = 0;
  
  // الاستثناءات — دائمًا تظهر في الفولو أب
followupSteps.push("response_to_name");
followupSteps.push("play_skills");

  if (failed.includes("eye_contact")) followupSteps.push("eye_contact");
  if (failed.includes("pointing_with_finger")) followupSteps.push("pointing_with_finger");
  if (failed.includes("imitation")) followupSteps.push("imitation");
  if (failed.includes("discrimination")) followupSteps.push("discrimination");
  if (failed.includes("response_to_commands")) followupSteps.push("response_to_commands");
  if (failed.includes("joint_attention")) followupSteps.push("joint_attention");
if (failed.includes("facial_expressions")) followupSteps.push("facial_expressions");
  
  if (followupSteps.length === 0) {
    document.getElementById("followupContainer").innerHTML = `
      <div class="question-progress">لا توجد أسئلة متابعة حالياً</div>
      <div class="question-description" style="text-align:center; margin-top:16px;">
        لا توجد مهارات تتطلب متابعة إضافية في هذه المرحلة.
      </div>
    `;
    return;
  }

  renderFollowupStep();
}

function renderFollowupStep() {
  const container = document.getElementById("followupContainer");
  const skill = followupSteps[currentFollowupIndex];
  const total = followupSteps.length;
  const isLast = currentFollowupIndex === total - 1;
  const isFirst = currentFollowupIndex === 0;
  const step = FOLLOWUP_STEPS_CONFIG[skill];
  const assessment = getAssessment();

  // تغيير سؤال الاستجابة للاسم حسب الجواب الأساسي
if (skill === "response_to_name") {
  const initialAnswer = assessment.initialAnswers.response_to_name;

  if (initialAnswer === 1) {
    step.question = "هل يستجيب طفلك لاسمه أحياناً في مواقف أخرى، حتى لو لم يكن ذلك ثابتاً؟ (مثال: يستجيب في الحديقة أو عند حماسه، لكن لا يستجيب أثناء مشاهدة التلفاز أو عند تركيزه على نشاط ما)";
  } else {
    step.question = "هل استجابة طفلك مرتبطة بتعرّفه على اسمه فعلاً، أم أنها بسبب نبرة الصوت أو الإيماءات الإضافية فقط؟ (مثال: إذا ناديته باسمه بصوت طبيعي من الجانب الآخر للغرفة، هل ينظر إليك أو يتوقف عما يفعله؟)";
  }
}

// تغيير سؤال مهارات اللعب حسب الجواب الأساسي
if (skill === "play_skills") {
  const initialAnswer = assessment.initialAnswers.play_skills;

  if (initialAnswer === 1) {
    step.question = "هل يغيّر طفلك سيناريوهات اللعب التخيلي أو يستخدم الأشياء بطرق مختلفة وإبداعية؟ (مثال: هل يتخيل أن الهاتف موزة، ثم في لعبة أخرى يستخدم الموزة كفرشاة أسنان؟)";
  } else {
    step.question = "عندما يلعب طفلك بالألعاب (مثل السيارات أو المكعبات)، هل يظهر باستمرار سلوكيات متكررة مثل ترتيب الألعاب أو التركيز على جزء واحد لفترة طويلة؟";
  }
}


  // Handle onlyIfFail: skip this step entirely if initial was pass
  if (step.onlyIfFail) {
    const skillKey = skill;
    const initialAnswer = assessment.initialAnswers?.[skillKey];
    if (Number(initialAnswer) !== 1) {
      // Initial was pass → auto-pass this followup and move on
      followupCollectedAnswers[step.name] = "auto_pass";
      if (currentFollowupIndex < followupSteps.length - 1) {
        currentFollowupIndex++;
        renderFollowupStep();
      } else {
        finalizeFollowup();
      }
      return;
    }
  }

  if (!followupBtnState[step.name]) {
    followupBtnState[step.name] = step.type === "radio" ? "" : new Set();
  }

  if (step.subQuestion && !followupBtnState[step.subQuestion.name]) {
    followupBtnState[step.subQuestion.name] = "";
  }

  let optionsHtml = "";

  step.options.forEach(opt => {
    const isSelected = step.type === "radio"
      ? followupBtnState[step.name] === opt.value
      : followupBtnState[step.name].has(opt.value);

    optionsHtml += `
      <button type="button"
        class="questionnaire-option${isSelected ? " selected" : ""}"
        data-field="${step.name}"
        data-value="${opt.value}"
        data-type="${step.type}"
        ${opt.isOther ? 'data-is-other="true"' : ""}
        onclick="handleFollowupOptionClick(this)">
        ${opt.label}
      </button>
    `;

    if (opt.isOther) {
      const isOtherSelected = step.type === "radio"
        ? followupBtnState[step.name] === "other"
        : followupBtnState[step.name].has("other");

      optionsHtml += `
        <div id="${step.name}_other_box" style="display:${isOtherSelected ? "block" : "none"}; margin-top:-6px; padding:0 2px 8px;">
          <input type="text" id="${step.name}_other_text"
            placeholder="اكتب هنا..."
            style="width:100%; padding:10px 14px; border:1.5px solid #c5d5ee; border-radius:12px; font-size:15px; font-family:inherit; direction:rtl; background:#fff; outline:none; box-sizing:border-box;">
        </div>
      `;
    }
  });

  let subHtml = "";

  if (step.subQuestion) {
    const checkedCount = followupBtnState[step.name].size;
    const subVisible = checkedCount === 1;
    const subName = step.subQuestion.name;

    let subOptHtml = "";

    ["yes", "no"].forEach(val => {
      const lbl = val === "yes" ? "نعم" : "لا";
      const sel = followupBtnState[subName] === val;

      subOptHtml += `
        <button type="button"
          class="questionnaire-option${sel ? " selected" : ""}"
          data-field="${subName}"
          data-value="${val}"
          data-type="radio"
          onclick="handleFollowupOptionClick(this)">
          ${lbl}
        </button>
      `;
    });

    subHtml = `
      <div id="${step.subQuestion.id}" style="display:${subVisible ? "block" : "none"}; margin-top:32px;">
        <div class="question-title">${step.subQuestion.title}</div>
        <div class="question-options">
          ${subOptHtml}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="question-progress">
      السؤال: ${currentFollowupIndex + 1}/${total}
    </div>

    <div class="question-title">${step.title}</div>

    <div class="question-description">${step.question}</div>

    <div class="question-options">
      ${optionsHtml}
    </div>

    ${subHtml}

    <div id="questionnaireError" style="color:red; text-align:center; margin-top:12px; min-height:20px; font-size:14px;"></div>

    <div class="questionnaire-nav">
      ${!isFirst ? `<button type="button" class="questionnaire-next-btn followup-prev-btn" onclick="goPrevFollowup()">السابق</button>` : ""}
      <button type="button" class="questionnaire-next-btn" onclick="goNextFollowup()">${isLast ? "إرسال" : "التالي"}</button>
    </div>
  `;
}

function handleFollowupOptionClick(btn) {
  const field = btn.dataset.field;
  const value = btn.dataset.value;
  const type = btn.dataset.type;
  const isOther = btn.dataset.isOther === "true";

  if (type === "radio") {
    document.querySelectorAll(`[data-field="${field}"]`).forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    followupBtnState[field] = value;
  } else {
    if (followupBtnState[field].has(value)) {
      followupBtnState[field].delete(value);
      btn.classList.remove("selected");
    } else {
      followupBtnState[field].add(value);
      btn.classList.add("selected");
    }

    if (isOther) {
      const otherBox = document.getElementById(`${field}_other_box`);
      if (otherBox) otherBox.style.display = followupBtnState[field].has("other") ? "block" : "none";

      if (!followupBtnState[field].has("other")) {
        const otherTxt = document.getElementById(`${field}_other_text`);
        if (otherTxt) otherTxt.value = "";
      }
    }

    const skill = followupSteps[currentFollowupIndex];
    const step = FOLLOWUP_STEPS_CONFIG[skill];

    if (step.subQuestion && step.name === field) {
      const subBox = document.getElementById(step.subQuestion.id);
      if (subBox) subBox.style.display = followupBtnState[field].size === 1 ? "block" : "none";

      if (followupBtnState[field].size !== 1) {
        followupBtnState[step.subQuestion.name] = "";
        document.querySelectorAll(`[data-field="${step.subQuestion.name}"]`)
          .forEach(b => b.classList.remove("selected"));
      }
    }
  }
}

function goNextFollowup() {
  const error = document.getElementById("questionnaireError");
  if (error) error.textContent = "";

  const skill = followupSteps[currentFollowupIndex];
  const step = FOLLOWUP_STEPS_CONFIG[skill];
  const assessment = getAssessment();

  if (skill === "eye_contact") {
    const count = followupBtnState[step.name] ? followupBtnState[step.name].size : 0;

    if (count === 0) {
      followupCollectedAnswers.eye_contact = 1;
    } else if (count >= 2) {
      followupCollectedAnswers.eye_contact = 0;
    } else {
      const subVal = followupBtnState[step.subQuestion.name];
      if (!subVal) {
        if (error) error.textContent = "يرجى استكمال سؤال المتابعة الخاص بالتواصل البصري.";
        return;
      }
      followupCollectedAnswers.eye_contact = subVal === "yes" ? 0 : 1;
    }
  }

  else if (skill === "response_to_name") {
    const val = followupBtnState[step.name];
    if (!val) {
      if (error) error.textContent = "يرجى الإجابة على سؤال متابعة الاستجابة للاسم.";
      return;
    }
    followupCollectedAnswers.response_to_name = val === "yes" ? 0 : 1;
  }

    else if (skill === "joint_attention") {
  const val = followupBtnState[step.name];
  if (!val) {
    if (error) error.textContent = "يرجى الإجابة على سؤال متابعة الانتباه المشترك.";
    return;
  }
  followupCollectedAnswers.joint_attention = val === "yes" ? 0 : 1;
}

else if (skill === "facial_expressions") {
  const val = followupBtnState[step.name];
  if (!val) {
    if (error) error.textContent = "يرجى الإجابة على سؤال متابعة تعابير الوجه.";
    return;
  }
  followupCollectedAnswers.facial_expressions = val === "yes" ? 0 : 1;
}

  else if (skill === "pointing_with_finger") {
    const count = followupBtnState[step.name] ? followupBtnState[step.name].size : 0;

    if (count === 0) {
      followupCollectedAnswers.pointing_with_finger = 1;
    } else if (count >= 2) {
      followupCollectedAnswers.pointing_with_finger = 0;
    } else {
      const subVal = followupBtnState[step.subQuestion.name];
      if (!subVal) {
        if (error) error.textContent = "يرجى استكمال سؤال المتابعة الخاص بالإشارة بالإصبع.";
        return;
      }
      followupCollectedAnswers.pointing_with_finger = subVal === "yes" ? 0 : 1;
    }
  }

  else if (skill === "imitation") {
    const count = followupBtnState[step.name] ? followupBtnState[step.name].size : 0;
    followupCollectedAnswers.imitation = count >= 2 ? 0 : 1;
  }

  else if (skill === "discrimination") {
    const count = followupBtnState[step.name] ? followupBtnState[step.name].size : 0;
    followupCollectedAnswers.discrimination = count >= 2 ? 0 : 1;
  }

    else if (skill === "play_skills") {
    const val = followupBtnState[step.name];
    if (!val) {
      if (error) error.textContent = "يرجى الإجابة على سؤال متابعة مهارات اللعب.";
      return;
    }

    const initialAnswer = Number(getAssessment()?.initialAnswers?.play_skills);

    if (initialAnswer === 1) {
      // كان الجواب الأصلي "لا"
      // نعم = Pass ، لا = Fail
      followupCollectedAnswers.play_skills = (val === "yes") ? 0 : 1;
    } else {
      // كان الجواب الأصلي "نعم"
      // نعم = Fail ، لا = Pass
      followupCollectedAnswers.play_skills = (val === "yes") ? 1 : 0;
    }
  }


  // ── الاستجابة للتعليمات ── yes=pass, no=fail
  else if (skill === "response_to_commands") {
    if (followupCollectedAnswers.response_to_commands_followup === "auto_pass") {
      followupCollectedAnswers.response_to_commands = 0;
    } else {
      const val = followupBtnState[step.name];
      if (!val) {
        if (error) error.textContent = "يرجى الإجابة على السؤال.";
        return;
      }
      followupCollectedAnswers.response_to_commands = val === "yes" ? 0 : 1;
    }
  }

 

  if (currentFollowupIndex < followupSteps.length - 1) {
    currentFollowupIndex++;
    renderFollowupStep();
  } else {
    finalizeFollowup();
  }
}

function goPrevFollowup() {
  if (currentFollowupIndex > 0) {
    currentFollowupIndex--;
    renderFollowupStep();
  }
}

async function finalizeFollowup() {
  const assessment = getAssessment();
  if (!assessment) {
    window.location.href = "questionnaire.html";
    return;
  }

  const updatedAnswers = { ...assessment.currentAnswers, ...followupCollectedAnswers };
  const finalScore = calculateScore(updatedAnswers);
  const finalRisk = classifyRisk(assessment.ageGroup, finalScore);

  let mlRisk = finalRisk;
  let mlConfidence = null;

  // Request refined ML prediction from the backend
  try {
    if (assessment.resultId) {
      const apiResult = await apiSubmitFollowup(assessment.resultId, followupCollectedAnswers);
      mlRisk = apiResult.prediction.risk;
      mlConfidence = apiResult.prediction.confidence;
    } else {
      const apiResult = await apiSubmitQuestionnaire(
        assessment.ageGroup,
        assessment.gender,
        updatedAnswers
      );
      mlRisk = apiResult.prediction.risk;
      mlConfidence = apiResult.prediction.confidence;
    }
  } catch (_) {
    // Backend unavailable – use rule-based result
  }

  assessment.currentAnswers = updatedAnswers;
  assessment.finalScore = finalScore;
  assessment.finalRisk = finalRisk;
  assessment.mlRisk = mlRisk;
  assessment.mlConfidence = mlConfidence;
  assessment.followupComplete = true;

  let history = JSON.parse(localStorage.getItem("maddadHistory")) || [];

  history.push({
    date: new Date().toLocaleDateString("ar-SA"),
    risk: riskTextArabic(mlRisk || finalRisk),
    score: finalScore
  });

  localStorage.setItem("maddadHistory", JSON.stringify(history));

  saveAssessment(assessment);
  window.location.href = "result.html";
}

// (duplicate removed — handled above)

/* =========================
   GROWTH DATA
========================= */

const ALL_SKILLS_DATA = [
  {
    key: "response_to_name",
    title: "الاستجابة للاسم",
    itemType: "game",
    icon: "../skills-icons/response_to_name.png",
    detailText: "هذه اللعبة التفاعلية تهدف إلى مساعدة الطفل على تحسين رد فعله عند سماع اسمه. يستمع الطفل بعناية، وبمجرد سماع الاسم يتفاعل مع الموقف المطلوب بطريقة ممتعة وآمنة تساعد على تعزيز التركيز والانتباه وسرعة الاستجابة.",
    playable: true,
    targetPage: "response-game.html"
  },
  {
    key: "eye_contact",
    title: "التواصل البصري",
    itemType: "game",
    icon: "../skills-icons/eye_contact.png",
    detailText: "هذه اللعبة مصممة لمساعدة الأطفال على تحسين التواصل البصري من خلال أنشطة تفاعلية ممتعة. يستمع الطفل للتعليمات وينفذ المهام ويحصل على تعزيزات عند التفاعل الصحيح.",
    playable: true,
    targetPage: ".eye_contact_game/index.html"
  },
  {
    key: "social_smile",
    title: "الابتسامة الاجتماعية",
    itemType: "tip",
    icon: "../skills-icons/social_smile.png",
    detailText: "شجعي طفلك على التفاعل من خلال الابتسام المتكرر، واستخدام الألعاب المرحة والأصوات المحببة، وإظهار تعابير الوجه بوضوح خلال اللعب اليومي.",
    playable: false
  },
  {
    key: "imitation",
    title: "التقليد",
    itemType: "game",
    icon: "../skills-icons/imitation.png",
    detailText: "هذه اللعبة ستُستخدم لاحقًا لدعم مهارة التقليد من خلال حركات بسيطة وتفاعلات ممتعة تساعد الطفل على نسخ السلوكيات بشكل تدريجي وآمن.",
    playable: false
  },
  {
    key: "discrimination",
    title: "التمييز",
    itemType: "game",
    icon: "../skills-icons/discrimination.png",
    detailText: "هذه اللعبة ستُطوّر لاحقًا لدعم مهارة التمييز بين الأشياء والأشكال والمفاهيم اليومية باستخدام مواقف تفاعلية مبسطة وممتعة.",
    playable: false
  },
  {
    key: "pointing_with_finger",
    title: "الإشارة بالإصبع",
    itemType: "game",
    icon: "../skills-icons/pointing_with_finger.png",
    detailText: "هذه اللعبة ستساعد الطفل مستقبلاً على تطوير مهارة الإشارة والإيماء لطلب الأشياء أو لفت الانتباه من خلال أنشطة تفاعلية بسيطة.",
    playable: false
  },
  {
    key: "facial_expressions",
    title: "تعابير الوجه",
    itemType: "tip",
    icon: "../skills-icons/facial_expressions.png",
    detailText: "استخدمي المرآة والصور التعبيرية وتمثيل المشاعر المختلفة مثل الفرح والحزن والتعجب، مع تسمية كل تعبير بوضوح أثناء اللعب أو القراءة.",
    playable: false
  },
  {
    key: "joint_attention",
    title: "الانتباه المشترك",
    itemType: "game",
    icon: "../skills-icons/joint_attention.png",
    detailText: "هذه اللعبة ستُطوّر لاحقًا لدعم مشاركة الطفل الانتباه مع الآخرين من خلال أنشطة تفاعلية تساعده على تتبع الإشارات والنظر إلى نفس الشيء مع الطرف الآخر.",
    playable: false
  },
  {
    key: "play_skills",
    title: "مهارات اللعب",
    itemType: "game",
    icon: "../skills-icons/play_skills.png",
    detailText: "هذه اللعبة سيتم تطويرها لاحقًا، وستركز على تنمية مهارات اللعب الوظيفي والتخيلي من خلال مواقف مرحة وتدريجية.",
    playable: false
  },
  {
    key: "response_to_commands",
    title: "الاستجابة للتعليمات",
    itemType: "tip",
    icon: "../skills-icons/response_to_commands.png",
    detailText: "استخدمي تعليمات قصيرة وواضحة، وكرريها بنبرة هادئة، مع دعم بصري أو إشارة بسيطة، ثم عززي الطفل فور تنفيذ التعليمات المطلوبة.",
    playable: false
  }
];

/* =========================
   GROWTH DATA
========================= */

const SKILL_ICONS = {
  response_to_name: "../skills-icons/response_to_name.png",
  response_to_commands: "../skills-icons/response_to_commands.png",
  pointing_with_finger: "../skills-icons/pointing_with_finger.png",
  joint_attention: "../skills-icons/joint_attention.png",
  discrimination: "../skills-icons/discrimination.png",
  social_smile: "../skills-icons/social_smile.png",
  eye_contact: "../skills-icons/eye_contact.png",
  facial_expressions: "../skills-icons/facial_expressions.png",
  play_skills: "../skills-icons/play_skills.png",
  imitation: "../skills-icons/imitation.png"
};

const SKILL_TITLES = {
  response_to_name: "الاستجابة للاسم",
  eye_contact: "التواصل البصري",
  social_smile: "الابتسامة الاجتماعية",
  imitation: "التقليد",
  discrimination: "التمييز",
  pointing_with_finger: "الإشارة بالإصبع",
  facial_expressions: "تعابير الوجه",
  joint_attention: "الانتباه المشترك",
  play_skills: "مهارات اللعب",
  response_to_commands: "الاستجابة للتعليمات"
};

const GAMES_AND_TIPS_DATA = [

  // ── الاستجابة للاسم — لعبة فقط ──
  {
    id: "game_response_to_name",
    skillKey: "response_to_name",
    title: "الاستجابة للاسم",
    cardType: "game",
    cardIcon: "../pictures/skill-game.png",
    detailIcon: SKILL_ICONS.response_to_name,
    detailText: "هذه اللعبة التفاعلية تهدف إلى مساعدة الطفل على تحسين رد فعله عند سماع اسمه. يستمع الطفل بعناية، وبمجرد سماع الاسم يتفاعل مع الموقف المطلوب بطريقة ممتعة وآمنة تساعد على تعزيز التركيز والانتباه وسرعة الاستجابة.",
    playable: true,
    targetPage: "response-game.html"
  },

  // ── التواصل البصري — لعبة فقط ──
  {
    id: "game_eye_contact",
    skillKey: "eye_contact",
    title: "التواصل البصري",
    cardType: "game",
    cardIcon: "../pictures/skill-game.png",
    detailIcon: SKILL_ICONS.eye_contact,
    detailText: "هذه اللعبة مصممة لمساعدة الأطفال على تحسين التواصل البصري من خلال أنشطة تفاعلية ممتعة. يستمع الطفل للتعليمات وينفذ المهام ويحصل على تعزيزات عند التفاعل الصحيح.",
    playable: true,
    targetPage: "eye-contact-game.html"
  },

  // ── الابتسامة الاجتماعية — نصيحة فقط ──
  {
    id: "tip_social_smile",
    skillKey: "social_smile",
    title: "الابتسامة الاجتماعية",
    cardType: "tip",
    cardIcon: "../pictures/skill-tip.png",
    detailIcon: SKILL_ICONS.social_smile,
    detailText: "شجعي طفلك على التفاعل من خلال الابتسام المتكرر، واستخدام الألعاب المرحة والأصوات المحببة، وإظهار تعابير الوجه بوضوح خلال اللعب اليومي.",
    playable: false
  },

  // ── التقليد — نصيحة فقط ──
  {
    id: "tip_imitation",
    skillKey: "imitation",
    title: "التقليد",
    cardType: "tip",
    cardIcon: "../pictures/skill-tip.png",
    detailIcon: SKILL_ICONS.imitation,
    detailText: "ابدأ بتقليد حركات طفلك وأصواته أثناء اللعب لكسر الجليد وبناء التفاعل المتبادل. ثم تدرج معه بطلب تقليد الحركات الكبرى (كالتصفيق) وصولاً للأصوات الدقيقة، مع مكافأته بحماس فور كل محاولة.",
    playable: false
  },

  // ── التمييز - نصيحة فقط ──
  {
    id: "tip_discrimination",
    skillKey: "discrimination",
    title: "التمييز",
    cardType: "tip",
    cardIcon: "../pictures/skill-tip.png",
    detailIcon: SKILL_ICONS.discrimination,
    detailText: "درب طفلك على مطابقة الأشياء المتطابقة أولاً، ثم أضف (مشتتات) بالتدريج لرفع مستوى تركيزه. بادر بتوجيه يده نحو الإجابة الصحيحة في البدايات لتجنب إحباطه، ثم قلل مساعدتك له تدريجياً.",
    playable: false
  },

  // ── الإشارة بالإصبع — نصيحة فقط ──
  {
    id: "tip_pointing_with_finger",
    skillKey: "pointing_with_finger",
    title: "الإشارة بالإصبع",
    cardType: "tip",
    cardIcon: "../pictures/skill-tip.png",
    detailIcon: SKILL_ICONS.pointing_with_finger,
    detailText: "ضعي الأشياء المفضلة أمام الطفل ولكن خارج متناول يده قليلًا، وانتظري منه محاولة الإشارة أو الطلب، ثم ساعديه تدريجيًا وعززي أي استجابة.",
    playable: false
  },

  // ── تعابير الوجه — لعبة فقط ──
  {
    id: "game_facial_expressions",
    skillKey: "facial_expressions",
    title: "تعابير الوجه",
    cardType: "game",
    cardIcon: "../pictures/skill-game.png",
    detailIcon: SKILL_ICONS.facial_expressions,
    detailText: "لعبة تعابير الوجه تساعد الطفل على فهم المشاعر المختلفة وربطها بالمواقف من خلال بطاقات تعبيرية وأنشطة ممتعة ومشوقة.",
    playable: false
  },

  // ── الانتباه المشترك — نصيحة فقط ──
  {
    id: "tip_joint_attention",
    skillKey: "joint_attention",
    title: "الانتباه المشترك",
    cardType: "tip",
    cardIcon: "../pictures/skill-tip.png",
    detailIcon: SKILL_ICONS.joint_attention,
    detailText: "شاركي الطفل الأشياء المثيرة للاهتمام، وأشيري إليها بوضوح، ثم انتظري أن ينظر إليها أو يعود إليك، مع تعزيز المشاركة والانتباه المشترك.",
    playable: false
  },

  // ── مهارات اللعب — لعبة فقط ──
  {
    id: "game_play_skills",
    skillKey: "play_skills",
    title: "مهارات اللعب",
    cardType: "game",
    cardIcon: "../pictures/skill-game.png",
    detailIcon: SKILL_ICONS.play_skills,
    detailText: "لعبة مهارات اللعب تنمي قدرة الطفل على اللعب الوظيفي والتخيلي من خلال مواقف مرحة وتدريجية تشجع على التفاعل والإبداع.",
    playable: false
  },

  // ── الاستجابة للتعليمات — نصيحة فقط ──
  {
    id: "tip_response_to_commands",
    skillKey: "response_to_commands",
    title: "الاستجابة للتعليمات",
    cardType: "tip",
    cardIcon: "../pictures/skill-tip.png",
    detailIcon: SKILL_ICONS.response_to_commands,
    detailText: "استخدمي تعليمات قصيرة وواضحة، وكرريها بنبرة هادئة، مع دعم بصري أو إشارة بسيطة، ثم عززي الطفل فور تنفيذ التعليمات المطلوبة.",
    playable: false
  }
];

/* =========================
   GAMES PAGE
========================= */

let currentGrowthFilter = "all";

function loadGamesPage() {
  renderGrowthItems("all");
}

function setGrowthFilter(filter, clickedBtn) {
  currentGrowthFilter = filter;

  document.querySelectorAll(".growth-tab").forEach(btn => btn.classList.remove("active"));
  if (clickedBtn) clickedBtn.classList.add("active");

  renderGrowthItems(filter);
}

function renderGrowthItems(filter) {
  const container = document.getElementById("growthItemsGrid");
  if (!container) return;

  // Get failed skills from assessment
  const assessment = getAssessment();
  const failedSkills = assessment?.failedSkills || [];

  let items = [];

  if (filter === "all") {
    items = GAMES_AND_TIPS_DATA;
  } else if (filter === "games") {
    items = GAMES_AND_TIPS_DATA.filter(item => item.cardType === "game");
  } else if (filter === "tips") {
    items = GAMES_AND_TIPS_DATA.filter(item => item.cardType === "tip");
  } else if (filter === "growth") {
    // Show only items related to failed skills
    items = GAMES_AND_TIPS_DATA.filter(item => failedSkills.includes(item.skillKey));
  }

  // Build info message for نقاط النمو tab
  const infoBox = document.getElementById("growthInfoBox");
  if (infoBox) {
    if (filter === "growth") {
      if (failedSkills.length > 0) {
        const skillNames = failedSkills.map(s => skillLabelsArabic[s] || s).join("، ");
        infoBox.innerHTML = `
          <div class="growth-info-msg">
            <span class="growth-info-icon">💡</span>
            <div>
              <strong>مهارات طفلك التي تحتاج تطوير:</strong> ${skillNames}<br>
              <span>الألعاب والنصائح أدناه مصممة خصيصاً لمساعدة طفلك على تطوير هذه المهارات</span>
            </div>
          </div>`;
      } else {
        infoBox.innerHTML = `
          <div class="growth-info-msg" style="background:#edf7ed;border-color:#27AE60;color:#1a6b30;">
            <span class="growth-info-icon">✅</span>
            <div>طفلك أظهر أداءً جيداً في جميع المهارات. يمكنك تصفح الألعاب والنصائح لتعزيز نموه</div>
          </div>`;
      }
      infoBox.style.display = "block";
    } else {
      infoBox.style.display = "none";
    }
  }

  if (!items.length) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px 20px; color:#666F82; font-size:18px;">
        لا توجد عناصر متاحة حاليًا في هذا القسم.
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const isGame = item.cardType === 'game';
    const badgeColor = isGame ? '#3c5274' : '#7a93b5';
    const badgeLabel = isGame ? 'لعبة' : 'نصيحة';
    const skillIcon = SKILL_ICONS[item.skillKey] || '';
    return `
    <button class="growth-item-card" onclick="openGrowthDetail('${item.id}')">
      <div class="growth-card-icon-wrap" style="background:${isGame ? '#edf1f7' : '#f5f0f7'};">
        <img src="${skillIcon}" alt="${item.title}" class="growth-skill-icon" onerror="this.style.display='none'" />
      </div>
      <div class="growth-card-badge" style="background:${badgeColor};">${badgeLabel}</div>
      <div class="growth-item-title">${item.title}</div>
    </button>`;
  }).join("");
}

function openGrowthDetail(itemId) {
  localStorage.setItem("maddadSelectedGrowthItem", itemId);
  window.location.href = "growth-detail.html";
}

/* =========================
   GROWTH DETAIL PAGE
========================= */

function loadGrowthDetailPage() {
  const selectedId = localStorage.getItem("maddadSelectedGrowthItem");
  const item = GAMES_AND_TIPS_DATA.find(x => x.id === selectedId);

  if (!item) {
    window.location.href = "games.html";
    return;
  }

  const image = document.getElementById("growthDetailImage");
  const title = document.getElementById("growthDetailSkill");
  const text = document.getElementById("growthDetailText");
  const actionBtn = document.getElementById("growthDetailBtn");

  image.src = item.detailIcon;
  image.alt = item.title;
  title.textContent = item.title;
  text.textContent = item.detailText;

  if (item.playable) {
    actionBtn.textContent = "ابدأ اللعب الآن";
    actionBtn.onclick = function () {
      window.location.href = item.targetPage;
    };
  }  else {
  // This hides the button completely when it's not playable
  actionBtn.style.display = "none";
}
}


function openAbout(){

alert(
"مدد هو نظام رقمي يساعد أولياء الأمور على دعم نمو أطفالهم من خلال أدوات تقييم مبكرة وأنشطة تفاعلية تساعد على تطوير المهارات الأساسية بطريقة ممتعة وآمنة."
);

}

/* =========================
   SETTINGS PAGE
========================= */

function goSettings() {
  window.location.href = "settings.html";
}

async function loadSettingsPage() {
  // Try to get fresh data from the API; fall back to localStorage cache
  let account;
  try {
    const profile = await apiGetProfile();
    account = {
      childName: profile.child_name,
      childAge: profile.child_age,
      childGender: profile.child_gender,
      email: profile.email,
      createdAt: profile.created_at
        ? new Date(profile.created_at).toLocaleDateString("ar-SA")
        : (JSON.parse(localStorage.getItem("maddadAccount")) || {}).createdAt || "غير متوفر",
    };
  } catch (_) {
    account = JSON.parse(localStorage.getItem("maddadAccount")) || {};
  }

  const childNameEl = document.getElementById("settingsChildName");
  const emailEl = document.getElementById("settingsEmail");
  const createdEl = document.getElementById("settingsCreated");
  const childAgeEl = document.getElementById("settingsChildAge");
  const childGenderEl = document.getElementById("settingsChildGender");

  if (childNameEl) {
    childNameEl.textContent = account.childName || "غير متوفر";
  }

  if (emailEl) {
    emailEl.textContent = account.email || "غير متوفر";
  }

  if (createdEl) {
    createdEl.textContent = account.createdAt || "غير متوفر";
  }

  if (childAgeEl) {
    childAgeEl.textContent = account.childAge || "غير متوفر";
  }

  if (childGenderEl) {
    childGenderEl.textContent = account.childGender || "غير متوفر";
  }
}

/* =========================
   CHILD LOGIN
========================= */

function goBackIndex() {
  window.location.href = "../index.html";
}

function submitChildLogin() {
  const emailInput = document.getElementById("childLoginEmail");
  const passwordInput = document.getElementById("childLoginPassword");

  validateEmail(emailInput, "childEmailError");
  validatePassword(passwordInput, "childPasswordError");

  const emailValid = !document.getElementById("childEmailError").textContent;
  const passwordValid = passwordInput.dataset.valid === "true";

  if (emailValid && passwordValid) {
    childLogin();
  }
}

async function childLogin() {
  const email = document.getElementById("childLoginEmail").value.trim();
  const password = document.getElementById("childLoginPassword").value.trim();

  if (!email || !password) {
    alert("يرجى إدخال البريد الإلكتروني وكلمة المرور");
    return;
  }

  // Try the backend API first
  try {
    await apiLogin(email, password);
    window.location.href = "child.html";
    return;
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      return;
    }
    // Backend unavailable – allow access if a session is already cached for this email
    const savedAccount = JSON.parse(localStorage.getItem("maddadAccount"));
    if (savedAccount && email === savedAccount.email && localStorage.getItem("maddadLoggedIn") === "true") {
      window.location.href = "child.html";
    } else {
      alert("تعذّر الوصول إلى الخادم. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.");
    }
  }
}

/* =========================
   CHILD GAMES PAGE
========================= */

let currentChildGamesFilter = "all";

function loadChildGamesPage() {
  const loggedIn = localStorage.getItem("maddadLoggedIn");

  if (loggedIn !== "true") {
    window.location.href = "child-login.html";
    return;
  }

  renderChildGames("all");
}

function setChildGamesFilter(filter, clickedBtn) {
  currentChildGamesFilter = filter;

  document.querySelectorAll(".child-games-tab").forEach(btn => btn.classList.remove("active"));
  if (clickedBtn) clickedBtn.classList.add("active");

  renderChildGames(filter);
}

function renderChildGames(filter) {
  const container = document.getElementById("childGamesGrid");
  if (!container) return;

  const assessment = getAssessment();

  const weakSkills = assessment?.followupComplete
    ? Object.keys(assessment.currentAnswers || {}).filter(key => Number(assessment.currentAnswers[key]) === 1)
    : Object.keys(assessment?.initialAnswers || {}).filter(key => Number(assessment.initialAnswers[key]) === 1);

  let items = [];

  if (filter === "all") {
    items = GAMES_AND_TIPS_DATA.filter(item => item.cardType === "game");
  } else if (filter === "growth") {
    items = GAMES_AND_TIPS_DATA.filter(
      item => item.cardType === "game" && weakSkills.includes(item.skillKey)
    );
  }

  if (!items.length) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px 20px; color:#666F82; font-size:18px;">
        لا توجد ألعاب متاحة حاليًا في هذا القسم.
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <button class="child-game-card" onclick="openChildGrowthDetail('${item.id}')">
      <img src="../pictures/skill-game.png" alt="${item.title}" class="child-game-image" />
      <div class="child-game-title">${item.title}</div>
    </button>
  `).join("");
}

function openChildGrowthDetail(itemId) {
  localStorage.setItem("maddadSelectedChildGame", itemId);
  window.location.href = "child-growth-detail.html";
}

/* =========================
   CHILD GROWTH DETAIL PAGE
========================= */

function loadChildGrowthDetailPage() {
  const selectedId = localStorage.getItem("maddadSelectedChildGame");
  const item = GAMES_AND_TIPS_DATA.find(x => x.id === selectedId && x.cardType === "game");

  if (!item) {
    window.location.href = "child.html";
    return;
  }

  const image = document.getElementById("childDetailImage");
  const title = document.getElementById("childDetailSkill");
  const text = document.getElementById("childDetailText");
  const actionBtn = document.getElementById("childDetailBtn");

  image.src = item.detailIcon;
  image.alt = item.title;
  title.textContent = item.title;
  text.textContent = item.detailText;

  if (item.playable) {
    actionBtn.textContent = "ابدأ اللعب الآن";
    actionBtn.onclick = function () {
      window.location.href = item.targetPage;
    };
  } else {
    actionBtn.textContent = "قيد التطوير";
    actionBtn.onclick = function () {
      alert("هذه اللعبة قيد التطوير وسيتم العمل عليها مستقبلاً.");
    };
  }
}

function enableSettingsEdit() {
  const account = JSON.parse(localStorage.getItem("maddadAccount")) || {};

  const nameEl = document.getElementById("settingsChildName");
  const emailEl = document.getElementById("settingsEmail");
  const ageEl = document.getElementById("settingsChildAge");
  const genderEl = document.getElementById("settingsChildGender");

  const editBtn = document.getElementById("editSettingsBtn");
  const saveBtn = document.getElementById("saveSettingsBtn");

  if (nameEl) {
    nameEl.innerHTML = `<input type="text" id="editChildName" value="${account.childName || ""}" class="settings-input">`;
  }

  if (emailEl) {
    emailEl.innerHTML = `<input type="email" id="editEmail" value="${account.email || ""}" class="settings-input">`;
  }

  if (ageEl) {
    ageEl.innerHTML = `
      <select id="editChildAge" class="settings-input">
        <option value="12-18">12 - 18 شهر</option>
        <option value="19-24">19 - 24 شهر</option>
        <option value="25-30">25 - 30 شهر</option>
        <option value="31-36">31 - 36 شهر</option>
      </select>
    `;
    document.getElementById("editChildAge").value = account.childAge || "";
  }

  if (genderEl) {
    genderEl.innerHTML = `
      <select id="editChildGender" class="settings-input">
        <option value="ذكر">ذكر</option>
        <option value="أنثى">أنثى</option>
      </select>
    `;
    document.getElementById("editChildGender").value = account.childGender || "";
  }

  editBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
}

async function saveSettingsData() {
  const newName = document.getElementById("editChildName")?.value.trim() || "";
  const newEmail = document.getElementById("editEmail")?.value.trim() || "";
  const newAge = document.getElementById("editChildAge")?.value || "";
  const newGender = document.getElementById("editChildGender")?.value || "";

  // Try to persist via API; fall back to localStorage-only update
  try {
    await apiUpdateProfile({
      child_name: newName || undefined,
      email: newEmail || undefined,
      child_age: newAge || undefined,
      child_gender: newGender || undefined,
    });
  } catch (_) {
    const account = JSON.parse(localStorage.getItem("maddadAccount")) || {};
    account.childName = newName;
    account.email = newEmail;
    account.childAge = newAge;
    account.childGender = newGender;
    localStorage.setItem("maddadAccount", JSON.stringify(account));
  }

  await loadSettingsPage();

  const editBtn = document.getElementById("editSettingsBtn");
  const saveBtn = document.getElementById("saveSettingsBtn");

  if (editBtn) editBtn.style.display = "inline-block";
  if (saveBtn) saveBtn.style.display = "none";
}

function goDashboard() {
  window.location.href = "dashboard.html";
}

function loadDashboardPage() {
  const assessment = getAssessment();
  const history = JSON.parse(localStorage.getItem("maddadHistory") || "[]");

  if (!assessment) {
    window.location.href = "questionnaire.html";
    return;
  }

  // تحديد الحالة والسكور
  const risk = assessment.followupComplete
    ? assessment.finalRisk
    : assessment.initialRisk;

  const score = assessment.followupComplete
    ? assessment.finalScore
    : assessment.initialScore;

  const failed = assessment.failedSkills || [];

  // عناصر الصفحة
  const skillsCountEl = document.getElementById("skillsCount");
  const lastScoreEl = document.getElementById("lastScore");
  const historyCountEl = document.getElementById("historyCount");

  const img = document.getElementById("riskImage");
  const title = document.getElementById("riskTitle");
  const desc = document.getElementById("riskDesc");

  const skillsList = document.getElementById("skillsList");
  const historyList = document.getElementById("historyList");
  const trendText = document.getElementById("trendText");
  const chartCanvas = document.getElementById("progressChart");

  // الإحصائيات
  if (skillsCountEl) skillsCountEl.textContent = failed.length;
  if (lastScoreEl) lastScoreEl.textContent = score ?? 0;
  if (historyCountEl) historyCountEl.textContent = history.length;

  // الحالة
  if (img && title && desc) {
    if (risk === "low") {
      img.src = "../pictures/result-low.png";
      title.textContent = "احتمالية منخفضة";
      desc.textContent = "نتيجة مطمئنة مع الاستمرار في المتابعة.";
    } else if (risk === "medium") {
      img.src = "../pictures/result-medium.png";
      title.textContent = "احتمالية متوسطة";
      desc.textContent = "توجد بعض المؤشرات وتحتاج متابعة.";
    } else {
      img.src = "../pictures/result-high.png";
      title.textContent = "احتمالية مرتفعة";
      desc.textContent = "يوصى بالمتابعة والتقييم المتخصص.";
    }
  }

  // المهارات
  if (skillsList) {
    if (failed.length === 0) {
      skillsList.innerHTML = `<span>لا توجد مهارات تحتاج متابعة</span>`;
    } else {
      skillsList.innerHTML = failed
        .map(s => `<span>${skillLabelsArabic[s] || s}</span>`)
        .join("");
    }
  }

  // السجل (آخر 5)
  if (historyList) {
    if (history.length === 0) {
      historyList.innerHTML = `<div class="dashboard-empty">لا يوجد سجل تقييمات بعد</div>`;
    } else {
      historyList.innerHTML = `
        <div class="dashboard-history-row dashboard-history-head">
          <span>التاريخ</span>
          <span>النتيجة</span>
          <span>السكور</span>
        </div>

        ${history.slice(-5).reverse().map(h => `
          <div class="dashboard-history-row">
            <span>${h.date || "-"}</span>
            <span>${h.risk || "-"}</span>
            <span>${h.score ?? "-"}</span>
          </div>
        `).join("")}
      `;
    }
  }

  // الرسم البياني
  const labels = history.map(h => h.date);
  const data = history.map(h => h.score);

  if (chartCanvas && typeof Chart !== "undefined" && data.length > 0) {
    new Chart(chartCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Score",
          data,
          borderColor: "#3c5274",
          backgroundColor: "rgba(60,82,116,0.1)",
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // الاتجاه
  if (trendText && data.length >= 2) {
    const diff = data[data.length - 1] - data[data.length - 2];

    if (diff < 0) trendText.textContent = "تحسن 👍";
    else if (diff > 0) trendText.textContent = "تراجع ⚠️";
    else trendText.textContent = "ثابت";
  } else if (trendText) {
    trendText.textContent = "";
  }
}
