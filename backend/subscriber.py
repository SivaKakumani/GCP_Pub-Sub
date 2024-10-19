import json
import os
from google.cloud import pubsub_v1
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header

# Google Application Credentials(Add Google Cloud Service Account credentials as JSON key location)
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r""

# Use your email address and the newly generated App Password
EMAIL_ADDRESS = ''
EMAIL_PASSWORD = ''  # App Password

# Pub/Sub subscriber client
project_id = ""
subscription_id = "my-subscription"
subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path(project_id, subscription_id)

# Email sending function
def send_verification_email(email, token):
    try:
        verification_link = f"http://localhost:5000/verify?token={token}"
        message_body = f"Click the link to verify your email: {verification_link}"

        msg = MIMEMultipart()
        msg['Subject'] = Header('Email Verification', 'utf-8')
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = email

        # Attach the text message body
        msg.attach(MIMEText(message_body, 'plain', 'utf-8'))

        # Setup the SMTP server and send the email
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

        print(f"Verification email sent to {email}")

    except Exception as e:
        print(f"Failed to send email to {email}. Error: {str(e)}")

# Callback to process Pub/Sub messages
def callback(message):
    try:
        print(f"Received message: {message.data.decode('utf-8')}")
        data = json.loads(message.data.decode('utf-8'))
        email = data.get('email')
        token = data.get('verification_token')

        if email and token:
            # Send the email
            send_verification_email(email, token)
        else:
            print("Email or token missing from message data.")

        # Acknowledge the message
        message.ack()

    except json.JSONDecodeError as e:
        print(f"JSON decode error: {str(e)}")
        message.ack()  # Acknowledge to avoid retries on malformed messages

    except Exception as e:
        print(f"Error processing message: {str(e)}")
        message.ack()

# Listen for messages
streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
print(f"Listening for messages on {subscription_path}...\n")

try:
    streaming_pull_future.result()
except KeyboardInterrupt:
    streaming_pull_future.cancel()
