import asyncio
import httpx
import os
import json
import logging
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("BlockchainPoller")

VERCEL_URL = "https://cpb-alpha.vercel.app/api/soc/events"
SOC_INGEST_URL = "http://localhost:8000/api/ingestion/events"
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

async def poll():
    logger.info("Starting blockchain polling agent...")
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
                    events = data.get("events", [])
                    
                    if events:
                        logger.info(f"Fetched {len(events)} new blockchain events.")
                        
                        # Post to SOC
                        soc_resp = await client.post(SOC_INGEST_URL, json=events)
                        if soc_resp.status_code in (200, 201):
                            logger.info(f"Successfully ingested {len(events)} events into SOC.")
                            
                            # Update cursor to the latest timestamp in the batch
                            latest_ts = max(e["timestamp"] for e in events)
                            save_last_timestamp(latest_ts)
                        else:
                            logger.error(f"Failed to ingest to SOC: {soc_resp.status_code} {soc_resp.text}")
                else:
                    logger.error(f"Failed to fetch from Vercel: {resp.status_code} {resp.text}")
                    
            except Exception as e:
                logger.error(f"Polling error: {e}")
                
            await asyncio.sleep(POLL_INTERVAL_SEC)

if __name__ == "__main__":
    asyncio.run(poll())
