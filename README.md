# Connect Sphere (Server)

**Connect Sphere** is a community forum where users can connect, share ideas, and engage in meaningful discussions. This is the server-side codebase that handles user authentication, content management, post interactions, and various other backend functionalities.

[Live Site](https://assignment12-60ec2.web.app/)

---

## **Admin Credentials**

For testing and admin access:
- **Username:** admin@admin.com
- **Password:** Admin@Admin

---

## **Features**

- **User Authentication:** Secure user login and registration.
- **User Profiles:** Manage and view user profiles.
- **Membership Tiers:** Handle different membership levels.
- **Content Creation:** Allow users to create posts.
- **Post Interaction:** Like, comment, and interact with posts.
- **Admin Dashboard:** Manage users, posts, and settings from the admin interface.
- **Permissions and Roles:** Control access to different features based on user roles.
- **Content Moderation:** Tools for moderators to manage posts and comments.
- **Announcements:** Admin can send site-wide announcements.
- **Private Messaging and Notifications:** Engage in direct communication with users.
- **Community Building:** Foster meaningful interactions among users.
- **Security and Compliance:** Implement data security and user privacy measures.
- **Customization and Integrations:** Extend functionalities with integrations and customizations.

---

## **Technologies Used**

- **Backend:**  
  - Node.js  
  - Express.js

- **Database:**  
  - MongoDB  

- **Authentication:**  
  - JWT (JSON Web Tokens)  
  - Firebase (for Google & GitHub login)

- **Other Tools & Libraries:**  
  - Bcrypt.js (for password hashing)  

---



## **Installation and Setup**

Follow these steps to set up the server locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/connect-sphere-server.git
2. **Navigate to the project directory:**
   ```bash
   cd connect-sphere-server

3. **Install dependencies:**
    ```bash
    npm install

4. **Set up environment variables:** Create a .env file in the root directory.
5. **Run the project:**
    ```bash
    npm run dev
The website should now be running on http://localhost:5000.

