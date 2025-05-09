# REST API Plan

## 1. Resources

1. **Users** – Corresponds to the `users` table. Contains user details such as `id`, `email`, `password_hash`, `created_at`, and `updated_at`.
2. **Flashcards** – Corresponds to the `flashcards` table. Represents flashcards created either manually or via AI. Key fields include `id`, `user_id`, `generation_id`, `front`, `back`, `source`, `created_at`, and `updated_at`. Validation constraints (e.g., `front` ≤ 200 characters, `back` ≤ 500 characters) are enforced at the database level.
3. **Generations** – Corresponds to the `generations` table. Represents AI flashcard generation sessions. Contains fields such as `id`, `user_id`, `model`, `generated_count`, `accepted_unedited_count`, `accepted_edited_count`, `source_text_hash`, `source_text_length`, `generation_duration`, `created_at`, and `updated_at`.
4. **Generation Error Logs** – Corresponds to the `generation_error_logs` table. Stores error logs for AI generation sessions with fields like `id`, `user_id`, `model`, `source_text_hash`, `source_text_length`, `error_code`, `error_message`, and `created_at`.

## 2. Endpoints

### 2.2 Flashcards Endpoints

- **GET /flashcards**
  - **Description:** Retrieve a paginated list of the user's flashcards.
  - **Query Parameters:**
    - `page` (number, default: 1)
    - `per_page` (number, default: 10)
    - `search` (string, optional – search within front/back text)
    - `sort` (e.g., `created_at`)
  - **Response:**
    ```json
    {
      "flashcards": [
        {
          "id": "uuid",
          "front": "string",
          "back": "string",
          "source": "ai/user",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
      ],
      "pagination": {
        "page": 1,
        "per_page": 10,
        "total_pages": 5,
        "total_items": 50
      }
    }
    ```
  - **Success:** 200 OK
  - **Errors:** 401 Unauthorized

- **GET /flashcards/{id}**
  - **Description:** Retrieve details for a specific flashcard.
  - **URL Parameter:** `id` – UUID of the flashcard.
  - **Response:**
    ```json
    {
      "id": "uuid",
      "user_id": "uuid",
      "generation_id": "uuid or null",
      "front": "string",
      "back": "string",
      "source": "ai/user",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
    ```
  - **Success:** 200 OK
  - **Errors:** 401 Unauthorized, 404 Not Found

- **POST /flashcards**
  - **Description:** Create a new flashcard (manual creation).
  - **Request Body:**
    ```json
    {
      "flashcards": [
        {
          "front": "string (max 200 characters)",
          "back": "string (max 500 characters)",
          "source": "manual/ai/edited",
          "generation_id": "uuid (opcjonalne, tylko dla fiszek z AI)"
        }
      ]
    }
    ```
  - **Response:**
    ```json
    {
      "flashcards": [
        {
          "id": "uuid",
          "user_id": "uuid",
          "front": "string",
          "back": "string",
          "source": "user/ai/edited",
          "generation_id": "uuid or null",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
      ]
    }
    ```
  - **Validation:** Enforce character limits on `front` and `back`.
  - **Success:** 201 Created
  - **Errors:** 400 Bad Request, 401 Unauthorized

- **PUT /flashcards/{id}**
  - **Description:** Update an existing flashcard (e.g., for review edits).
  - **URL Parameter:** `id` – flashcard UUID.
  - **Request Body:**
    ```json
    {
      "front": "string (optional, max 200 characters)",
      "back": "string (optional, max 500 characters)"
    }
    ```
  - **Response:**
    ```json
    {
      "id": "uuid",
      "front": "string",
      "back": "string",
      "updated_at": "timestamp"
    }
    ```
  - **Validation:** Check field lengths and resource ownership.
  - **Success:** 200 OK
  - **Errors:** 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

- **DELETE /flashcards/{id}**
  - **Description:** Delete a specific flashcard.
  - **URL Parameter:** `id` – flashcard UUID.
  - **Response:**
    ```json
    { "message": "Flashcard deleted successfully." }
    ```
  - **Success:** 200 OK
  - **Errors:** 401 Unauthorized, 403 Forbidden, 404 Not Found

### 2.3 Generations Endpoints (AI Flashcard Generation)

- **POST /generations**
  - **Description:** Initiate an AI generation session by submitting source text.
  - **Request Body:**
    ```json
    {
      "source_text": "string (min 1000 and max 10000 characters)",
    }
    ```
  - **Business Logic:** Validate text length, trigger AI processing, and create a generation record. Candidate flashcards are returned for review.
  - **Response:**
    ```json
    {
      "id": "uuid",
      "user_id": "uuid",
      "model": "string",
      "generated_count": 0,
      "accepted_unedited_count": 0,
      "accepted_edited_count": 0,
      "source_text_hash": "string",
      "source_text_length": 1234,
      "generation_duration": null,
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "candidate_flashcards": [
        { "front": "string", "back": "string" }
      ]
    }
    ```
  - **Success:** 201 Created
  - **Errors:** 400 Bad Request, 401 Unauthorized

- **GET /generations/{id}**
  - **Description:** Retrieve details of a specific AI generation session.
  - **URL Parameter:** `id` – generation UUID.
  - **Response:**
    ```json
    {
      "id": "uuid",
      "user_id": "uuid",
      "model": "string",
      "generated_count": 10,
      "accepted_unedited_count": 5,
      "accepted_edited_count": 2,
      "source_text_hash": "string",
      "source_text_length": 5000,
      "generation_duration": 2500,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
    ```
  - **Success:** 200 OK
  - **Errors:** 401 Unauthorized, 404 Not Found

- **GET /generations/{id}/flashcards**
  - **Description:** Retrieve candidate flashcards associated with a generation session.
  - **URL Parameter:** `id` – generation UUID.
  - **Response:**
    ```json
    {
      "flashcards": [
        {
          "front": "string",
          "back": "string",
          "source": "ai",
          "created_at": "timestamp"
        }
      ]
    }
    ```
  - **Success:** 200 OK
  - **Errors:** 401 Unauthorized, 404 Not Found

### 2.4 Generation Error Logs Endpoints

- **GET /generation_error_logs**
  - **Description:** Retrieve a paginated list of AI generation error logs for the authenticated user.
  - **Query Parameters:** e.g., `page`, `per_page`
  - **Response:**
    ```json
    {
      "error_logs": [
        {
          "id": "uuid",
          "model": "string",
          "source_text_hash": "string",
          "error_code": "string",
          "error_message": "string",
          "created_at": "timestamp"
        }
      ],
      "pagination": {
        "page": 1,
        "per_page": 10,
        "total_pages": 2,
        "total_items": 15
      }
    }
    ```
  - **Success:** 200 OK
  - **Errors:** 401 Unauthorized

- **GET /generation_error_logs/{id}**
  - **Description:** Retrieve details of a specific generation error log.
  - **URL Parameter:** `id` – error log UUID.
  - **Response:**
    ```json
    {
      "id": "uuid",
      "model": "string",
      "source_text_hash": "string",
      "error_code": "string",
      "error_message": "string",
      "created_at": "timestamp"
    }
    ```
  - **Success:** 200 OK
  - **Errors:** 401 Unauthorized, 404 Not Found

## 3. Authentication and Authorization

- **Authentication:** All endpoints require a valid JWT provided in the `Authorization` header as a Bearer token. The API leverages Supabase Authentication to manage user sessions.
- **Authorization:** Row Level Security (RLS) is enforced at the database layer to ensure users can only access their own data. The API endpoints further check that the user ID in the JWT matches the resource owner.
- **Additional Measures:** Sensitive endpoints (e.g., password updates, account deletion) may require re-validation of credentials.

## 4. Validation and Business Logic

- **Input Validation:**
  - Use Zod schemas (or a similar library) to validate incoming JSON payloads on all endpoints.
  - For flashcards, ensure:
    - `front` does not exceed 200 characters.
    - `back` does not exceed 500 characters.
  - For AI generation, ensure `source_text` is between 1000 and 10000 characters.

- **Business Logic:**
  - **Flashcard Review:** Users can review, edit, and accept candidate flashcards generated by AI. Accepted flashcards are then integrated with the spaced repetition algorithm.
  - **Ownership Enforcement:** Endpoints for updating and deleting flashcards verify that the flashcard belongs to the authenticated user.
  - **Efficient Data Retrieval:** Implement pagination, filtering, and sorting (e.g., by `created_at`) to optimize list endpoints. Database indexes (e.g., on `user_id`, `generation_id`, and `created_at`) support these operations.
  - **Error Handling:** Standardize error responses for validation failures (400), unauthorized access (401), forbidden actions (403), and not found errors (404).