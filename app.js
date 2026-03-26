const SUPABASE_URL = "https://eoeiucawlhojrkisjkpi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZyNfyZeTnuknsNDyPcO-OQ_wMj6nsge";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    helperBox.textContent = `今天已经记录过 ${count} 次啦，心情有变化，爸爸都会收到哦！`;
  } else {
    helperBox.textContent = "你不需要写得很完整，只要把今天的感觉留下来就已经很好了。";
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

somaticPresentSelect.addEventListener("change", updateSomaticField);
updateSomaticField();
showTodayReminder();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const todayCount = getTodaySubmitCount();

  if (todayCount >= 1) {
    const confirmed = window.confirm(
      `今天已经记录过 ${todayCount} 次啦。\n宝贝看来今天有很多故事呢，还想继续跟我说吗？`
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
