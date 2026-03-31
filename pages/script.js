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

function validatePassword(input, errorId) {
  const error = document.getElementById(errorId);
  const value = input.value;

  const rules = [
    { test: value.length >= 8, label: "8 أحرف على الأقل" },
    { test: /[A-Z]/.test(value), label: "حرف كبير (A-Z)" },
    { test: /[a-z]/.test(value), label: "حرف صغير (a-z)" },
    { test: /[0-9]/.test(value), label: "رقم واحد على الأقل" },
    { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value), label: "رمز خاص (!@#$%...)" }
  ];

  if (!value) {
    error.textContent = "كلمة المرور مطلوبة";
    input.dataset.valid = "false";
    return;
  }

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
  validatePassword(passwordInput, "loginPasswordError", false); // hide rules on login

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

function parentSignup() {
  const childName = document.getElementById("signupChildName").value.trim();
  const childAge = document.getElementById("signupChildAge").value;
  const childGender = document.getElementById("signupChildGender").value;
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (!childName || !childAge || !childGender || !email || !password) {
    alert("فضلاً عبئي جميع الحقول");
    return;
  }

  const account = {
    childName: childName,
    childAge: childAge,
    childGender: childGender,
    email: email,
    password: password,
    createdAt: new Date().toLocaleDateString("ar-SA")
    
  };

  localStorage.setItem("maddadAccount", JSON.stringify(account));
  localStorage.setItem("maddadLoggedIn", "true");

  window.location.href = "home-new.html";
}

function parentLogin() {
  const email = document.getElementById("parentLoginEmail").value.trim();
  const password = document.getElementById("parentLoginPassword").value.trim();

  const savedAccount = JSON.parse(localStorage.getItem("maddadAccount"));

  if (!email || !password) {
    alert("فضلاً أدخلي البريد الإلكتروني وكلمة المرور");
    return;
  }

  if (!savedAccount) {
    alert("لا يوجد حساب محفوظ حالياً. أنشئي حساب أولاً");
    return;
  }

  if (email === savedAccount.email && password === savedAccount.password) {
    localStorage.setItem("maddadLoggedIn", "true");
    window.location.href = "home-login.html";
  } else {
    alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }
}

/* =========================
   HOME NEW PAGE
========================= */

function logout() {
  localStorage.removeItem("maddadLoggedIn");
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

function loadLoginHomePage() {
  const loggedIn = localStorage.getItem("maddadLoggedIn");
  const savedAccount = JSON.parse(localStorage.getItem("maddadAccount"));

  if (loggedIn !== "true" || !savedAccount) {
    window.location.href = "parent.html";
    return;
  }

  const welcomeTitle = document.getElementById("welcomeTitle");
  const childNameText = document.getElementById("childNameText");
  const childAgeText = document.getElementById("childAgeText");
  const childGenderText = document.getElementById("childGenderText");
  const emailText = document.getElementById("emailText");

  if (welcomeTitle) {
    welcomeTitle.textContent = `أهلًا ولي أمر ${savedAccount.childName || ""}`;
  }

  if (childNameText) {
    childNameText.textContent = savedAccount.childName || "-";
  }

  if (childAgeText) {
    childAgeText.textContent = savedAccount.childAge || "-";
  }

  if (childGenderText) {
    childGenderText.textContent = savedAccount.childGender || "-";
  }

  if (emailText) {
    emailText.textContent = savedAccount.email || "-";
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

function finishQuestionnaire() {
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

  const assessment = {
    ageGroup: account.childAge,
    gender: account.childGender,
    initialAnswers: answers,
    currentAnswers: { ...answers },
    initialScore: score,
    initialRisk: initialRisk,
    failedSkills: failedSkills,
    followupNeeded: (initialRisk === "medium" || initialRisk === "high"),
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

    if (assessment.followupComplete) {

      resultText.textContent =
        "هذه النتيجة النهائية بعد أسئلة المتابعة والتي ساعدت في الوصول إلى تصنيف أكثر دقة.";

      resultMainBtn.textContent = "الأنشطة المقترحة";
      resultMainBtn.className = "result-main-btn btn-yellow";

    } else {

      resultText.textContent = "يُنصح بإكمال التقييم الإضافي";

      resultMainBtn.textContent = "أسئلة المتابعة";
      resultMainBtn.className = "result-main-btn btn-yellow";
    }

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



  resultSummary.innerHTML = `
    <strong>العمر:</strong> ${assessment.ageGroup} شهر تقريبًا<br>
    <strong>مجموع الإجابات (لا):</strong> ${shownScore}<br>
    <strong>مستوى الخطورة:</strong> ${riskTextArabic(shownRisk)}
  `;
}

function handleResultMainAction() {
  const assessment = getAssessment();
  if (!assessment) {
    window.location.href = "questionnaire.html";
    return;
  }

  const shownRisk = assessment.followupComplete ? assessment.finalRisk : assessment.initialRisk;

  if (!assessment.followupComplete && (shownRisk === "medium" || shownRisk === "high")) {
    window.location.href = "followup.html";
    return;
  }

  if (shownRisk === "low") {
    window.location.href = "report.html";
    return;
  }

  window.location.href = "games.html";
}

function goToDetailedReport() {
  window.location.href = "report.html";
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
    question: "هل طفلك يناظر عينك؟",
    type: "checkbox",
    name: "eye_contact_context",
    options: [
      { label: "لما يحتاج شيء", value: "needs" },
      { label: "لما يلعب معك", value: "play" },
      { label: "أثناء الأكل", value: "eating" },
      { label: "أثناء اللبس", value: "dressing" },
      { label: "عندما تقرأ له قصة", value: "story" },
      { label: "عندما تتحدث معه", value: "talking" }
    ],
    subQuestion: {
      id: "eyeSubBox",
      title: "لما أنت وطفلك سوا خلال اليوم، هل ينظر إلى عينك على الأقل 5 ثوانٍ؟",
      name: "eye_contact_sub"
    }
  },

  response_to_name: {
    title: "متابعة: الاستجابة للاسم",
    question: "هل طفلك يستجيب لاسمه في مواقف أخرى حتى لو لم يكن الأمر ثابتًا؟ (مثال: قد يستجيب في الحديقة أو عند الحماس لكنه لا يستجيب أثناء مشاهدة التلفاز أو عندما يكون مركزًا على نشاط).",
    type: "radio",
    name: "response_to_name_followup",
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
      title: 'إذا قلت له "وريني"، هل سيشير طفلك إلى الشيء؟',
      name: "pointing_sub"
    }
  },

  imitation: {
    title: "متابعة: التقليد",
    question: "اختاري ما ينطبق على طفلك:",
    type: "checkbox",
    name: "imitation_context",
    options: [
      { label: "هل يخرج لسانه؟", value: "tongue" },
      { label: "هل يصدر أصواتاً مضحكة؟", value: "sounds" },
      { label: 'هل يلوح قاصداً "وداعاً"؟ (أو يشير لـ "وداعاً"؟)', value: "wave" },
      { label: "هل يصفق بيده؟", value: "clap" },
      { label: 'هل يضع إصبعه على شفتيه كإشارة لـ "السكوت"/"الصمت"؟', value: "shush" },
      { label: "هل يرسل قبلة في الهواء؟", value: "kiss" }
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
  }
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

  if (failed.includes("eye_contact")) followupSteps.push("eye_contact");
  if (failed.includes("response_to_name")) followupSteps.push("response_to_name");
  if (failed.includes("pointing_with_finger")) followupSteps.push("pointing_with_finger");
  if (failed.includes("imitation")) followupSteps.push("imitation");
  if (failed.includes("discrimination")) followupSteps.push("discrimination");

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

  if (skill === "response_to_name") {
    const initialAnswer = assessment.initialAnswers.response_to_name;

    if (initialAnswer === 1) {
      step.question = "هل طفلك يستجيب لاسمه في مواقف أخرى حتى لو لم يكن الأمر ثابتًا؟ (مثال: قد يستجيب في الحديقة أو عند الحماس لكنه لا يستجيب أثناء مشاهدة التلفاز أو عندما يكون مركزًا على نشاط).";
    } else {
      step.question = "هل استجابة طفلك مرتبطة فعلاً بمعرفته لاسمه، أم أنها تحدث بسبب نبرة الصوت أو التلميحات؟ (مثال: إذا قلت اسمه بصوت عادي من بعيد هل ينظر إليك؟)";
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
      ${!isFirst ? `<button type="button" class="questionnaire-next-btn" onclick="goPrevFollowup()">السابق</button>` : ""}
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

function finalizeFollowup() {
  const assessment = getAssessment();
  if (!assessment) {
    window.location.href = "questionnaire.html";
    return;
  }

  const updatedAnswers = { ...assessment.currentAnswers, ...followupCollectedAnswers };
  const finalScore = calculateScore(updatedAnswers);
  const finalRisk = classifyRisk(assessment.ageGroup, finalScore);

  assessment.currentAnswers = updatedAnswers;
  assessment.finalScore = finalScore;
  assessment.finalRisk = finalRisk;
  assessment.followupComplete = true;

  let history = JSON.parse(localStorage.getItem("maddadHistory")) || [];

  history.push({
    date: new Date().toLocaleDateString("ar-SA"),
    risk: riskTextArabic(finalRisk),
    score: finalScore
  });

  localStorage.setItem("maddadHistory", JSON.stringify(history));

  saveAssessment(assessment);
  window.location.href = "result.html";
}

function handleResultMainAction() {

  const assessment = getAssessment();

  if (!assessment) {
    window.location.href = "questionnaire.html";
    return;
  }

  let risk = assessment.initialRisk;

  if (assessment.followupComplete) {
    risk = assessment.finalRisk;
  }

  if (risk === "low") {

    window.location.href = "home-login.html";

  } else {

    if (assessment.followupComplete) {

      window.location.href = "games.html";

    } else {

      window.location.href = "followup.html";

    }

  }
}

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
    targetPage: "eye-contact-game.html"
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
  {
    id: "tip_response_to_name",
    skillKey: "response_to_name",
    title: "الاستجابة للاسم",
    cardType: "tip",
    cardIcon: "../pictures/skill-tip.png",
    detailIcon: SKILL_ICONS.response_to_name,
    detailText: "كرري اسم الطفل في مواقف يومية ممتعة، وامنحيه تعزيزًا فوريًا عندما يلتفت أو يستجيب. احرصي على أن يكون الصوت واضحًا وأن تقللي المشتتات أثناء التدريب.",
    playable: false
  },

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
  {
    id: "tip_eye_contact",
    skillKey: "eye_contact",
    title: "التواصل البصري",
    cardType: "tip",
    cardIcon: "../pictures/skill-tip.png",
    detailIcon: SKILL_ICONS.eye_contact,
    detailText: "قربي وجهك من مستوى نظر الطفل أثناء اللعب، وامنحيه وقتًا كافيًا للنظر إليك، مع استخدام ألعاب يحبها أو أصوات مشجعة لزيادة فرص التواصل البصري.",
    playable: false
  },

  {
    id: "game_social_smile",
    skillKey: "social_smile",
    title: "الابتسامة الاجتماعية",
    cardType: "game",
    cardIcon: "../pictures/skill-game.png",
    detailIcon: SKILL_ICONS.social_smile,
    detailText: "هذه اللعبة قيد التطوير حاليًا، وسيتم العمل عليها مستقبلًا لدعم مهارة الابتسامة الاجتماعية من خلال مواقف مرحة وتعزيزات مناسبة.",
    playable: false
  },
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

  {
    id: "game_imitation",
    skillKey: "imitation",
    title: "التقليد",
    cardType: "game",
    cardIcon: "../pictures/skill-game.png",
    detailIcon: SKILL_ICONS.imitation,
    detailText: "هذه اللعبة قيد التطوير حاليًا، وسيتم العمل عليها مستقبلًا لدعم مهارة التقليد من خلال حركات بسيطة وأنشطة ممتعة وتدريجية.",
    playable: false
  },
  {
    id: "tip_imitation",
    skillKey: "imitation",
    title: "التقليد",
    cardType: "tip",
    cardIcon: "../pictures/skill-tip.png",
    detailIcon: SKILL_ICONS.imitation,
    detailText: "ابدئي بحركات سهلة مثل التصفيق أو التلويح، ثم شجعي الطفل على تقليدها مباشرة مع مدح فوري أو مكافأة بسيطة يحبها.",
    playable: false
  },

  {
    id: "game_discrimination",
    skillKey: "discrimination",
    title: "التمييز",
    cardType: "game",
    cardIcon: "../pictures/skill-game.png",
    detailIcon: SKILL_ICONS.discrimination,
    detailText: "هذه اللعبة قيد التطوير حاليًا، وسيتم العمل عليها مستقبلًا لدعم مهارة التمييز بين الأشياء والأشكال والمفاهيم اليومية بطريقة تفاعلية.",
    playable: false
  },
  {
    id: "tip_discrimination",
    skillKey: "discrimination",
    title: "التمييز",
    cardType: "tip",
    cardIcon: "../pictures/skill-tip.png",
    detailIcon: SKILL_ICONS.discrimination,
    detailText: "استخدمي بطاقات أو أدوات حقيقية من بيئة الطفل، وابدئي بالتمييز بين عنصرين فقط، ثم زيدي الصعوبة تدريجيًا مع التكرار والتعزيز.",
    playable: false
  },

  {
    id: "game_pointing_with_finger",
    skillKey: "pointing_with_finger",
    title: "الإشارة بالإصبع",
    cardType: "game",
    cardIcon: "../pictures/skill-game.png",
    detailIcon: SKILL_ICONS.pointing_with_finger,
    detailText: "هذه اللعبة قيد التطوير حاليًا، وسيتم العمل عليها مستقبلًا لدعم مهارة الإشارة بالإصبع وطلب الأشياء أو لفت الانتباه بطريقة تفاعلية.",
    playable: false
  },
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

  {
    id: "game_facial_expressions",
    skillKey: "facial_expressions",
    title: "تعابير الوجه",
    cardType: "game",
    cardIcon: "../pictures/skill-game.png",
    detailIcon: SKILL_ICONS.facial_expressions,
    detailText: "هذه اللعبة قيد التطوير حاليًا، وسيتم العمل عليها مستقبلًا لمساعدة الطفل على فهم تعابير الوجه وربطها بالمواقف المختلفة.",
    playable: false
  },
  {
    id: "tip_facial_expressions",
    skillKey: "facial_expressions",
    title: "تعابير الوجه",
    cardType: "tip",
    cardIcon: "../pictures/skill-tip.png",
    detailIcon: SKILL_ICONS.facial_expressions,
    detailText: "استخدمي المرآة والصور التعبيرية وتمثيل المشاعر المختلفة مثل الفرح والحزن والتعجب، مع تسمية كل تعبير بوضوح أثناء اللعب أو القراءة.",
    playable: false
  },

  {
    id: "game_joint_attention",
    skillKey: "joint_attention",
    title: "الانتباه المشترك",
    cardType: "game",
    cardIcon: "../pictures/skill-game.png",
    detailIcon: SKILL_ICONS.joint_attention,
    detailText: "هذه اللعبة قيد التطوير حاليًا، وسيتم العمل عليها مستقبلًا لدعم مهارة الانتباه المشترك ومشاركة الطفل الاهتمام مع الآخرين.",
    playable: false
  },
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

  {
    id: "game_play_skills",
    skillKey: "play_skills",
    title: "مهارات اللعب",
    cardType: "game",
    cardIcon: "../pictures/skill-game.png",
    detailIcon: SKILL_ICONS.play_skills,
    detailText: "هذه اللعبة قيد التطوير حاليًا، وسيتم العمل عليها مستقبلًا لتنمية مهارات اللعب الوظيفي والتخيلي من خلال مواقف مرحة وتدريجية.",
    playable: false
  },
  {
    id: "tip_play_skills",
    skillKey: "play_skills",
    title: "مهارات اللعب",
    cardType: "tip",
    cardIcon: "../pictures/skill-tip.png",
    detailIcon: SKILL_ICONS.play_skills,
    detailText: "ابدئي بألعاب بسيطة وواضحة الهدف، ثم انتقلي تدريجيًا إلى اللعب التخيلي باستخدام الدمى والأدوات اليومية مع مشاركة الكبار.",
    playable: false
  },

  {
    id: "game_response_to_commands",
    skillKey: "response_to_commands",
    title: "الاستجابة للتعليمات",
    cardType: "game",
    cardIcon: "../pictures/skill-game.png",
    detailIcon: SKILL_ICONS.response_to_commands,
    detailText: "هذه اللعبة قيد التطوير حاليًا، وسيتم العمل عليها مستقبلًا لدعم مهارة اتباع التعليمات اليومية بطريقة ممتعة وتفاعلية.",
    playable: false
  },
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

  const assessment = getAssessment();
  const weakSkills = assessment?.followupComplete
    ? Object.keys(assessment.currentAnswers || {}).filter(key => Number(assessment.currentAnswers[key]) === 1)
    : Object.keys(assessment?.initialAnswers || {}).filter(key => Number(assessment.initialAnswers[key]) === 1);

  let items = [];

  if (filter === "all") {
    items = GAMES_AND_TIPS_DATA;
  } else if (filter === "games") {
    items = GAMES_AND_TIPS_DATA.filter(item => item.cardType === "game");
  } else if (filter === "tips") {
    items = GAMES_AND_TIPS_DATA.filter(item => item.cardType === "tip");
  } else if (filter === "growth") {
    items = GAMES_AND_TIPS_DATA.filter(item => item.cardType === "game" && weakSkills.includes(item.skillKey));
  }

  if (!items.length) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px 20px; color:#666F82; font-size:18px;">
        لا توجد عناصر متاحة حاليًا في هذا القسم.
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <button class="growth-item-card" onclick="openGrowthDetail('${item.id}')">
      <img src="${item.cardIcon}" alt="${item.title}" class="growth-item-image" />
      <div class="growth-item-title">${item.title}</div>
    </button>
  `).join("");
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
  } else if (item.cardType === "tip") {
    actionBtn.textContent = "اقرأ المزيد";
    actionBtn.onclick = function () {
      alert("يمكنك تعديل هذه الصفحة لاحقًا لإضافة نصائح تفصيلية أكثر.");
    };
  } else {
    actionBtn.textContent = "قيد التطوير";
    actionBtn.onclick = function () {
      alert("هذه اللعبة قيد التطوير وسيتم العمل عليها مستقبلاً.");
    };
  }
}

/* =========================
   SETTINGS PAGE
========================= */

function loadSettingsPage(){

const user = JSON.parse(localStorage.getItem("maddadUser")) || {};

document.getElementById("settingsEmail").textContent =
user.email || "غير متوفر";

document.getElementById("settingsCreated").textContent =
user.createdAt || "غير متوفر";

document.getElementById("settingsChildAge").textContent =
user.childAge || "غير متوفر";

document.getElementById("settingsChildGender").textContent =
user.childGender || "غير متوفر";

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

function loadSettingsPage() {
  const account = JSON.parse(localStorage.getItem("maddadAccount")) || {};

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



function openAbout() {
  alert(
    "مدد هو نظام رقمي يساعد أولياء الأمور على دعم نمو أطفالهم من خلال أدوات تقييم مبكرة وأنشطة تفاعلية ونصائح موجهة تساعد على تطوير المهارات الأساسية بطريقة ممتعة وآمنة."
  );
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

function childLogin() {
  const email = document.getElementById("childLoginEmail").value.trim();
  const password = document.getElementById("childLoginPassword").value.trim();

  const savedAccount = JSON.parse(localStorage.getItem("maddadAccount"));

  if (!email || !password) {
    alert("يرجى إدخال البريد الإلكتروني وكلمة المرور");
    return;
  }

  if (!savedAccount) {
    alert("لا يوجد حساب ولي أمر مسجل");
    return;
  }

  if (email === savedAccount.email && password === savedAccount.password) {
    localStorage.setItem("maddadLoggedIn", "true");
    window.location.href = "child.html";
  } else {
    alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
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

function saveSettingsData() {
  const account = JSON.parse(localStorage.getItem("maddadAccount")) || {};

  const newName = document.getElementById("editChildName")?.value.trim() || "";
  const newEmail = document.getElementById("editEmail")?.value.trim() || "";
  const newAge = document.getElementById("editChildAge")?.value || "";
  const newGender = document.getElementById("editChildGender")?.value || "";

  account.childName = newName;
  account.email = newEmail;
  account.childAge = newAge;
  account.childGender = newGender;

  localStorage.setItem("maddadAccount", JSON.stringify(account));

  loadSettingsPage();

  const editBtn = document.getElementById("editSettingsBtn");
  const saveBtn = document.getElementById("saveSettingsBtn");

  if (editBtn) editBtn.style.display = "inline-block";
  if (saveBtn) saveBtn.style.display = "none";
}

