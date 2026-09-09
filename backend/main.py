from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()


@app.get("/health")
async def health_check():
    return JSONResponse({"status": "ok"})
