from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import(
    JWTManager, jwt_required, create_access_token, get_jwt_identity
)

# back-ened instances
app = Flask(__name__)
CORS(app)

# landing page
@app.route("/login", methods = ["GET"])
def landing_page():
    return jsonify({"message": "running good"})


@app.route("/test", methods = ["GET"])
def landing_page():
    return jsonify({"message": "running good"})

# running on development mode
if __name__ == "__main__":
    app.run(debug=True, port=8080)