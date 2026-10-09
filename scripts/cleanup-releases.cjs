const { execSync } = require('child_process');

// Ensure token is available
let token = process.env.GITHUB_TOKEN;
if (!token) {
    try {
        const remoteUrl = execSync('git config --get remote.origin.url').toString().trim();
        const match = remoteUrl.match(/https:\/\/(.*?)@github\.com/);
        if (match && match[1]) {
            token = match[1];
        }
    } catch (e) {
        console.log("Could not extract token from git remote.");
    }
}

if (!token) {
    console.error("GITHUB_TOKEN not found.");
    process.exit(1);
}

const tagsToDelete = [
    "v2.4.2", "v2.4.1", "v2.4.0", "v2.3.9", "v2.3.8", "v2.3.7", "v2.3.6", "v2.3.5", "v2.3.4", "v2.3.3", "v2.3.2", "v2.3.1"
];

for (const tag of tagsToDelete) {
    console.log(`Processing ${tag}...`);
    try {
        const response = execSync(`curl -s -H "Authorization: token ${token}" https://api.github.com/repos/mdaltoon10/Daltoon-Bot/releases/tags/${tag}`).toString();
        const release = JSON.parse(response);
        if (release && release.id) {
            console.log(`Deleting release ${release.id} for tag ${tag}`);
            execSync(`curl -s -X DELETE -H "Authorization: token ${token}" https://api.github.com/repos/mdaltoon10/Daltoon-Bot/releases/${release.id}`);
        }
    } catch (e) {
        console.log(`Failed to delete release for ${tag}`);
    }

    try {
        console.log(`Deleting local tag ${tag}`);
        execSync(`git tag -d ${tag}`);
    } catch (e) {
        console.log(`Local tag ${tag} might not exist.`);
    }

    try {
        console.log(`Deleting remote tag ${tag}`);
        execSync(`git push --delete origin ${tag}`);
    } catch (e) {
        console.log(`Remote tag ${tag} might not exist.`);
    }
}
console.log("Cleanup complete!");
