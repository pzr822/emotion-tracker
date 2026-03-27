const SUPABASE_URL = "https://eoeiucawlhojrkisjkpi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZyNfyZeTnuknsNDyPcO-OQ_wMj6nsge";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== mood =====
const form = document.getElementById("moodForm");
const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");
const submitBtn = document.getElementById("submitBtn");
const heroImage = document.getElementById("heroImage");
const subtitle = document.getElementById("subtitle");
const helperBox = document.getElementById("helperBox");
const somaticPresentSelect = document.getElementById("somatic_present");
const somaticNoteField = document.getElementById("somaticNoteField");
const somaticNote = document.getElementById("somatic_note");

// ===== supplement =====
const supplementForm = document.getElementById("supplementForm");
const supplementSubmitBtn = document.getElementById("supplementSubmitBtn");
const supplementSuccessMessage = document.getElementById("supplementSuccessMessage");
const supplementErrorMessage = document.getElementById("supplementErrorMessage");
const todayList = document.getElementById("todayList");

// ===== tabs =====
const tabButtons = document.querySelectorAll(".tab-btn");
const moodPanel = document.getElementById("moodPanel");
const supplementPanel = document.getElementById("supplementPanel");

const LAST_SUBMIT_DATE_KEY = "emotion_tracker_last_submit_date";
const TODAY_SUBMIT_COUNT_KEY = "emotion_tracker_today_submit_count";

function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getTodaySubmitCount() {
  const today = getTodayString();
  const savedDate = localStorage.getItem(LAST_SUBMIT_DATE_KEY);
  const savedCount = Number(localStorage.getItem(TODAY_SUBMIT_COUNT_KEY) || "0");

  if (savedDate !== today) {
    return 0;
  }

  return savedCount;
}

function increaseTodaySubmitCount() {
  const today = getTodayString();
  const savedDate = localStorage.getItem(LAST_SUBMIT_DATE_KEY);
  const savedCount = Number(localStorage.getItem(TODAY_SUBMIT_COUNT_KEY) || "0");

  if (savedDate !== today) {
    localStorage.setItem(LAST_SUBMIT_DATE_KEY, today);
    localStorage.setItem(TODAY_SUBMIT_COUNT_KEY, "1");
  } else {
    localStorage.setItem(TODAY_SUBMIT_COUNT_KEY, String(savedCount + 1));
  }
}

function showTodayReminder() {
  const count = getTodaySubmitCount();

  if (count >= 1) {
    helperBox.textContent = "今天已经记录过啦，心情有变化，都要告诉爸爸哦！";
  } else {
    helperBox.textContent = "你不需要写得很完整，只要把今天的感觉留下来就已经很好了。";
  }
}

function updateSomaticField() {
  if (somaticPresentSelect.value === "有") {
    somaticNoteField.classList.remove("hidden");
  } else {
    somaticNoteField.classList.add("hidden");
    somaticNote.value = "";
  }
}

function switchTab(tabName) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  if (tabName === "mood") {
    moodPanel.classList.remove("hidden");
    supplementPanel.classList.add("hidden");
  } else {
    supplementPanel.classList.remove("hidden");
    moodPanel.classList.add("hidden");
    loadTodaySupplements();
  }
}

async function loadTodaySupplements() {
  todayList.textContent = "正在读取今天的补给记录…";

  const today = getTodayString();

  const { data, error } = await supabaseClient
    .from("supplement_entries")
    .select("supplement")
    .eq("local_date", today)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("读取补给失败：", error);
    todayList.textContent = "读取失败了，请稍后再试一次。";
    return;
  }

  if (!data || data.length === 0) {
    todayList.textContent = "今天还没有记录补给哦。";
    return;
  }

  const uniqueSupplements = [...new Set(data.map((item) => item.supplement))];
  todayList.textContent = uniqueSupplements.join("、");
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchTab(button.dataset.tab);
  });
});

somaticPresentSelect.addEventListener("change", updateSomaticField);
updateSomaticField();
showTodayReminder();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const todayCount = getTodaySubmitCount();

  if (todayCount >= 1) {
    const confirmed = window.confirm(
      "今天已经记录过啦。\n宝贝看来今天有很多故事呢，还想继续跟我说吗？"
    );

    if (!confirmed) {
      return;
    }
  }

  successMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");
  submitBtn.disabled = true;
  submitBtn.textContent = "正在提交…";

  const payload = {
    mood_score: Number(document.getElementById("mood_score").value),
    sleep_score: Number(document.getElementById("sleep_score").value),
    anxiety_score: Number(document.getElementById("anxiety_score").value),
    depression_score: Number(document.getElementById("depression_score").value),
    somatic_present: document.getElementById("somatic_present").value,
    somatic_note: document.getElementById("somatic_note").value.trim(),
    note: document.getElementById("note").value.trim()
  };

  const { error } = await supabaseClient
    .from("emotion_entries")
    .insert([payload]);

  if (error) {
    console.error("提交失败：", error);
    errorMessage.classList.remove("hidden");
    submitBtn.disabled = false;
    submitBtn.textContent = "提交今天的记录";
    return;
  }

  increaseTodaySubmitCount();

  form.reset();
  updateSomaticField();
  showTodayReminder();

  heroImage.src = "assets/success.png";
  subtitle.textContent = "宝贝今天也很努力呢！爸爸永远在你身边~";
  successMessage.classList.remove("hidden");

  submitBtn.disabled = false;
  submitBtn.textContent = "提交今天的记录";
});

supplementForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  supplementSuccessMessage.classList.add("hidden");
  supplementErrorMessage.classList.add("hidden");
  supplementSubmitBtn.disabled = true;
  supplementSubmitBtn.textContent = "正在提交…";

  const checkedSupplements = Array.from(
    supplementForm.querySelectorAll('input[name="supplement"]:checked')
  ).map((item) => item.value);

  if (checkedSupplements.length === 0) {
    supplementErrorMessage.textContent = "请先勾选今天吃过的补给哦。";
    supplementErrorMessage.classList.remove("hidden");
    supplementSubmitBtn.disabled = false;
    supplementSubmitBtn.textContent = "提交今日补给";
    return;
  }

  const today = getTodayString();

  const { data: existingRows, error: readError } = await supabaseClient
    .from("supplement_entries")
    .select("supplement")
    .eq("local_date", today);

  if (readError) {
    console.error("读取已有补给失败：", readError);
    supplementErrorMessage.textContent = "读取记录失败了，请稍后再试一次。";
    supplementErrorMessage.classList.remove("hidden");
    supplementSubmitBtn.disabled = false;
    supplementSubmitBtn.textContent = "提交今日补给";
    return;
  }

  const existingSet = new Set((existingRows || []).map((item) => item.supplement));
  const newSupplements = checkedSupplements.filter((name) => !existingSet.has(name));

  if (newSupplements.length === 0) {
    supplementErrorMessage.textContent = "这些补给今天已经记过啦，不用重复提交哦。";
    supplementErrorMessage.classList.remove("hidden");
    supplementForm.reset();
    await loadTodaySupplements();
    supplementSubmitBtn.disabled = false;
    supplementSubmitBtn.textContent = "提交今日补给";
    return;
  }

  const payload = newSupplements.map((name) => ({
    local_date: today,
    supplement: name
  }));

  const { error } = await supabaseClient
    .from("supplement_entries")
    .insert(payload);

  if (error) {
    console.error("补给提交失败：", error);
    supplementErrorMessage.textContent = "补给提交失败了，请稍后再试一次。";
    supplementErrorMessage.classList.remove("hidden");
    supplementSubmitBtn.disabled = false;
    supplementSubmitBtn.textContent = "提交今日补给";
    return;
  }

  supplementForm.reset();
  supplementSuccessMessage.textContent = "今天的补给已经记下来啦。";
  supplementSuccessMessage.classList.remove("hidden");

  await loadTodaySupplements();

  supplementSubmitBtn.disabled = false;
  supplementSubmitBtn.textContent = "提交今日补给";
});

switchTab("mood");
