import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/stream", tags=["stream"])

# Global event triggered when the polling daemon detects new data
new_data_event = asyncio.Event()

async def event_generator():
    """Yields Server-Sent Events (SSE) whenever new data is ingested."""
    while True:
        # Wait for the poller to trigger the event
        await new_data_event.wait()
        # Clear the event so it can be triggered again
        new_data_event.clear()
        # Send the SSE message
        yield "data: new_events\n\n"

@router.get("/events")
async def stream_events():
    """SSE endpoint for live dashboards."""
    return StreamingResponse(event_generator(), media_type="text/event-stream")
