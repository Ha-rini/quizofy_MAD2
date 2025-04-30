class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    SECURITY_LOGIN_ENDPOINT = None #disable the default login endpoint of flask-security

class LocalDevelopmentConfig(Config):
    #configuration for local development
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.db"
    DEBUG = True

    #config for security
    SECRET_KEY = "mysecretkey" #change this to a random string - for hashing
    SECURITY_PASSWORD_HASH = "bcrypt" #mechanism to hash passwords
    SECURITY_PASSWORD_SALT = "MYSALT" #change this to a random string - for adding salt
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authorization-Token"