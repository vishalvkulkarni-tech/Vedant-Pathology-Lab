# Project Setup Instructions

Follow these steps to get your Pathology Lab Web App up and running:

## 1. Supabase Setup
1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project.
3. Go to the **SQL Editor** in your Supabase dashboard and paste the contents of `supabase_schema.sql` (found in the project root) and run it. This will create all necessary tables, policies, and the automated signup trigger.
4. Go to **Storage** and create a new public bucket named `reports`. This is where diagnostic reports will be stored.
5. In your project settings, find your **API URL**, **Anon Key**, and **Service Role Key**.

## 2. Environment Variables
1. Create a file named `.env.local` in the project root.
2. Copy the contents from `.env.example` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

## 3. Local Development
1. Open your terminal in the project directory.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server. 
   - *Note: This command automatically cleans the `.next` cache to prevent build issues.*
4. Visit `http://localhost:3000`.

## 4. Admin Access
1. Go to the Sign Up page on your locally running app (or deployed app).
2. Fill in your details.
3. In the **Admin Access Code** field, enter the secret code: `VEDANT_ADMIN_2026`.
4. Click Create Account. You will automatically be granted admin privileges via the database trigger and can access the `/admin` dashboard.

## 5. Deployment (Vercel)
1. Push your code to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Add the environment variables from your `.env.local` to the Vercel project settings.
4. Deploy!

### Rebuilding on Vercel
If your build fails or you push new changes:
1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to the **Deployments** tab.
3. Find the latest deployment.
4. Click the three dots `...` and select **Redeploy**.
5. Ensure "Use existing Build Cache" is unchecked if you want a completely fresh build.

## 6. WhatsApp Notifications
- Currently, the app provides a manual "Update on WhatsApp" button for patients.
- For fully automated background notifications, you can integrate the Meta Cloud API or Twilio API within the `orders` insertion logic in `BookingForm.tsx`.
