import json,sys,importlib.util,os
def load(p,name):
    spec=importlib.util.spec_from_file_location(name,p); m=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m); return m
b='briefs/linux/'
rows = load(b+'narr_p1.py','p1').P1 + load(b+'narr_p2.py','p2').P2 + load(b+'narr_p3.py','p3').P3
json.dump(rows,open(b+'table.json','w'),indent=1)
print(len(rows),"rows")
