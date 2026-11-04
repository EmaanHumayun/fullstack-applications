const token = process.argv[2] || process.env.GITHUB_TOKEN;

async function check() {
  const query = `
    query {
      __schema {
        mutationType {
          fields {
            name
          }
        }
      }
    }
  `;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'User-Agent': 'Node-Fetch' },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  const fields = data.data?.__schema?.mutationType?.fields?.map(f => f.name) || [];
  console.log('Pin-related mutations:', fields.filter(f => f.toLowerCase().includes('pin')));
  console.log('Profile-related mutations:', fields.filter(f => f.toLowerCase().includes('profile')));
}

check().catch(console.error);

