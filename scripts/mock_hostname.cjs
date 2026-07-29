const os = require('os');
const originalHostname = os.hostname;
os.hostname = function() {
    return 'Nikolay-PC';
};
console.log('Hostname mocked successfully for Vercel CLI compatibility.');
