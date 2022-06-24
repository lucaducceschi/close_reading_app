import sys
import os
import re
import json
import pickle
punctuation = set(""")⁄;(€!‘¨·£‰‐_§⁂∴<~«°¦%•¶`?\\—»‒№#.¡′※†₪‡¬☞’:+,[␠¤^{/¿¢‱”@}]=&–―₩‽-…"'>*“¥|$""")


path = sys.argv[1]
path = re.sub(r"\\", "/", path)

dictfromtint = json.load(open(path, "r", encoding = "utf8"))
# print("...processing with Stanza") 

# print([token["word"] for sent in j["sentences"] for token in sent["tokens"]])
# print([sent["text"] for sent in j["sentences"]])

def get_dependencies(sentence):
    """Extract dependencies form a sentence in a TINT parsed json.
    Format is a dictionary {id_of_dependent: ["dependency, id_of_governor"]}"""
    return {dep["dependent"]:[dep["dep"], dep["governor"] ] for dep in sentence["basic-dependencies"]}  


print("Processing html...")
def tint2html(tintjson, css_info=""):
    """MWT putput in html: 
    <span class='mwt' id='s1_w9-10'><span class='mwt' id='s1_w9'><span class='mwt' id='s1_w10'>sulla</span></span></span>"""

    new_txt=f'<html><head>{css_info}<meta charset="UTF-8"></head><body>'
    nsent=1
    
    for nsent,sentence in enumerate(tintjson["sentences"]):
   
        new_txt+="<span class='sentence' id='s" + str(nsent) +"'>"
        new_sent=""
        for i,token in enumerate(sentence["tokens"]):
            # if token["word"] in ";,:.?!”,)»...…":
            #     print(token["word"])
    
            # taking care of mwt
            if token["isMultiwordToken"]:
                try: # only the first mwt has the key "multiwordSpan"; the exception takes care of the other parts, which can be ignored
                    multiwordspan = [int(i) for i in token["multiwordSpan"].split("-")] 
                    multiwordrange = [x for x in range(multiwordspan[0], multiwordspan[-1]+1)]
                    # with the range stored we build the n span sequence  
                    mwt_span_element = f"<span>&nbsp</span><span class='mwt' id='s{nsent}_w{token['multiwordSpan']}'>"
                    for mwt_id in  multiwordrange:
                        mwt_span_element += f"<span class='mwt' id='s{nsent}_w{mwt_id}'>"
                    mwt_span_element += token["originalText"]
                    for mwt_id in  multiwordrange:
                        mwt_span_element += f"</span>"
                    mwt_span_element += f"</span>"
                    new_sent += mwt_span_element 


                except KeyError:
                    # print(token["word"])
                    pass
            else:
                new_sent+=f"<span>&nbsp</span><span class='word' id='s{nsent}_w{token['index']}'>{token['word']}</span>"
        new_txt+= new_sent + "</span><span><br></span>" + "\n" 
        nsent+=1
    return new_txt + "</body>"
#                         tok_id = "-".join([str(i) for i in tok.id])
#                         new_sent+=f"<span>&nbsp</span><span class='word' id='s{nsent}_w{tok_id}'>{tok.text}</span>"

print("Processing close rading json...")
def tint2creadjson(tintsjon):
    """Valid values in tokens:
    ["index", 'ud_pos', pos, 'word', 'ner', 'featuresText', "lemma", "isMultiwordToken"]"""
    c = 1
    d = {}
    token_features_to_extract =  ["index", 'ud_pos', "pos", 'word', 'ner', "lemma", "isMultiwordToken"]
    for sent in tintsjon["sentences"]:
        sentenceid = f"s{c}"
        sentencedict = {}
        sentencedict["dict"] = {}
        sentencedict["id"] = sentenceid
        
        ### sentence type ###
        if "?" in sent["text"]:
            sentencedict["type"] = "int"
        elif "!" in sent["text"]:
            sentencedict["type"] = "excl"
        else:
            sentencedict["stype"] = "decl"
        
       
        deps = get_dependencies(sent)
        for token in sent["tokens"]:
            tokenid = f"s{c}_w{token['index']}"
            # Non multiword
            if not token.get("isMultiwordFirstToken"):
                
                ### common token features ###
                tokendict = {key:token[key] for key in token_features_to_extract}
                dependency, governor = deps[token["index"]]
                tokendict["head"] = governor
                tokendict["deprel"] = dependency

                ### Morphological features
                if "featuresText" in token:
                    if token["featuresText"] != "" and token["featuresText"] != "_":
                        features = [tuple(feats.split("=")) for feats in token["featuresText"].split("|")]
                        for key,val in features:
                            tokendict[key.lower()] = val

                
            else:
                # MWT global token
                tokendict = {"index": token["multiwordSpan"].split("-")}
                tokendict["text"] = token["originalText"]
                sentencedict["dict"][f"s{c}_w{token['multiwordSpan']}"] = tokendict
                
                # MWT first token
                tokendict = {key:token[key] for key in token_features_to_extract}
                dependency, governor = deps[token["index"]]
                tokendict["head"] = governor
                
                if "featuresText" in token:
                    if token["featuresText"] != "" and token["featuresText"] != "_":
                        features = [tuple(feats.split("=")) for feats in token["featuresText"].split("|")]
                        for key,val in features:
                            tokendict[key.lower()] = val
                
            sentencedict["dict"][tokenid] = tokendict

        
        d[f"s{c}"] = sentencedict # modifies version
        c += 1
    for sentenceid in d:
        for tokenid in d[sentenceid]["dict"]:
            id_ = d[sentenceid]["dict"][tokenid].pop("index")
            d[sentenceid]["dict"][tokenid]["id"] = id_
            try: 
                text = d[sentenceid]["dict"][tokenid].pop("word")    
                d[sentenceid]["dict"][tokenid]["text"] = text
                upos = d[sentenceid]["dict"][tokenid].pop("ud_pos")    
                d[sentenceid]["dict"][tokenid]["upos"] = upos
                ismwt = d[sentenceid]["dict"][tokenid].pop("isMultiwordToken")
                d[sentenceid]["dict"][tokenid]["ismwt"] = ismwt
                
            except KeyError:
                pass
    return d


extension = re.compile(r"\.json")

with open(extension.sub(r".html", path), "w", encoding="utf8") as outfile:
    outfile.write(tint2html(dictfromtint))
with open(extension.sub(r"_creading.json", path), "w", encoding="utf8") as outfile:
    json.dump(tint2creadjson(dictfromtint), outfile)
