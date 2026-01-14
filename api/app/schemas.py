from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


# User Profile Schemas
class TasteProfileGenre(BaseModel):
    name: str
    percentage: int = Field(ge=0, le=100)


class TasteProfile(BaseModel):
    genres: List[TasteProfileGenre]
    tropes: List[str]


class ReadingGoal(BaseModel):
    target: int
    current: int
    year: int


class UserProfile(BaseModel):
    id: str
    display_name: str
    avatar_url: Optional[str] = None
    taste_profile: TasteProfile
    reading_goal: ReadingGoal
    created_at: datetime
    updated_at: datetime


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    taste_profile: Optional[TasteProfile] = None
    reading_goal: Optional[ReadingGoal] = None


# Library Schemas
class BookGenre(BaseModel):
    genre: str


class BookTrope(BaseModel):
    trope: str


class Book(BaseModel):
    id: str
    title: str
    author: str
    cover_image_url: Optional[str] = None
    description: Optional[str] = None
    genres: List[str] = []
    tropes: List[str] = []
    created_at: datetime


class LibraryBook(Book):
    status: str  # 'want_to_read', 'reading', 'read'
    rating: Optional[int] = Field(None, ge=1, le=5)
    date_added: datetime


class LibraryResponse(BaseModel):
    books: List[LibraryBook]
    has_library: bool
    counts: dict


class AddBookRequest(BaseModel):
    title: str
    author: str
    status: str = "want_to_read"  # 'want_to_read', 'reading', 'read'
    rating: Optional[int] = Field(None, ge=1, le=5)
    cover_image_url: Optional[str] = None
    description: Optional[str] = None
    genres: Optional[List[str]] = []
    tropes: Optional[List[str]] = []


class AddBookResponse(BaseModel):
    success: bool
    book_id: Optional[str] = None
    message: Optional[str] = None


class DeleteBookResponse(BaseModel):
    success: bool
    message: str

