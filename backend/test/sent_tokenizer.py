import re

mspeech = re.compile(r"(«)([\w ?'’,!.;:]+)(»)([.:;?!])?")
sentend= re.compile(r"»[.;:][ \n\r]")
msent = re.compile(""" ?([\w"']+[”»’–]?[?.!;:][”»’–]? ?)""")



def splitsent(in_s):
    text = in_s
    out= []
    if msent.search(text):
        t = msent.split(text)
        out.extend([ ' '.join(x).strip() for x in zip(t[0::2], t[1::2]) ])
    else:
        return [text.strip()]
    return out




s = """Lilí disse: «Viene giorno. Non mi piace!». E poi disse «Ancora una volta? Non voglio. Basta.». Infine, se ne andò. Piano. Come sempre, dicendo: «sei un pavido!». """
out = []
gino = [i.span() for i in mspeech.finditer(s)] # get the indices of starts and ends of reported speech
parts = [i for t in gino for i in t] # extract indices from tuples
sents = []
if 0 not in parts: # add index 0 to ranges
    parts.append(0)
if len(s) not in parts:
    parts.append(len(s))
parts = sorted(parts) # sorts the indices
for i,part in enumerate(parts): # recreate sentences order
    try:
        sents.append(s[part:parts[i+1]])
    except IndexError: #handle index error 
        pass
final_sents = []    
for i,sent in enumerate(sents):
    if not mspeech.search(sent): #handle non reported speech cases
        #print(sent)
        final_sents.append((i,splitsent(sent))) # append index and sentences. Some sentences are lists
    else:
        new_s = [i for i in mspeech.split(sent) if i!= ""] # create new split reported speech sentence
        if re.search(r"[.;:]", new_s[-1]): # if punctuation after angular brackets
            start = new_s[0] 
            middle = new_s[1]
            end = "".join(new_s[2:])
            new_middle = splitsent(middle)
            if len(new_middle) >1:
                start2 = new_middle.pop(0)
                end2 = new_middle.pop(-1)
                if new_middle == []: # new_middle is an empty list after popping start and end if it only contains two sentences 
                    final_sents.append((i, [start + start2 +"»", "«" + end2 +end]))
                else:  # if it is longer than two sentences
                    repsp2 = splitsent(middle) 
                    #print(repsp2)
                    new_middle2 = ["«"+i+"»" for i in repsp2[1:-1]  ] # recreate reported speech sentences with added angular brackets
                    new_s2 = [start  + repsp2[0] + "»"]
                    new_s2.extend(new_middle2)
                    new_s2.append(  "«" + repsp2[-1] +end)
                    new_s2 = (i,new_s2)
                    final_sents.append(new_s2)
            else:
                #s = new_middle.pop(0)
                #e = new_middle.pop(-1)
                #print(new_middle)
                pass
                    
            
            #print(new_middle)
            
print(final_sents)

