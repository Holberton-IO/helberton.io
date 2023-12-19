FROM python:3.9
WORKDIR /app
COPY . /app
RUN pip install -r /app/req.txt
CMD ["python3", "server.py"]
