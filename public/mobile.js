
if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  const mobileWarning = document.getElementById('mobile-warning');
  mobileWarning.style.display = 'flex';
  mobileWarning.style.position = 'fixed';
  mobileWarning.style.inset = '0';
  mobileWarning.style.background = 'rgba(0, 0, 0, 0.9)';
  mobileWarning.style.color = '#ffffff';
  mobileWarning.style.zIndex = '600';
  mobileWarning.style.alignItems = 'center';
  mobileWarning.style.justifyContent = 'center';
  mobileWarning.style.textAlign = 'center';
  mobileWarning.style.padding = '20px';
  mobileWarning.style.marginBottom = '50px';
  mobileWarning.style.flexDirection = 'column';
  mobileWarning.innerHTML = `
    <h2>Mobile Not Supported</h2>
    <p>MmSpicy io is not supported on mobile devices.<br>Please use a desktop or laptop to play.</p>
  `;
  mobileWarning.querySelector('h2').style.fontSize = '2em';
  mobileWarning.querySelector('h2').style.color = 'orange';
  mobileWarning.querySelector('h2').style.marginBottom = '10px';
  mobileWarning.querySelector('p').style.fontSize = '1.2em';
  mobileWarning.querySelector('p').style.color = '#ccc';
  mobileWarning.querySelector('p').style.textShadow = '0 0 5px #ccc';
}