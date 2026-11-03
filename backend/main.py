
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import hashlib
import os
import json
from datetime import datetime


# =========================================================
# APP
# =========================================================

app = FastAPI(title="PeerTutor API")


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE
# =========================================================

DATABASE = "peertutor.db"


def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db


def create_tables():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            year TEXT,
            branch TEXT,
            created_at TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tutor_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            bio TEXT NOT NULL,
            subjects TEXT NOT NULL,
            availability TEXT NOT NULL,
            rating REAL DEFAULT 0,
            reviews INTEGER DEFAULT 0,
            created_at TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            tutor_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            session_date TEXT NOT NULL,
            session_time TEXT NOT NULL,
            status TEXT DEFAULT 'Confirmed',
            created_at TEXT,
            FOREIGN KEY(student_id) REFERENCES users(id),
            FOREIGN KEY(tutor_id) REFERENCES users(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    db.commit()
    db.close()


create_tables()


# =========================================================
# PASSWORD FUNCTIONS
# =========================================================

def hash_password(password):
    salt = os.urandom(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt,
        100000
    )

    return salt.hex() + ":" + password_hash.hex()


def verify_password(password, stored_password):
    try:
        salt_hex, hash_hex = stored_password.split(":")
        salt = bytes.fromhex(salt_hex)

        new_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode(),
            salt,
            100000
        )

        return new_hash.hex() == hash_hex

    except Exception:
        return False


# =========================================================
# REQUEST MODELS
# =========================================================

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    year: str = ""
    branch: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class TutorRequest(BaseModel):
    user_id: int
    bio: str
    subjects: list[str]
    availability: str


class BookingRequest(BaseModel):
    student_id: int
    tutor_id: int
    subject: str
    session_date: str
    session_time: str


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "PeerTutor Backend is Running!",
        "status": "success",
        "database": "SQLite"
    }


# =========================================================
# REGISTER
# =========================================================

@app.post("/api/register")
def register(data: RegisterRequest):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE email = ?",
        (data.email,)
    )

    existing = cursor.fetchone()

    if existing:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    password = hash_password(data.password)

    cursor.execute("""
        INSERT INTO users
        (name, email, password, year, branch, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        data.name,
        data.email,
        password,
        data.year,
        data.branch,
        datetime.now().isoformat()
    ))

    user_id = cursor.lastrowid

    db.commit()
    db.close()

    return {
        "message": "Registration successful",
        "user_id": user_id,
        "name": data.name,
        "email": data.email
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/api/login")
def login(data: LoginRequest):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    SELECT *
    FROM users
    WHERE email = ? COLLATE NOCASE
""", (data.email.strip(),))

    user = cursor.fetchone()
    db.close()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(data.password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "year": user["year"],
            "branch": user["branch"]
        }
    }


# =========================================================
# CREATE / UPDATE TUTOR PROFILE
# =========================================================

@app.post("/api/tutors")
def create_tutor(data: TutorRequest):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE id = ?",
        (data.user_id,)
    )

    user = cursor.fetchone()

    if not user:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    subjects = ", ".join(data.subjects)

    cursor.execute("""
        SELECT id
        FROM tutor_profiles
        WHERE user_id = ?
    """, (data.user_id,))

    existing = cursor.fetchone()

    if existing:
        cursor.execute("""
            UPDATE tutor_profiles
            SET bio = ?,
                subjects = ?,
                availability = ?
            WHERE user_id = ?
        """, (
            data.bio,
            subjects,
            data.availability,
            data.user_id
        ))

        message = "Tutor profile updated"

    else:
        cursor.execute("""
            INSERT INTO tutor_profiles
            (
                user_id,
                bio,
                subjects,
                availability,
                rating,
                reviews,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data.user_id,
            data.bio,
            subjects,
            data.availability,
            0,
            0,
            datetime.now().isoformat()
        ))

        message = "Tutor profile created"

    db.commit()
    db.close()

    return {"message": message}


# =========================================================
# GET ALL TUTORS
# =========================================================

@app.get("/api/tutors")
def get_tutors(subject: str = ""):
    db = get_db()
    cursor = db.cursor()

    if subject:
        cursor.execute("""
            SELECT
                tutor_profiles.id AS tutor_profile_id,
                users.id AS user_id,
                users.name,
                users.email,
                users.year,
                users.branch,
                tutor_profiles.bio,
                tutor_profiles.subjects,
                tutor_profiles.availability,
                tutor_profiles.rating,
                tutor_profiles.reviews
            FROM tutor_profiles
            JOIN users
            ON tutor_profiles.user_id = users.id
            WHERE tutor_profiles.subjects LIKE ?
        """, (f"%{subject}%",))

    else:
        cursor.execute("""
            SELECT
                tutor_profiles.id AS tutor_profile_id,
                users.id AS user_id,
                users.name,
                users.email,
                users.year,
                users.branch,
                tutor_profiles.bio,
                tutor_profiles.subjects,
                tutor_profiles.availability,
                tutor_profiles.rating,
                tutor_profiles.reviews
            FROM tutor_profiles
            JOIN users
            ON tutor_profiles.user_id = users.id
        """)

    tutors = cursor.fetchall()
    db.close()

    result = []

    for tutor in tutors:
        initials = "".join(
            word[0]
            for word in tutor["name"].split()
        ).upper()

        subjects = [
            x.strip()
            for x in tutor["subjects"].split(",")
        ]

        result.append({
            "id": tutor["user_id"],
            "tutorProfileId": tutor["tutor_profile_id"],
            "name": tutor["name"],
            "email": tutor["email"],
            "initials": initials,
            "year": f'{tutor["year"]} • {tutor["branch"]}',
            "subjects": subjects,
            "rating": tutor["rating"],
            "reviews": tutor["reviews"],
            "availability": tutor["availability"],
            "description": tutor["bio"]
        })

    return result


# =========================================================
# GET SINGLE TUTOR
# =========================================================

@app.get("/api/tutors/{user_id}")
def get_tutor(user_id: int):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT
            users.id,
            users.name,
            users.email,
            users.year,
            users.branch,
            tutor_profiles.bio,
            tutor_profiles.subjects,
            tutor_profiles.availability,
            tutor_profiles.rating,
            tutor_profiles.reviews
        FROM tutor_profiles
        JOIN users
        ON tutor_profiles.user_id = users.id
        WHERE users.id = ?
    """, (user_id,))

    tutor = cursor.fetchone()
    db.close()

    if not tutor:
        raise HTTPException(
            status_code=404,
            detail="Tutor not found"
        )

    return {
        "id": tutor["id"],
        "name": tutor["name"],
        "email": tutor["email"],
        "year": tutor["year"],
        "branch": tutor["branch"],
        "bio": tutor["bio"],
        "subjects": [
            x.strip()
            for x in tutor["subjects"].split(",")
        ],
        "availability": tutor["availability"],
        "rating": tutor["rating"],
        "reviews": tutor["reviews"]
    }


# =========================================================
# CREATE BOOKING
# =========================================================

@app.post("/api/bookings")
def create_booking(data: BookingRequest):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE id = ?",
        (data.student_id,)
    )
    student = cursor.fetchone()

    if not student:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    cursor.execute(
        "SELECT id FROM users WHERE id = ?",
        (data.tutor_id,)
    )
    tutor = cursor.fetchone()

    if not tutor:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Tutor not found"
        )

    if data.student_id == data.tutor_id:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="You cannot book yourself"
        )

    cursor.execute("""
        SELECT id
        FROM bookings
        WHERE tutor_id = ?
        AND session_date = ?
        AND session_time = ?
        AND status = 'Confirmed'
    """, (
        data.tutor_id,
        data.session_date,
        data.session_time
    ))

    existing = cursor.fetchone()

    if existing:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="This time slot is already booked"
        )

    cursor.execute("""
        INSERT INTO bookings
        (
            student_id,
            tutor_id,
            subject,
            session_date,
            session_time,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data.student_id,
        data.tutor_id,
        data.subject,
        data.session_date,
        data.session_time,
        "Confirmed",
        datetime.now().isoformat()
    ))

    booking_id = cursor.lastrowid

    db.commit()
    db.close()

    return {
        "message": "Session booked successfully",
        "booking_id": booking_id,
        "status": "Confirmed"
    }


# =========================================================
# STUDENT BOOKINGS
# =========================================================

@app.get("/api/bookings/student/{student_id}")
def get_student_bookings(student_id: int):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT
            bookings.id,
            bookings.subject,
            bookings.session_date,
            bookings.session_time,
            bookings.status,
            users.name AS tutor_name
        FROM bookings
        JOIN users
        ON bookings.tutor_id = users.id
        WHERE bookings.student_id = ?
        ORDER BY bookings.session_date
    """, (student_id,))

    bookings = cursor.fetchall()
    db.close()

    return [
        {
            "id": booking["id"],
            "subject": booking["subject"],
            "date": booking["session_date"],
            "time": booking["session_time"],
            "status": booking["status"],
            "tutor": booking["tutor_name"]
        }
        for booking in bookings
    ]


# =========================================================
# TUTOR BOOKINGS
# =========================================================

@app.get("/api/bookings/tutor/{tutor_id}")
def get_tutor_bookings(tutor_id: int):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT
            bookings.id,
            bookings.subject,
            bookings.session_date,
            bookings.session_time,
            bookings.status,
            users.name AS student_name
        FROM bookings
        JOIN users
        ON bookings.student_id = users.id
        WHERE bookings.tutor_id = ?
        ORDER BY bookings.session_date
    """, (tutor_id,))

    bookings = cursor.fetchall()
    db.close()

    return [
        {
            "id": booking["id"],
            "subject": booking["subject"],
            "date": booking["session_date"],
            "time": booking["session_time"],
            "status": booking["status"],
            "student": booking["student_name"]
        }
        for booking in bookings
    ]


# =========================================================
# CHAT HISTORY
# =========================================================

@app.get("/api/chat/history/{user_id}/{other_user_id}")
def get_chat_history(user_id: int, other_user_id: int):
    if user_id == other_user_id:
        raise HTTPException(
            status_code=400,
            detail="Invalid chat users"
        )

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT id, sender_id, receiver_id, message, created_at
        FROM chat_messages
        WHERE (sender_id = ? AND receiver_id = ?)
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY id ASC
    """, (
        user_id,
        other_user_id,
        other_user_id,
        user_id
    ))

    messages = [dict(row) for row in cursor.fetchall()]
    db.close()

    return {"messages": messages}


# =========================================================
# REAL-TIME CHAT WITH PERSISTENT STORAGE
# =========================================================

active_connections = {}


@app.websocket("/ws/chat/{user_id}/{other_user_id}")
async def websocket_chat(
    websocket: WebSocket,
    user_id: int,
    other_user_id: int
):
    if user_id == other_user_id:
        await websocket.close(code=1008)
        return

    connection_key = tuple(sorted([user_id, other_user_id]))

    await websocket.accept()

    if connection_key not in active_connections:
        active_connections[connection_key] = []

    active_connections[connection_key].append(websocket)

    print(f"CHAT CONNECTED: {user_id} <-> {other_user_id}")

    try:
        while True:
            message_text = await websocket.receive_text()

            # Save message in database.
            # Keep the original JSON message unchanged for the frontend.
            try:
                message_data = json.loads(message_text)
                if not isinstance(message_data, dict):
                    raise ValueError("Message must be a JSON object")

                if int(message_data.get("sender_id", -1)) != user_id:
                    await websocket.close(code=1008)
                    return

                if not isinstance(message_data.get("text"), str):
                    raise ValueError("Message text is required")

            except (ValueError, TypeError, json.JSONDecodeError):
                await websocket.close(code=1008)
                return

            db = get_db()
            cursor = db.cursor()

            cursor.execute("""
                INSERT INTO chat_messages
                (sender_id, receiver_id, message, created_at)
                VALUES (?, ?, ?, ?)
            """, (
                user_id,
                other_user_id,
                message_text,
                datetime.now().isoformat()
            ))

            db.commit()
            db.close()

            print(f"CHAT MESSAGE SAVED: {user_id} -> {other_user_id}")

            # Relay to the other user's connected browser.
            connections = active_connections.get(connection_key, [])

            for connection in connections.copy():
                if connection is websocket:
                    continue

                try:
                    await connection.send_text(message_text)

                except Exception as error:
                    print("CHAT SEND ERROR:", error)

                    if connection in active_connections.get(connection_key, []):
                        active_connections[connection_key].remove(connection)

    except WebSocketDisconnect:
        print(f"CHAT DISCONNECTED: {user_id} <-> {other_user_id}")

    finally:
        if connection_key in active_connections:
            if websocket in active_connections[connection_key]:
                active_connections[connection_key].remove(websocket)

            if not active_connections[connection_key]:
                del active_connections[connection_key]
