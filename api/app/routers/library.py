from fastapi import APIRouter, Depends, HTTPException, status, Path
from app.auth import get_current_user
from app.database import get_supabase_client
from app.schemas import (
    LibraryResponse,
    LibraryBook,
    AddBookRequest,
    AddBookResponse,
    DeleteBookResponse
)
from typing import List

router = APIRouter()


@router.get("", response_model=LibraryResponse)
async def get_user_library(current_user: dict = Depends(get_current_user)):
    """
    Get the current user's library with all books and their status.
    """
    supabase = get_supabase_client(access_token=current_user["token"])
    user_id = current_user["id"]
    
    try:
        # Get library entries with book details
        library_response = supabase.table("user_library").select(
            """
            id,
            status,
            rating,
            added_at,
            books (
                id,
                title,
                author,
                cover_image_url,
                description
            )
            """
        ).eq("user_id", user_id).order("added_at", desc=True).execute()
        
        library_entries = library_response.data or []
        
        # Get genres and tropes for each book
        books: List[LibraryBook] = []
        
        for entry in library_entries:
            if not entry.get("books"):
                continue
            
            book = entry["books"]
            book_id = book["id"]
            
            # Get genres
            genres_response = supabase.table("book_genres").select("genre").eq("book_id", book_id).execute()
            genres = [item["genre"] for item in genres_response.data or []]
            
            # Get tropes
            tropes_response = supabase.table("book_tropes").select("trope").eq("book_id", book_id).execute()
            tropes = [item["trope"] for item in tropes_response.data or []]
            
            from datetime import datetime
            created_at = book.get("created_at")
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            
            date_added = entry.get("added_at")
            if isinstance(date_added, str):
                date_added = datetime.fromisoformat(date_added.replace('Z', '+00:00'))
            
            books.append(LibraryBook(
                id=book["id"],
                title=book["title"],
                author=book["author"],
                cover_image_url=book.get("cover_image_url"),
                description=book.get("description"),
                genres=genres,
                tropes=tropes,
                created_at=created_at,
                status=entry["status"],
                rating=entry.get("rating"),
                date_added=date_added
            ))
        
        # Calculate counts
        counts = {
            "total": len(books),
            "reading": len([b for b in books if b.status == "reading"]),
            "want_to_read": len([b for b in books if b.status == "want_to_read"]),
            "read": len([b for b in books if b.status == "read"])
        }
        
        return LibraryResponse(
            books=books,
            has_library=len(books) > 0,
            counts=counts
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch library: {str(e)}"
        )


@router.post("", response_model=AddBookResponse)
async def add_book_to_library(
    book_request: AddBookRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Add a book to the user's library. If the book doesn't exist, it will be created.
    If the book is already in the library, it will be updated.
    """
    supabase = get_supabase_client(access_token=current_user["token"])
    user_id = current_user["id"]
    
    try:
        # Check if book already exists
        existing_book_response = supabase.table("books").select("id").eq("title", book_request.title).eq("author", book_request.author).execute()
        
        book_id = None
        if existing_book_response.data:
            book_id = existing_book_response.data[0]["id"]
        else:
            # Create new book
            new_book_data = {
                "title": book_request.title,
                "author": book_request.author,
            }
            
            if book_request.cover_image_url:
                new_book_data["cover_image_url"] = book_request.cover_image_url
            
            if book_request.description:
                new_book_data["description"] = book_request.description
            
            new_book_response = supabase.table("books").insert(new_book_data).select("id").single().execute()
            
            if not new_book_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create book"
                )
            
            book_id = new_book_response.data["id"]
            
            # Add genres if provided
            if book_request.genres:
                genre_entries = [
                    {"book_id": book_id, "genre": genre}
                    for genre in book_request.genres
                ]
                supabase.table("book_genres").insert(genre_entries).execute()
            
            # Add tropes if provided
            if book_request.tropes:
                trope_entries = [
                    {"book_id": book_id, "trope": trope}
                    for trope in book_request.tropes
                ]
                supabase.table("book_tropes").insert(trope_entries).execute()
        
        # Check if book is already in user's library
        existing_library_response = supabase.table("user_library").select("id").eq("user_id", user_id).eq("book_id", book_id).execute()
        
        library_data = {
            "user_id": user_id,
            "book_id": book_id,
            "status": book_request.status,
            "rating": book_request.rating
        }
        
        if existing_library_response.data:
            # Update existing entry
            library_id = existing_library_response.data[0]["id"]
            supabase.table("user_library").update({
                "status": book_request.status,
                "rating": book_request.rating
            }).eq("id", library_id).execute()
        else:
            # Insert new entry
            supabase.table("user_library").insert(library_data).execute()
        
        return AddBookResponse(
            success=True,
            book_id=book_id,
            message="Book added to library successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add book: {str(e)}"
        )


@router.delete("/{book_id}", response_model=DeleteBookResponse)
async def delete_book_from_library(
    book_id: str = Path(..., description="The ID of the book to remove from library"),
    current_user: dict = Depends(get_current_user)
):
    """
    Remove a book from the user's library.
    """
    supabase = get_supabase_client(access_token=current_user["token"])
    user_id = current_user["id"]
    
    try:
        # Check if book exists in user's library
        library_entry_response = supabase.table("user_library").select("id").eq("user_id", user_id).eq("book_id", book_id).execute()
        
        if not library_entry_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found in library"
            )
        
        # Delete the library entry
        supabase.table("user_library").delete().eq("user_id", user_id).eq("book_id", book_id).execute()
        
        return DeleteBookResponse(
            success=True,
            message="Book removed from library successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete book: {str(e)}"
        )

