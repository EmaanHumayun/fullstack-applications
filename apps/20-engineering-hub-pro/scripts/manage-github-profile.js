const token = process.argv[2] || process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = 'EmaanHumayun';

const TARGET_PINS = [
  'engineering-portfolio',
  'devops-engineering-bootcamp',
  'backend-engineering-hub',
  'automation-integration-hub',
  'ai-agent-engineering-hub',
  'fullstack-applications'
];

async function main() {
  if (!token) {
    console.error('Error: Token required');
    process.exit(1);
  }

  // 1. Update Bio on GitHub Profile
  const newBio = 'Software Engineer | DevOps Engineer · Cloud Infrastructure, Backend Systems, Automation & Integrations, AI Agents & Full-Stack Applications.';
  console.log('[BIO] Updating GitHub Profile Bio...');
  const bioRes = await fetch('https://api.github.com/user', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Node-Fetch'
    },
    body: JSON.stringify({
      bio: newBio,
      blog: 'https://github.com/EmaanHumayun/engineering-portfolio',
      company: 'Software & DevOps Engineering'
    })
  });
  const bioData = await bioRes.json();
  console.log('[BIO] Updated Bio:', bioData.bio);

  // 2. Fetch repository node IDs for pinning
  console.log('[GRAPHQL] Fetching Repository Node IDs for pinning...');
  const repoIdsQuery = `
    query {
      viewer {
        id
        ${TARGET_PINS.map((name, i) => `
          repo${i}: repository(name: "${name}") {
            id
            name
          }
        `).join('\n')}
      }
    }
  `;

  const gqlRes = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Node-Fetch'
    },
    body: JSON.stringify({ query: repoIdsQuery })
  });

  const gqlData = await gqlRes.json();
  if (gqlData.errors) {
    console.log('[GRAPHQL ERRORS]', JSON.stringify(gqlData.errors));
  } else {
    const viewerId = gqlData.data.viewer.id;
    const itemIds = [];
    for (let i = 0; i < TARGET_PINS.length; i++) {
      const r = gqlData.data.viewer[`repo${i}`];
      if (r && r.id) {
        itemIds.push(r.id);
        console.log(`Found node ID for ${r.name}: ${r.id}`);
      }
    }

    // Try setPinnedRepositories mutation
    console.log('[MUTATION] Pinning top 6 repositories...');
    const pinMutation = `
      mutation SetPins($input: SetPinnedRepositoriesInput!) {
        setPinnedRepositories(input: $input) {
          user {
            login
          }
        }
      }
    `;

    const pinRes = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Node-Fetch'
      },
      body: JSON.stringify({
        query: pinMutation,
        variables: {
          input: {
            userId: viewerId,
            repositoryIds: itemIds
          }
        }
      })
    });

    const pinData = await pinRes.json();
    if (pinData.errors) {
      console.log('[PIN NOTICE]', pinData.errors[0]?.message || pinData.errors);
    } else {
      console.log('[SUCCESS] Successfully pinned 6 repositories on GitHub Profile!');
    }
  }
}

main().catch(console.error);
