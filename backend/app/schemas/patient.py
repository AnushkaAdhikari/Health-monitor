from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PatientCreate(BaseModel):
    name:   str
    age:    int
    gender: str
    ward: str
    phone: str
    blood_group: str
    address: str
    medical_history: str


class PatientResponse(PatientCreate):
    id:         int
    created_at: datetime
    # Existing records created before these fields were introduced may be blank.
    # New and updated patient submissions still use PatientCreate and require them.
    ward: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    medical_history: Optional[str] = None

    model_config = {"from_attributes": True}
