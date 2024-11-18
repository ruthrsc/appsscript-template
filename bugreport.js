// Usage: node bugreport.js
// Description: This script will generate a bug report for the current environment.
console.log('Node.js Version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Environment Variables:', process.env);

const { execSync } = require('child_process');
const packageList = execSync('npm list --depth=0').toString();
console.log('Installed Packages:\n', packageList);