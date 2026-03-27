const SUPABASE_URL = "https://eoeiucawlhojrkisjkpi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZyNfyZeTnuknsNDyPcO-OQ_wMj6nsge";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const moodForm = document.getElementById("moodForm");
const supplementForm = document.getElementById("supplementForm");

const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");

const submitBtn = document.getElementById("submitBtn");
const supplementSubmitBtn = document.getElementById("supplementSubmitBtn");

const heroImage = document.getElementById("heroImage");
const subtitle = document.getElementById("subtitle");
const helperBox = document.getElementById("helperBox");

const somaticPresentSelect = document.getElementById("somatic_present");
const somaticNoteField = document.getElementById("somaticNoteField");
const somaticNote = document.getElementById("somatic_note");

const todaySupplementsBox = document.getElementById("todaySupplements");

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
    helperBox.textContent = "宝宝不需要说的很多呢，只要把今天的感觉慢慢说给爸爸听。";
  }
}

function updateSomaticField() {
  if (somaticPresentSelect.value === "没有") {
    somaticNoteField.classList.add("hidden");
    somaticNote.value = "";
  } else {
    somaticNoteField.classList.remove("hidden");
  }
}

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.tab;

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanels.forEach((panel) => panel.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(targetId).classList.add("active");

      successMessage.classList.add("hidden");
      errorMessage.classList.add("hidden");
    });
  });
}

async function getTodaySupplements() {
  const today = getTodayString();

  const { data, error } = await supabaseClient
    .from("supplement_entries")
    .select("supplement")
    .eq("local_date", today);

  if (error) {
    console.error("读取补给失败：", error);
    return [];
  }

  return [...new Set(data.map(item => item.supplement))];
}

async function showTodaySupplements() {
  const list = await getTodaySupplements();

  if (list.length === 0) {
    todaySupplementsBox.textContent = "今天还没有记录补给。";
  } else {
    todaySupplementsBox.textContent = "今天已经吃过：" + list.join("、");
  }

  document.querySelectorAll('input[name="supplement"]').forEach((checkbox) => {
    if (list.includes(checkbox.value)) {
      checkbox.checked = true;
      checkbox.disabled = true;
    } else {
      checkbox.checked = false;
      checkbox.disabled = false;
    }
  });
}

somaticPresentSelect.addEventListener("change", updateSomaticField);
updateSomaticField();
showTodayReminder();
setupTabs();
showTodaySupplements();

moodForm.addEventListener("submit", async (e) => {
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

  moodForm.reset();
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

  successMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");
  supplementSubmitBtn.disabled = true;
  supplementSubmitBtn.textContent = "正在提交…";

  const selectedSupplements = Array.from(
    document.querySelectorAll('input[name="supplement"]:checked')
  )
    .filter(item => !item.disabled)
    .map(item => item.value);

  if (selectedSupplements.length === 0) {
    errorMessage.textContent = "这次还没有选择新的补给哦。";
    errorMessage.classList.remove("hidden");
    supplementSubmitBtn.disabled = false;
    supplementSubmitBtn.textContent = "提交今日补给";
    return;
  }

  const today = getTodayString();
  const rows = selectedSupplements.map((item) => ({
    local_date: today,
    supplement: item
  }));

  const { error } = await supabaseClient
    .from("supplement_entries")
    .insert(rows);

  if (error) {
    console.error("补给提交失败：", error);
    errorMessage.textContent = "补给提交失败了，请稍后再试一次。";
    errorMessage.classList.remove("hidden");
    supplementSubmitBtn.disabled = false;
    supplementSubmitBtn.textContent = "提交今日补给";
    return;
  }

  await showTodaySupplements();

  successMessage.textContent = "今日补给已经记好啦，爸爸会一起帮你记着。";
  successMessage.classList.remove("hidden");

  supplementSubmitBtn.disabled = false;
  supplementSubmitBtn.textContent = "提交今日补给";
});
