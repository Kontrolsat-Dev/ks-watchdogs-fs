class RunsWriteRepo:
    def __init__(self, db):
        self.db = db

    def insert_run(self, check_name: str, status: str, duration_ms: int, payload_json: dict | None) -> int:
        ...
