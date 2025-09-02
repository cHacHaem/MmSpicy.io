
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
  mobileWarning.style.marginBottom = '20px';
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
  
  const path = window.location.pathname;
  if (path !== '/play' && path !== '/create/editor') {
    mobileWarning.innerHTML += `
      <footer style="
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        font-size: 12px;
        text-align: center;
        padding: 6px 5px;
        background: #fff;
        border-top: 1px solid #ccc;
        color: #666;
        z-index: 1000;
        white-space: nowrap;
        overflow-x: auto;
      ">
        <a href="/" style="margin: 0 6px; color: inherit; text-decoration: none;">Home</a> |
        <a href="/play" style="margin: 0 6px; color: inherit; text-decoration: none;">Play</a> |
        <a href="/create" style="margin: 0 6px; color: inherit; text-decoration: none;">Create</a> |
        <a href="/create/editor" style="margin: 0 6px; color: inherit; text-decoration: none;">Editor</a> |
        <a href="/about" style="margin: 0 6px; color: inherit; text-decoration: none;">About</a> |
        <a href="/contact" style="margin: 0 6px; color: inherit; text-decoration: none;">Contact</a> |
        <a href="/privacy" style="margin: 0 6px; color: inherit; text-decoration: none;">Privacy</a> |
        <a href="/terms" style="margin: 0 6px; color: inherit; text-decoration: none;">Terms</a>
      </footer>
    `;
  }
}