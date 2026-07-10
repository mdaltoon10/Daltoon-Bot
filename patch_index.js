const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const script = `
    <script>
      (function() {
        // Prevent infinite reload loop by checking a sessionStorage flag
        if (sessionStorage.getItem('reloaded_for_update')) {
           sessionStorage.removeItem('reloaded_for_update');
           return;
        }
        
        // Fetch current version from server, bypass cache
        fetch('/api/system/check-update?t=' + new Date().getTime())
          .then(r => r.json())
          .then(data => {
            const expectedVersion = "2.3.2"; // Inject current version here during build? 
            // Wait, this is a static index.html. We can just hardcode it or fetch a static version.json
            // Since we can't easily replace it during build without modifying vite config, let's just make the dashboard JS handle it.
          })
          .catch(e => console.error(e));
      })();
    </script>
`;
// Actually, it's better to just add a cache busting parameter to the fetch requests in the app.
