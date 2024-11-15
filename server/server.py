from flask import Flask, request, jsonify
import util
from flask_cors import CORS
util.load_saved_artifacts()

app = Flask(__name__)

@app.route('/get_location_names',methods=['GET'])
def get_location_names():
    response= jsonify({
        'locations': util.get_location_names()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/predict_price', methods=['GET','POST'])
def predict_price():
    Sqft = float(request.form['Sqft'])
    Place = request.form['Place']
    Bath = int (request.form['Bath'])
    Beds = int(request.form['Beds'])
    response = jsonify({
        'estimated_price': util.get_estimated_price(Place, Sqft, Bath, Beds)
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
if __name__=="__main__":
    print("Starting Python Flask")
    app.run()