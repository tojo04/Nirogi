# 💊 Prescription Comparator - Key Features

> A HealthTech project to help Indian patients compare prescription medicine prices, discover discounts, and make cost-effective decisions. Built using the MERN stack with AI-assisted tooling (Bolt + Cursor).

## 🚀 Feature 1: Prescription Price Comparison

**Objective:** Allow users to compare prescription prices from Indian pharmacy websites (1mg, PharmEasy, Netmeds).

**Tech Stack:** React, Node.js, Express, MongoDB, Playwright, SERP API

**Backend Implementation:**
- Use SERP API to locate medicine pages.
- Use Playwright to scrape prices.
- Create Express endpoint: `/api/prices/:medicine`
- Cache results in MongoDB.

**Frontend Implementation:**
- Create React component to fetch and display comparison.

---

## 🎁 Feature 2: Discounts and Offers Aggregation

**Objective:** Showcase current discounts and coupons from pharmacy sites.

**Tech Stack:** React, Node.js, Express, MongoDB, Playwright, SERP API

**Backend Implementation:**
- Scrape promo sections from websites.
- Schedule scrapes (e.g. cron).
- Create endpoint: `/api/discounts`

**Frontend Implementation:**
- React UI to display categorized discounts.



## 🔍 Feature 3: User-Friendly Search Interface

**Objective:** Autocomplete medication search bar.

**Tech Stack:** React, Axios, Node.js, Express

**Backend Implementation:**
- Endpoint: `/api/search-suggestions` for autocomplete.

**Frontend Implementation:**
- Debounced React search input with suggestions.


---

## 👤 Feature 4: User Authentication and Profiles

**Objective:** Enable user accounts, login/signup, and prescription management.

**Tech Stack:** React, React Router, Axios, Node.js, Express, JWT, bcryptjs, MongoDB

**Backend Implementation:**
- Endpoints: `/api/auth/signup`, `/api/auth/login`, `/api/user/profile`
- Use JWT and bcryptjs.

**Frontend Implementation:**
- React UI for auth and profiles.



---

## 📱 Feature 5: Mobile Responsiveness and Accessibility

**Objective:** Ensure mobile-friendly and accessible UI.

**Tech Stack:** React, Tailwind CSS

**Implementation:**
- Use Tailwind CSS for responsiveness.
- Test on multiple devices.
- Follow accessibility standards.

---

## 🛠️ Feature 6: Admin Dashboard

**Objective:** Admins manage pharmacies, medicines, users, and scraped data.

**Tech Stack:** React, Node.js, Express, MongoDB, Admin UI Template

**Backend Implementation:**
- Admin routes under `/api/admin/*` with JWT protection.
- CRUD for users, medicines, discounts.

**Frontend Implementation:**
- React-based admin dashboard.



---



