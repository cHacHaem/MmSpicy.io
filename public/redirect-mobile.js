
if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  const mobileWarning = document.getElementById('mobile-warning');
  mobileWarning.className = 'mobile-warning';
  mobileWarning.innerHTML = `
    <h2>Mobile Not Supported</h2>
    <p>MmSpicy io is not supported on mobile devices.<br>Please use a desktop or laptop to play.</p>
  `;
}
