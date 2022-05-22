import stanza
import sys
import os
import re
import json
import pickle
punctuation = set(""")⁄;(€!‘¨·£‰‐_§⁂∴<~«°¦%•¶`?\\—»‒№#.¡′※†₪‡¬☞’:+,[␠¤^{/¿¢‱”@}]=&–―₩‽-…"'>*“¥|$""")


path = sys.argv[1]
path = re.sub(r"\\", "/", path)

nlpit = stanza.Pipeline("it", dir=sys.argv[2], use_gpu=True, pos_batch_size=1000, depparse_batch_size=400)
try:
    string = open(path, "r", encoding = "utf8").read().strip()
except UnicodeDecodeError:
    string = open(path, "r", encoding = "latin1").read().strip()

print("...processing with Stanza") 
doc = nlpit(string)

def toksinsent(sent_, tokens = True):
    if tokens:
        return " ".join([i.text for i in sent_.tokens])
    else:
        return " ".join([i.text for i in sent_.words])

def stanza_annotation(doc_, css_info=""):

#### TODO: eliminate &nbsp at the beginning of the sentence 
    new_txt=f'<html><head>{css_info}<meta charset="UTF-8"></head><body>'
    nsent=1
    
    for sent in doc_.sentences:
        new_txt+="<span class='sentence' id='s" + str(nsent) +"'>"
        new_sent=""
        for tok in sent.tokens:
            try:
                if tok.text not in punctuation:
                    if len(tok.id) == 1:
                        tok_id = "-".join([str(i) for i in tok.id])
                        new_sent+=f"<span>&nbsp</span><span class='word' id='s{nsent}_w{tok_id}'>{tok.text}</span>"
                    else:
                        word = tok.to_dict()[0]
                        mwt_id = "-".join([str(i) for i in word["id"]])
                        mwt_text = word["text"]
                        new_sent+=f"<span>&nbsp</span><span class='mwt' id='s{nsent}_w{mwt_id}'>{mwt_text}</span>"
                        

                else:
                    tok_id = "-".join([str(i) for i in tok.id])
                    new_sent+=f"<span>&nbsp</span><span class='word' id='s{nsent}_w{tok_id}'>{tok.text}</span>"
            except Exception as e:
                print(tok.text, e)
                
        new_txt+= new_sent + "</span><span><br></span>" + "\n"
        nsent+=1
    return(new_txt + "</body><html>")



def generate_d_from_stanza(doc_):
  c = 1
  d = {}
  for sent in doc_.sentences:
    out = {}
    for d_temp in sent.to_dict():
      try:
        if "feats" in d_temp:
          features = [tuple(i.split("=")) for i in d_temp["feats"].split("|")]
          d_temp.pop("feats")
          for key,val in features:
            d_temp[key.lower()] = val
            d_temp["ismwt"] = False
          out[f"s{str(c)}_w{d_temp['id']}"]= d_temp
        elif isinstance(d_temp['id'], tuple):
          newid = "-".join([str(i) for i in d_temp['id']])
          d_temp["ismwt"] = True
          d_temp["sub_ids"] = d_temp["id"]
          out[f"s{str(c)}_w{newid}"] = d_temp
        else:
          d_temp["ismwt"] = False
          out[f"s{str(c)}_w{d_temp['id']}"] = d_temp
          
      except KeyError:
        print(d_temp)
    d["s"+str(c)] = out # modifies version
    # d["sent_"+str(c)] = out ù previous version 
    c += 1
  return d

print("...processing the html and json data")
html_data = stanza_annotation(doc)
json_data = generate_d_from_stanza(doc)


if len(path.split("/"))>1:
    objname = re.sub(".txt", "", path.split("/")[-1])
    path_to_folder = "/".join(path.split("/")[:-1])+"/"
    with open(f"{path_to_folder}/{objname}.json", "w", encoding ="utf8") as jout:
        json.dump(json_data, jout)
    with open(f"{path_to_folder}/{objname}.html", "w", encoding ="utf8") as hout:
        hout.writelines(html_data)
    with open(f"{path_to_folder}/{objname}.pkl", "wb") as pklout:
        pickle.dump(doc, pklout)
    print(f"... files saved in {path_to_folder[:-1]}")
else:
    objname = re.sub(".txt", "", path)
    path_to_folder = objname
    try:
        os.mkdir(path_to_folder)
        print(f"...saving  files in {path_to_folder}")
        with open(f"{path_to_folder}/{objname}.json", "w", encoding ="utf8") as jout:
            json.dump(json_data, jout)
        with open(f"{path_to_folder}/{objname}.html", "w", encoding ="utf8") as hout:
            hout.writelines(html_data)
        with open(f"{path_to_folder}/{objname}.pkl", "wb") as pklout:
            pickle.dump(doc, pklout)
    except FileExistsError:
        print("file/path name Error: your file and a folder with the same name exist in the same directory") 
        
    


# def stanza_annotation_old(doc_, css_info=""):

# #### TODO: eliminate &nbsp at the beginning of the sentence 
#     new_txt=f'<html><head>{css_info}<meta charset="UTF-8"></head><body>'
#     nsent=1
    
#     for sent in doc_.sentences:
#       new_txt+="<span class='sentence' id='s" + str(nsent) +"'>"
#       new_sent=""
#       for tok in sent.words:
#         if tok.pos != "PUNCT":
#           new_sent+=f"<span>&nbsp</span><span class='word' id='s{nsent}_w{tok.id}'>{tok.text}</span>"
#         else:
#           new_sent+=f"<span class='word' id='s{nsent}_w{tok.id}'>{tok.text}</span>"

#       new_txt+= new_sent + "</span><span><br></span>" + "\n"
#       nsent+=1
#     return(new_txt + "</body><html>")
