import fs from 'fs';

async function run() {
  const token = process.env.GH_PAT;
  const repo = process.env.GITHUB_REPOSITORY;
  
  if (!token || !repo) {
    console.error("Missing GH_PAT or GITHUB_REPOSITORY");
    process.exit(1);
  }

  const res = await fetch(`https://api.github.com/repos/${repo}/traffic/clones`, {
    headers: {
      "Authorization": `token ${token}`,
      "Accept": "application/vnd.github.v3+json"
    }
  });

  if (!res.ok) {
    console.error("Failed to fetch clones:", await res.text());
    process.exit(1);
  }

  const data = await res.json();
  
  let currentData = { total: 0, history: {} };
  if (fs.existsSync('downloads.json')) {
    try {
      const content = JSON.parse(fs.readFileSync('downloads.json', 'utf8'));
      if (content.history) {
        currentData = content;
      } else if (content.downloads) {
        currentData.total = content.downloads;
      }
    } catch (e) {}
  }

  // Update history with new data
  for (const clone of data.clones) {
    const date = clone.timestamp.split('T')[0];
    if (!currentData.history[date] || currentData.history[date] < clone.count) {
        currentData.history[date] = clone.count;
    }
  }

  // Calculate new total
  let newTotal = 0;
  for (const count of Object.values(currentData.history)) {
    newTotal += count;
  }
  
  // Just in case history total is somehow less than old total (e.g. lost data)
  if (newTotal < currentData.total) {
      newTotal = currentData.total;
  }
  
  currentData.total = newTotal;
  currentData.downloads = newTotal; // for shields.io

  fs.writeFileSync('downloads.json', JSON.stringify(currentData, null, 2));
  console.log(`Updated downloads to ${newTotal}`);
}

run();
