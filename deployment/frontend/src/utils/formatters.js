const pad = (value, size = 2) => value.toString().padStart(size, '0');

const getTimeParts = (seconds) => ({
  hours: Math.floor(seconds / 3600),
  minutes: Math.floor((seconds % 3600) / 60),
  seconds: Math.floor(seconds % 60),
  milliseconds: Math.floor((seconds % 1) * 1000)
});

export const formatElapsed = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${pad(s)}`;
};

export const formatTime = (seconds) => {
  const time = getTimeParts(seconds);
  return `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`;
};

export const formatSrtTime = (seconds) => {
  const time = getTimeParts(seconds);
  return `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)},${pad(time.milliseconds, 3)}`;
};
