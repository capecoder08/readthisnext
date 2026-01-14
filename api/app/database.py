import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def get_supabase_client(access_token: Optional[str] = None) -> Client:
    """
    Get Supabase client with optional access token for authenticated requests.
    If access_token is provided, it will be used for authentication via headers.
    Otherwise, uses service role key for admin operations.
    
    Note: The Supabase Python client uses RLS (Row Level Security) policies.
    When using the anon key with a user token, RLS will enforce user-specific access.
    We'll set the authorization header on the postgrest client.
    """
    if access_token:
        # Create client with anon key
        client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        # Set the authorization header on the postgrest client
        # This allows RLS to work correctly with the user's token
        if hasattr(client, 'postgrest') and hasattr(client.postgrest, 'session'):
            client.postgrest.session.headers.update({
                "Authorization": f"Bearer {access_token}",
                "apikey": SUPABASE_ANON_KEY
            })
        return client
    else:
        # Use service role key for admin operations (bypasses RLS)
        return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

