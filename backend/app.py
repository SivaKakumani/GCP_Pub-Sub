from flask import Flask, request, jsonify, url_for
from flask_cors import CORS
import bcrypt
from pymongo import MongoClient
import jwt
import datetime
from functools import wraps
import uuid
from google.cloud import pubsub_v1
import os
import json

# Google Application Credentials(Add Google Cloud Service Account credentials as JSON key location)
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r""

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# MongoDB connection setup
client = MongoClient('mongodb://localhost:27017/')
db = client['face_auth_db']  # Database name
users_collection = db['users2']  # Collection for storing user data

# Pub/Sub client setup
project_id = ""  # Replace with your actual project ID
topic_id = "my-topic"  # Replace with your Pub/Sub topic
publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(project_id, topic_id)

# Secret key for JWT encoding/decoding
app.config['SECRET_KEY'] = 'your_jwt_secret_key'

# Function to hash the password
def hash_password(password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password

# Function to check the password during sign-in
def check_password(stored_password, provided_password):
    return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password)

# Publish email verification message to Pub/Sub
def publish_verification_email(email, token):
    message_data = {
        'email': email,
        'verification_token': token
    }
    # Ensure the message is properly serialized to JSON
    json_message_data = json.dumps(message_data)  # Convert to JSON format
    future = publisher.publish(topic_path, data=json_message_data.encode('utf-8'))  # Send JSON message
    print(f"Message published with ID: {future.result()}")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"success": False, "message": "Token is missing!"}), 403
        try:
            token = token.split(" ")[1]  # Expect 'Bearer <token>'
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({'username': data['username']})
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token has expired!"}), 403
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Token is invalid!"}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# Route to handle the signup process
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json  # Get the JSON data from the request
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    mobile_phone = data.get('mobilePhone')
    email_updates = data.get('emailUpdates')

    if username and email and password and mobile_phone:
        # Check if the username or email already exists in the database
        if users_collection.find_one({'$or': [{'username': username}, {'email': email}]}):
            return jsonify({"success": False, "message": "Username or Email already exists."})

        # Hash the password before storing it
        hashed_password = hash_password(password)

        # Generate a unique verification token
        verification_token = str(uuid.uuid4())

        # Store the user data in the MongoDB collection
        users_collection.insert_one({
            'username': username,
            'email': email,
            'password': hashed_password,
            'mobile_phone': mobile_phone,
            'email_updates': email_updates,
            'is_verified': False,
            'verification_token': verification_token
        })

        # Publish message to Pub/Sub for email verification
        publish_verification_email(email, verification_token)

        return jsonify({"success": True, "message": "Signup successful! Please check your email for verification."})

    return jsonify({"success": False, "message": "Signup failed."})

@app.route('/signin', methods=['POST'])
def signin():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Find the user by username
    user = users_collection.find_one({'username': username})
    if user:
        # Check if the password matches
        if check_password(user['password'], password):
            if user['is_verified']:  # Check if the user is verified
                # Generate a JWT token valid for 30 minutes
                token = jwt.encode({
                    'username': user['username'],
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)  # Corrected UTC time
                }, app.config['SECRET_KEY'], algorithm="HS256")
                return jsonify({"success": True, "message": "Sign In successful!", "token": token})
            else:
                return jsonify({"success": False, "message": "Email not verified."})
        else:
            return jsonify({"success": False, "message": "Invalid password."})
    else:
        return jsonify({"success": False, "message": "Username not found."})


# Route to handle email verification
@app.route('/verify', methods=['GET'])
def verify_email():
    token = request.args.get('token')
    if not token:
        return jsonify({"success": False, "message": "Verification token missing."})

    # Find the user with the matching verification token
    user = users_collection.find_one({'verification_token': token})
    if user:
        # Update user record to set 'is_verified' to True
        users_collection.update_one({'_id': user['_id']}, {'$set': {'is_verified': True}})
        return jsonify({"success": True, "message": "Email verified successfully!"})
    else:
        return jsonify({"success": False, "message": "Invalid or expired token."})

# Example of a protected route
@app.route('/protected', methods=['GET'])
@token_required
def protected_route(current_user):
    return jsonify({"success": True, "message": f"Welcome, {current_user['username']}!"})

# Run the Flask app in debug mode
if __name__ == '__main__':
    app.run(debug=True)
