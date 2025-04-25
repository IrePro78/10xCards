# 10xCards

## Table of Contents

- [10xCards](#10xcards)
  - [Table of Contents](#table-of-contents)
  - [Project Description](#project-description)
  - [Tech Stack](#tech-stack)
  - [Getting Started Locally](#getting-started-locally)
  - [Available Scripts](#available-scripts)
  - [Project Scope](#project-scope)
  - [Project Status](#project-status)
  - [License](#license)

## Project Description

10xCards is a web application designed to simplify the creation and management of educational flashcards. It leverages AI to generate flashcard candidates from user-provided text, significantly reducing the time required for manual creation. Users can review, edit, accept, or reject AI-generated flashcards, and also manually create flashcards as needed.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL) for authentication and database management
- **AI Integration:** Openrouter.ai for generating flashcards
- **Environment:** Node.js version 22.15.0

## Getting Started Locally

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd 10xCards
   ```
3. Ensure you are using Node.js version 22.15.0 (as specified in the .nvmrc file):
   ```bash
   nvm use
   ```
4. Install the dependencies:
   ```bash
   npm install
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- **dev:** Runs the development server with turbopack support
  ```bash
  npm run dev
  ```
- **build:** Builds the application for production
  ```bash
  npm run build
  ```
- **start:** Starts the production server
  ```bash
  npm run start
  ```
- **lint:** Lints and fixes files in the `src` and `app` directories
  ```bash
  npm run lint
  ```
- **format:** Formats the project files using Prettier
  ```bash
  npm run format
  ```
- **check:** Checks code formatting using Prettier
  ```bash
  npm run check
  ```

## Project Scope

- **AI-Powered Flashcard Generation:** Accepts text input (between 1000 to 10000 characters) to generate flashcard candidates using AI.
- **Flashcard Review and Management:** Allows users to review, edit, accept, or reject generated flashcards before saving them.
- **Manual Flashcard Creation:** Provides a modal with fields for "front" (up to 200 characters) and "back" (up to 500 characters) to create flashcards manually.
- **Flashcard Listing & Pagination:** Includes search functionality, pagination, and options for editing or deleting flashcards.
- **User Account Management:** Supports secure user authentication, password changes, and account deletion.
- **Spaced Repetition Integration:** Automatically integrates accepted flashcards with a spaced repetition algorithm to enhance learning efficiency.
- **Data Validation:** Implements comprehensive validation on the frontend, backend, and database levels, with inline error feedback.

## Project Status

This project is currently in the MVP development stage. Further features and optimizations will be implemented based on user feedback and evolving requirements.

## License

This project is distributed under the MIT License.
