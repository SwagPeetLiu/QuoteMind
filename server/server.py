from flask import Flask, jsonify
from flask_cors import CORS

# back-ened instances
app = Flask(__name__)
CORS(app)

# landing page
@app.route("/home_info", methods = ["GET"])
def landing_page():
    return jsonify({"message": "running good"})


# running on development mode
if __name__ == "__main__":
    app.run(debug=True, port=8080)