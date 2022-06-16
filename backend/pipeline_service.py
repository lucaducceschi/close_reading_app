from flask import Flask, escape, request, jsonify
import os
import json


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


#### These functions need to be refactored to respond to the new structure of the textual data 
# @app.route("/gettokeninfo")
# def gettokeninfo():
#     fname = request.args.get("doc")
#     path = f"texts/{fname}/{fname}.json"
#     tokenid = request.args.get("token")
#     sentid = tokenid.split("_")[0]
#     d = json.load(open(path))
#     return d[sentid][tokenid]

# @app.route("/getpos",methods=['POST'])
# def getpos():
#     out = []
#     request_data = request.get_json()
#     pos = request_data["upos"]
#     fname =request_data["id_text"]
#     text = json.load(open(f"texts/{fname}/{fname}.json"))
#     for s_id, s_dict in text.items():
#         for w_id, w_dict in s_dict.items():
#             try:
#                 if w_dict["upos"] == pos:
#                     out.append(w_id)
#             except KeyError:
#                 pass
#     return " ".join(out)
#     #return text

@app.route("/getfilter", methods=["POST"])
def getfilter():
    """Returns a string output containing the Ids of all the tokens that correspond to the search criteria and the number of matches per upos"""
    out = []
    upos_counts = 0
    request_data = request.get_json()
    keys = {key:val for key,val in request_data.items() if val and key !="id_text" }
    fname =request_data["id_text"]
    text = json.load(open(f"texts/{fname}/{fname}.json"))
    ## The new json structure is now {sentence_id:{word_id:word_features}, sentence_type:"decl|excl|int"}
    for s_id, s_properties in text.items(): # s_properties is assigned a value like "int", o r "decl" or "excl"
        for w_id, w_dict in s_properties["dict"].items():
            if "upos" in keys and "upos" in w_dict:
                if w_dict["upos"] == keys["upos"]:
                    upos_counts += 1
            if all((key,val) in w_dict.items() for key,val in keys.items()):
                out.append(w_id)
                print(w_dict["text"])
    

    return {"ids": " ".join(out), 
            "count": f"{len(out)}/{upos_counts}"
            }


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
    doc = json.load(open(f"texts/{fname}/{fname}.json"))
    distance = request_data["distance"] -1 # distance is minus one; that's in order to get the right sequence

    a = {s.split("_")[0]:[] for s in request_data["after"]}
    for s in request_data["after"]:
        key,val = s.split("_")
        a[key].append(int(val[1:]))

    b = {s.split("_")[0]:[] for s in request_data["before"]}
    for s in request_data["before"]:
        key,val = s.split("_")
        b[key].append(int(val[1:]))

    intersections = set(a).intersection(b)
    out = {sentid:[] for sentid in intersections}
    for sentid in intersections:
        for wordid_a, wordid_b in zip(a[sentid], b[sentid]):
            if wordid_b  <= wordid_a + distance and wordid_b > wordid_a:
                print(sentid, wordid_a, wordid_b)
                seq = [f"{sentid}_w{val}" for val in range(wordid_a, wordid_b+1)]
                out[sentid].append(seq)
                

    out = {key:val for key,val in out.items() if val != []}
    
    return out


                



if __name__ == "__main__":
    app.run(debug=True)

