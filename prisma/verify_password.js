const bcrypt = require('bcryptjs');
const hash = '$2b$10$6Jnfo8xWOhEkrkUKTwMl.ObsIJlDZeeFePo84ft3A1ReY9jiFZeMa';

async function check() {
  console.log('cybersecurity2026:', await bcrypt.compare('cybersecurity2026', hash));
  console.log('admin:', await bcrypt.compare('admin', hash));
  console.log('admin123:', await bcrypt.compare('admin123', hash));
  console.log('password:', await bcrypt.compare('password', hash));
}

check();
