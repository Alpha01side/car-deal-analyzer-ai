const viewport = document.getElementById('wardrobeViewport');
const track = document.getElementById('wardrobeTrack');
const panels = [...document.querySelectorAll('.category-panel')];
const title = document.getElementById('active-category');
const dots = [...document.querySelectorAll('.dot')];
const prev = document.querySelector('.nav-prev');
const next = document.querySelector('.nav-next');

let index = 0;
let startX = 0;
let currentX = 0;
let dragging = false;
let startTime = 0;
let width = viewport.clientWidth;

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

function setIndex(nextIndex, animate = true) {
  index = clamp(nextIndex, 0, panels.length - 1);
  track.style.transition = animate ? 'transform .72s cubic-bezier(.19,1,.22,1)' : 'none';
  track.style.transform = `translate3d(${-index * width}px, 0, 0)`;
  title.textContent = panels[index].dataset.title;
  dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
}

function beginDrag(clientX) {
  dragging = true;
  startX = clientX;
  currentX = clientX;
  startTime = performance.now();
  viewport.classList.add('dragging');
  track.style.transition = 'none';
}

function moveDrag(clientX) {
  if (!dragging) return;
  currentX = clientX;
  const delta = currentX - startX;
  const resistance = (index === 0 && delta > 0) || (index === panels.length - 1 && delta < 0) ? 0.28 : 1;
  track.style.transform = `translate3d(${(-index * width) + delta * resistance}px, 0, 0)`;
}

function endDrag() {
  if (!dragging) return;
  dragging = false;
  viewport.classList.remove('dragging');
  const delta = currentX - startX;
  const elapsed = Math.max(performance.now() - startTime, 1);
  const velocity = Math.abs(delta / elapsed);
  const shouldMove = Math.abs(delta) > width * 0.18 || velocity > 0.55;
  setIndex(shouldMove ? index + (delta < 0 ? 1 : -1) : index);
}

prev.addEventListener('click', () => setIndex(index - 1));
next.addEventListener('click', () => setIndex(index + 1));
dots.forEach(dot => dot.addEventListener('click', () => setIndex(Number(dot.dataset.index))));

viewport.addEventListener('pointerdown', event => {
  viewport.setPointerCapture(event.pointerId);
  beginDrag(event.clientX);
});
viewport.addEventListener('pointermove', event => moveDrag(event.clientX));
viewport.addEventListener('pointerup', endDrag);
viewport.addEventListener('pointercancel', endDrag);

viewport.addEventListener('wheel', event => {
  if (Math.abs(event.deltaX) < Math.abs(event.deltaY) && Math.abs(event.deltaY) < 18) return;
  event.preventDefault();
  setIndex(index + (event.deltaX + event.deltaY > 0 ? 1 : -1));
}, { passive: false });

window.addEventListener('resize', () => {
  width = viewport.clientWidth;
  setIndex(index, false);
});

setIndex(0, false);
