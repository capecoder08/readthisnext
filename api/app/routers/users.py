from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user
from app.database import get_supabase_client
from app.schemas import UserProfile, UserProfileUpdate, TasteProfile, ReadingGoal
from typing import Dict, Any

router = APIRouter()


@router.get("/me", response_model=UserProfile)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get the current user's profile including taste profile and reading goal.
    """
    supabase = get_supabase_client(access_token=current_user["token"])
    user_id = current_user["id"]
    
    try:
        # Get profile
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        profile = profile_response.data
        
        # Get taste profile genres
        genres_response = supabase.table("user_taste_profiles").select("genre, preference_score").eq("user_id", user_id).execute()
        genres = [
            {"name": item["genre"], "percentage": item["preference_score"]}
            for item in genres_response.data
        ]
        
        # Get tropes
        tropes_response = supabase.table("user_tropes").select("trope").eq("user_id", user_id).execute()
        tropes = [item["trope"] for item in tropes_response.data]
        
        # Get reading goal for current year
        from datetime import datetime
        current_year = datetime.now().year
        goal_response = supabase.table("reading_goals").select("*").eq("user_id", user_id).eq("year", current_year).single().execute()
        
        reading_goal_data = goal_response.data if goal_response.data else {
            "target_books": 12,
            "books_read": 0,
            "year": current_year
        }
        
        from datetime import datetime
        
        created_at = profile["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        updated_at = profile["updated_at"]
        if isinstance(updated_at, str):
            updated_at = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
        
        return UserProfile(
            id=profile["id"],
            display_name=profile["display_name"] or "",
            avatar_url=profile.get("avatar_url"),
            taste_profile=TasteProfile(
                genres=genres,
                tropes=tropes
            ),
            reading_goal=ReadingGoal(
                target=reading_goal_data["target_books"],
                current=reading_goal_data["books_read"],
                year=reading_goal_data["year"]
            ),
            created_at=created_at,
            updated_at=updated_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile: {str(e)}"
        )


@router.put("/me", response_model=UserProfile)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update the current user's profile.
    """
    supabase = get_supabase_client(access_token=current_user["token"])
    user_id = current_user["id"]
    
    try:
        # Update basic profile fields
        update_data: Dict[str, Any] = {}
        
        if profile_update.display_name is not None:
            update_data["display_name"] = profile_update.display_name
        
        if profile_update.avatar_url is not None:
            update_data["avatar_url"] = profile_update.avatar_url
        
        if update_data:
            update_data["updated_at"] = "now()"
            supabase.table("profiles").update(update_data).eq("id", user_id).execute()
        
        # Update taste profile if provided
        if profile_update.taste_profile:
            # Delete existing taste profile entries
            supabase.table("user_taste_profiles").delete().eq("user_id", user_id).execute()
            supabase.table("user_tropes").delete().eq("user_id", user_id).execute()
            
            # Insert new genres
            if profile_update.taste_profile.genres:
                genre_entries = [
                    {
                        "user_id": user_id,
                        "genre": genre.name,
                        "preference_score": genre.percentage
                    }
                    for genre in profile_update.taste_profile.genres
                ]
                if genre_entries:
                    supabase.table("user_taste_profiles").insert(genre_entries).execute()
            
            # Insert new tropes
            if profile_update.taste_profile.tropes:
                trope_entries = [
                    {"user_id": user_id, "trope": trope}
                    for trope in profile_update.taste_profile.tropes
                ]
                if trope_entries:
                    supabase.table("user_tropes").insert(trope_entries).execute()
        
        # Update reading goal if provided
        if profile_update.reading_goal:
            from datetime import datetime
            current_year = profile_update.reading_goal.year or datetime.now().year
            
            goal_data = {
                "user_id": user_id,
                "year": current_year,
                "target_books": profile_update.reading_goal.target,
                "books_read": profile_update.reading_goal.current
            }
            
            # Check if goal exists
            existing = supabase.table("reading_goals").select("*").eq("user_id", user_id).eq("year", current_year).execute()
            
            if existing.data:
                supabase.table("reading_goals").update(goal_data).eq("user_id", user_id).eq("year", current_year).execute()
            else:
                supabase.table("reading_goals").insert(goal_data).execute()
        
        # Return updated profile
        return await get_user_profile(current_user)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

