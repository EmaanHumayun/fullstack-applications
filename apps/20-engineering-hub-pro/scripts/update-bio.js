const token = process.argv[2] || process.env.GITHUB_TOKEN;

async function updateBio() {
  const bioText = 'Software Engineer | DevOps Engineer · Cloud Infrastructure, Backend Systems, Automation & Integrations, AI Agents & Full-Stack Applications.';
  console.log('Sending bio update, length:', bioText.length);
  const res = await fetch('https://api.github.com/user', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Node-Fetch'
    },
    body: JSON.stringify({
      bio: bioText,
      company: 'Software & DevOps Engineering',
      blog: 'https://github.com/EmaanHumayun/engineering-portfolio'
    })
  });
  const data = await res.json();
  console.log('Response Status:', res.status);
  console.log('Updated Bio:', data.bio);
  console.log('Updated Company:', data.company);
  console.log('Updated Blog:', data.blog);
}

updateBio().catch(console.error);

