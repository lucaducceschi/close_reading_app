from flask import Flask, escape, request, jsonify
import sys
import os
import json
import utils
import pickle


app = Flask(__name__)

@app.route('/health')
def health():
    version = request.args.get("v", "2020-feb")
    if not version:
        return f'py-pypeline healthy!'
    return f'py-pipeline {escape(version)} healthy'

@app.route("/listtexts")
def listtexts():
    return json.load(open("texts/texts.json"))

@app.route("/lstextfolder")
def lstextfolder():
    return "\n".join([i for i in os.listdir("texts") if os.path.isdir(f"texts/{i}")])


@app.route("/getdocument")
def getdocument():
    """TODO: add 440 in case file does not exist"""

    fname = request.args.get("doc")
    path = f"texts/{fname}/{fname}.html"
    return open(path, encoding="utf8").read()
    #return open(f"texts/{doc}").read()

@app.route("/lstexts")
def lstexts():
    dirname = request.args.get("dirname")
    return "\n".join(os.listdir(f"texts/{dirname}"))

@app.route("/gettokeninfo")
def gettokeninfo():
    fname = request.args.get("doc")
    path = f"texts/{fname}/{fname}.json"
    tokenid = request.args.get("token")
    sentid = tokenid.split("_")[0]
    d = json.load(open(path))
    return d[sentid][tokenid]

@app.route("/getpos",methods=['POST'])
def getpos():
    out = []
    request_data = request.get_json()
    pos = request_data["upos"]
    fname =request_data["id_text"]
    text = json.load(open(f"texts/{fname}/{fname}.json"))
    for s_id, s_dict in text.items():
        for w_id, w_dict in s_dict.items():
            try:
                if w_dict["upos"] == pos:
                    out.append(w_id)
            except KeyError:
                pass
    return " ".join(out)
    #return text

@app.route("/getfilter", methods=["POST"])
def getfilter():
    
    out = []
    request_data = request.get_json()
    keys = {key:val for key,val in request_data.items() if val and key !="id_text" }
    fname =request_data["id_text"]
    text = json.load(open(f"texts/{fname}/{fname}.json"))
    
    for s_id, s_properties in text.items():
        for w_id, w_dict in s_properties["dict"].items():
            if all((key,val) in w_dict.items() for key,val in keys.items()):
                out.append(w_id)
                print(w_dict["text"])
     
    return " ".join(out)


@app.route("/getsentence", methods=["POST"])
def getsentence():
    """It accepts a json with two possible fields: 'stype' (a list of sentence types) and 'word_ids' (a list of ids 
    of words sent by another filter) and returns the ids of the matching sentences as a string """
    out = {"s_ids": []}
    request_data = request.get_json()
    keys = {key:val for key,val in request_data.items() if val and key !="id_text" }
    fname =request_data["id_text"]
    text = json.load(open(f"texts/{fname}/{fname}.json"))

    if "word_ids" in keys:
        for s_id, s_properties in text.items():
            if s_properties["stype"] in keys["s_types"]:
                words_in_sents = set(keys["word_ids"]).intersection(s_properties["dict"])
                if words_in_sents:
                    out["s_ids"].append(s_id)

                
                
    
    else:
        for s_id, s_properties in text.items():
            if s_properties["stype"] in keys["s_types"]:
                out["s_ids"].append(s_id)



    return " ".join(out["s_ids"])




@app.route("/getsequence", methods=["POST"])
def getsequence():
    out = {}
    request_data = request.get_json()
    keys = {key:val for key,val in request_data.items() if val and key !="id_text" }
    fname =request_data["id_text"]
    text = json.load(open(f"texts/{fname}/{fname}.json"))
    distance = request_data["distance"]

    a = {s.split("_")[0]:[] for s in request_data["after"]}
    for s in request_data["after"]:
        key,val = s.split("_")
        a[key].append(int(val[1:]))

    b = {s.split("_")[0]:[] for s in request_data["before"]}
    for s in request_data["before"]:
        key,val = s.split("_")
        b[key].append(int(val[1:]))

    intersections = set(a).intersection(b)
    out = {key:[] for key in intersections}
    for key in intersections:
        for val_a, val_b in zip(a[key], b[key]):
            if val_b - val_a <= distance:
                out[key].append([f"{key}_w{val_a}", f"{key}_w{val_b}"])

    return out

                



if __name__ == "__main__":
    app.run(debug=True)

