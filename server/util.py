import json
import pickle
import  numpy as np
__locations = None
__data_columns= None
__model = None

def get_estimated_price(Place,Sqft,Bath,Beds):
    try:
        loc_index = __data_columns.index(Place.lower())
    except:
        loc_index = -1

    x = np.zeros(len(__data_columns))
    x[2] = Sqft
    x[1] = Bath
    x[0] = Beds
    if loc_index >= 0:
        x[loc_index] = 1
    return round(__model.predict([x])[0],2)
def get_location_names():
    return __locations


def load_saved_artifacts():
    print("loading saved artifacts...")
    global __data_columns
    global __locations
    global __model
    with open("./artifacts/columns.json") as f:
        __data_columns=json.load(f)['data_columns']
        __locations=__data_columns[3:]

    with open("./artifacts/USA_House_Model.pickle",'rb') as f:
        __model= pickle.load(f)
    print("loaded saved artifacts...")
if __name__== '__main__':
    load_saved_artifacts()
    print(get_location_names())
    print(get_estimated_price('North Glenmore Park',1500,3,5))