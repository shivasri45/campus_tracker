# 🏫 Campus Tracker

A full-stack web application that allows students and administrators to report, track, and manage campus maintenance issues in real-time.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20AWS%20Lambda%20%7C%20DynamoDB-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 🚀 Features

### 👨‍🎓 Student Features
- Submit new issue tickets with:
  - Title, description, and category
  - Student name and roll number
  - Optional image upload
- View only their own submitted tickets
- Filter and search issues
- Track ticket status (**OPEN / RESOLVED**)

### 🛠️ Admin Features
- View all submitted tickets across the campus
- Mark tickets as **resolved**
- Delete tickets
- Filter and search across all issues

---

## 🧠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React (Vite) | UI framework & build tool |
| AWS Cognito | User authentication |
| Custom CSS | Styling & UI system |

### Backend
| Technology | Purpose |
|---|---|
| AWS Lambda (Node.js) | Serverless API functions |
| API Gateway | HTTP routing to Lambda |
| DynamoDB | NoSQL ticket storage |
| AWS S3 | Image uploads & storage |

---

## 📁 Project Structure

```
campus_tracker/
│
├── Campus-tracker-backend/              # AWS Lambda functions (Node.js)
│   ├── createTicket/                    # Lambda: create a new ticket
│   ├── getTickets/                      # Lambda: fetch tickets (student/admin)
│   ├── updateTicket/                    # Lambda: mark ticket as resolved
│   ├── deleteTicket/                    # Lambda: delete a ticket
│   ├── uploadImage/                     # Lambda: handle S3 image uploads
│   └── package.json
│
└── Campus-tracker-frontend/
    └── campus-frontend/                 # React app (Vite)
        ├── public/
        ├── src/
        │   ├── components/              # Reusable UI components
        │   ├── pages/                   # Student & Admin views
        │   ├── services/                # API call helpers
        │   ├── auth/                    # AWS Cognito integration
        │   └── App.jsx
        ├── index.html
        ├── vite.config.js
        └── package.json
```

---

## 🏗️ Architecture Overview

```
Student / Admin (Browser)
        │
        ▼
  React App (Vite)
  AWS Cognito Auth
        │
        ▼
  API Gateway (REST)
        │
        ▼
  AWS Lambda (Node.js)
     ├── DynamoDB  ──  Ticket data
     └── S3        ──  Image uploads
```

---

## ⚙️ Setup & Deployment

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate permissions
- AWS account with access to: Lambda, API Gateway, DynamoDB, S3, Cognito

---

### 1. Clone the Repository

```bash
git clone https://github.com/shivasri45/campus_tracker.git
cd campus_tracker
```

---

### 2. Frontend Setup

```bash
cd Campus-tracker-frontend/campus-frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=https://your-api-gateway-url.amazonaws.com/prod
VITE_COGNITO_USER_POOL_ID=your_user_pool_id
VITE_COGNITO_CLIENT_ID=your_cognito_app_client_id
VITE_AWS_REGION=your_aws_region
VITE_S3_BUCKET_NAME=your_s3_bucket_name
```

Start the development server:

```bash
npm run dev
```

The app will run at `http://localhost:5173`.

---

### 3. Backend Setup (AWS Lambda)

```bash
cd ../../Campus-tracker-backend
npm install
```

Deploy each Lambda function via the AWS Console or AWS CLI:

```bash
# Example: zip and deploy a function
zip -r createTicket.zip createTicket/
aws lambda update-function-code \
  --function-name createTicket \
  --zip-file fileb://createTicket.zip
```

---

### 4. AWS Services Configuration

| Service | Configuration |
|---|---|
| **DynamoDB** | Create a table `Tickets` with `ticketId` as the partition key |
| **S3** | Create a bucket and enable public read or use pre-signed URLs |
| **Cognito** | Create a User Pool with student and admin user groups |
| **API Gateway** | Create a REST API and connect routes to Lambda functions |

---

## 🔐 Authentication Flow

1. User signs up / logs in via **AWS Cognito**
2. Cognito returns a **JWT token**
3. Frontend attaches the token to all API requests
4. Lambda functions verify the token and determine the user's role (**student** or **admin**)

---

## 🧾 API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/tickets` | Submit a new ticket | Student |
| `GET` | `/tickets` | Fetch tickets (own or all) | Student / Admin |
| `PATCH` | `/tickets/{id}` | Mark a ticket as resolved | Admin |
| `DELETE` | `/tickets/{id}` | Delete a ticket | Admin |
| `POST` | `/tickets/upload` | Upload an image to S3 | Student |

---

## 📸 Ticket Lifecycle

```
Student submits ticket  →  Status: OPEN
                               │
                         Admin reviews
                               │
                         Admin resolves  →  Status: RESOLVED
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Shivansh Srivastava**  
GitHub: [@shivasri45](https://github.com/shivasri45)
