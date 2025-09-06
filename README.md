🌍 CleanQuest – Gamified Environmental Clean-Up Web App
“Cleaning is no longer a chore — it’s a game we all win together.”

📌 Problem Statement
Waste pollution in cities, rivers, and oceans is rising rapidly. Despite clean-up drives being organized, they face challenges:
Lack of motivation for volunteers
No real-time tracking of impact
Volunteers don’t get recognition for their efforts
Organizers struggle with management & reporting
Integrated Platform Vision:
A web application that combines:
Crowdsourced hazard/clean-up reporting (citizens, volunteers, NGOs).
Gamified environmental clean-up events with rewards and leaderboards.
Social media analytics to detect trending hazard issues.
This ensures early warnings, increased participation, and measurable impact.

💡 Our Solution
We designed CleanQuest, a web-based platform that:
Enables volunteers to discover, join, and participate in local clean-up drives.
Provides organizers with tools to manage events, verify contributions, and generate reports.
Uses gamification (XP, badges, leaderboards, rewards) to boost engagement.
Tracks personal and community impact (waste collected, CO₂ reduced, events attended).
Integrates social media analytics for hazard trend detection.

🚀 Workflow (User Journey)
Sign Up → Choose Volunteer or Organizer role.
Discover Events nearby via map + filters.
Join & Check-in → QR code attendance.
Collect Waste + Upload Proof (photos, weight entry).
Earn XP, Badges, and Rewards for contributions.
Track Impact → Personal stats & community dashboards.
Engage → Post stories, like/comment, climb leaderboards.

🎮 Key Features
🔹 Volunteer Features
Event discovery & registration
Gamification: XP, badges, leaderboard
Proof submission (photos, waste data)
Personal impact tracker & certificates
🔹 Organizer Features
Create & manage events
Volunteer verification system
Impact reporting & analytics
🔹 Community Features
Leaderboards (city/global)
Social wall for stories & photos
Reward redemption store
🔹 Advanced (Hackathon WOW)
AI Waste Recognition (classify waste from photos)
AR Litter Detection (future scope)
Social Media Analytics → Detect ocean/land hazards via trending posts

🏆 Gamification System
Points System
Join event → +10 XP
Upload proof → +20 XP
Verified contribution → +50 XP
Badges
First Clean-up, Eco Hero, Team Player, City Top 10
Leaderboard
Weekly, Monthly, All-Time rankings
Rewards
Redeem XP for eco-products, vouchers, or digital certificates

🛠️ Tech Stack
Frontend: React.js / Next.js (responsive web app)
Backend: Node.js / Spring Boot (REST APIs)
Database: MySQL / PostgreSQL
Authentication: OAuth (Google, Email, Phone OTP)
Cloud Hosting: AWS / Firebase
AI/ML (optional): TensorFlow / OpenCV
Visualization: D3.js / Chart.js for impact dashboards

🗄️ Database Schema (Simplified ER Model)
Entities:
Users (Volunteers, Organizers, Admin)
Events (location, date, waste target)
Participation (check-in, proof, waste collected)
XP & Badges (gamification tracking)
Rewards (redeemable items)
Impact Stats (waste collected, volunteers engaged)
erDiagram
    Users ||--o{ Events : organizes
    Users ||--o{ EventParticipation : joins
    Events ||--o{ EventParticipation : includes
    Users ||--o{ UserXP : earns
    Users ||--o{ UserBadges : unlocks
    Users ||--o{ UserRewards : redeems
    Events ||--o{ ImpactStats : generates

📊 Impact & Benefits
🌱 For Volunteers
Motivation through gamification
Recognition via badges & certificates
Rewards for eco-friendly actions

🌍 For Organizers/NGOs
Easy event management
Real-time volunteer verification
Impact reporting & CSR sponsorships

🏖️ For Society
Cleaner environment
Data-driven sustainability progress
Safer oceans & beaches via hazard detection

📸 Demo Screens (Sample UI)
Dashboard – Upcoming events + personal impact
Event Details – Location, waste target, join button
Leaderboard – Top volunteers & teams
Rewards Store – Redeem XP for eco-gifts
(Screenshots / mockups go here when ready)

📈 Future Enhancements
AI-powered hazard detection (oil spills, dead fish, plastic patches)
IoT integration with smart bins & weight sensors
AR-based litter detection for volunteers
Global partnerships with UN SDG initiatives

🤝 Team
Team 404 NOT FOUND
Members: Solanki Jaimin,
         Gosai Harshpari,
         Vegad Udit, 
         Chopda Uday,
         Baraiya Jaydip

📢 Conclusion
“CleanQuest turns community service into a movement.
Together, we clean, play, and create measurable impact for a sustainable future.”