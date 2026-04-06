# Transition Frontend to Real API Integration

This plan outlines the steps to disconnect the frontend from `mockData.js` and connect it securely to the backend endpoints outlined in `API_DOCS.txt`. This will involve implementing async data fetching, configuring Axios with JWT interceptors, and migrating all dashboards to track server state.

## User Review Required

> [!WARNING]
> Before proceeding, please review the **Open Questions** section regarding sub-admin identifiers and JWT storage.

## Proposed Changes

---

### API Configuration `src/services/api.js`

#### [MODIFY] api.js
- Setup Axios instance with `baseURL: "/api"` (or specific backend URL).
- Add an Axios Request Interceptor to retrieve the `token` from `localStorage` and attach it as an `Authorization: Bearer <token>` header dynamically.
- Export all configured API bindings for auth, users, uploads, and fabric verified endpoints matching `API_DOCS.txt`.

---

### Authentication

#### [MODIFY] LoginPage.jsx
- Replace `authenticateUser` mock with `API.post("/users/login", { email, password })`.
- On success, store both the returned `token` and `user` object in `localStorage`.
- Implement proper error handling based on server responses.

#### [MODIFY] App.jsx / Navigation
- Ensure logout thoroughly clears `token` and `idenfy_user` from `localStorage`.

---

### Admindashboards

#### [MODIFY] AdminPage.jsx
- Replace `mockStudents.length` and `mockCertificates.length` calculations with data fetched directly.
- Fetch users via `API.get("/users/all")` to count total students.
- Fetch certificates via `API.get("/fileUpload/certificate-counts")` to calculate `totalCerts` and populate the Line Graph directly from live server data.

#### [MODIFY] ManageStudentsPage.jsx
- Instead of local `mockStudents`, use `useEffect` to fetch `GET /users/all`. Filter the results in frontend where `role === "user"`.
- Insert Flow: Use `POST /users/create` (with payload `{ name, email, password, roll_no, department, dob, role: "user" }`).
- Edit Flow: Use `PUT /users/update/:roll_no` (updating `name`, `dob`, `department`).
- Delete Flow: Use `DELETE /users/delete/:roll_no`.
- Re-fetch data upon successful mutation.

#### [MODIFY] ManageSubAdminsPage.jsx
- Fetch via `GET /users/all` filtered to `role === "subadmin"`.
- Insert Flow: Use `POST /users/create` with `role: "subadmin"`.
- *Note on Edit/Delete for Subadmins below.*

#### [MODIFY] IssueCertificatePage.jsx
- On mount, load target students from `GET /users/all`.
- On submitting a certificate, instead of local `mockCertificates` latency simulation:
  - Construct `FormData` containing the `file` object and `certificateName`.
  - Use `POST /fileUpload/upload-for-user/:roll_no` to automatically upload the file, mint to blockchain, and pin to IPFS in a single step (per the API docs).
  - Update the loading spinner states to reflect genuine upload status rather than a mock preset timer.

---

### Student Views and Public Views

#### [MODIFY] StudentPage.jsx
- Replace `mockCertificates.filter` with `API.get("/fileUpload/get-files")` strictly returning the authenticated user's documents.

#### [MODIFY] LandingPage.jsx
- Migrate the public "Verify Certificate" mock search into a live fetch request against `GET /fabric/verify/:id`.

## Open Questions

> [!IMPORTANT]
> 1. **Sub-Admin Deletions/Updates:** The API docs state that `PUT /api/users/update/:roll_no` and `DELETE /api/users/delete/:roll_no` use the `roll_no` parameter. However, sub-admins generally do not have a `roll_no`. Does the backend allow the target's `email` or `_id` in place of `roll_no` for these endpoints, or should we prevent the editing/deleting of sub-admins via the frontend for now?
> 2. **Backend Server URL:** By default, I will set the Axios `baseURL` to `http://localhost:5000/api`. Is this correct for your local backend environment?

## Verification Plan

### Automated/Manual Testing
- Boot up the frontend and attempt login with mock credentials—it should now fail unless actual backend credentials exist.
- Verify that valid login securely returns and stores a JWT into LocalStorage.
- Add a new "Student" and ensure it persists across page reloads.
- Attempt an Issue Certificate network call with a PDF, monitoring the DevTools Network Tab for the `multipart/form-data` payload containing the file to the correct `/fileUpload/upload-for-user/:roll_no` endpoint.
