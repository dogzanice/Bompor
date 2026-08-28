/**
 * app.js
 * Main Controller for Field Trip Report Web App
 */

// Sample Answer Prompts for Students
const SAMPLE_ANSWERS = {
  place1: {
    title: 'ร้านโกโก้ตาหลวง (อ.ทุ่งสง)',
    knowledge: `1. ได้เรียนรู้ขั้นตอนการปลูกและดูแลรักษาต้นโกโก้ในสภาพภูมิอากาศภาคใต้
2. ศึกษากระบวนการหมักเมล็ดโกโก้ (Fermentation) เพื่อสร้างกลิ่นหอมและรสชาติที่เป็นเอกลักษณ์
3. กระบวนการตากและคั่วเมล็ดโกโก้เพื่อนำไปแปรรูปเป็นผลิตภัณฑ์ต่างๆ เช่น โกโก้ผง ช็อกโกแลตแท่ง และเครื่องดื่ม`,
    apply: `1. นำแนวคิดการเพิ่มมูลค่าผลผลิตทางการเกษตรมาปรับใช้กับผลิตภัณฑ์ท้องถิ่น
2. นำเทคนิคการออกแบบบรรจุภัณฑ์และการเล่าเรื่องราวของแบรนด์ (Storytelling) ไปใช้ในการทำการตลาดออนไลน์
3. ศึกษาช่องทางการจัดจำหน่ายและการทำคาเฟ่เชิงเกษตรสร้างสรรค์`,
    impression: `ประทับใจความมุ่งมั่นของเจ้าของสถานประกอบการที่พัฒนาสายพันธุ์โกโก้และสร้างแบรนด์จนเป็นที่ยอมรับ รวมถึงวิทยากรให้ความเป็นกันเองและอธิบายขั้นตอนการทำอย่างละเอียด`,
    suggestion: `อยากให้มีกิจกรรม Workshop ให้ทดลองทำช็อกโกแลตด้วยตนเอง และมีจุดถ่ายภาพพร้อมข้อมูลความรู้เพิ่มเติม`
  },
  place2: {
    title: 'บริษัท รักษ์จันทน์110 จำกัด (อ.ร่อนพิบูลย์)',
    knowledge: `1. ได้ศึกษาเทคโนโลยีการแปรรูปสมุนไพรและผลผลิตทางการเกษตรระดับอุตสาหกรรม
2. ระบบการควบคุมคุณภาพมาตรฐานโรงงาน เช่น GMP / อย. และการรักษาความสะอาดในสายการผลิต
3. การจัดการสต็อกวัตถุดิบ บรรจุภัณฑ์ และการกระจายสินค้าไปยังตัวแทนจำหน่าย`,
    apply: `1. นำความรู้เรื่องมาตรฐานการผลิตไปใช้เป็นแนวทางในการทำโครงงานวิชาชีพของแผนกวิชา
2. นำหลักการบริหารจัดการต้นทุนและการควบคุมสุขอนามัยไปประยุกต์ใช้ในการประกอบธุรกิจส่วนตัว
3. สร้างเครือข่ายความร่วมมือและการศึกษาดูงานต่อยอดในอนาคต`,
    impression: `โรงงานมีความสะอาด ทันสมัย มีการจัดระเบียบสายการผลิตที่เป็นระบบอย่างยิ่ง เจ้าหน้าที่ให้การต้อนรับเป็นอย่างดีและตอบข้อซักถามอย่างครบถ้วน`,
    suggestion: `ควรเพิ่มเอกสารแผ่นพับหรือ QR Code เพื่อให้นักศึกษาสามารถดาวน์โหลดข้อมูลผลิตภัณฑ์และกระบวนการผลิตกลับไปทบทวนได้`
  }
};

// Form State
const state = {
  currentStep: 1,
  prefix: 'นาย',
  firstName: '',
  lastName: '',
  level: 'ปวช. 3/1',
  department: 'การตลาด',
  place1_knowledge: '',
  place1_apply: '',
  place1_impression: '',
  place1_suggestion: '',
  place2_knowledge: '',
  place2_apply: '',
  place2_impression: '',
  place2_suggestion: '',
  photos: {
    photo1: null,
    photo2: null,
    photo3: null,
    photo4: null
  }
};

const DRAFT_KEY = 'FIELD_TRIP_REPORT_DRAFT_2026';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadDraft();
  setupEventListeners();
  updateProgressUI();
  updateLivePreview();
});

// Setup Listeners
function setupEventListeners() {
  // Navigation Steps
  document.querySelectorAll('[data-step-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const step = parseInt(btn.getAttribute('data-step-target'), 10);
      goToStep(step);
    });
  });

  // Next / Prev Buttons
  document.querySelectorAll('.btn-next-step').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateCurrentStep()) {
        goToStep(state.currentStep + 1);
      }
    });
  });

  document.querySelectorAll('.btn-prev-step').forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(state.currentStep - 1);
    });
  });

  // Form Inputs
  const formElements = document.querySelectorAll('input[name], select[name], textarea[name]');
  formElements.forEach(el => {
    const updateHandler = () => {
      state[el.name] = el.value;
      saveDraft();
      updateProgressUI();
      updateLivePreview();
    };
    el.addEventListener('input', updateHandler);
    el.addEventListener('change', updateHandler);
  });

  // Image Upload Inputs
  ['photo1', 'photo2', 'photo3', 'photo4'].forEach(photoKey => {
    const input = document.getElementById(`input_${photoKey}`);
    const dropzone = document.getElementById(`dropzone_${photoKey}`);
    const removeBtn = document.getElementById(`remove_${photoKey}`);

    if (input) {
      input.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleImageUpload(photoKey, e.target.files[0]);
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removePhoto(photoKey);
      });
    }

    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-blue-500', 'bg-blue-50');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-blue-500', 'bg-blue-50');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-blue-500', 'bg-blue-50');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleImageUpload(photoKey, e.dataTransfer.files[0]);
        }
      });
    }
  });

  // Download Word Button
  const btnDownloadWord = document.getElementById('btnDownloadWord');
  if (btnDownloadWord) {
    btnDownloadWord.addEventListener('click', handleDownloadDocx);
  }

  // Print PDF Button
  const btnPrintPdf = document.getElementById('btnPrintPdf');
  if (btnPrintPdf) {
    btnPrintPdf.addEventListener('click', () => {
      window.print();
    });
  }

  // Copy Text Button
  const btnCopySummary = document.getElementById('btnCopySummary');
  if (btnCopySummary) {
    btnCopySummary.addEventListener('click', handleCopySummary);
  }

  // Clear Draft Button
  const btnClearDraft = document.getElementById('btnClearDraft');
  if (btnClearDraft) {
    btnClearDraft.addEventListener('click', handleClearDraft);
  }

  // Sample Prompts Buttons
  document.querySelectorAll('[data-use-sample]').forEach(btn => {
    btn.addEventListener('click', () => {
      const place = btn.getAttribute('data-use-sample');
      useSampleData(place);
    });
  });
}

// Step Navigation
function goToStep(stepNumber) {
  if (stepNumber < 1 || stepNumber > 4) return;
  state.currentStep = stepNumber;

  document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
  const activeStep = document.getElementById(`step_section_${stepNumber}`);
  if (activeStep) {
    activeStep.classList.remove('hidden');
  }

  // Update tabs
  document.querySelectorAll('.step-tab').forEach((tab, index) => {
    const s = index + 1;
    const tabIcon = tab.querySelector('.tab-badge');
    if (s === stepNumber) {
      tab.classList.remove('text-gray-500', 'border-transparent');
      tab.classList.add('text-blue-600', 'border-blue-600', 'font-semibold');
      if (tabIcon) tabIcon.classList.add('bg-blue-600', 'text-white');
    } else if (s < stepNumber) {
      tab.classList.remove('border-blue-600', 'text-gray-500');
      tab.classList.add('text-emerald-600', 'border-emerald-500');
      if (tabIcon) {
        tabIcon.classList.remove('bg-blue-600');
        tabIcon.classList.add('bg-emerald-600', 'text-white');
      }
    } else {
      tab.classList.remove('text-blue-600', 'border-blue-600', 'text-emerald-600', 'border-emerald-500', 'font-semibold');
      tab.classList.add('text-gray-500', 'border-transparent');
      if (tabIcon) {
        tabIcon.classList.remove('bg-blue-600', 'bg-emerald-600', 'text-white');
        tabIcon.classList.add('bg-gray-100', 'text-gray-500');
      }
    }
  });

  updateProgressUI();
  updateLivePreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validation
function validateCurrentStep() {
  if (state.currentStep === 1) {
    if (!state.firstName.trim() || !state.lastName.trim()) {
      showToast('กรุณากรอกชื่อและนามสกุลให้ครบถ้วน', 'warning');
      document.getElementById('input_firstName')?.focus();
      return false;
    }
  }
  return true;
}

// Image Compression & Handling
async function handleImageUpload(photoKey, file) {
  if (!file.type.startsWith('image/')) {
    showToast('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG)', 'error');
    return;
  }

  showToast('กำลังปรับขนาดและประมวลผลรูปภาพ...', 'info');

  try {
    const compressedDataUrl = await compressImage(file, 1280, 0.85);
    state.photos[photoKey] = compressedDataUrl;

    renderPhotoUI(photoKey, compressedDataUrl);
    saveDraft();
    updateLivePreview();
    showToast('อัพโหลดรูปภาพสำเร็จ', 'success');
  } catch (err) {
    console.error(err);
    showToast('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ', 'error');
  }
}

function compressImage(file, maxWidth = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderPhotoUI(photoKey, dataUrl) {
  const previewImg = document.getElementById(`img_preview_${photoKey}`);
  const placeholder = document.getElementById(`placeholder_${photoKey}`);
  const overlay = document.getElementById(`overlay_${photoKey}`);

  if (previewImg && placeholder && overlay) {
    if (dataUrl) {
      previewImg.src = dataUrl;
      previewImg.classList.remove('hidden');
      placeholder.classList.add('hidden');
      overlay.classList.remove('hidden');
    } else {
      previewImg.src = '';
      previewImg.classList.add('hidden');
      placeholder.classList.remove('hidden');
      overlay.classList.add('hidden');
    }
  }
}

function removePhoto(photoKey) {
  state.photos[photoKey] = null;
  const input = document.getElementById(`input_${photoKey}`);
  if (input) input.value = '';
  renderPhotoUI(photoKey, null);
  saveDraft();
  updateLivePreview();
  showToast('ลบรูปภาพแล้ว', 'info');
}

// Use Sample Prompts
function useSampleData(placeKey) {
  const sample = SAMPLE_ANSWERS[placeKey];
  if (!sample) return;

  if (placeKey === 'place1') {
    state.place1_knowledge = sample.knowledge;
    state.place1_apply = sample.apply;
    state.place1_impression = sample.impression;
    state.place1_suggestion = sample.suggestion;

    document.getElementById('input_place1_knowledge').value = sample.knowledge;
    document.getElementById('input_place1_apply').value = sample.apply;
    document.getElementById('input_place1_impression').value = sample.impression;
    document.getElementById('input_place1_suggestion').value = sample.suggestion;
  } else if (placeKey === 'place2') {
    state.place2_knowledge = sample.knowledge;
    state.place2_apply = sample.apply;
    state.place2_impression = sample.impression;
    state.place2_suggestion = sample.suggestion;

    document.getElementById('input_place2_knowledge').value = sample.knowledge;
    document.getElementById('input_place2_apply').value = sample.apply;
    document.getElementById('input_place2_impression').value = sample.impression;
    document.getElementById('input_place2_suggestion').value = sample.suggestion;
  }

  saveDraft();
  updateProgressUI();
  updateLivePreview();
  showToast(`นำตัวอย่างคำตอบ (${sample.title}) มาใส่ให้แล้ว! ปรับแต่งข้อความได้ตามต้องการ`, 'success');
}

// Draft Management
let saveTimeout = null;
function saveDraft() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
      const badge = document.getElementById('saveDraftBadge');
      if (badge) {
        badge.classList.remove('opacity-0');
        setTimeout(() => badge.classList.add('opacity-0'), 2000);
      }
    } catch (e) {
      console.warn('Draft save error (quota exceeded):', e);
    }
  }, 300);
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);

    // Populate input fields
    for (const [key, val] of Object.entries(state)) {
      if (key !== 'photos' && key !== 'currentStep') {
        const el = document.getElementById(`input_${key}`);
        if (el) el.value = val;
      }
    }

    // Populate photos
    if (state.photos) {
      for (const [pKey, pVal] of Object.entries(state.photos)) {
        if (pVal) renderPhotoUI(pKey, pVal);
      }
    }
  } catch (e) {
    console.error('Failed to load draft:', e);
  }
}

function handleClearDraft() {
  if (confirm('คุณต้องการล้างข้อมูลทั้งหมดที่กรอกไว้ใช่หรือไม่? (ไม่สามารถกู้คืนได้)')) {
    localStorage.removeItem(DRAFT_KEY);
    location.reload();
  }
}

// Progress UI
function updateProgressUI() {
  let filledCount = 0;
  const totalFields = 10; // Firstname, Lastname, 4 for place1, 4 for place2

  if (state.firstName.trim()) filledCount++;
  if (state.lastName.trim()) filledCount++;
  if (state.place1_knowledge.trim()) filledCount++;
  if (state.place1_apply.trim()) filledCount++;
  if (state.place1_impression.trim()) filledCount++;
  if (state.place1_suggestion.trim()) filledCount++;
  if (state.place2_knowledge.trim()) filledCount++;
  if (state.place2_apply.trim()) filledCount++;
  if (state.place2_impression.trim()) filledCount++;
  if (state.place2_suggestion.trim()) filledCount++;

  const percent = Math.round((filledCount / totalFields) * 100);
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');

  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressText) progressText.innerText = `${percent}% (${filledCount}/${totalFields} หัวข้อ)`;
}

// Live Preview Mode
function updateLivePreview() {
  const fullName = `${state.prefix || ''}${state.firstName || '...'} ${state.lastName || '...'}`.trim();
  const dept = state.department || '...';
  const level = state.level || '...';

  // Preview elements
  const elFullName = document.querySelectorAll('.pv-fullname');
  elFullName.forEach(el => el.textContent = fullName);

  const elDept = document.querySelectorAll('.pv-dept');
  elDept.forEach(el => el.textContent = dept);

  const elLevel = document.querySelectorAll('.pv-level');
  elLevel.forEach(el => el.textContent = level);

  // Place 1
  const setPvText = (id, val, defaultText = 'ยังไม่ได้ระบุ') => {
    const el = document.getElementById(id);
    if (el) el.textContent = val.trim() || defaultText;
  };

  setPvText('pv_p1_knowledge', state.place1_knowledge);
  setPvText('pv_p1_apply', state.place1_apply);
  setPvText('pv_p1_impression', state.place1_impression);
  setPvText('pv_p1_suggestion', state.place1_suggestion);

  // Place 2
  setPvText('pv_p2_knowledge', state.place2_knowledge);
  setPvText('pv_p2_apply', state.place2_apply);
  setPvText('pv_p2_impression', state.place2_impression);
  setPvText('pv_p2_suggestion', state.place2_suggestion);

  // Preview Photos
  ['photo1', 'photo2', 'photo3', 'photo4'].forEach(pKey => {
    const img = document.getElementById(`pv_img_${pKey}`);
    const emptyBox = document.getElementById(`pv_empty_${pKey}`);
    if (img && emptyBox) {
      if (state.photos[pKey]) {
        img.src = state.photos[pKey];
        img.classList.remove('hidden');
        emptyBox.classList.add('hidden');
      } else {
        img.src = '';
        img.classList.add('hidden');
        emptyBox.classList.remove('hidden');
      }
    }
  });
}

// Download Word (.docx)
async function handleDownloadDocx() {
  const btn = document.getElementById('btnDownloadWord');
  const originalText = btn.innerHTML;

  if (!state.firstName.trim()) {
    showToast('กรุณากรอกชื่อ-นามสกุลก่อนดาวน์โหลด', 'warning');
    goToStep(1);
    return;
  }

  try {
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      กำลังสร้างไฟล์ Word...
    `;

    if (!window.DOCX_TEMPLATE_BASE64) {
      throw new Error('ไม่พบข้อมูล Template แม่แบบ Word');
    }

    const fullName = `${state.prefix || ''}${state.firstName || ''} ${state.lastName || ''}`.trim();
    const filename = `แบบบันทึกดูงาน_${fullName.replace(/\s+/g, '_')}_${state.level.replace(/[\/\s]+/g, '_')}.docx`;

    const blob = await window.DocxGenerator.generateDocxBlob(window.DOCX_TEMPLATE_BASE64, {
      prefix: state.prefix,
      firstName: state.firstName,
      lastName: state.lastName,
      fullName: fullName,
      level: state.level,
      department: state.department,
      place1_knowledge: state.place1_knowledge,
      place1_apply: state.place1_apply,
      place1_impression: state.place1_impression,
      place1_suggestion: state.place1_suggestion,
      place2_knowledge: state.place2_knowledge,
      place2_apply: state.place2_apply,
      place2_impression: state.place2_impression,
      place2_suggestion: state.place2_suggestion,
      photos: state.photos
    });

    window.DocxGenerator.downloadBlob(blob, filename);
    showToast('ดาวน์โหลดไฟล์ Word (.docx) สำเร็จแล้ว!', 'success');
  } catch (err) {
    console.error(err);
    showToast('เกิดข้อผิดพลาดในการสร้างไฟล์ Word: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// Copy Summary
function handleCopySummary() {
  const fullName = `${state.prefix || ''}${state.firstName || ''} ${state.lastName || ''}`.trim();
  const summaryText = `📋 บันทึกการศึกษาดูงาน (29 ส.ค. 2569)
👤 ผู้บันทึก: ${fullName} (${state.level}) แผนก: ${state.department}

🍫 สถานที่ 1: ร้านโกโก้ตาหลวง
1. ความรู้ที่ได้รับ: ${state.place1_knowledge || '-'}
2. การนำไปต่อยอด: ${state.place1_apply || '-'}
3. ความประทับใจ: ${state.place1_impression || '-'}
4. ข้อเสนอแนะ: ${state.place1_suggestion || '-'}

🌿 สถานที่ 2: บริษัท รักษ์จันทน์110 จำกัด
1. ความรู้ที่ได้รับ: ${state.place2_knowledge || '-'}
2. การนำไปต่อยอด: ${state.place2_apply || '-'}
3. ความประทับใจ: ${state.place2_impression || '-'}
4. ข้อเสนอแนะ: ${state.place2_suggestion || '-'}`;

  navigator.clipboard.writeText(summaryText).then(() => {
    showToast('คัดลอกข้อความสรุปเรียบร้อยแล้ว (สามารถวางใน LINE ได้เลย)', 'success');
  }).catch(() => {
    showToast('ไม่สามารถคัดลอกได้อัตโนมัติ', 'error');
  });
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-500 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-slate-800 text-white'
  };

  toast.className = `flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
