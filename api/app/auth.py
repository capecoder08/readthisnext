from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.database import get_supabase_client

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """
    Verify JWT token and return current user information.
    """
    token = credentials.credentials
    
    try:
        # Create a temporary Supabase client to verify the token
        from app.database import SUPABASE_URL, SUPABASE_ANON_KEY
        from supabase import create_client
        
        client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        
        # Verify the token by getting the user
        # The get_user method accepts a JWT token directly
        response = client.auth.get_user(token)
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return {
            "id": response.user.id,
            "email": response.user.email,
            "token": token
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

