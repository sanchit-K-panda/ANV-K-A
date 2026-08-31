import asyncio
import httpx
import os
import logging
from datetime import datetime, timezone

from app.models.base import AsyncSessionLocal
from app.ingestion.service import ingest_batch
from app.schemas.ingestion import BatchIngestRequest, EventIngest
from app.api.stream import new_data_event

logger = logging.getLogger("BlockchainPoller")

VERCEL_URL = "https://cpb-alpha.vercel.app/api/soc/events"
API_KEY = "cpb_live_sk_sih2026_soc_detect_all"
CURSOR_FILE = ".blockchain_cursor.txt"
POLL_INTERVAL_SEC = 10

def get_last_timestamp():
    if os.path.exists(CURSOR_FILE):
        with open(CURSOR_FILE, "r") as f:
            return f.read().strip()
    return None

def save_last_timestamp(ts):
    with open(CURSOR_FILE, "w") as f:
        f.write(ts)

async def poll_loop():
    logger.info("Starting native blockchain polling agent...")
    async with httpx.AsyncClient() as client:
        while True:
            last_ts = get_last_timestamp()
            url = VERCEL_URL
            if last_ts:
                url += f"?since={last_ts}"
            
            try:
                # Fetch from Vercel
                resp = await client.get(url, headers={"X-API-Key": API_KEY}, timeout=10.0)
                if resp.status_code == 200:
                    data = resp.json()
                    events_raw = data.get("events", [])
                    
                    if events_raw:
                        logger.info(f"Fetched {len(events_raw)} new blockchain events.")
                        
                        valid_events = []
                        for e in events_raw:
                            try:
                                valid_events.append(EventIngest.model_validate(e))
                            except Exception as ex:
                                logger.error(f"Error parsing event: {ex}")
                        
                        if valid_events:
                            req = BatchIngestRequest(events=valid_events)
                            async with AsyncSessionLocal() as db:
                                try:
                                    counts = await ingest_batch(db, req)
                                    logger.info(f"Successfully ingested {counts.get('events', 0)} events into SOC database natively.")
                                    
                                    # Update cursor
                                    latest_ts = max(e["timestamp"] for e in events_raw)
                                    save_last_timestamp(latest_ts)
                                    
                                    # Trigger SSE Notification to Frontend Dashboard!
                                    new_data_event.set()
                                except Exception as e:
                                    logger.error(f"Failed to ingest to SOC DB natively: {e}")
                else:
                    logger.error(f"Failed to fetch from Vercel: {resp.status_code} {resp.text}")
                    
            except Exception as e:
                # Use debug for standard polling errors like connection drops to avoid spamming logs
                logger.debug(f"Polling error: {e}")
                
            await asyncio.sleep(POLL_INTERVAL_SEC)
