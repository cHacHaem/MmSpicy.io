  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    document.getElementById('mobile-warning').class = 'mobile-warning';
    document.getElementById("mobile-warning").innerHTML(`
      <h2 class='.mobile-warning'>Mobile Not Supported</h2>
      <p class='.mobile-warning'>MmSpicy io is not supported on mobile devices.<br>Please use a desktop or laptop to play.</p>
    `)
  }

