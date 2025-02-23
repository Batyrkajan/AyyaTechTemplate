🔒 Authentication Pages Guide for Ayya Technologies
Objective:
Create a seamless and intuitive authentication experience that reflects Ayya Technologies' modern, edgy, and bold brand identity. Every page should prioritize user experience, visual clarity, and secure interactions.

📌 1. Splash Screen
Purpose:
The splash screen serves as the first impression of Ayya Technologies. It should reflect the futuristic and powerful nature of the brand while offering a sleek transition into the app.

Design Requirements:

Background: A pure black base with subtle, animated geometric patterns (moving lines or grids) to reflect a tech-savvy, cutting-edge vibe.
Logo Animation: Display the Ayya Technologies logo in the center with a smooth zoom-in animation. The logo should have an electric blue glow effect on a dark background.
Typography: Display the tagline below the logo in a futuristic font (Exo or Orbitron):
"Powering the Future of Innovation"
Duration: The screen should automatically transition to the Welcome Screen after 2 seconds.
User Flow:

Display the animated splash screen upon app launch.
Auto-redirect to the Welcome Screen after a brief delay.
📌 2. Welcome Screen
Purpose:
This screen introduces users to the app and guides them to either sign up or log in.

Design Requirements:

Background: Dark mode-first with a gradient from black to charcoal gray. Subtle neon accents around the edges.
Headline:
"Welcome to Ayya" — Displayed boldly at the top in electric blue.
Subtext:
"Your Gateway to Innovation" — Smaller font beneath the headline.
Primary Buttons: Two large, bold CTAs:
Login – White background with black text, rounded edges, subtle shadow.
Sign Up – Dark gray background with white text and a blue border glow on hover/tap.
Animation: Smooth button scaling on tap.
Navigation: Clicking either button should navigate to the respective screens.
User Flow:

User chooses between Login or Sign Up.
Redirects accordingly.
📌 3. Login Screen
Purpose:
Allow returning users to securely access their accounts.

Design Requirements:

Background: Solid black with subtle electric blue accents around the input fields.
Title:
"Login to Your Account" – Bold, futuristic font in white.
Input Fields:
Email or Phone – Dark gray input box with placeholder text in light gray.
Password – Dark gray input box with an eye icon for password visibility toggle.
Input fields should have subtle animations on focus (e.g., a glowing electric blue border).
Forgot Password Link:
Positioned below the password field, small text in light gray with underline on hover.
CTA Button:
"Login" – Large button, white background with black text and rounded corners.
Social Login Options:
Icons for Google and Apple ID below the main login button.
User Flow:

User enters credentials.
On successful login, redirect to the main dashboard.
If login fails, display a clear error message (e.g., "Incorrect email or password").
📌 4. Signup Screen
Purpose:
Enable new users to create an account quickly and securely.

Design Requirements:

Background: Same dark theme with electric blue highlights.
Title:
"Create Your Account" – Bold in white, centered at the top.
Input Fields:
Full Name
Email Address
Password – Include a password strength meter below the input field.
All fields should have a glowing border when selected.
Checkbox:
"I agree to the Terms & Conditions" — Small, white text with clickable link.
CTA Button:
"Join the Future" — Electric blue button with bold white text.
Social Signup Options:
Google and Apple ID buttons below the main form.
User Flow:

User completes the form.
If successful, redirect to the Email Verification Page (if applicable).
After verification, redirect to the main dashboard with a personalized welcome message (e.g., "Welcome, [User's Name]!").
📌 5. Forgot Password Screen
Purpose:
Allow users to reset their password if they've forgotten it.

Design Requirements:

Background: Consistent with other screens – black with subtle neon accents.
Title:
"Reset Your Password" – White text, bold and centered.
Input Field:
Email Address – A single input box with placeholder text: "Enter your registered email"
CTA Button:
"Send Reset Link" – Large white button with bold black text.
Confirmation Message:
On submission, show a confirmation message:
"A reset link has been sent to your email address."
User Flow:

User enters their email.
App sends a reset link via email.
Upon successful reset, redirect to the Login Screen with a success message:
"Password successfully updated. Please log in again."
🔐 Security and Functionality Requirements
Input Validation: Ensure all fields have proper validation (e.g., email format, password strength).
Secure Authentication: Implement secure authentication using JWT or OAuth2.
Data Privacy: Encrypt sensitive information (especially passwords).
Error Handling: Provide clear feedback for user errors (e.g., invalid email format, weak password).
Accessibility: Ensure buttons and inputs are accessible (proper contrast, touch-friendly).