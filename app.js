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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

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

  form.reset();
  updateSomaticField();

  heroImage.src = "assets/success.png";
  subtitle.textContent = "已经认真收下啦，今天也辛苦你了。";
  helperBox.textContent = "这份记录已经好好保存下来了。";

  successMessage.classList.remove("hidden");
  submitBtn.disabled = false;
  submitBtn.textContent = "提交今天的记录";
});