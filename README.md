# Digital Library

This is a demo digital library application.

Deployment and hosting
----------------------

We recommend hosting the frontend on Netlify and the backend on Render (or similar Node-hosting).

Quick steps
1. Create a GitHub repository and push this project (see below for a professional commit message example).
2. Frontend (Netlify)
	- Connect your GitHub repo to Netlify and set the build command to `npm run build` and publish directory to `dist`.
	- Add an environment variable `VITE_BACKEND_URL` pointing to your backend (e.g. https://my-backend.onrender.com). This tells the frontend where to reach the API.

3. Backend (Render)
	- Create a new Web Service on Render, set the Root Directory to `backend` (this is a monorepo), and choose the branch (e.g. master).
	- Build: default (Render will run `npm install` in `backend`); Start command: `npm start`.
	- Add environment variables (see `backend/.env.example`) including `MONGODB_URI` and Cloudinary credentials (see below).

Remote images
-------------
For images to be reliably accessible from the frontend, configure Cloudinary and set the env vars in the backend:
- Option A (recommended): Set `CLOUDINARY_URL` (or `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) in your Render service environment. The backend will upload images to Cloudinary and return secure URLs the frontend can load directly.
- Option B (dev): If you prefer not to use Cloudinary, uploaded files are stored under `/uploads` and the backend serves them; ensure your backend is publicly reachable (Render will serve static `/uploads`). This is less robust than Cloudinary for production.

Config and environment
----------------------
- Frontend env sample: see `.env.example` (Vite expects VITE_ prefixed vars).
- Backend env sample: `backend/.env.example` (MongoDB, Cloudinary, mailer, admin seed credentials).

Professional git & GitHub steps
-----------------------------
1. Initialize git (if not already):
	git init
2. Add files and create a clean commit with helpful message:
	git add .
	git commit -m "chore: initial project import — React frontend (Vite) + Express backend"
3. Create a repo on GitHub, then push:
	git remote add origin git@github.com:<your-org>/<repo>.git
	git branch -M main
	git push -u origin main

CI / future improvements
- Add a GitHub Actions workflow to lint, build, and run basic tests on PRs.
- Add a Render `render.yaml` if you prefer infrastructure-as-code for service creation.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
