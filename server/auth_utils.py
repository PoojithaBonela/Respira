import bcrypt
import secrets

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # bcrypt.checkpw requires bytes
    try:
        # Ensure input is bytes
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
            
        return bcrypt.checkpw(plain_password, hashed_password)
    except Exception as e:
        print(f"Error checking password: {e}")
        return False

def get_password_hash(password: str) -> str:
    # bcrypt.hashpw requires bytes and returns bytes
    if isinstance(password, str):
        password = password.encode('utf-8')
        
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt)
    return hashed.decode('utf-8')

import re

def validate_password_strength(password: str, email: str = "") -> tuple[bool, str]:
    """
    Validates password against strict rules:
    - Min 8 chars
    - 1 uppercase, 1 lowercase, 1 number, 1 special char
    - No spaces
    - No email/localpart inside
    - No repeats > 3
    - No common passwords
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    
    if len(password) > 128: # Reasonable max limit
        return False, "Password is too long."

    # Character sets
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number."
    if not re.search(r'[!@#$%^&*()\-_+=.<,>?/:;]', password):
        return False, "Password must contain at least one special character (!@#$%^&*()-_+=.<,>?/:;)."
    
    # Disallowed
    if ' ' in password:
        return False, "Password must not contain spaces."
    
    # Repetitions (e.g., 'aaaa') - check for 4 or more
    if re.search(r'(.)\1{3,}', password):
        return False, "Password must not contain repeated characters more than 3 times."

    # Email/Username check
    if email:
        local_part = email.split('@')[0]
        if local_part.lower() in password.lower() and len(local_part) > 3:
             return False, "Password should not contain your email username."
        if email.lower() in password.lower():
             return False, "Password should not contain your email."

    # Common passwords (tiny subset for example)
    common_passwords = ["password", "123456", "qwerty", "12345678", "admin123"]
    if password.lower() in common_passwords:
        return False, "Password is too common."

    return True, ""

def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)
