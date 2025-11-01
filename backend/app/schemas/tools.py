# -------------------------------c
# PDA
# -------------------------------
from pydantic import BaseModel

class Report(BaseModel):
    id: int
    code: str
    message: str
    context_json: str
    error_text: str
    stack_text: str
    log_mode: str
    ts_client: str
    state: str
    date_added: str
    date_updated: str