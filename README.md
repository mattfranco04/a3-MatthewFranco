## Calorie Tracker

https://a3-matthewfranco-production.up.railway.app/

## Project Summary

The Calorie Tracker is a full-stack web application that allows users to log, view, and manage their daily meals and calorie intake. Authenticated users can add, edit, and delete meal entries, view meals grouped by date, and see total calories per day. The app features secure login via GitHub OAuth.

### Goal of the Application

The goal is to help users track their daily food consumption and calories in a simple, secure, and visually appealing way. The app makes it easy to log meals, review nutrition, and maintain healthy habits.

### Challenges Faced

- Integrating GitHub OAuth authentication and session management with Express and MongoDB.
- Ensuring frontend and backend data models matched for CRUD operations.
- Styling the app for accessibility and responsiveness using Bootstrap 5.

### Authentication Strategy

I chose GitHub OAuth using Passport.js because it is widely supported, secure, and easy to implement for student projects. It allows users to log in with their GitHub account, and Passport handles the session and user management.

### CSS Framework Used

I used Bootstrap 5 for the UI because it provides a robust grid system, responsive components, and easy-to-use utility classes. This made it simple to create a clean, modern layout.

### Express Middleware Packages Used

- **express-session**: Manages user sessions and cookies for authentication.
- **passport**: Handles authentication strategies and user login/logout.
- **passport-github2**: Implements GitHub OAuth authentication.
- **body-parser**: Parses incoming request bodies for form and JSON data.
- **method-override**: Allows HTTP verbs like PUT and DELETE in forms.
- **express-partials**: Supports EJS partials for reusable view components.
- **Custom helper functions**: Group meals by date, calculate total calories, and format data for the frontend.

### Google Lighthouse Scores

![Google Lighthouse Scores](public/img/Screenshot%202025-09-25%20at%203.23.30%E2%80%AFPM.png)

### HTML Input Tags

My calorie tracker form uses a variety of semantic HTML input tags to ensure accessibility, usability, and proper data validation:

- `<select>`: Used for the 'meal' and 'unit' fields, allowing users to choose from predefined options (e.g., meal type, units of measurement).
- `<option>`: Defines each selectable choice within the `<select>` dropdowns.
- `<input type="text">`: Used for the food name field, allowing freeform text entry.
- `<input type="number">`: Used for quantity and calories fields, restricting input to numeric values and enabling built-in validation.

These tags were chosen for their semantic meaning and built-in browser validation, which helps users enter accurate data and improves accessibility for all users.

## Technical Achievements

- **OAuth Authentication (10 pts):** I implemented OAuth authentication using Passport.js with the GitHub strategy. This allows users to securely log in with their GitHub account, and Passport manages the session and user identity. This was the most challenging part of the project, requiring careful integration of authentication, session management, and route protection.

- **Deployment on Railway (5 pts):** Instead of Render, I deployed my site on Railway, a reputable cloud platform with a free tier. Railway provided a smoother deployment experience, faster build times, and easier environment variable management compared to Render. The UI is more modern and intuitive, and the free tier was sufficient for my needs.

### Design/Evaluation Achievements

#### CRAP Principles in Design

**Contrast:**
Contrast is used throughout the site to draw attention to key elements and improve readability. The most emphasized element on the main page is the total calories row, which uses larger, bold text and a distinct background color to stand out from the rest of the table. Buttons are styled with Bootstrap's primary and secondary color schemes to make them easily distinguishable. Form labels and headings use strong contrast against the background, ensuring that users with low vision can easily read and interact with the site. Overall, contrast is used to guide the user's attention to important actions and information, making the site intuitive and easy to use.

**Repetition:**
Repetition is achieved by consistently using Bootstrap's grid system, button styles, and form layouts across all pages. The same font family, color palette, and spacing are applied throughout the site, creating a cohesive visual experience. Navigation elements, form fields, and tables follow a uniform design pattern, which helps users quickly understand how to interact with different parts of the app. Repeated use of icons and button shapes reinforces the site's branding and usability. This consistency reduces cognitive load and makes the site feel professional and well-organized.

**Alignment:**
Alignment is carefully managed using Bootstrap's flexbox and grid utilities. Form fields are aligned vertically and horizontally for easy scanning, and tables are centered within their containers. Headings, labels, and buttons are aligned to create clear visual hierarchies, making it easy for users to find and understand information. The use of consistent margins and padding ensures that elements are spaced evenly, preventing clutter and improving readability. Alignment also helps increase contrast for key elements, such as the total calories row, by separating them from surrounding content and making them more prominent.

**Proximity:**
Proximity is used to group related information and actions together. Form fields for adding a meal are placed close to their labels and submit buttons, making it clear which inputs belong together. The meals table is positioned directly below the form, allowing users to see their entries immediately after submission. By grouping related elements, the site reduces confusion and helps users complete tasks efficiently. Proximity also enhances the overall organization of the page, making it easier to navigate and understand.

### Use of AI

GitHub Copilot was used durinh the coding process to suggest code snippets, refactor logic, and generate boilerplate for both backend and frontend components. Copilot provided helpful recommendations for Express route handlers, EJS templates, and Bootstrap-based UI layouts, reducing manual effort and minimizing errors. AI assistance also helped with documentation, including generating README sections and summarizing technical achievements.
