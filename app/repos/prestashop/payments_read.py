from sqlalchemy.orm import Session

class PaymentsReadRepo:
    def __init__(self, db:Session):
        self.db = db

    def latest_by_method(self) -> list[dict]:
        return []  # ← placeholder