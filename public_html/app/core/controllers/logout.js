'use strict'

localStorage.removeItem("token");
localStorage.removeItem("expiration");

window.open('/login/', '_self');