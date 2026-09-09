from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from utils import calculate, calculate_bmi, format_name, is_palindrome, validate_email

app = FastAPI()


@app.get("/health")
async def health_check():
    return JSONResponse({"status": "ok"})


@app.get("/calculate")
async def calculate_endpoint(a: float, b: float, operation: str):
    try:
        result = calculate(a, b, operation)
        return JSONResponse({"result": result})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ZeroDivisionError:
        raise HTTPException(status_code=400, detail="Divisão por zero não é permitida")


@app.get("/validate-email")
async def validate_email_endpoint(email: str):
    try:
        is_valid = validate_email(email)
        return JSONResponse({"email": email, "valid": is_valid})
    except TypeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/format-name")
async def format_name_endpoint(first: str, last: str):
    try:
        name = format_name(first, last)
        return JSONResponse({"name": name})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/palindrome")
async def palindrome_endpoint(text: str):
    try:
        result = is_palindrome(text)
        return JSONResponse({"text": text, "is_palindrome": result})
    except TypeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/bmi")
async def bmi_endpoint(weight: float, height: float):
    try:
        result = calculate_bmi(weight, height)
        return JSONResponse({"bmi": result})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
