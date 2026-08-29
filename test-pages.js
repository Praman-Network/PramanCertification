async function testPages() {
  const routes = ['/', '/verify', '/login', '/admin'];
  console.log('Testing Next.js Page Renders:');
  for (const route of routes) {
    const res = await fetch(`http://localhost:3000${route}`);
    const text = await res.text();
    console.log(`  ${route.padEnd(10)} -> Status: ${res.status}, Length: ${text.length} bytes, Contains HTML: ${text.includes('<html')}`);
  }
}
testPages().catch(console.error);
