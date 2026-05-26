const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Testing connection to:', url);
  
  if (!url || url.includes('your-supabase-url')) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set correctly in .env.local');
    return;
  }

  if (url.endsWith('/')) {
    console.warn('⚠️ Warning: NEXT_PUBLIC_SUPABASE_URL ends with a slash. This might cause "Invalid Path" errors.');
  }

  const supabase = createClient(url, key);

  try {
    console.log('Attempting to fetch catalog...');
    const { data, error } = await supabase.from('catalog').select('*').limit(1);
    
    if (error) {
      console.error('❌ Supabase Error:', error.message);
      if (error.message.includes('Invalid path')) {
        console.error('👉 This confirms the URL or path is incorrect. Ensure the URL is just the base (e.g., https://xyz.supabase.co)');
      }
    } else {
      console.log('✅ Success! Connection working. Catalog data:', data);
    }
  } catch (err) {
    console.error('❌ Unexpected Error:', err.message);
  }
}

testConnection();
