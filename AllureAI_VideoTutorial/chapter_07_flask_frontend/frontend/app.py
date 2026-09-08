"""
app.py

A deliberately small Flask app. Its only job is to serve one HTML page
and its JavaScript/CSS. All the real work - fetching reports, test
cases, steps, attachments - happens in the browser, talking directly
to the FastAPI backend from Chapter 6.

Run it with:
    python app.py

Then open http://127.0.0.1:5050 in a browser. Make sure the Chapter 6
backend is ALSO running (in backend_api/, on port 8834) before you do.
"""
from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html", api_base_url="http://127.0.0.1:8834")


if __name__ == "__main__":
    app.run(port=5050, debug=True)
