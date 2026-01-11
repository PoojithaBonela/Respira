import requests
import json
import sys

BASE_URL = "http://localhost:8000"
EMAIL = "test@example.com"
PASSWORD = "password123"

def login():
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
        if resp.status_code == 200:
            return resp.json()["token"]
        else:
            print(f"Login failed: {resp.text}")
            # Try signup if login fails
            print("Attempting signup...")
            signup_resp = requests.post(f"{BASE_URL}/auth/signup", json={"name": "Test User", "email": EMAIL, "password": PASSWORD})
            if signup_resp.status_code == 200:
                print("Signup success")
                return login() # Retry login
            else:
                print(f"Signup failed: {signup_resp.text}")
                return None
    except Exception as e:
        print(f"Connection error: {e}")
        return None

def submit_profile(token):
    headers = {"Authorization": f"Bearer {token}"}
    profile_data = {
        "age_range": "25-34",
        "gender": "Male",
        "smoking_frequency": "11-20",
        "smoking_duration": "5-10 years",
        "triggers": ["Stress", "After meals"],
        "reasons": ["Health", "Money"],
        "stress_smoking": "Yes, helps me relax",
        "quit_attempts": "1-2 times",
        "current_goal": "Quit completely"
    }
    
    print("\n--- Submitting Profile ---")
    resp = requests.post(f"{BASE_URL}/user/profile", json=profile_data, headers=headers)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")
    return resp.status_code == 200

def test_chat(token):
    headers = {"Authorization": f"Bearer {token}"}
    print("\n--- Testing Chat Personalization ---")
    # Ask a question that should trigger a stress-related response given the profile
    resp = requests.post(f"{BASE_URL}/chat", json={"message": "I'm feeling really stressed right now."}, headers=headers)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"AI Response: {resp.json()['response']}")
    else:
        print(f"Error: {resp.text}")

def test_insight(token):
    headers = {"Authorization": f"Bearer {token}"}
    print("\n--- Testing Daily Insight Fallback ---")
    # Assuming no logs for this user yet
    resp = requests.get(f"{BASE_URL}/chat/daily-insight", headers=headers) # Note: endpoint is actually /chat/daily-insight now? No in router it's @router.get("/daily-insight") under prefix /chat so yes.
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Insight: {data['insight']}")
        print(f"Has Data: {data['has_data']}")
        print(f"Focus Index: {data['focus_index']}")
    else:
        print(f"Error: {resp.text}")

if __name__ == "__main__":
    token = login()
    if token:
        print("Login successful")
        if submit_profile(token):
            test_chat(token)
            test_insight(token)
    else:
        print("Could not authenticate")
