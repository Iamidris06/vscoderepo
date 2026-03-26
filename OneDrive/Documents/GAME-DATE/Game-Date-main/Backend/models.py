from pydantic import BaseModel, Field
from typing   import List, Optional
from enum     import Enum

class Platform(str, Enum):
    PC           = "PC"
    PlayStation  = "PlayStation"
    Xbox         = "Xbox"
    Mobile       = "Mobile"
    Switch       = "Switch"

class PlayStyle(str, Enum):
    Casual      = "Casual"
    Competitive = "Competitive"
    Both        = "Both"

class PlayTime(str, Enum):
    Morning   = "Morning"
    Afternoon = "Afternoon"
    Evening   = "Evening"
    Night     = "Night"
    Anytime   = "Anytime"

class Gender(str, Enum):
    Male   = "Male"
    Female = "Female"


# Used when CREATING a user (input)
class UserCreate(BaseModel):
    name      : str
    age       : int
    bio       : Optional[str] = ""
    gender    : Gender        = Gender.Male 
    platform  : Platform      = Platform.PC
    games     : List[str]     = []
    genres    : List[str]     = []
    playStyle : PlayStyle     = PlayStyle.Casual
    playTime  : PlayTime      = PlayTime.Night

# Used when RETURNING a user (output) — includes id and likes
class UserOut(UserCreate):
    id    : str
    likes : int = 0
