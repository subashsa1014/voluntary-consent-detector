"""Database Initialization Script for Voluntary Consent Detector

This script initializes the PostgreSQL database with all required tables
and creates sample data for testing.

Usage:
    python backend/app/init_db.py
    
Environment Variables:
    DATABASE_URL: PostgreSQL connection string
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from uuid import uuid4

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.database import Base, User, ConsentRecord, ConsentForm

def init_database():
    """Initialize the database with tables and sample data"""
    
    # Get database URL from environment or use default
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/consent_detector"
    )
    
    print(f"🔄 Connecting to database: {DATABASE_URL}")
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL, echo=False)
        
        # Test connection
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            print("✅ Database connection successful")
        
        # Create all tables
        print("📊 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully")
        
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        
        try:
            # Check if sample data exists
            existing_users = session.query(User).count()
            
            if existing_users == 0:
                print("\n📝 Creating sample data...")
                
                # Create sample users
                sample_users = [
                    User(
                        email="user1@example.com",
                        full_name="John Doe",
                        phone_number="+91-9999999999",
                        is_active=True
                    ),
                    User(
                        email="user2@example.com",
                        full_name="Jane Smith",
                        phone_number="+91-8888888888",
                        is_active=True
                    ),
                    User(
                        email="user3@example.com",
                        full_name="Raj Patel",
                        phone_number="+91-7777777777",
                        is_active=True
                    ),
                ]
                
                for user in sample_users:
                    session.add(user)
                
                session.commit()
                print(f"✅ Created {len(sample_users)} sample users")
                
                # Create sample consent records
                user1 = session.query(User).filter(
                    User.email == "user1@example.com"
                ).first()
                
                if user1:
                    sample_consent = ConsentRecord(
                        user_id=user1.id,
                        document_type="Property Sale Deed",
                        document_hash="abc123def456",
                        detected_emotion="neutral",
                        emotion_confidence=0.87,
                        voice_sentiment="positive",
                        voice_confidence=0.92,
                        user_consent=True,
                        consent_timestamp=datetime.utcnow(),
                        consent_duration_seconds=45,
                        data_usage_purpose="Document Registration Verification",
                        data_retention_period="7 years",
                        right_to_withdraw=True,
                        jurisdiction="India",
                        digital_signature="SIGNATURE_HASH_HERE",
                        signature_algorithm="SHA-256",
                        verification_status="verified"
                    )
                    session.add(sample_consent)
                    session.commit()
                    print("✅ Created sample consent record")
                
                # Create sample consent form
                sample_form = ConsentForm(
                    form_name="India Digital Consent Form",
                    jurisdiction="India",
                    form_version="1.0.0",
                    form_template={
                        "title": "Voluntary Consent for Document Registration",
                        "fields": [
                            {"name": "full_name", "type": "text", "required": True},
                            {"name": "email", "type": "email", "required": True},
                            {"name": "phone", "type": "tel", "required": True},
                            {"name": "consent_check", "type": "checkbox", "required": True},
                        ]
                    },
                    required_fields=["full_name", "email", "phone", "consent_check"],
                    optional_fields=["address"],
                    is_active=True
                )
                session.add(sample_form)
                session.commit()
                print("✅ Created sample consent form")
            else:
                print(f"\n📊 Database already contains {existing_users} users. Skipping sample data creation.")
            
            # Print statistics
            total_users = session.query(User).count()
            total_consents = session.query(ConsentRecord).count()
            total_forms = session.query(ConsentForm).count()
            
            print("\n" + "="*50)
            print("📈 Database Statistics:")
            print(f"   • Total Users: {total_users}")
            print(f"   • Total Consent Records: {total_consents}")
            print(f"   • Total Consent Forms: {total_forms}")
            print("="*50)
            
            print("\n✨ Database initialization completed successfully!")
            print("\n🚀 You can now run the application:")
            print("   python -m uvicorn app.main:app --reload")
            
        finally:
            session.close()
    
    except Exception as e:
        print(f"\n❌ Error initializing database:")
        print(f"   {type(e).__name__}: {str(e)}")
        print("\n💡 Make sure PostgreSQL is running and DATABASE_URL is correct.")
        sys.exit(1)

if __name__ == "__main__":
    print("\n🗄️  Voluntary Consent Detector - Database Initialization")
    print("="*50)
    init_database()
