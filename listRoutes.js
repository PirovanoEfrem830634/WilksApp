const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, 'app');

function getRoutes(dir, base = '') {
  const files = fs.readdirSync(dir);
  let routes = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(base, file);

    if (fs.statSync(fullPath).isDirectory()) {
      routes = routes.concat(getRoutes(fullPath, relativePath));
    } else if (file.endsWith('.tsx') && !file.startsWith('_')) {
      const name = file.replace(/\.tsx$/, '');
      const route = path.join('/', base, name).replace(/\\/g, '/');
      routes.push(route);
    }
  }

  return routes;
}

const allRoutes = getRoutes(APP_DIR);
console.log('\n📂 Expo Router — Registered Routes:\n');
allRoutes.forEach((route, i) => {
  console.log(`${i + 1}. ${route}`);
});
console.log('\n✅ Done.\n');
