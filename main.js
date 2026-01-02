const btn1 = document.getElementById('btn1');
const btn5 = document.getElementById('btn5');
const btn15 = document.getElementById('btn15');
const btn30 = document.getElementById('btn30');
const btn45 = document.getElementById('btn45');
const btn60 = document.getElementById('btn60');
const reset = document.getElementById('reset');
const pad = document.getElementById('pad');
const share = document.getElementById('share');
const timeEl = document.getElementById('time');
const clicksEl = document.getElementById('clicks');
const cpsEl = document.getElementById('cps');
const sharePopup = document.getElementById('sharePopup');

let duration = 0;
let testType = '';
let startAt = 0;
let clicks = 0;
let rafId = 0;
let endTimer = 0;
let running = false;
let armed = false;

function armTest(sec) {
  if (running || armed) {
    doReset();
  }
  duration = sec;
  testType = sec + 's';
  clicks = 0;
  clicksEl.textContent = '0';
  timeEl.textContent = sec.toFixed(2) + 's';
  cpsEl.textContent = 'Finish the test';
  armed = true;
  pad.disabled = false;
  reset.disabled = false;
  share.disabled = true;
}

function updateCps(newValue) {
  const formatted = newValue.toFixed(2);
  setDigits(formatted);
}

function setDigits(value) {
  const digits = cpsEl.querySelectorAll('.digit');
  const chars = value.split('');
  chars.forEach((char, i) => {
    if (digits[i]) {
      digits[i].textContent = char;
    }
  });
}

function startTest() {
  running = true;
  armed = false;
  startAt = performance.now();

  const tick = () => {
    if (!running) return;
    const elapsed = (performance.now() - startAt) / 1000;
    const remaining = Math.max(0, duration - elapsed);
    timeEl.textContent = remaining.toFixed(2) + 's';
    rafId = requestAnimationFrame(tick);
  };
  tick();

  clearTimeout(endTimer);
  endTimer = setTimeout(endTest, duration * 1000);
}

function endTest() {
  if (!running) return;
  running = false;
  pad.disabled = true;
  cancelAnimationFrame(rafId);
  const elapsed = (performance.now() - startAt) / 1000;
  timeEl.textContent = '0.00s';

  cpsEl.innerHTML = '<span class="digit">0</span><span class="digit dot">.</span><span class="digit">0</span><span class="digit">0</span>';

  const finalCps = clicks / duration;
  const steps = Math.min(Math.ceil(finalCps * 20), 100);
  const increment = finalCps / steps;
  const delay = 2;

  let current = 0;
  let step = 0;

  const animate = () => {
    if (step >= steps) {
      setDigits(finalCps.toFixed(2));
      share.disabled = false;
      return;
    }

    current += increment;
    step++;
    setDigits(current.toFixed(2));
    setTimeout(animate, delay);
  };

  animate();
}

function doReset() {
  running = false;
  armed = false;
  pad.disabled = true;
  cancelAnimationFrame(rafId);
  clearTimeout(endTimer);
  clicks = 0;
  timeEl.textContent = '0.00s';
  clicksEl.textContent = '0';
  cpsEl.textContent = '0.00';
  share.disabled = true;
}

pad.addEventListener('click', () => {
  if (armed) {
    clicks = 1;
    clicksEl.textContent = '1';
    startTest();
  } else if (running) {
    clicks++;
    clicksEl.textContent = String(clicks);
  }
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    pad.click();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Enter') {
    e.preventDefault();
    if (!running && !armed && testType) {
      doReset();
      armTest(parseFloat(testType));
    }
  }
});

btn1.addEventListener('click', () => armTest(1));
btn5.addEventListener('click', () => armTest(5));
btn15.addEventListener('click', () => armTest(15));
btn30.addEventListener('click', () => armTest(30));
btn45.addEventListener('click', () => armTest(45));
btn60.addEventListener('click', () => armTest(60));
reset.addEventListener('click', doReset);

const expandBtn = document.getElementById('expandBtn');
const extraTests = document.getElementById('extraTests');
let expanded = false;

expandBtn.addEventListener('click', () => {
  expanded = !expanded;
  extraTests.style.display = expanded ? 'contents' : 'none';
  expandBtn.textContent = expanded ? 'Show less tests ▲' : 'More tests ▼';
});

share.addEventListener('click', () => {
  const text = `Test time: ${testType}, Times clicked: ${clicks}, Average CPS: ${cpsEl.textContent}`;
  navigator.clipboard.writeText(text).then(() => {
    sharePopup.style.opacity = '1';
    setTimeout(() => sharePopup.style.opacity = '0', 6000);
  });
});

pad.addEventListener('mousedown', e => e.preventDefault());
