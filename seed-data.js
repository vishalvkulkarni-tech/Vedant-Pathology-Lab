const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS for seeding
);

const dummyData = [
  { name: 'Complete Blood Count (CBC)', description: 'Analyzes red/white blood cells and platelets.', price: 500, category: 'test' },
  { name: 'Diabetes Profile', description: 'Includes HbA1c and Blood Sugar tests.', price: 800, category: 'test' },
  { name: 'Thyroid Profile (T3, T4, TSH)', description: 'Comprehensive thyroid function test.', price: 1200, category: 'test' },
  { name: 'Full Body Checkup Premium', description: 'Lipid, Liver, Kidney, Thyroid, CBC, and Diabetes profiles.', price: 4500, category: 'package' },
  { name: 'Senior Citizen Package', description: 'Comprehensive tests tailored for seniors including Vitamin D and B12.', price: 3500, category: 'package' }
];

async function seed() {
  console.log('Seeding dummy data...');
  const { data, error } = await supabase.from('catalog').insert(dummyData);
  if (error) console.error('Error seeding:', error.message);
  else console.log('✅ Catalog seeded successfully!');
}

seed();
