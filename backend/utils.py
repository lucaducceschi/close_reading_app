# -*- coding: utf-8 -*-
"""
Created on Mon Feb 22 18:47:39 2021

@author: luca
"""
import re    

def filter_by_pos(d,pos):
  filtered =[]
  for key,list_of_dictinaries in d.items():
    for item in list_of_dictinaries:
      try:
        if item["upos"] == pos:
          filtered.append(f"{key}_w{str(item['id'])}")
      except KeyError:
        pass
  return filtered



def stanza_annotation(doc_, css_info=""):

#### TODO: eliminate &nbsp at the beginning of the sentence 
    new_txt=f'<html><head>{css_info}<meta charset="UTF-8"></head><body>'
    nsent=1
    
    for sent in doc_.sentences:
      new_txt+="<span class='sentence' id='s" + str(nsent) +"'>"
      new_sent=""
      for tok in sent.words:
        if tok.pos != "PUNCT":
          new_sent+=f"<span>&nbsp</span><span class='word' id='s{nsent}_w{tok.id}'>{tok.text}</span>"
        else:
          new_sent+=f"<span class='word' id='s{nsent}_w{tok.id}'>{tok.text}</span>"

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
          for key,val in features:
            d_temp[key.lower()] = val
          out[f"s{str(c)}_w{d_temp['id']}"]= d_temp
        else:
          out[f"s{str(c)}_w{d_temp['id']}"] = d_temp
      except KeyError:
        print(d_temp)
    d["s"+str(c)] = out # modifies version
    # d["sent_"+str(c)] = out ù previous version 
    c += 1
  return d

class GetPos():
  """new method: get_features
  class starts at zero 
  lemma should be list of comma separated values in a string and every lemma is found with a startswith"""
  def __init__(self, pos, dict_from_stanza):
    self.pos = pos
    self.text = dict_from_stanza
    self.words = GetPos.extract_pos(pos, self.text)
    # self.nwords = len(self.verbs)
    
    # self.features = GetPos.refine_search()

  @classmethod
  def extract_pos(cls, pos, dictionary):
    cls.var1 = []
    for key,l_of_d in dictionary.items():
      for d in l_of_d: 
        try:
            if d["upos"] == pos:
                cls.var1.append((key+"-"+str(d["id"]), d["text"]))
        except KeyError:
            pass
    return cls.var1
  
  def refine_search(self, features):

    """this should update the self.verbs  and the nverbs"""
    #print(features)
    ids = [i[0] for i in self.verbs]
    out_ = [] 
    for i in ids:
      sentid, wordid = i.split("-")
      for d in self.text[sentid]:
        if d["id"] == int(wordid) and re.search(features, d["feats"]):
          out_.append(sentid + "-" + str(d["id"]))
  
  # def filter_for_feauters(self, feats):
  #   ids = [i[0] for i in self.verbs]
  #   out_ = [] 
  #   for i in ids:
  #     sentid, wordid = i.split("-")
  #     for d in self.text[sentid]:
  #       if d["id"] == int(wordid):
  #         for i in range(len(feats)):
  #           if re.search(feats[], d["feats"]):
  #             out_.append(sentid + "-" + str(d["id"]))

    return out_