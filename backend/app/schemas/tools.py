# -------------------------------c
# PDA
# -------------------------------
from pydantic import BaseModel


class Report(BaseModel):
    id: str
    code: str
    message: str
    context_json: str
    error_text: str
    stack_text: str
    log_mode: str
    ts_client: str
    state: str
    date_add: str
    date_upd: str