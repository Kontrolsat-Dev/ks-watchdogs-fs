from app.external.pda_client import PdaClient
from app.schemas.tools import Report

class PdaQueryService:
    def __init__(self):
        self._pda_client = PdaClient()

    def get_pda_report(self):
        rows = self._pda_client.fetch_reports()
        return [
            Report(
                id = r['id'],
                code = r['code'],
                message = r['context_json'],
                error_text = r['error_text'],
                log_mode = r['log_mode'],
                ts_client = r['ts_client'],
                state = r['state'],
                date_add = r['date_add'],
                date_upd = r['date_upd'],
            )
            for r in rows
        ]