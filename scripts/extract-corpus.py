"""Extract only the six original public sample PDFs; never native evaluation data."""
import pathlib, subprocess, json
root = pathlib.Path(__file__).resolve().parent.parent
metadata = [('react','React Notes','Frontend','ocean'),('system','System Design','Backend','sand'),('javascript','JavaScript Deep Dive','Frontend','ivory'),('patterns','Design Patterns','Backend','rose'),('cs','Computer Science Essentials','Study','slate'),('interviews','Coding Interviews','Study','sage')]
docs=[]
for id,title,category,cover in metadata:
    text=subprocess.check_output(['pdftotext','-layout',str(root/'public/samples'/f'{title}.pdf'),'-'],text=True)
    pages=[]
    for i,page in enumerate(text.split('\f')):
        if not page.strip(): continue
        lines=[line.rstrip() for line in page.splitlines() if not line.strip().startswith(('SHELF SAMPLES','SHELF /'))]
        clean='\n'.join(lines).strip()
        if i==0:
            clean=clean.replace(title,'',1).strip() if title in clean else clean
            if title=='Computer Science Essentials': clean=clean.replace('Computer Science\n Essentials','',1).strip()
        heading,_,body=clean.partition('\n')
        pages.append({'heading':heading.strip(),'text':body.strip()})
    docs.append({'id':id,'title':title,'category':category,'cover':cover,'pages':pages,'kind':'PDF','file':f'/samples/{title}.pdf'})
(root/'src/domain/corpus.json').write_text(json.dumps(docs,indent=2))
