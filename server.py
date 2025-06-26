from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json

    print("Received Data:", data)  # Debugging

    if not data or "expression" not in data:
        return jsonify({"error": "Invalid Request Format"}), 400

    expression = data.get("expression")

    try:
        result = eval(expression, {"__builtins__": None}, {
            "sin": math.sin, "cos": math.cos, "tan": math.tan,
            "asin": lambda x: math.asin(x) * 180 / math.pi,  # Convert to degrees
            "acos": lambda x: math.acos(x) * 180 / math.pi,  # Convert to degrees
            "atan": lambda x: math.atan(x) * 180 / math.pi,  # Convert to degrees
            "sinh": math.sinh, "cosh": math.cosh, "tanh": math.tanh,
            "asinh": math.asinh, "acosh": math.acosh, "atanh": math.atanh,
            "sqrt": math.sqrt,
            "cbrt": lambda x: x ** (1/3),  # Correct cube root function
            "log": math.log, "log10": math.log10,
            "factorial": math.factorial, "abs": abs,
            "pi": math.pi, "e": math.e
        })

        return jsonify({"result": result})
    except Exception as e:
        print("Error:", str(e))  # Debugging
        return jsonify({"error": "Invalid Expression"}), 400

if __name__ == '__main__':
    print("Calculator is ready")  # Debugging message
    app.run(debug=True)
